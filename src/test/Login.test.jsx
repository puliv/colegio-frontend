import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Login from "../pages/Login";

// Mock de useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

// Mock del logo para evitar error de import
vi.mock("../assets/logo-colegio.png", () => ({ default: "logo.png" }));

// Helper para renderizar con el router
const renderLogin = () => render(<Login />, { wrapper: MemoryRouter });

describe("Login component", () => {
  beforeEach(() => mockNavigate.mockClear());

  // --- Renderizado ---
  it("muestra el título y los campos", () => {
    renderLogin();
    expect(screen.getByPlaceholderText("Correo")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Contraseña")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /ingresar/i }),
    ).toBeInTheDocument();
  });

  // --- Credenciales correctas ---
  it("navega al dashboard con credenciales válidas", async () => {
    renderLogin();
    const user = userEvent.setup();

    await user.type(
      screen.getByPlaceholderText("Correo"),
      "benjamin.profesor@cbohiggins.cl",
    );
    await user.type(screen.getByPlaceholderText("Contraseña"), "benja2026");
    await user.click(screen.getByRole("button", { name: /ingresar/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  // --- Credenciales incorrectas ---
  it("muestra error con contraseña incorrecta", async () => {
    renderLogin();
    const user = userEvent.setup();

    await user.type(
      screen.getByPlaceholderText("Correo"),
      "benjamin.profesor@cbohiggins.cl",
    );
    await user.type(screen.getByPlaceholderText("Contraseña"), "wrongpass");
    await user.click(screen.getByRole("button", { name: /ingresar/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      /credenciales incorrectas/i,
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("muestra error con email incorrecto", async () => {
    renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText("Correo"), "otro@email.com");
    await user.type(screen.getByPlaceholderText("Contraseña"), "benja2026");
    await user.click(screen.getByRole("button", { name: /ingresar/i }));

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  // --- Normalización de email ---
  it("acepta el email con mayúsculas o espacios", async () => {
    renderLogin();
    const user = userEvent.setup();

    await user.type(
      screen.getByPlaceholderText("Correo"),
      "  Benjamin.Profesor@cbohiggins.cl  ",
    );
    await user.type(screen.getByPlaceholderText("Contraseña"), "benja2026");
    await user.click(screen.getByRole("button", { name: /ingresar/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });

  // --- El error desaparece en login exitoso ---
it("limpia el error al loguearse correctamente después de un intento fallido", async () => {
  renderLogin();
  const user = userEvent.setup();

  // Primer intento fallido — necesita email también
  await user.type(
    screen.getByPlaceholderText("Correo"),
    "benjamin.profesor@cbohiggins.cl",
  );
  await user.type(screen.getByPlaceholderText("Contraseña"), "wrong");
  await user.click(screen.getByRole("button", { name: /ingresar/i }));
  expect(screen.getByRole("alert")).toBeInTheDocument();

  // Segundo intento exitoso
  await user.clear(screen.getByPlaceholderText("Correo"));
  await user.clear(screen.getByPlaceholderText("Contraseña"));
  await user.type(
    screen.getByPlaceholderText("Correo"),
    "benjamin.profesor@cbohiggins.cl",
  );
  await user.type(screen.getByPlaceholderText("Contraseña"), "benja2026");
  await user.click(screen.getByRole("button", { name: /ingresar/i }));

  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});
});
