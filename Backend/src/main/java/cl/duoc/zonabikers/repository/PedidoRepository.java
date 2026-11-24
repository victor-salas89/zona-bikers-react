package cl.duoc.zonabikers.repository;
import cl.duoc.zonabikers.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface PedidoRepository extends JpaRepository<Pedido,String> {
 Optional<Pedido> findByUsuarioIdAndClave(Long usuarioId, String clave);
 List<Pedido> findByUsuarioIdOrderByFechaDesc(Long usuarioId);
}

