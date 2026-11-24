import { Navigate, useLocation } from 'react-router-dom';
import { useUsuario } from '../utils/sesion';
export default function ProtectedRoute({ children, roles = ['administrador', 'vendedor'] }) {
  const usuario = useUsuario();
  const location = useLocation();
  if (!usuario) return <Navigate to="/login" state={{ volver: location.pathname + location.search }} replace />;
  if (!roles.includes(usuario.rol)) return <Navigate to="/" replace />;
  return children;
}
