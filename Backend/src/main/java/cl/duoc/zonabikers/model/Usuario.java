package cl.duoc.zonabikers.model;
import jakarta.persistence.*;
@Entity
@Table(name="usuarios")
public class Usuario {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 @Column(nullable=false, unique=true, length=100) public String correo;
 @Column(nullable=false) public String passwordHash;
 @Column(nullable=false) public String rol;
 public String nombre;
 public String apellidos;
 public String run;
 public String region;
 public String comuna;
 @Column(length=300) public String direccion;
 public String fechaNacimiento;
 public long versionSesion;
}

