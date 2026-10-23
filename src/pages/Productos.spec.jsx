import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Productos from "./Productos";
import { CarritoProvider } from "../context/CarritoContext";

const datosFalsos = [
  { id: 1, nombre: "Casco Integral", descripcion: "Casco de prueba", precio: 79990, imagen: "/img/a.jpg", alt: "Casco" },
  { id: 2, nombre: "Guantes Biker", descripcion: "Guantes de prueba", precio: 29990, imagen: "/img/b.jpg", alt: "Guantes" },
];

// Productos usa TarjetaProducto, que necesita router y carrito.
function renderizarPagina() {
  return render(
    <MemoryRouter>
      <CarritoProvider>
        <Productos />
      </CarritoProvider>
    </MemoryRouter>
  );
}

describe("Productos", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("muestra una tarjeta por cada producto recibido (mock de fetch)", async () => {
    // Mock: fetch responde con datos falsos, sin pedir el JSON real
    vi.spyOn(window, "fetch").mockReturnValue(
      Promise.resolve({ json: () => Promise.resolve(datosFalsos) })
    );

    renderizarPagina();

    expect(await screen.findByRole("heading", { name: "Casco Integral" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Guantes Biker" })).toBeTruthy();
    expect(screen.getByText("$79.990")).toBeTruthy();
  });

  it("pide los datos a la ruta data/productos.json", async () => {
    const espia = vi.spyOn(window, "fetch").mockReturnValue(
      Promise.resolve({ json: () => Promise.resolve(datosFalsos) })
    );

    renderizarPagina();
    await screen.findByRole("heading", { name: "Casco Integral" });

    expect(espia).toHaveBeenCalledWith("/data/productos.json");
  });

  it("no muestra el mensaje de error cuando la carga resulta bien", async () => {
    vi.spyOn(window, "fetch").mockReturnValue(
      Promise.resolve({ json: () => Promise.resolve(datosFalsos) })
    );

    renderizarPagina();
    await screen.findByRole("heading", { name: "Casco Integral" });

    expect(screen.queryByText("No se pudieron cargar los productos.")).toBeNull();
  });

  it("muestra un mensaje de error si fetch falla (mock de fetch rechazado)", async () => {
    // Mock: fetch falla, como si no hubiera red
    vi.spyOn(window, "fetch").mockReturnValue(Promise.reject(new Error("sin red")));

    renderizarPagina();

    expect(await screen.findByText("No se pudieron cargar los productos.")).toBeTruthy();
  });
});