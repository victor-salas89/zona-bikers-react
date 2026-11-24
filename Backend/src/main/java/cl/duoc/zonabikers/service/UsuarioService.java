package cl.duoc.zonabikers.service;
import cl.duoc.zonabikers.api.Datos.Cuenta;
import cl.duoc.zonabikers.model.Usuario;
import cl.duoc.zonabikers.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import static org.springframework.http.HttpStatus.*;
@Service
public class UsuarioService {
 private final UsuarioRepository repo; private final PasswordEncoder encoder;
 public UsuarioService(UsuarioRepository repo,PasswordEncoder encoder) {this.repo=repo;this.encoder=encoder;}
 public static String correo(String value) {return value.trim().toLowerCase(Locale.ROOT);}
 @Transactional public Usuario guardar(Cuenta d, Long id, boolean registro, Long actor) {
  if(registro && d.rol()!=null && !d.rol().equals("cliente")) throw new ResponseStatusException(BAD_REQUEST,"El registro público solo permite clientes.");
  if(registro && (d.run()==null || d.run().isBlank() || d.apellidos()==null || d.apellidos().isBlank() || d.direccion()==null || d.direccion().isBlank() || d.region()==null || d.region().isBlank() || d.comuna()==null || d.comuna().isBlank()))
   throw new ResponseStatusException(BAD_REQUEST,"Completa RUN, apellidos, dirección, región y comuna.");
  Usuario u=id==null?new Usuario():repo.bloquear(id).orElseThrow(()->new ResponseStatusException(NOT_FOUND,"Usuario no encontrado."));
  String rol=registro?"cliente":(d.rol()==null?"cliente":d.rol());
  if(id!=null && id.equals(actor) && !rol.equals(u.rol)) throw new ResponseStatusException(CONFLICT,"No puedes cambiar tu propio rol.");
  if(d.contrasena()!=null && !d.contrasena().isEmpty()) {
   if(d.contrasena().length()<8 || d.contrasena().getBytes(StandardCharsets.UTF_8).length>72) throw new ResponseStatusException(BAD_REQUEST,"La contraseña debe tener al menos 8 caracteres y hasta 72 bytes.");
   u.passwordHash=encoder.encode(d.contrasena());
  } else if(id==null) throw new ResponseStatusException(BAD_REQUEST,"La contraseña es requerida.");
  if(d.run()!=null && !d.run().isBlank() && !rutValido(d.run())) throw new ResponseStatusException(BAD_REQUEST,"RUN inválido.");
  if(d.region()!=null && !d.region().isBlank()) PedidoService.validarUbicacion(d.region(),d.comuna());
  if(!correo(d.correo()).matches("^[^\\s@]+@(duoc\\.cl|profesor\\.duoc\\.cl|gmail\\.com)$")) throw new ResponseStatusException(BAD_REQUEST,"Dominio de correo no permitido.");
  u.correo=correo(d.correo()); u.rol=rol; u.nombre=d.nombre().trim(); u.apellidos=d.apellidos(); u.run=d.run();
  u.region=d.region(); u.comuna=d.comuna(); u.direccion=d.direccion(); u.fechaNacimiento=d.fechaNacimiento();
  if(id!=null) u.versionSesion++;
  return repo.saveAndFlush(u);
 }
 @Transactional public void eliminar(Long id,Long actor) {
  if(id.equals(actor)) throw new ResponseStatusException(CONFLICT,"No puedes eliminar tu propia cuenta.");
  Usuario u=repo.bloquear(id).orElseThrow(()->new ResponseStatusException(NOT_FOUND,"Usuario no encontrado."));
  repo.delete(u);
 }
 static boolean rutValido(String rut) {
  if(!rut.matches("[0-9]{6,8}[0-9Kk]")) return false;
  int suma=0,m=2;
  for(int i=rut.length()-2;i>=0;i--) {suma+=(rut.charAt(i)-'0')*m; m=m==7?2:m+1;}
  int dv=11-suma%11;
  return rut.substring(rut.length()-1).equalsIgnoreCase(dv==11?"0":dv==10?"K":Integer.toString(dv));
 }
}

