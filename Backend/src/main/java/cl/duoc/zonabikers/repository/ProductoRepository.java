package cl.duoc.zonabikers.repository;
import cl.duoc.zonabikers.model.Producto;
import org.springframework.data.jpa.repository.*;
import jakarta.persistence.LockModeType;
import java.util.Optional;
public interface ProductoRepository extends JpaRepository<Producto,Long> {
 boolean existsByCodigo(String codigo);
 @Lock(LockModeType.PESSIMISTIC_WRITE) @Query("select p from Producto p where p.id=:id")
 Optional<Producto> bloquear(Long id);
}

