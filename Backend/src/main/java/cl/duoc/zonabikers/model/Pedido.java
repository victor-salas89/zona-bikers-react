package cl.duoc.zonabikers.model;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
@Entity
@Table(name="pedidos", uniqueConstraints=@UniqueConstraint(columnNames={"usuarioId","clave"}))
public class Pedido {
 @Id public String id;
 @Column(nullable=false) public Long usuarioId;
 @Column(nullable=false) public String clave;
 public Instant fecha;
 public String estado;
 @Embedded public Comprador comprador;
 public BigDecimal subtotal;
 public BigDecimal costoEntrega;
 public BigDecimal total;
 @ElementCollection(fetch=FetchType.EAGER) @CollectionTable(name="pedido_items")
 public List<Item> productos = new ArrayList<>();
 @Embeddable public static class Comprador {
  public String nombre;
  public String correo;
  @Column(length=300) public String direccion;
  public String region;
  public String comuna;
  public String entrega;
 }
 @Embeddable public static class Item {
  public Long id;
  public String nombre;
  public BigDecimal precio;
  public int cantidad;
 }
}

