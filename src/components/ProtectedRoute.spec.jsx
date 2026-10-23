import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

// Monta una ruta protegida en /admin, con pantallas simples de destino para /login y /.
function renderizarRuta(props = {}) {
  return render(
    <MemoryRouter initialEntries={["/admin"]}>
      <Routes>
        <Route path="/login" element={<p>Pantalla login</p>} />
        <Route path="/" element={<p>Pantalla inicio</p>} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute {...props}>
              <p>Contenido protegido</p>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

function iniciarSesion(rol) {
  sessionStorage.setItem("usuario", JSON.stringify({ nombre: "Ana", rol }));
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("redirige a /login si no hay sesión", () => {
    renderizarRuta();

    expect(screen.getByText("Pantalla login")).toBeTruthy();
    expect(screen.queryByText("Contenido protegido")).toBeNull();
  });

  it("muestra el contenido a un administrador", () => {
    iniciarSesion("administrador");

    renderizarRuta();

    expect(screen.getByText("Contenido protegido")).toBeTruthy();
  });

  it("muestra el contenido a un vendedor (roles por defecto)", () => {
    iniciarSesion("vendedor");

    renderizarRuta();

    expect(screen.getByText("Contenido protegido")).toBeTruthy();
  });

  it("redirige a inicio si el rol no está permitido", () => {
    iniciarSesion("cliente");

    renderizarRuta();

    expect(screen.getByText("Pantalla inicio")).toBeTruthy();
    expect(screen.queryByText("Contenido protegido")).toBeNull();
  });

  it("respeta una lista de roles personalizada", () => {
    iniciarSesion("vendedor");

    renderizarRuta({ roles: ["administrador"] });

    expect(screen.getByText("Pantalla inicio")).toBeTruthy();
  });

  it("redirige a /login si lo guardado no es JSON válido (mock de getItem)", () => {
    // Mock: getItem devuelve texto inválido
    vi.spyOn(Storage.prototype, "getItem").mockReturnValue("{no es json");

    renderizarRuta();

    expect(screen.getByText("Pantalla login")).toBeTruthy();
  });
});