package cl.duoc.zonabikers.api;
import cl.duoc.zonabikers.api.Datos.*;
import cl.duoc.zonabikers.model.*;
import cl.duoc.zonabikers.repository.*;
import cl.duoc.zonabikers.service.*;
import cl.duoc.zonabikers.security.JwtService;
import cl.duoc.zonabikers.security.JwtService.Identidad;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import java.util.*;
import static org.springframework.http.HttpStatus.*;
@RestController @RequestMapping("/api")
@SecurityRequirement(name="bearerAuth")
public class ApiController {
 private final ProductoRepository productos; private final UsuarioRepository usuarios; private final PedidoRepository pedidos;
 private final ProductoService productoService; private final UsuarioService usuarioService; private final PedidoService pedidoService;
 private final JwtService jwt; private final PasswordEncoder encoder;
 public ApiController(ProductoRepository p,UsuarioRepository u,PedidoRepository pe,ProductoService ps,UsuarioService us,PedidoService pes,JwtService jwt,PasswordEncoder encoder){
  productos=p;usuarios=u;pedidos=pe;productoService=ps;usuarioService=us;pedidoService=pes;this.jwt=jwt;this.encoder=encoder;
 }
 @GetMapping("/prueba") public Map<String,String> prueba(){return Map.of("mensaje","API Zona Bikers disponible");}
 @PostMapping("/auth/registro") @ResponseStatus(CREATED)
 public UsuarioVista registro(@Valid @RequestBody Cuenta d){return UsuarioVista.de(usuarioService.guardar(d,null,true,null));}
 @PostMapping("/auth/login")
 public Map<String,Object> login(@Valid @RequestBody Login d){
  Usuario u=usuarios.findByCorreo(UsuarioService.correo(d.correo())).orElseThrow(()->new ResponseStatusException(UNAUTHORIZED,"El correo o la contraseña son incorrectos."));
  if(!encoder.matches(d.contrasena(),u.passwordHash)) throw new ResponseStatusException(UNAUTHORIZED,"El correo o la contraseña son incorrectos.");
  var t=jwt.crear(u);return Map.of("token",t.token(),"expira",t.expira(),"usuario",UsuarioVista.de(u));
 }
 @PostMapping("/auth/refresh")
 public Map<String,Object> renovar(@AuthenticationPrincipal Identidad i){
  var t=jwt.renovar(i);
  return Map.of("token",t.token(),"expira",t.expira(),"usuario",UsuarioVista.de(usuarios.findById(i.id()).orElseThrow()));
 }
 @GetMapping("/auth/me") public UsuarioVista me(@AuthenticationPrincipal Identidad i){return UsuarioVista.de(usuarios.findById(i.id()).orElseThrow());}
 @PostMapping("/auth/logout") @ResponseStatus(NO_CONTENT)
 public void logout(@AuthenticationPrincipal Identidad i){jwt.cerrar(i.sesion());}
 @GetMapping("/productos") public List<Producto> productos(){return productos.findAll(org.springframework.data.domain.Sort.by("id"));}
 @GetMapping("/productos/{id}") public Producto producto(@PathVariable Long id){return productos.findById(id).orElseThrow(()->new ResponseStatusException(NOT_FOUND,"Producto no encontrado."));}
 @PostMapping("/productos") @ResponseStatus(CREATED) public Producto crear(@Valid @RequestBody ProductoDatos d){return productoService.guardar(d,null);}
 @PutMapping("/productos/{id}") public Producto editar(@PathVariable Long id,@Valid @RequestBody ProductoDatos d){return productoService.guardar(d,id);}
 @DeleteMapping("/productos/{id}") @ResponseStatus(NO_CONTENT) public void eliminar(@PathVariable Long id){productoService.eliminar(id);}
 @GetMapping("/usuarios") public List<UsuarioVista> usuarios(){return usuarios.findAll().stream().map(UsuarioVista::de).toList();}
 @GetMapping("/usuarios/{id}") public UsuarioVista usuario(@PathVariable Long id){return UsuarioVista.de(usuarios.findById(id).orElseThrow(()->new ResponseStatusException(NOT_FOUND,"Usuario no encontrado.")));}
 @PostMapping("/usuarios") @ResponseStatus(CREATED) public UsuarioVista crearUsuario(@Valid @RequestBody Cuenta d,@AuthenticationPrincipal Identidad i){return UsuarioVista.de(usuarioService.guardar(d,null,false,i.id()));}
 @PutMapping("/usuarios/{id}") public UsuarioVista editarUsuario(@PathVariable Long id,@Valid @RequestBody Cuenta d,@AuthenticationPrincipal Identidad i){return UsuarioVista.de(usuarioService.guardar(d,id,false,i.id()));}
 @DeleteMapping("/usuarios/{id}") @ResponseStatus(NO_CONTENT) public void eliminarUsuario(@PathVariable Long id,@AuthenticationPrincipal Identidad i){usuarioService.eliminar(id,i.id());}
 @PostMapping("/pedidos") @ResponseStatus(CREATED) public Pedido comprar(@Valid @RequestBody Compra d,@AuthenticationPrincipal Identidad i){return pedidoService.comprar(d,i.id());}
 @GetMapping("/pedidos") public List<Pedido> pedidos(@AuthenticationPrincipal Identidad i){return pedidos.findByUsuarioIdOrderByFechaDesc(i.id());}
 @GetMapping("/pedidos/{id}") public Pedido pedido(@PathVariable String id,@AuthenticationPrincipal Identidad i){return pedidoService.obtener(id,i.id());}
}

