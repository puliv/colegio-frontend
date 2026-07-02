import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { vi, describe, test, expect, beforeEach } from "vitest";
import axios from "axios";
import Cursos from "../pages/Cursos";

// ─── Mocks ────────────────────────────────────────────────────────────────────
vi.mock("axios");
vi.mock("../styles/Cursos.css", () => ({}));

// ─── Datos de prueba ──────────────────────────────────────────────────────────
const cursosMock = [
  { id: 1, nombre: "1° Básico A" },
  { id: 2, nombre: "2° Básico B" },
];

const alumnosMock = [
  { id: 10, rut: "12345678-9", nombre: "Ana", apellido: "Soto" },
  { id: 11, rut: "98765432-1", nombre: "Luis", apellido: "Araya" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const mockToken = (token = "token-valido-123") =>
  vi.spyOn(Storage.prototype, "getItem").mockReturnValue(token);

const mockSinToken = () =>
  vi.spyOn(Storage.prototype, "getItem").mockReturnValue(null);

// Configura la respuesta de axios para cursos Y alumnos en una sola llamada
const mockAxiosExitoso = () => {
  axios.get.mockImplementation((url) => {
    if (url.includes("/cursos")) {
      return Promise.resolve({ data: { cursos: cursosMock } });
    }
    if (url.includes("/estudiantes")) {
      return Promise.resolve({ data: { alumnos: alumnosMock } });
    }
  });
};

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("Cursos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Estado de carga ──────────────────────────────────────────────────────
  describe("Estado de carga", () => {
    test("muestra spinner mientras carga los cursos", () => {
      mockToken();
      // axios nunca resuelve → componente queda en loading
      axios.get.mockImplementation(() => new Promise(() => {}));

      render(<Cursos />);

      expect(
        screen.getByText(/Cargando nómina oficial desde MySQL/i)
      ).toBeInTheDocument();
    });
  });

  // ── Sin token ────────────────────────────────────────────────────────────
  describe("Sin sesión activa", () => {
    test("muestra error si no hay token en localStorage", async () => {
      mockSinToken();

      render(<Cursos />);

      await waitFor(() => {
        expect(
          screen.getByText(/No se encontró una sesión activa/i)
        ).toBeInTheDocument();
      });

      expect(axios.get).not.toHaveBeenCalled();
    });
  });

  // ── Carga exitosa de cursos ──────────────────────────────────────────────
  describe("Carga exitosa", () => {
    test("renderiza los botones de curso al cargar correctamente", async () => {
      mockToken();
      mockAxiosExitoso();

      render(<Cursos />);

      await waitFor(() => {
        expect(screen.getByText("1° Básico A")).toBeInTheDocument();
        expect(screen.getByText("2° Básico B")).toBeInTheDocument();
      });
    });

    test("selecciona el primer curso automáticamente", async () => {
      mockToken();
      mockAxiosExitoso();

      render(<Cursos />);

      await waitFor(() => {
        const botonActivo = screen.getByText("1° Básico A").closest("button");
        expect(botonActivo).toHaveClass("active");
      });
    });

    test("carga y muestra los alumnos del primer curso automáticamente", async () => {
      mockToken();
      mockAxiosExitoso();

      render(<Cursos />);

      await waitFor(() => {
        expect(screen.getByText("Soto")).toBeInTheDocument();
        expect(screen.getByText("Araya")).toBeInTheDocument();
      });
    });

    test("muestra el contador total de alumnos", async () => {
      mockToken();
      mockAxiosExitoso();

      render(<Cursos />);

      await waitFor(() => {
        expect(screen.getByText(/Total: 2 alumnos/i)).toBeInTheDocument();
      });
    });

    test("muestra el nombre del curso activo en el encabezado de la tabla", async () => {
      mockToken();
      mockAxiosExitoso();

      render(<Cursos />);

      await waitFor(() => {
        expect(
          screen.getByText(/Alumnos del 1° Básico A/i)
        ).toBeInTheDocument();
      });
    });

    test("ordena los alumnos por apellido de forma ascendente", async () => {
      mockToken();
      mockAxiosExitoso();

      render(<Cursos />);

      await waitFor(() => {
        const filas = screen.getAllByRole("row");
        // fila 0 = thead, fila 1 = primer alumno
        expect(filas[1]).toHaveTextContent("Araya"); // A antes que S
        expect(filas[2]).toHaveTextContent("Soto");
      });
    });

    test("cada alumno muestra badge 'Activo'", async () => {
      mockToken();
      mockAxiosExitoso();

      render(<Cursos />);

      await waitFor(() => {
        const badges = screen.getAllByText("Activo");
        expect(badges).toHaveLength(alumnosMock.length);
      });
    });

    test("muestra los RUT de los alumnos en la tabla", async () => {
      mockToken();
      mockAxiosExitoso();

      render(<Cursos />);

      await waitFor(() => {
        expect(screen.getByText("12345678-9")).toBeInTheDocument();
        expect(screen.getByText("98765432-1")).toBeInTheDocument();
      });
    });
  });

  // ── Cambio de curso ──────────────────────────────────────────────────────
  describe("Cambio de curso", () => {
    test("cambia el curso activo al hacer click en otro botón", async () => {
      mockToken();
      mockAxiosExitoso();

      render(<Cursos />);

      await waitFor(() => screen.getByText("2° Básico B"));

      fireEvent.click(screen.getByText("2° Básico B"));

      await waitFor(() => {
        const boton = screen.getByText("2° Básico B").closest("button");
        expect(boton).toHaveClass("active");
      });
    });

    test("vuelve a consultar la API de estudiantes al cambiar de curso", async () => {
      mockToken();
      mockAxiosExitoso();

      render(<Cursos />);

      await waitFor(() => screen.getByText("2° Básico B"));
      fireEvent.click(screen.getByText("2° Básico B"));

      await waitFor(() => {
        const llamadas = axios.get.mock.calls.filter((c) =>
          c[0].includes("/estudiantes")
        );
        // Una llamada para curso 1 + otra para curso 2
        expect(llamadas.length).toBeGreaterThanOrEqual(2);
      });
    });

    test("la segunda llamada a estudiantes incluye el cursoId correcto", async () => {
      mockToken();
      mockAxiosExitoso();

      render(<Cursos />);

      await waitFor(() => screen.getByText("2° Básico B"));
      fireEvent.click(screen.getByText("2° Básico B"));

      await waitFor(() => {
        const llamadas = axios.get.mock.calls.filter((c) =>
          c[0].includes("/estudiantes")
        );
        const ultima = llamadas[llamadas.length - 1][0];
        expect(ultima).toContain("cursoId=2");
      });
    });
  });

  // ── Sin alumnos ──────────────────────────────────────────────────────────
  describe("Sin alumnos en el curso", () => {
    test("muestra mensaje cuando el curso no tiene alumnos matriculados", async () => {
      mockToken();
      axios.get.mockImplementation((url) => {
        if (url.includes("/cursos"))
          return Promise.resolve({ data: { cursos: cursosMock } });
        if (url.includes("/estudiantes"))
          return Promise.resolve({ data: { alumnos: [] } });
      });

      render(<Cursos />);

      await waitFor(() => {
        expect(
          screen.getByText(/No se encontraron alumnos matriculados/i)
        ).toBeInTheDocument();
      });
    });
  });

  // ── Sin cursos ───────────────────────────────────────────────────────────
  describe("Sin cursos disponibles", () => {
    test("muestra alerta cuando el profesor no tiene cursos asignados", async () => {
      mockToken();
      axios.get.mockImplementation((url) => {
        if (url.includes("/cursos"))
          return Promise.resolve({ data: { cursos: [] } });
      });

      render(<Cursos />);

      await waitFor(() => {
        expect(
          screen.getByText(/No hay cursos disponibles para este profesor/i)
        ).toBeInTheDocument();
      });
    });
  });

  // ── Errores de API ───────────────────────────────────────────────────────
  describe("Errores de API", () => {
    test("muestra error si falla la petición de cursos", async () => {
      mockToken();
      axios.get.mockRejectedValue(new Error("Network Error"));

      render(<Cursos />);

      await waitFor(() => {
        expect(
          screen.getByText(/Error al cargar la lista de cursos/i)
        ).toBeInTheDocument();
      });
    });

    test("muestra lista vacía si falla la petición de alumnos (sin romper UI)", async () => {
      mockToken();
      axios.get.mockImplementation((url) => {
        if (url.includes("/cursos"))
          return Promise.resolve({ data: { cursos: cursosMock } });
        if (url.includes("/estudiantes"))
          return Promise.reject(new Error("Error de red"));
      });

      render(<Cursos />);

      await waitFor(() => {
        expect(
          screen.getByText(/No se encontraron alumnos matriculados/i)
        ).toBeInTheDocument();
      });
    });

    test("acepta respuesta de cursos como array directo (sin wrapper {cursos})", async () => {
      mockToken();
      axios.get.mockImplementation((url) => {
        if (url.includes("/cursos"))
          return Promise.resolve({ data: cursosMock }); // array directo
        if (url.includes("/estudiantes"))
          return Promise.resolve({ data: { alumnos: [] } });
      });

      render(<Cursos />);

      await waitFor(() => {
        expect(screen.getByText("1° Básico A")).toBeInTheDocument();
      });
    });
  });
});
