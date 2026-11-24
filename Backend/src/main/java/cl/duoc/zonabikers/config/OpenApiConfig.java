package cl.duoc.zonabikers.config;
import org.springframework.context.annotation.*;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
@Configuration
public class OpenApiConfig {
 @Bean OpenAPI openAPI(){return new OpenAPI().info(new Info().title("Zona Bikers API").version("1.0").description("Catálogo, cuentas y pedidos simulados persistentes. Importes en CLP; sin pasarela de pagos."))
  .components(new Components().addSecuritySchemes("bearerAuth",new SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("bearer").bearerFormat("JWT")));}
}

