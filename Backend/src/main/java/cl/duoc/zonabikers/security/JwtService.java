package cl.duoc.zonabikers.security;
import cl.duoc.zonabikers.model.*;
import cl.duoc.zonabikers.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import javax.crypto.spec.SecretKeySpec;
import com.nimbusds.jose.jwk.source.ImmutableSecret;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.UUID;
@Service
public class JwtService {
 private final JwtEncoder encoder; private final JwtDecoder decoder;
 private final SesionRepository sesiones; private final UsuarioRepository usuarios; private final long minutos;
 public record Identidad(Long id,String rol,String sesion) {}
 public record Token(String token,Instant expira) {}
 public JwtService(@Value("${app.jwt.secret}") String secret,@Value("${app.jwt.minutes}") long minutos,SesionRepository s,UsuarioRepository u) {
  byte[] bytes=secret.getBytes(StandardCharsets.UTF_8);
  if(bytes.length<32 || minutos<1 || minutos>1440) throw new IllegalArgumentException("JWT_SECRET requiere al menos 32 bytes; JWT_MINUTES entre 1 y 1440.");
  var key=new SecretKeySpec(bytes,"HmacSHA256");
  encoder=new NimbusJwtEncoder(new ImmutableSecret<>(key));
  decoder=NimbusJwtDecoder.withSecretKey(key).macAlgorithm(MacAlgorithm.HS256).build();
  this.sesiones=s; this.usuarios=u; this.minutos=minutos;
 }
 public Token crear(Usuario u) {
  Instant now=Instant.now(), expira=now.plusSeconds(minutos*60);
  Sesion s=new Sesion(); s.id=UUID.randomUUID().toString(); s.usuarioId=u.id; s.expira=expira; s.versionUsuario=u.versionSesion;
  sesiones.save(s);
  var claims=JwtClaimsSet.builder().issuer("https://zona-bikers.local").subject(u.id.toString()).id(s.id).issuedAt(now).expiresAt(expira).build();
  return new Token(encoder.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(),claims)).getTokenValue(),expira);
 }
 public Identidad validar(String token) {
  Jwt jwt=decoder.decode(token);
  if(!"https://zona-bikers.local".equals(jwt.getClaimAsString("iss")) || jwt.getExpiresAt()==null || !jwt.getExpiresAt().isAfter(Instant.now())) throw new BadJwtException("Sesión inválida");
  Sesion s=sesiones.findById(jwt.getId()).orElseThrow(()->new BadJwtException("Sesión cerrada"));
  Usuario u=usuarios.findById(s.usuarioId).orElseThrow(()->new BadJwtException("Usuario no disponible"));
  if(!jwt.getSubject().equals(u.id.toString()) || !s.expira.isAfter(Instant.now()) || s.versionUsuario!=u.versionSesion) throw new BadJwtException("Sesión vencida");
  return new Identidad(u.id,u.rol,s.id);
 }
 public void cerrar(String id) {sesiones.deleteById(id);}
}

