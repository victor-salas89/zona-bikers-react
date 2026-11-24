package cl.duoc.zonabikers.api;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;
import cl.duoc.zonabikers.model.Usuario;
public final class Datos {
 private Datos() {}
 public record Login(@NotBlank @Email @Size(max=100) String correo, @NotBlank @Size(max=72) String contrasena) {}
 public record Cuenta(
  @NotBlank @Email @Size(max=100) String correo, @Size(max=72) String contrasena,
  @NotBlank @Size(max=50) String nombre, @Size(max=100) String apellidos,
  @Size(max=9) String run, @Size(max=100) String region, @Size(max=100) String comuna,
  @Size(max=300) String direccion, @Size(max=10) String fechaNacimiento,
  @Pattern(regexp="cliente|vendedor|administrador") String rol) {}
 public record UsuarioVista(Long id,String correo,String rol,String nombre,String apellidos,String run,
   String region,String comuna,String direccion,String fechaNacimiento) {
  public static UsuarioVista de(Usuario u) { return new UsuarioVista(u.id,u.correo,u.rol,u.nombre,u.apellidos,u.run,u.region,u.comuna,u.direccion,u.fechaNacimiento); }
 }
 public record ProductoDatos(
  @NotBlank @Size(min=3,max=40) String codigo, @NotBlank @Size(max=100) String nombre,
  @NotBlank @Size(max=500) String descripcion,
  @NotNull @DecimalMin("0") @Digits(integer=12,fraction=0) BigDecimal precio,
  @DecimalMin(value="0",inclusive=false) @Digits(integer=12,fraction=0) BigDecimal precioOferta,
  @NotNull @Min(0) Integer stock, @Min(0) Integer stockCritico,
  @NotBlank @Pattern(regexp="cascos|guantes|chaquetas|protecciones|otros") String categoria,
  @Size(max=2000) @Pattern(regexp="^(https?://|\\.?/).*") String imagen, @Size(max=255) String alt) {}
 public record CompradorDatos(
  @NotBlank @Size(min=2,max=100) String nombre, @NotBlank @Email @Size(max=100) String correo,
  @NotBlank @Size(min=5,max=300) String direccion, @NotBlank String region, @NotBlank String comuna,
  @NotBlank @Pattern(regexp="retiro|domicilio") String entrega) {}
 public record Linea(@NotNull @Positive Long id, @Min(1) @Max(999) int cantidad) {}
 public record Compra(@NotEmpty @Size(max=100) List<@Valid Linea> productos,
  @NotNull @Valid CompradorDatos comprador, @NotBlank @Pattern(regexp="aprobada|rechazada") String estado,
  @NotBlank @Size(max=80) String clave) {}
}

