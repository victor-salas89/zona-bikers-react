package cl.duoc.zonabikers.model;
import jakarta.persistence.*;
import java.time.Instant;
@Entity
@Table(name="sesiones")
public class Sesion {
 @Id public String id;
 public Long usuarioId;
 public Instant expira;
 public long versionUsuario;
}

