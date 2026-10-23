import Checkout from "./pages/Checkout";
import ResultadoCompra from "./pages/ResultadoCompra";
import { Routes, Route } from "react-router-dom";
import NavbarSuperior from "./components/NavbarSuperior";
import Footer from "./components/Footer";
import BotonWhatsApp from "./components/BotonWhatsApp";
import ChatBiker from "./components/ChatBiker";
import ProtectedRoute from "./components/ProtectedRoute";
import Inicio from "./pages/Inicio";
import Productos from "./pages/Productos";
import Nosotros from "./pages/Nosotros";
import Noticias from "./pages/Noticias";
import Contacto from "./pages/Contacto";
import Login from "./pages/Login";
import Carrito from "./pages/Carrito";
import Registro from "./pages/Registro";
import DetalleProducto from "./pages/DetalleProducto";
import DetalleBlog1 from "./pages/DetalleBlog1";
import DetalleBlog2 from "./pages/DetalleBlog2";
import Admin from "./pages/Admin";
import AdminProductos from "./pages/AdminProductos";
import AdminNuevoProducto from "./pages/AdminNuevoProducto";
import AdminUsuarios from "./pages/AdminUsuarios";
import AdminNuevoUsuario from "./pages/AdminNuevoUsuario";

/**
 * Componente raíz: define el diseño general (barra superior, contenido y pie)
 * y la tabla de rutas de la aplicación.
 * Rutas públicas: /, /productos, /nosotros, /noticias, /contacto, /login,
 * /carrito, /registro, /detalle-producto, /detalle-blog1 y /detalle-blog2.
 * Rutas protegidas con ProtectedRoute (requieren sesión de administrador o
 * vendedor): /admin, /admin-productos, /admin-nuevo-producto, /admin-usuarios
 * y /admin-nuevo-usuario.
 *
 * @returns {JSX.Element} Aplicación completa.
 */
function App() {
  return (
    <>
      <a className="visually-hidden-focusable p-3 d-block" href="#contenido" onClick={evento => { evento.preventDefault(); document.getElementById('contenido').focus(); }}>Saltar al contenido</a>
      <NavbarSuperior />
      <main id="contenido" tabIndex={-1} className="container my-4">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="*" element={<section><h1>Página no encontrada</h1><p>Utiliza el menú para continuar navegando.</p></section>} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/ofertas" element={<Productos soloOfertas />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/noticias" element={<Noticias />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/login" element={<Login />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/compra/:id" element={<ResultadoCompra />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/detalle-producto" element={<DetalleProducto />} />
          <Route path="/detalle-blog1" element={<DetalleBlog1 />} />
          <Route path="/detalle-blog2" element={<DetalleBlog2 />} />
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          <Route path="/admin-productos" element={<ProtectedRoute><AdminProductos /></ProtectedRoute>} />
          <Route path="/admin-nuevo-producto" element={<ProtectedRoute><AdminNuevoProducto /></ProtectedRoute>} />
          <Route path="/admin-usuarios" element={<ProtectedRoute roles={["administrador"]}><AdminUsuarios /></ProtectedRoute>} />
          <Route path="/admin-nuevo-usuario" element={<ProtectedRoute roles={["administrador"]}><AdminNuevoUsuario /></ProtectedRoute>} />
        </Routes>
      </main>
      <Footer />
      <BotonWhatsApp />
      <ChatBiker />
    </>
  );
}

export default App;
