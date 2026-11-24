package cl.duoc.zonabikers.repository;
import cl.duoc.zonabikers.model.Usuario;
import org.springframework.data.jpa.repository.*;
import jakarta.persistence.LockModeType;
import java.util.Optional;
public interface UsuarioRepository extends JpaRepository<Usuario,Long> {
 Optional<Usuario> findByCorreo(String correo);
 boolean existsByCorreo(String correo);
 @Lock(LockModeType.PESSIMISTIC_WRITE) @Query("select u from Usuario u where u.id=:id")
 Optional<Usuario> bloquear(Long id);
}

