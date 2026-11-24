package cl.duoc.zonabikers;

import cl.duoc.zonabikers.model.Usuario;
import cl.duoc.zonabikers.repository.*;
import cl.duoc.zonabikers.security.JwtService;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.web.server.ResponseStatusException;
import java.time.Instant;
import java.util.List;
import java.util.concurrent.Executors;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class JwtRenovacionTests {
 @Autowired JwtService jwt;
 @Autowired UsuarioRepository usuarios;
 @Autowired SesionRepository sesiones;
 Usuario cliente;
 String anterior;
 @BeforeEach void preparar() {
  cliente=new Usuario();cliente.correo="renovacion-"+java.util.UUID.randomUUID()+"@gmail.com";
  cliente.nombre="Prueba";cliente.rol="cliente";cliente.passwordHash="sin-login-en-esta-prueba";
  cliente=usuarios.save(cliente);anterior=jwt.crear(cliente).token();
 }
 @Test void rotaTokenRevocaAnteriorYConservaPermisos() {
  var nuevo=jwt.renovar(jwt.validar(anterior));
  assertNotEquals(anterior,nuevo.token());assertTrue(nuevo.expira().isAfter(Instant.now()));
  assertThrows(JwtException.class,()->jwt.validar(anterior));
  assertEquals("cliente",jwt.validar(nuevo.token()).rol());
  jwt.cerrar(jwt.validar(nuevo.token()).sesion());
  assertThrows(JwtException.class,()->jwt.validar(nuevo.token()));
 }
 @Test void revalidaSesionVencidaYCambioDePermisos() {
  var identidad=jwt.validar(anterior);
  var sesion=sesiones.findById(identidad.sesion()).orElseThrow();
  sesion.expira=Instant.now().minusSeconds(1);sesiones.save(sesion);
  assertThrows(ResponseStatusException.class,()->jwt.renovar(identidad));
  anterior=jwt.crear(cliente).token();var identidadActual=jwt.validar(anterior);
  cliente.versionSesion++;usuarios.save(cliente);
  assertThrows(ResponseStatusException.class,()->jwt.renovar(identidadActual));
 }
 @Test void dosRenovacionesDelMismoTokenSoloCreanUnaSesionNueva() throws Exception {
  var identidad=jwt.validar(anterior);
  java.util.concurrent.Callable<Integer> renovar=()->{try {jwt.renovar(identidad);return 200;}catch(ResponseStatusException e){return e.getStatusCode().value();}};
  try(var pool=Executors.newVirtualThreadPerTaskExecutor()) {
   var a=pool.submit(renovar);var b=pool.submit(renovar);
   assertEquals(List.of(200,401),java.util.stream.Stream.of(a.get(),b.get()).sorted().toList());
  }
 }
}
