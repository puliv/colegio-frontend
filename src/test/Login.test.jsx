import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import axios from "axios";
import Login from "../pages/Login";

vi.mock("axios");

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../assets/logo-colegio.png", () => ({ default: "logo.png" }));

const renderLogin = () => render(<Login />, { wrapper: MemoryRouter });

describe("Login component", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    axios.post.mockReset();
  });

  it("muestra el título y los campos", () => {
    renderLogin();
    expect(screen.getByPlaceholderText("Correo")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Contraseña")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /ingresar/i }),
    ).toBeInTheDocument();
  });

  it("navega al dashboard con credenciales válidas", async () => {
    axios.post.mockResolvedValue({
      data: {
        ok: true,
        token: "fake-token",
        usuario: { id: 1, nombre: "Benjamin", rol: "PROFESOR" },
      },
    });

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

  it("muestra error con contraseña incorrecta", async () => {
    axios.post.mockRejectedValue({
      response: { data: { ok: false, msg: "Credenciales incorrectas (Password)" } },
    });

    renderLogin();
    const user = userEvent.setup();

    await user.type(
      screen.getByPlaceholderText("Correo"),
      "benjamin.profesor@cbohiggins.cl",
    );
    await user.type(screen.getByPlaceholderText("Contraseña"), "wrongpass");
    await user.click(screen.getByRole("button", { name: /ingresar/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /credenciales incorrectas/i,
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("muestra error con email incorrecto", async () => {
    axios.post.mockRejectedValue({
      response: { data: { ok: false, msg: "Credenciales incorrectas (Email)" } },
    });

    renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText("Correo"), "otro@email.com");
    await user.type(screen.getByPlaceholderText("Contraseña"), "benja2026");
    await user.click(screen.getByRole("button", { name: /ingresar/i }));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("acepta el email con mayúsculas o espacios", async () => {
    axios.post.mockResolvedValue({
      data: {
        ok: true,
        token: "fake-token",
        usuario: { id: 1, nombre: "Benjamin", rol: "PROFESOR" },
      },
    });

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

  it("limpia el error al loguearse correctamente después de un intento fallido", async () => {
    renderLogin();
    const user = userEvent.setup();

    axios.post.mockRejectedValueOnce({
      response: { data: { ok: false, msg: "Credenciales incorrectas (Password)" } },
    });

    await user.type(
      screen.getByPlaceholderText("Correo"),
      "benjamin.profesor@cbohiggins.cl",
    );
    await user.type(screen.getByPlaceholderText("Contraseña"), "wrong");
    await user.click(screen.getByRole("button", { name: /ingresar/i }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();

    axios.post.mockResolvedValueOnce({
      data: {
        ok: true,
        token: "fake-token",
        usuario: { id: 1, nombre: "Benjamin", rol: "PROFESOR" },
      },
    });

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
