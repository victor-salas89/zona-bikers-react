package cl.duoc.zonabikers.service;
import cl.duoc.zonabikers.api.Datos.*;
import cl.duoc.zonabikers.model.*;
import cl.duoc.zonabikers.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import static org.springframework.http.HttpStatus.*;
@Service
public class PedidoService {
 private final PedidoRepository pedidos; private final ProductoRepository productos; private final UsuarioRepository usuarios;
 public PedidoService(PedidoRepository p,ProductoRepository r,UsuarioRepository u){pedidos=p;productos=r;usuarios=u;}
 public static void validarUbicacion(String region,String comuna) {
  var mapa=Map.of("Región Metropolitana",List.of("Santiago","Puente Alto","Maipú","La Florida"),
   "Región de Valparaíso",List.of("Valparaíso","Viña del Mar","Quilpué","Villa Alemana"),
   "Región del Biobío",List.of("Concepción","Talcahuano","Los Ángeles","San Pedro de la Paz"));
  if(!mapa.getOrDefault(region,List.of()).contains(comuna)) throw new ResponseStatusException(BAD_REQUEST,"Región o comuna inválida.");
 }
 @Transactional public Pedido comprar(Compra d,Long usuarioId) {
  // Serializa reintentos del mismo comprador y bloquea stock en orden estable.
  usuarios.bloquear(usuarioId).orElseThrow(()->new ResponseStatusException(UNAUTHORIZED));
  var previo=pedidos.findByUsuarioIdAndClave(usuarioId,d.clave());
  if(previo.isPresent()) return previo.get();
  validarUbicacion(d.comprador().region(),d.comprador().comuna());
  var cantidades=new TreeMap<Long,Integer>();
  for(var l:d.productos()) cantidades.merge(l.id(),l.cantidad(),Integer::sum);
  Pedido p=new Pedido(); p.id=UUID.randomUUID().toString(); p.usuarioId=usuarioId; p.clave=d.clave();
  p.fecha=Instant.now(); p.estado=d.estado(); p.subtotal=BigDecimal.ZERO;
  p.comprador=new Pedido.Comprador();
  p.comprador.nombre=d.comprador().nombre().trim(); p.comprador.correo=UsuarioService.correo(d.comprador().correo());
  p.comprador.direccion=d.comprador().direccion().trim(); p.comprador.region=d.comprador().region();
  p.comprador.comuna=d.comprador().comuna(); p.comprador.entrega=d.comprador().entrega();
  for(var entry:cantidades.entrySet()) {
   Producto producto=productos.bloquear(entry.getKey()).orElseThrow(()->new ResponseStatusException(CONFLICT,"Un producto ya no está disponible."));
   int cantidad=entry.getValue();
   if(cantidad>999 || producto.stock<cantidad) throw new ResponseStatusException(CONFLICT,"Stock insuficiente: "+producto.nombre);
   Pedido.Item item=new Pedido.Item(); item.id=producto.id; item.nombre=producto.nombre;
   item.precio=producto.precioOferta==null?producto.precio:producto.precioOferta; item.cantidad=cantidad;
   p.productos.add(item); p.subtotal=p.subtotal.add(item.precio.multiply(BigDecimal.valueOf(cantidad)));
   if(p.estado.equals("aprobada")) producto.stock-=cantidad;
  }
  p.costoEntrega=d.comprador().entrega().equals("domicilio")?BigDecimal.valueOf(3990):BigDecimal.ZERO;
  p.total=p.subtotal.add(p.costoEntrega);
  return pedidos.saveAndFlush(p);
 }
 public Pedido obtener(String id, Long usuarioId) {
  return pedidos.findById(id).filter(p->p.usuarioId.equals(usuarioId)).orElseThrow(()->new ResponseStatusException(NOT_FOUND,"Pedido no disponible."));
 }
}

