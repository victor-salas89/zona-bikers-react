import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from "@testing-library/react";
import { CarritoProvider, useCarrito } from "./CarritoContext";

const casco = { id: 1, nombre: "Casco Aero", precio: 10000, imagen: "/img/casco.jpg", alt: "Casco" };
const guantes = { id: 2, nombre: "Guantes", precio: 5000, imagen: "/img/guantes.jpg", alt: "Guantes" };

// Monta el hook useCarrito dentro de su proveedor, como lo usa la app.
function montarCarrito() {
  return renderHook(() => useCarrito(), { wrapper: CarritoProvider });
}

describe("CarritoContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("inicia vacío", () => {
    const { result } = montarCarrito();

    expect(result.current.carrito).toEqual([]);
    expect(result.current.total).toBe(0);
    expect(result.current.cantidadTotal).toBe(0);
  });

  it("agrega un producto nuevo con cantidad 1", () => {
    const { result } = montarCarrito();

    act(() => result.current.agregar(casco));

    expect(result.current.carrito.length).toBe(1);
    expect(result.current.carrito[0].id).toBe(1);
    expect(result.current.carrito[0].cantidad).toBe(1);
  });

  it("suma la cantidad si el producto ya estaba en el carrito", () => {
    const { result } = montarCarrito();

    act(() => result.current.agregar(casco));
    act(() => result.current.agregar(casco));

    expect(result.current.carrito.length).toBe(1);
    expect(result.current.carrito[0].cantidad).toBe(2);
  });

  it("agrega con la cantidad indicada", () => {
    const { result } = montarCarrito();

    act(() => result.current.agregar(casco, 3));

    expect(result.current.carrito[0].cantidad).toBe(3);
  });

  it("cambia la cantidad de un producto", () => {
    const { result } = montarCarrito();
    act(() => result.current.agregar(casco));

    act(() => result.current.cambiarCantidad(1, 5));

    expect(result.current.carrito[0].cantidad).toBe(5);
  });

  it("ignora un cambio de cantidad a 0 o negativo", () => {
    const { result } = montarCarrito();
    act(() => result.current.agregar(casco, 2));

    act(() => result.current.cambiarCantidad(1, 0));
    act(() => result.current.cambiarCantidad(1, -3));

    expect(result.current.carrito[0].cantidad).toBe(2);
  });

  it("elimina un producto por id", () => {
    const { result } = montarCarrito();
    act(() => result.current.agregar(casco));
    act(() => result.current.agregar(guantes));

    act(() => result.current.eliminar(1));

    expect(result.current.carrito.length).toBe(1);
    expect(result.current.carrito[0].id).toBe(2);
  });

  it("vacía el carrito", () => {
    const { result } = montarCarrito();
    act(() => result.current.agregar(casco));
    act(() => result.current.agregar(guantes));

    act(() => result.current.vaciar());

    expect(result.current.carrito).toEqual([]);
  });

  it("calcula el total y la cantidad total", () => {
    const { result } = montarCarrito();

    act(() => result.current.agregar(casco, 2)); // 2 x 10000
    act(() => result.current.agregar(guantes, 1)); // 1 x 5000

    expect(result.current.total).toBe(25000);
    expect(result.current.cantidadTotal).toBe(3);
  });

  it("carga el carrito guardado en localStorage al iniciar", () => {
    localStorage.setItem(
      "carritoBikers",
      JSON.stringify([{ ...casco, cantidad: 4 }])
    );

    const { result } = montarCarrito();

    expect(result.current.carrito.length).toBe(1);
    expect(result.current.carrito[0].cantidad).toBe(4);
  });

  it("usa un carrito vacío si lo guardado no es JSON válido (mock de getItem)", () => {
    // Mock: localStorage.getItem devuelve texto inválido
    vi.spyOn(Storage.prototype, "getItem").mockReturnValue("{no es json");

    const { result } = montarCarrito();

    expect(result.current.carrito).toEqual([]);
  });

  it("guarda el carrito en localStorage al agregar (mock de setItem)", () => {
    // Mock: espía setItem sin escribir de verdad
    const espia = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {});
    const { result } = montarCarrito();

    act(() => result.current.agregar(casco));

    const ultimaLlamada = espia.mock.calls.at(-1);
    expect(ultimaLlamada[0]).toBe("carritoBikers");
    expect(JSON.parse(ultimaLlamada[1])[0].id).toBe(1);
  });

    it("al sumar cantidad no modifica los otros productos del carrito", () => {
    const { result } = montarCarrito();
    act(() => result.current.agregar(casco));
    act(() => result.current.agregar(guantes));

    act(() => result.current.agregar(casco)); // casco ya existe, guantes no debe cambiar

    expect(result.current.carrito.find((p) => p.id === 1).cantidad).toBe(2);
    expect(result.current.carrito.find((p) => p.id === 2).cantidad).toBe(1);
  });

  it("al cambiar la cantidad no modifica los otros productos del carrito", () => {
    const { result } = montarCarrito();
    act(() => result.current.agregar(casco));
    act(() => result.current.agregar(guantes));

    act(() => result.current.cambiarCantidad(1, 5)); // guantes no debe cambiar

    expect(result.current.carrito.find((p) => p.id === 1).cantidad).toBe(5);
    expect(result.current.carrito.find((p) => p.id === 2).cantidad).toBe(1);
  });
});