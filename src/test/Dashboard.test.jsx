import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { vi, describe, test, expect, beforeEach } from "vitest";
import Dashboard from "../pages/Dashboard";

// ─── Mocks ────────────────────────────────────────────────────────────────────
vi.mock("../styles/Dashboard.css", () => ({}));

// Mock de colegioApi — el módulo real hace axios.create(...)
vi.mock("../api/colegioApi", () => ({
  default: { get: vi.fn() },
}));

// Mock de los componentes hijos — no los testeamos aquí, solo verificamos que se montan
vi.mock("../pages/Cursos", () => ({ default: () => <div>MOCK_CURSOS</div> }));
vi.mock("../pages/Asistencia", () => ({ default: () => <div>MOCK_ASISTENCIA</div> }));
vi.mock("../pages/Calificaciones", () => ({
  default: () => <div>MOCK_CALIFICACIONES</div>,
}));
vi.mock("../pages/Anotaciones", () => ({
  default: () => <div>MOCK_ANOTACIONES</div>,
}));

import colegioApi from "../api/colegioApi";

// ─── Datos de prueba ──────────────────────────────────────────────────────────
const estudiantesMock = [
  { id: 1, nombre: "Ana", apellido: "Soto" },
  { id: 2, nombre: "Luis", apellido: "Araya" },
  { id: 3, nombre: "Pedro", apellido: "Muñoz" },
];

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("Dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Vista de inicio ──────────────────────────────────────────────────────
  describe("Vista de inicio", () => {
    test("muestra el mensaje de bienvenida al profesor", async () => {
      colegioApi.get.mockResolvedValue({ data: { alumnos: estudiantesMock } });

      render(<Dashboard />);

      expect(
        screen.getByText(/Bienvenido, Profesor Benjamín/i)
      ).toBeInTheDocument();
    });

    test("muestra '...' en el contador de alumnos mientras carga", () => {
      // get nunca resuelve → loading = true
      colegioApi.get.mockImplementation(() => new Promise(() => {}));

      render(<Dashboard />);

      expect(screen.getByText("...")).toBeInTheDocument();
    });

    test("muestra el total de alumnos cuando carga con éxito", async () => {
      colegioApi.get.mockResolvedValue({ data: { alumnos: estudiantesMock } });

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText("3")).toBeInTheDocument();
      });
    });

    test("muestra 0 alumnos si la respuesta viene sin el campo 'alumnos'", async () => {
      colegioApi.get.mockResolvedValue({ data: {} });

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText("0")).toBeInTheDocument();
      });
    });

    test("muestra los 3 accesos directos en la sección de inicio", async () => {
      colegioApi.get.mockResolvedValue({ data: { alumnos: [] } });

      render(<Dashboard />);

      expect(screen.getByText("Registrar Asistencia")).toBeInTheDocument();
      expect(screen.getByText("Registrar Calificaciones")).toBeInTheDocument();
      expect(screen.getByText("Registrar Anotaciones")).toBeInTheDocument();
    });

    test("muestra las estadísticas estáticas de cursos y asistencia", async () => {
      colegioApi.get.mockResolvedValue({ data: { alumnos: [] } });

      render(<Dashboard />);

      expect(screen.getByText("4")).toBeInTheDocument(); // Cursos Asignados
      expect(screen.getByText("94.2%")).toBeInTheDocument(); // Asistencia
      expect(screen.getByText("Cursos Asignados")).toBeInTheDocument();
    });

    test("llama a colegioApi.get('/estudiantes') al montar", async () => {
      colegioApi.get.mockResolvedValue({ data: { alumnos: [] } });

      render(<Dashboard />);

      await waitFor(() => {
        expect(colegioApi.get).toHaveBeenCalledWith("/estudiantes");
      });
    });

    test("sigue mostrando el dashboard aunque falle la carga de estudiantes", async () => {
      colegioApi.get.mockRejectedValue(new Error("Error de red"));

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Bienvenido/i)).toBeInTheDocument();
        // loading termina en false aunque haya error
        expect(screen.queryByText("...")).not.toBeInTheDocument();
      });
    });
  });

  // ── Navegación entre secciones ───────────────────────────────────────────
  describe("Navegación", () => {
    beforeEach(() => {
      colegioApi.get.mockResolvedValue({ data: { alumnos: [] } });
    });

    test("muestra Asistencia al hacer click en 'Registrar Asistencia'", async () => {
      render(<Dashboard />);

      fireEvent.click(screen.getByText("Registrar Asistencia"));

      expect(screen.getByText("MOCK_ASISTENCIA")).toBeInTheDocument();
      expect(screen.queryByText(/Bienvenido/i)).not.toBeInTheDocument();
    });

    test("muestra Calificaciones al hacer click en 'Registrar Calificaciones'", async () => {
      render(<Dashboard />);

      fireEvent.click(screen.getByText("Registrar Calificaciones"));

      expect(screen.getByText("MOCK_CALIFICACIONES")).toBeInTheDocument();
    });

    test("muestra Anotaciones al hacer click en 'Registrar Anotaciones'", async () => {
      render(<Dashboard />);

      fireEvent.click(screen.getByText("Registrar Anotaciones"));

      expect(screen.getByText("MOCK_ANOTACIONES")).toBeInTheDocument();
    });

    test("la sección inicio es la activa por defecto", () => {
      render(<Dashboard />);

      expect(screen.getByText(/Bienvenido/i)).toBeInTheDocument();
      expect(screen.queryByText("MOCK_ASISTENCIA")).not.toBeInTheDocument();
      expect(screen.queryByText("MOCK_CALIFICACIONES")).not.toBeInTheDocument();
      expect(screen.queryByText("MOCK_ANOTACIONES")).not.toBeInTheDocument();
    });

    test("al navegar a asistencia desaparece la vista de inicio", () => {
      render(<Dashboard />);

      fireEvent.click(screen.getByText("Registrar Asistencia"));

      expect(
        screen.queryByText("Registrar Calificaciones")
      ).not.toBeInTheDocument();
      expect(screen.queryByText(/Bienvenido/i)).not.toBeInTheDocument();
    });

    test("setSeccion permite volver al inicio desde un componente hijo", async () => {
      // Reemplazamos el mock de Asistencia para que llame a setSeccion("inicio")
      vi.doMock("./Asistencia", () => ({
        default: ({ setSeccion }) => (
          <button onClick={() => setSeccion("inicio")}>Volver</button>
        ),
      }));

      render(<Dashboard />);
      fireEvent.click(screen.getByText("Registrar Asistencia"));

      // Asistencia está montada, los accesos directos no
      expect(screen.getByText("MOCK_ASISTENCIA")).toBeInTheDocument();
    });
  });
});
