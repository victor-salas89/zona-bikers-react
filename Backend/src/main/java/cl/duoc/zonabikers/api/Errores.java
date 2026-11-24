package cl.duoc.zonabikers.api;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.*;
import org.springframework.dao.*;
import java.util.Map;
@RestControllerAdvice
public class Errores {
 @ExceptionHandler(ResponseStatusException.class)
 ResponseEntity<?> negocio(ResponseStatusException e) { return ResponseEntity.status(e.getStatusCode()).body(Map.of("message", e.getReason()==null?"Solicitud inválida":e.getReason())); }
 @ExceptionHandler(MethodArgumentNotValidException.class)
 ResponseEntity<?> validacion(MethodArgumentNotValidException e) {
  var errores = new java.util.TreeMap<String,String>();
  e.getBindingResult().getFieldErrors().forEach(f -> errores.put(f.getField(),f.getDefaultMessage()));
  return ResponseEntity.badRequest().body(Map.of("message","Revisa los datos enviados.","errores",errores));
 }
 @ExceptionHandler(org.springframework.http.converter.HttpMessageNotReadableException.class)
 ResponseEntity<?> formato() { return ResponseEntity.badRequest().body(Map.of("message","Formato de datos inválido.")); }
 @ExceptionHandler({DataIntegrityViolationException.class,OptimisticLockingFailureException.class,PessimisticLockingFailureException.class})
 ResponseEntity<?> conflicto() { return ResponseEntity.status(409).body(Map.of("message","Registro duplicado o modificado simultáneamente. Recarga y vuelve a intentar.")); }
}

