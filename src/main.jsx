import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./estilos.css";
import App from "./App.jsx";
import { CarritoProvider } from "./context/CarritoContext";

/**
 * Punto de entrada de la aplicación.
 * Carga los estilos (Bootstrap y estilos.css) y monta App dentro de
 * StrictMode, HashRouter (rutas) y CarritoProvider (estado del carrito).
 */
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HashRouter>
      <CarritoProvider>
        <App />
      </CarritoProvider>
    </HashRouter>
  </StrictMode>,
);