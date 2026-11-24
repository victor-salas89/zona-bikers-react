package cl.duoc.zonabikers.security;
import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.*;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.cors.*;
import org.springframework.http.HttpMethod;
import org.springframework.beans.factory.annotation.Value;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.*;
@Configuration
public class SecurityConfig {
 @Bean PasswordEncoder passwordEncoder(){return new BCryptPasswordEncoder();}
 @Bean org.springframework.security.core.userdetails.UserDetailsService sinUsuariosEnMemoria() {
  return username -> { throw new org.springframework.security.core.userdetails.UsernameNotFoundException("Autenticación disponible mediante /api/auth/login"); };
 }
 @Bean SecurityFilterChain security(HttpSecurity http,JwtService jwt,@Value("${app.cors.origins}") String origins) throws Exception {
  var cors=new CorsConfiguration(); cors.setAllowedOrigins(Arrays.stream(origins.split(",")).map(String::trim).toList());
  cors.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS")); cors.setAllowedHeaders(List.of("Authorization","Content-Type"));
  var source=new UrlBasedCorsConfigurationSource(); source.registerCorsConfiguration("/**",cors);
  http.cors(c->c.configurationSource(source)).csrf(c->c.disable())
   .sessionManagement(s->s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
   .formLogin(c->c.disable()).httpBasic(c->c.disable())
   .exceptionHandling(e->e.authenticationEntryPoint((req,res,ex)->error(res,401,"Debes iniciar sesión."))
      .accessDeniedHandler((req,res,ex)->error(res,403,"No tienes permisos.")))
   .authorizeHttpRequests(a->a
    .requestMatchers("/swagger-ui.html","/swagger-ui/**","/v3/api-docs/**","/error").permitAll()
    .requestMatchers(HttpMethod.POST,"/api/auth/login","/api/auth/registro").permitAll()
    .requestMatchers(HttpMethod.GET,"/api/productos","/api/productos/**","/api/prueba").permitAll()
    .requestMatchers("/api/usuarios/**").hasRole("administrador")
    .requestMatchers("/api/productos/**").hasAnyRole("administrador","vendedor")
    .requestMatchers("/api/auth/**","/api/pedidos/**").authenticated()
    .anyRequest().denyAll())
   .addFilterBefore(new OncePerRequestFilter(){
    @Override protected void doFilterInternal(HttpServletRequest req,HttpServletResponse res,FilterChain chain) throws ServletException,IOException {
     String header=req.getHeader("Authorization");
     if(header!=null && header.startsWith("Bearer ")) {
      try {
       var identity=jwt.validar(header.substring(7));
       var auth=new UsernamePasswordAuthenticationToken(identity,null,List.of(new SimpleGrantedAuthority("ROLE_"+identity.rol())));
       SecurityContextHolder.getContext().setAuthentication(auth);
      } catch(JwtException|IllegalArgumentException e) {error(res,401,"Sesión inválida o expirada.");return;}
     }
     chain.doFilter(req,res);
    }
   },UsernamePasswordAuthenticationFilter.class);
  return http.build();
 }
 private static void error(HttpServletResponse res,int status,String mensaje) throws IOException {
  res.setStatus(status); res.setContentType("application/json");res.setCharacterEncoding("UTF-8");
  res.getWriter().write("{\"message\":\""+mensaje+"\"}");
 }
}

