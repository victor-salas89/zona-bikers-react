package cl.duoc.zonabikers;

import cl.duoc.zonabikers.model.*;
import cl.duoc.zonabikers.repository.*;
import cl.duoc.zonabikers.security.JwtService;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.security.crypto.password.PasswordEncoder;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.JsonNode;
import java.net.URI;
import java.net.http.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment=SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class ApiIntegrationTests {
 @Value("${local.server.port}") int port;
 @Autowired ObjectMapper mapper;
 @Autowired UsuarioRepository usuarios;
 @Autowired ProductoRepository productos;
 @Autowired PedidoRepository pedidos;
 @Autowired SesionRepository sesiones;
 @Autowired PasswordEncoder encoder;
 @Autowired JwtService jwt;
 HttpClient http=HttpClient.newHttpClient();
 Usuario admin, vendedor, cliente, otro;
 Producto producto;
 String ta,tv,tc,to;
 @BeforeEach void preparar() {
  pedidos.deleteAll();sesiones.deleteAll();productos.deleteAll();usuarios.deleteAll();
  admin=usuario("admin","administrador");vendedor=usuario("vende","vendedor");cliente=usuario("cliente","cliente");otro=usuario("otro","cliente");
  ta=jwt.crear(admin).token();tv=jwt.crear(vendedor).token();tc=jwt.crear(cliente).token();to=jwt.crear(otro).token();
  producto=new Producto();producto.codigo="CAS001";producto.nombre="Casco";producto.descripcion="Casco integral";
  producto.categoria="cascos";producto.precio=BigDecimal.valueOf(10000);producto.precioOferta=BigDecimal.valueOf(8000);producto.stock=3;
  producto=productos.save(producto);
 }
 Usuario usuario(String nombre,String rol){Usuario u=new Usuario();u.correo=nombre+"@gmail.com";u.nombre=nombre;u.rol=rol;u.passwordHash=encoder.encode("Prueba-segura-123");return usuarios.save(u);}
 HttpResponse<String> request(String method,String path,Object body,String token) throws Exception {
  var b=HttpRequest.newBuilder(URI.create("http://localhost:"+port+path));
  if(token!=null)b.header("Authorization","Bearer "+token);
  b.header("Content-Type","application/json");
  b.method(method,body==null?HttpRequest.BodyPublishers.noBody():HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(body)));
  return http.send(b.build(),HttpResponse.BodyHandlers.ofString());
 }
 JsonNode json(HttpResponse<String> r){return mapper.readTree(r.body());}
 Map<String,Object> cuenta(String rol){return Map.of("correo","nueva@gmail.com","nombre","Nueva","contrasena","Otra-segura-123","rol",rol,"run","123456785","apellidos","Prueba","direccion","Calle 123","region","Región Metropolitana","comuna","Santiago");}
 Map<String,Object> datosProducto(){return new HashMap<>(Map.of("codigo","GUA002","nombre","Guantes","descripcion","Guantes de moto","categoria","guantes","precio",5000,"stock",2));}
 Map<String,Object> compra(String estado,String clave,int cantidad){return new HashMap<>(Map.of("productos",List.of(Map.of("id",producto.id,"cantidad",cantidad,"precio",1)),"estado",estado,"clave",clave,
   "comprador",Map.of("nombre","Cliente","correo","cliente@gmail.com","direccion","Calle 123","region","Región Metropolitana","comuna","Santiago","entrega","domicilio"),"total",1));}
 @Test void registroHasheaYNoExponeSecretos() throws Exception {
  var r=request("POST","/api/auth/registro",cuenta("cliente"),null);assertEquals(201,r.statusCode(),r.body());
  assertFalse(r.body().contains("password"));assertFalse(r.body().contains("contrasena"));
  var u=usuarios.findByCorreo("nueva@gmail.com").orElseThrow();assertTrue(encoder.matches("Otra-segura-123",u.passwordHash));assertEquals("cliente",u.rol);
  assertEquals(409,request("POST","/api/auth/registro",cuenta("cliente"),null).statusCode());
 }
 @Test void registroNoEscalaRoles() throws Exception {assertEquals(400,request("POST","/api/auth/registro",cuenta("administrador"),null).statusCode());assertFalse(usuarios.existsByCorreo("nueva@gmail.com"));}
 @Test void loginMeLogoutRevocaToken() throws Exception {
  assertEquals(401,request("POST","/api/auth/login",Map.of("correo",cliente.correo,"contrasena","incorrecta"),null).statusCode());
  var r=request("POST","/api/auth/login",Map.of("correo","CLIENTE@GMAIL.COM","contrasena","Prueba-segura-123"),null);
  assertEquals(200,r.statusCode(),r.body());String token=json(r).get("token").asText();
  assertEquals(200,request("GET","/api/auth/me",null,token).statusCode());
  assertEquals(204,request("POST","/api/auth/logout",null,token).statusCode());
  assertEquals(401,request("GET","/api/auth/me",null,token).statusCode());
 }
 @Test void renovacionRotaTokenYConservaRol() throws Exception {
  var r=request("POST","/api/auth/refresh",null,tc);assertEquals(200,r.statusCode(),r.body());
  String nuevo=json(r).get("token").asText();assertNotEquals(tc,nuevo);
  assertEquals("cliente",json(r).get("usuario").get("rol").asText());
  assertTrue(Instant.parse(json(r).get("expira").asText()).isAfter(Instant.now()));
  assertEquals(401,request("GET","/api/auth/me",null,tc).statusCode());
  assertEquals(401,request("POST","/api/auth/refresh",null,tc).statusCode());
  assertEquals(200,request("GET","/api/auth/me",null,nuevo).statusCode());
  assertEquals(403,request("GET","/api/usuarios",null,nuevo).statusCode());
  assertEquals(204,request("POST","/api/auth/logout",null,nuevo).statusCode());
  assertEquals(401,request("POST","/api/auth/refresh",null,nuevo).statusCode());
 }
 @Test void renovacionRechazaSesionAusenteAlteradaYVencida() throws Exception {
  assertEquals(401,request("POST","/api/auth/refresh",null,null).statusCode());
  assertEquals(401,request("POST","/api/auth/refresh",null,tc+"x").statusCode());
  var s=sesiones.findById(jwt.validar(tc).sesion()).orElseThrow();s.expira=Instant.now().minusSeconds(1);sesiones.save(s);
  assertEquals(401,request("POST","/api/auth/refresh",null,tc).statusCode());
 }
 @Test void renovacionConcurrenteSoloAceptaUnaSolicitud() throws Exception {
  try(var pool=Executors.newVirtualThreadPerTaskExecutor()) {
   var a=pool.submit(()->request("POST","/api/auth/refresh",null,tc).statusCode());
   var b=pool.submit(()->request("POST","/api/auth/refresh",null,tc).statusCode());
   assertEquals(List.of(200,401),java.util.stream.Stream.of(a.get(),b.get()).sorted().toList());
  }
 }
 @Test void rechazaTokensAlteradosYExpirados() throws Exception {
  assertEquals(401,request("GET","/api/auth/me",null,tc+"x").statusCode());
  var s=sesiones.findAll().stream().filter(x->x.usuarioId.equals(cliente.id)).findFirst().orElseThrow();s.expira=Instant.now().minusSeconds(1);sesiones.save(s);
  assertEquals(401,request("GET","/api/auth/me",null,tc).statusCode());
 }
 @Test void permisosYCrudProductos() throws Exception {
  assertEquals(200,request("GET","/api/productos",null,null).statusCode());
  assertEquals(401,request("POST","/api/productos",datosProducto(),null).statusCode());
  assertEquals(403,request("POST","/api/productos",datosProducto(),tc).statusCode());
  var r=request("POST","/api/productos",datosProducto(),tv);assertEquals(201,r.statusCode(),r.body());long id=json(r).get("id").asLong();
  var d=datosProducto();d.put("nombre","Guantes editados");assertEquals(200,request("PUT","/api/productos/"+id,d,ta).statusCode());
  assertEquals("Guantes editados",json(request("GET","/api/productos/"+id,null,null)).get("nombre").asText());
  assertEquals(204,request("DELETE","/api/productos/"+id,null,tv).statusCode());assertEquals(404,request("GET","/api/productos/"+id,null,null).statusCode());
 }
 @Test void validaPrecioStockOfertaYCategoria() throws Exception {
  for(var entrada:Map.<String,Object>of("precio",-1,"stock",-1,"precioOferta",6000,"categoria","invalida").entrySet()){
   var d=datosProducto();d.put(entrada.getKey(),entrada.getValue());assertEquals(400,request("POST","/api/productos",d,ta).statusCode(),entrada.getKey());
  }
 }
 @Test void usuariosSoloAdministradorEInvalidaSesionesAlEditar() throws Exception {
  assertEquals(403,request("GET","/api/usuarios",null,tv).statusCode());assertEquals(403,request("POST","/api/usuarios",cuenta("vendedor"),tc).statusCode());
  var r=request("POST","/api/usuarios",cuenta("vendedor"),ta);assertEquals(201,r.statusCode(),r.body());long id=json(r).get("id").asLong();
  assertEquals(200,request("GET","/api/usuarios/"+id,null,ta).statusCode());
  assertEquals(200,request("PUT","/api/usuarios/"+cliente.id,Map.of("correo",cliente.correo,"nombre","Cliente editado","rol","vendedor"),ta).statusCode());
  assertEquals(401,request("GET","/api/auth/me",null,tc).statusCode());
  assertEquals(204,request("DELETE","/api/usuarios/"+id,null,ta).statusCode());
  assertEquals(409,request("DELETE","/api/usuarios/"+admin.id,null,ta).statusCode());
 }
 @Test void pedidoRecalculaPreciosDescuentaUnaVezYProtegePropietario() throws Exception {
  var d=compra("aprobada","misma-clave",2);var r=request("POST","/api/pedidos",d,tc);assertEquals(201,r.statusCode(),r.body());
  var p=json(r);assertEquals(19990,p.get("total").asInt());assertEquals(1,productos.findById(producto.id).orElseThrow().stock);
  assertEquals(p.get("id").asText(),json(request("POST","/api/pedidos",d,tc)).get("id").asText());assertEquals(1,pedidos.count());
  assertEquals(404,request("GET","/api/pedidos/"+p.get("id").asText(),null,to).statusCode());
  assertEquals(200,request("GET","/api/pedidos/"+p.get("id").asText(),null,tc).statusCode());
 }
 @Test void rechazoNoDescuentaYStockInsuficienteNoCreaPedido() throws Exception {
  assertEquals(201,request("POST","/api/pedidos",compra("rechazada","rechazo",2),tc).statusCode());assertEquals(3,productos.findById(producto.id).orElseThrow().stock);
  assertEquals(409,request("POST","/api/pedidos",compra("aprobada","sin-stock",4),tc).statusCode());assertEquals(1,pedidos.count());
  assertEquals(400,request("POST","/api/pedidos",compra("aprobada","cero",0),tc).statusCode());
  assertEquals(401,request("POST","/api/pedidos",compra("aprobada","anonimo",1),null).statusCode());
 }
 @Test void comprasConcurrentesNoSobrevenden() throws Exception {
  try(var pool=Executors.newVirtualThreadPerTaskExecutor()) {
   var a=pool.submit(()->request("POST","/api/pedidos",compra("aprobada","a",2),tc).statusCode());
   var b=pool.submit(()->request("POST","/api/pedidos",compra("aprobada","b",2),to).statusCode());
   assertEquals(Set.of(201,409),Set.of(a.get(),b.get()));assertEquals(1,productos.findById(producto.id).orElseThrow().stock);
  }
 }
 @Test void swaggerYCors() throws Exception {
  var r=request("GET","/v3/api-docs",null,null);assertEquals(200,r.statusCode(),r.body());assertTrue(r.body().contains("bearerAuth"));assertTrue(r.body().contains("/api/pedidos"));
  assertEquals(200,request("GET","/swagger-ui/index.html",null,null).statusCode());
  var pre=HttpRequest.newBuilder(URI.create("http://localhost:"+port+"/api/productos")).header("Origin","http://localhost:5173").header("Access-Control-Request-Method","POST").method("OPTIONS",HttpRequest.BodyPublishers.noBody()).build();
  var respuesta=http.send(pre,HttpResponse.BodyHandlers.ofString());assertEquals(200,respuesta.statusCode());assertEquals("http://localhost:5173",respuesta.headers().firstValue("Access-Control-Allow-Origin").orElseThrow());
 }
 @Test void rechazaCantidadesFraccionariasYRegistroIncompleto() throws Exception {
  var d=datosProducto();d.put("stock",1.5);assertEquals(400,request("POST","/api/productos",d,ta).statusCode());
  var c=compra("aprobada","fraccion",1);c.put("productos",List.of(Map.of("id",producto.id,"cantidad",1.5)));
  assertEquals(400,request("POST","/api/pedidos",c,tc).statusCode());
  assertEquals(400,request("POST","/api/auth/registro",Map.of("correo","incompleta@gmail.com","nombre","Incompleta","contrasena","Password123"),null).statusCode());
 }
 @Test void jwtConFirmaValidaPeroExpiradoEsRechazado() throws Exception {
  var token=new com.nimbusds.jwt.SignedJWT(new com.nimbusds.jose.JWSHeader(com.nimbusds.jose.JWSAlgorithm.HS256),
   new com.nimbusds.jwt.JWTClaimsSet.Builder().issuer("https://zona-bikers.local").subject(cliente.id.toString())
    .issueTime(Date.from(Instant.now().minusSeconds(7200))).expirationTime(Date.from(Instant.now().minusSeconds(3600))).jwtID("expirado").build());
  token.sign(new com.nimbusds.jose.crypto.MACSigner("solo-para-pruebas-aisladas-no-usar-en-produccion-123456"));
  assertEquals(401,request("GET","/api/auth/me",null,token.serialize()).statusCode());
 }
}
