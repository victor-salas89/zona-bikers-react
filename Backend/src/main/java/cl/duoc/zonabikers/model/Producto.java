package cl.duoc.zonabikers.model;
import jakarta.persistence.*;
import java.math.BigDecimal;
@Entity
@Table(name="productos")
public class Producto {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 @Column(nullable=false, unique=true, length=40) public String codigo;
 @Column(nullable=false, length=100) public String nombre;
 @Column(nullable=false, length=500) public String descripcion;
 @Column(nullable=false, precision=12, scale=0) public BigDecimal precio;
 @Column(precision=12, scale=0) public BigDecimal precioOferta;
 public int stock;
 public Integer stockCritico;
 @Column(nullable=false) public String categoria;
 @Column(length=2000) public String imagen;
 public String alt;
 @Version public Long version;
}

