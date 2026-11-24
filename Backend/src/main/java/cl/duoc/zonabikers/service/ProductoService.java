package cl.duoc.zonabikers.service;
import cl.duoc.zonabikers.api.Datos.ProductoDatos;
import cl.duoc.zonabikers.model.Producto;
import cl.duoc.zonabikers.repository.ProductoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import static org.springframework.http.HttpStatus.*;
@Service
public class ProductoService {
 private final ProductoRepository repo;
 public ProductoService(ProductoRepository repo) { this.repo=repo; }
 @Transactional public Producto guardar(ProductoDatos d, Long id) {
  if(d.precioOferta()!=null && d.precioOferta().compareTo(d.precio())>=0) throw new ResponseStatusException(BAD_REQUEST,"La oferta debe ser menor al precio normal.");
  Producto p=id==null?new Producto():repo.bloquear(id).orElseThrow(()->new ResponseStatusException(NOT_FOUND,"Producto no encontrado."));
  p.codigo=d.codigo().trim(); p.nombre=d.nombre().trim(); p.descripcion=d.descripcion().trim();
  p.precio=d.precio(); p.precioOferta=d.precioOferta(); p.stock=d.stock(); p.stockCritico=d.stockCritico();
  p.categoria=d.categoria(); p.imagen=d.imagen(); p.alt=d.alt();
  return repo.saveAndFlush(p);
 }
 @Transactional public void eliminar(Long id) {
  Producto p=repo.bloquear(id).orElseThrow(()->new ResponseStatusException(NOT_FOUND,"Producto no encontrado."));
  repo.delete(p);
 }
}

