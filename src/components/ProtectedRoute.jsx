import { Navigate } from "react-router-dom";

/**
 * Protege una ruta según la sesión guardada en sessionStorage (clave "usuario").
 * - Sin sesión (o con datos inválidos): redirige a /login.
 * - Con sesión pero rol no permitido: redirige a la página de inicio.
 * - Con sesión y rol permitido: muestra el contenido.
 *
 * @param {Object} props
 * @param {JSX.Element} props.children - Contenido que se muestra si hay acceso.
 * @param {string[]} [props.roles=["administrador", "vendedor"]] - Roles con acceso.
 * @returns {JSX.Element} El contenido protegido o una redirección.
 */
function ProtectedRoute({ children, roles = ["administrador", "vendedor"] }) {
  let usuario;
  try {
    usuario = JSON.parse(sessionStorage.getItem("usuario"));
  } catch {
    usuario = null;
  }

  if (!usuario) return <Navigate to="/login" replace />;
  if (!roles.includes(usuario.rol)) return <Navigate to="/" replace />;
  return children;
}

export default ProtectedRoute;