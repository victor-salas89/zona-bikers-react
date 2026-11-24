package cl.duoc.zonabikers.config;
import cl.duoc.zonabikers.api.Datos.*;
import cl.duoc.zonabikers.repository.*;
import cl.duoc.zonabikers.service.*;
import org.springframework.stereotype.Component;
import org.springframework.boot.CommandLineRunner;
import org.springframework.beans.factory.annotation.Value;
import tools.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
@Component
public class DatosIniciales implements CommandLineRunner {
 private final ProductoRepository productos; private final UsuarioRepository usuarios; private final ProductoService ps; private final UsuarioService us; private final ObjectMapper mapper;
 @Value("${app.bootstrap.email}") String correo;
 @Value("${app.bootstrap.password}") String password;
 @Value("${app.seed.catalog}") boolean seed;
 public DatosIniciales(ProductoRepository p,UsuarioRepository u,ProductoService ps,UsuarioService us,ObjectMapper m){productos=p;usuarios=u;this.ps=ps;this.us=us;mapper=m;}
 public void run(String... args) throws Exception {
  if(seed && productos.count()==0) {
   try(var in=new ClassPathResource("catalogo-inicial.json").getInputStream()){
    for(var d:mapper.readValue(in,ProductoDatos[].class)) ps.guardar(d,null);
   }
  }
  if(!correo.isBlank() && !usuarios.existsByCorreo(UsuarioService.correo(correo))) {
   us.guardar(new Cuenta(correo,password,"Administrador",null,null,null,null,null,null,"administrador"),null,false,null);
  }
 }
}

