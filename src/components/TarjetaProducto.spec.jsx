import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TarjetaProducto from "./TarjetaProducto";
import { CarritoProvider } from "../context/CarritoContext";

const producto = {
  id: 7,
  nombre: "Casco Aero",
  descripcion: "Casco liviano para ruta",
  precio: 15990,
  imagen: "/img/casco.jpg",
  alt: "Casco Aero negro",
};

// Renderiza la tarjeta con el router y el carrito que necesita para funcionar.
function renderizarTarjeta() {
  return render(
    <MemoryRouter>
      <CarritoProvider>
        <TarjetaProducto producto={producto} />
      </CarritoProvider>
    </MemoryRouter>
  );
}

function leerCarritoGuardado() {
  return JSON.parse(localStorage.getItem("carritoBikers"));
}

describe("TarjetaProducto", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("muestra nombre, descripción y precio formateado", () => {
    renderizarTarjeta();

    expect(screen.getByRole("heading", { name: "Casco Aero" })).toBeTruthy();
    expect(screen.getByText("Casco liviano para ruta")).toBeTruthy();
    expect(screen.getByText("$15.990")).toBeTruthy();
  });

  it("muestra la imagen con su texto alternativo", () => {
    renderizarTarjeta();

    const imagen = screen.getByRole("img", { name: "Casco Aero negro" });
    expect(imagen.getAttribute("src")).toBe("/img/casco.jpg");
  });

  it("enlaza a la página de detalle con el id del producto", () => {
    renderizarTarjeta();

    // react-bootstrap le pone role="button" al enlace cuando se usa Button as={Link}
    const enlace = screen.getByRole("button", { name: "Ver detalle" });
    expect(enlace.getAttribute("href")).toBe("/detalle-producto?id=7");
  });

  it("agrega el producto al carrito al hacer clic", () => {
    renderizarTarjeta();

    fireEvent.click(screen.getByRole("button", { name: "Agregar al carrito" }));

    const carrito = leerCarritoGuardado();
    expect(carrito.length).toBe(1);
    expect(carrito[0].id).toBe(7);
    expect(carrito[0].cantidad).toBe(1);
  });

  it("suma la cantidad si se agrega dos veces el mismo producto", () => {
    renderizarTarjeta();
    const boton = screen.getByRole("button", { name: "Agregar al carrito" });

    fireEvent.click(boton);
    fireEvent.click(boton);

    const carrito = leerCarritoGuardado();
    expect(carrito.length).toBe(1);
    expect(carrito[0].cantidad).toBe(2);
  });
});