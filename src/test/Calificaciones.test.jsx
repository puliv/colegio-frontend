import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, test, expect, beforeEach } from "vitest";
import axios from "axios";
import Calificaciones from "../pages/Calificaciones";

// ─── Mocks ────────────────────────────────────────────────────────────────────
vi.mock("axios");
vi.mock("../styles/Calificaciones.css", () => ({}));

// ─── Datos de prueba ──────────────────────────────────────────────────────────
const cursosMock = [
  { id: 1, nombre: "1° Básico A" },
  { id: 2, nombre: "2° Básico B" },
];

const alumnosMock = [
  {
    id: 10,
    rut: "12345678-9",
    nombre: "Ana",
    apellido: "Soto",
    calificaciones: [{ id: 1, nota: 6.5, descripcion: "Prueba 1" }],
  },
  {
    id: 11,
    rut: "98765432-1",
    nombre: "Luis",
    apellido: "Araya",
    calificaciones: [],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const mockToken = () =>
  vi.spyOn(Storage.prototype, "getItem").mockReturnValue("token-test-123");

const mockSinToken = () =>
  vi.spyOn(Storage.prototype, "getItem").mockReturnValue(null);

const mockAxiosExitoso = () => {
  axios.get.mockImplementation((url) => {
    if (url.includes("/cursos"))
      return Promise.resolve({ data: { cursos: cursosMock } });
    if (url.includes("/estudiantes"))
      return Promise.resolve({ data: { alumnos: alumnosMock } });
  });
};

// setSeccion mock — prop requerida
const setSeccionMock = vi.fn();

const renderCalificaciones = () =>
  render(<Calificaciones setSeccion={setSeccionMock} />);

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("Calificaciones", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Carga inicial ────────────────────────────────────────────────────────
  describe("Carga inicial", () => {
    test("muestra spinner mientras cargan los cursos", () => {
      mockToken();
      axios.get.mockImplementation(() => new Promise(() => {}));

      renderCalificaciones();

      expect(screen.getByText(/Cargando asignaturas/i)).toBeInTheDocument();
    });

    test("muestra error si no hay token", async () => {
      mockSinToken();

      renderCalificaciones();

      await waitFor(() => {
        expect(
          screen.getByText(/No se encontró una sesión activa/i)
        ).toBeInTheDocument();
      });
      expect(axios.get).not.toHaveBeenCalled();
    });

    test("muestra error si falla la petición de cursos", async () => {
      mockToken();
      axios.get.mockRejectedValue(new Error("Network Error"));

      renderCalificaciones();

      await waitFor(() => {
        expect(
          screen.getByText(/Error al cargar la lista de cursos/i)
        ).toBeInTheDocument();
      });
    });

    test("renderiza los tabs de cursos correctamente", async () => {
      mockToken();
      mockAxiosExitoso();

      renderCalificaciones();

      await waitFor(() => {
        expect(screen.getByText("1° Básico A")).toBeInTheDocument();
        expect(screen.getByText("2° Básico B")).toBeInTheDocument();
      });
    });

    test("selecciona el primer curso automáticamente", async () => {
      mockToken();
      mockAxiosExitoso();

      renderCalificaciones();

      await waitFor(() => {
        const boton = screen.getByText("1° Básico A").closest("button");
        expect(boton).toHaveClass("active");
      });
    });
  });

  // ── Vista de alumnos y calificaciones ────────────────────────────────────
  describe("Vista de alumnos", () => {
    test("muestra alumnos ordenados por apellido", async () => {
      mockToken();
      mockAxiosExitoso();

      renderCalificaciones();

      await waitFor(() => {
        const filas = screen.getAllByRole("row");
        expect(filas[1]).toHaveTextContent("Araya"); // A antes que S
        expect(filas[2]).toHaveTextContent("Soto");
      });
    });

    test("muestra las notas existentes del alumno", async () => {
      mockToken();
      mockAxiosExitoso();

      renderCalificaciones();

      await waitFor(() => {
        expect(screen.getByText("6.5")).toBeInTheDocument();
      });
    });

    test("muestra 'Sin notas registradas' para alumnos sin calificaciones", async () => {
      mockToken();
      mockAxiosExitoso();

      renderCalificaciones();

      await waitFor(() => {
        expect(screen.getByText("Sin notas registradas")).toBeInTheDocument();
      });
    });

    test("muestra alerta cuando no hay alumnos en el curso", async () => {
      mockToken();
      axios.get.mockImplementation((url) => {
        if (url.includes("/cursos"))
          return Promise.resolve({ data: { cursos: cursosMock } });
        if (url.includes("/estudiantes"))
          return Promise.resolve({ data: { alumnos: [] } });
      });

      renderCalificaciones();

      await waitFor(() => {
        expect(
          screen.getByText(/No se encontraron alumnos matriculados/i)
        ).toBeInTheDocument();
      });
    });

    test("columna de cabecera muestra 'Calificaciones Registradas' en modo lectura", async () => {
      mockToken();
      mockAxiosExitoso();

      renderCalificaciones();

      await waitFor(() => {
        expect(
          screen.getByText("Calificaciones Registradas")
        ).toBeInTheDocument();
      });
    });
  });

  // ── Modo crear calificación ──────────────────────────────────────────────
  describe("Modo crear calificación", () => {
    test("botón 'Agregar Calificación' está visible en modo lectura", async () => {
      mockToken();
      mockAxiosExitoso();

      renderCalificaciones();

      await waitFor(() => {
        expect(screen.getByText(/Agregar Calificación/i)).toBeInTheDocument();
      });
    });

    test("al hacer click en 'Agregar Calificación' aparece el input de evaluación", async () => {
      mockToken();
      mockAxiosExitoso();

      renderCalificaciones();

      await waitFor(() => screen.getByText(/Agregar Calificación/i));
      fireEvent.click(screen.getByText(/Agregar Calificación/i));

      expect(screen.getByPlaceholderText("Ej: Prueba 1")).toBeInTheDocument();
    });

    test("en modo crear la columna cambia a 'Ingresar Nota'", async () => {
      mockToken();
      mockAxiosExitoso();

      renderCalificaciones();

      await waitFor(() => screen.getByText(/Agregar Calificación/i));
      fireEvent.click(screen.getByText(/Agregar Calificación/i));

      expect(screen.getByText("Ingresar Nota")).toBeInTheDocument();
    });

    test("en modo crear aparecen inputs de nota para cada alumno", async () => {
      mockToken();
      mockAxiosExitoso();

      renderCalificaciones();

      await waitFor(() => screen.getByText(/Agregar Calificación/i));
      fireEvent.click(screen.getByText(/Agregar Calificación/i));

      await waitFor(() => {
        const inputs = screen.getAllByPlaceholderText("7.0");
        expect(inputs).toHaveLength(alumnosMock.length);
      });
    });

    test("se puede escribir el nombre de la evaluación", async () => {
      mockToken();
      mockAxiosExitoso();

      const user = userEvent.setup();
      renderCalificaciones();

      await waitFor(() => screen.getByText(/Agregar Calificación/i));
      fireEvent.click(screen.getByText(/Agregar Calificación/i));

      const inputEval = screen.getByPlaceholderText("Ej: Prueba 1");
      await user.type(inputEval, "Prueba Mensual");

      expect(inputEval).toHaveValue("Prueba Mensual");
    });

    test("se puede ingresar una nota en el input de un alumno", async () => {
      mockToken();
      mockAxiosExitoso();

      const user = userEvent.setup();
      renderCalificaciones();

      await waitFor(() => screen.getByText(/Agregar Calificación/i));
      fireEvent.click(screen.getByText(/Agregar Calificación/i));

      const inputs = screen.getAllByPlaceholderText("7.0");
      await user.type(inputs[0], "6.5");

      expect(inputs[0]).toHaveValue("6.5");
    });

    test("botón 'Cancelar' vuelve al modo lectura y limpia el formulario", async () => {
      mockToken();
      mockAxiosExitoso();

      const user = userEvent.setup();
      renderCalificaciones();

      await waitFor(() => screen.getByText(/Agregar Calificación/i));
      fireEvent.click(screen.getByText(/Agregar Calificación/i));

      const inputEval = screen.getByPlaceholderText("Ej: Prueba 1");
      await user.type(inputEval, "Prueba 1");

      fireEvent.click(screen.getByText("Cancelar"));

      // Vuelve al modo lectura
      expect(screen.getByText(/Agregar Calificación/i)).toBeInTheDocument();
      expect(
        screen.queryByPlaceholderText("Ej: Prueba 1")
      ).not.toBeInTheDocument();
    });

    test("muestra botón 'Guardar Calificación' en modo crear", async () => {
      mockToken();
      mockAxiosExitoso();

      renderCalificaciones();

      // Esperar que carguen los alumnos ANTES de activar modo crear
      // (el botón Guardar solo se renderiza cuando alumnos.length > 0)
      await waitFor(() => screen.getByText("Araya"));

      fireEvent.click(screen.getByText(/Agregar Calificación/i));

      await waitFor(() => {
        expect(screen.getByText("Guardar Calificación")).toBeInTheDocument();
      });
    });
  });

  // ── Guardar calificaciones ───────────────────────────────────────────────
  describe("Guardar calificaciones", () => {
    const prepararFormulario = async () => {
      mockToken();
      mockAxiosExitoso();

      const user = userEvent.setup();
      renderCalificaciones();

      await waitFor(() => screen.getByText(/Agregar Calificación/i));
      fireEvent.click(screen.getByText(/Agregar Calificación/i));

      const inputEval = screen.getByPlaceholderText("Ej: Prueba 1");
      await user.type(inputEval, "Prueba Mensual");

      const inputs = screen.getAllByPlaceholderText("7.0");
      await user.type(inputs[0], "6.5");

      return { user };
    };

    test("guarda correctamente y llama a POST con el payload esperado", async () => {
      axios.post.mockResolvedValue({
        data: { ok: true, msg: "Calificaciones guardadas con éxito." },
      });
      vi.spyOn(window, "alert").mockImplementation(() => {});

      await prepararFormulario();
      fireEvent.click(screen.getByText("Guardar Calificación"));

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          "http://localhost:3000/api/v1/calificaciones",
          expect.objectContaining({
            cursoId: 1,
            nombreEvaluacion: "Prueba Mensual",
            calificaciones: expect.arrayContaining([
              expect.objectContaining({ nota: 6.5 }),
            ]),
          }),
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: expect.stringContaining("Bearer"),
            }),
          })
        );
      });
    });

    test("tras guardar exitosamente vuelve al modo lectura", async () => {
      axios.post.mockResolvedValue({
        data: { ok: true, msg: "Guardado con éxito." },
      });
      vi.spyOn(window, "alert").mockImplementation(() => {});

      await prepararFormulario();
      fireEvent.click(screen.getByText("Guardar Calificación"));

      await waitFor(() => {
        expect(screen.getByText(/Agregar Calificación/i)).toBeInTheDocument();
      });
    });

    test("muestra alerta si el nombre de evaluación está vacío", async () => {
      mockToken();
      mockAxiosExitoso();
      const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});

      renderCalificaciones();

      await waitFor(() => screen.getByText(/Agregar Calificación/i));
      fireEvent.click(screen.getByText(/Agregar Calificación/i));

      // Guardar sin nombre
      fireEvent.click(screen.getByText("Guardar Calificación"));

      expect(alertMock).toHaveBeenCalledWith(
        expect.stringMatching(/nombre de la evaluación/i)
      );
      expect(axios.post).not.toHaveBeenCalled();
    });

    test("muestra alerta si no se ingresó ninguna nota", async () => {
      mockToken();
      mockAxiosExitoso();
      const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});

      const user = userEvent.setup();
      renderCalificaciones();

      await waitFor(() => screen.getByText(/Agregar Calificación/i));
      fireEvent.click(screen.getByText(/Agregar Calificación/i));

      const inputEval = screen.getByPlaceholderText("Ej: Prueba 1");
      await user.type(inputEval, "Prueba Mensual");

      // Guardar sin notas
      fireEvent.click(screen.getByText("Guardar Calificación"));

      expect(alertMock).toHaveBeenCalledWith(
        expect.stringMatching(/al menos una calificación/i)
      );
      expect(axios.post).not.toHaveBeenCalled();
    });

    test("muestra alerta de error si el POST falla", async () => {
      axios.post.mockRejectedValue({
        response: { data: { msg: "Error al guardar en BD." } },
      });
      const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});

      await prepararFormulario();
      fireEvent.click(screen.getByText("Guardar Calificación"));

      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith("Error al guardar en BD.");
      });
    });
  });

  // ── Cambio de curso ──────────────────────────────────────────────────────
  describe("Cambio de curso", () => {
    test("cambia el tab activo al hacer click en otro curso", async () => {
      mockToken();
      mockAxiosExitoso();

      renderCalificaciones();

      await waitFor(() => screen.getByText("2° Básico B"));
      fireEvent.click(screen.getByText("2° Básico B"));

      await waitFor(() => {
        expect(screen.getByText("2° Básico B").closest("button")).toHaveClass(
          "active"
        );
      });
    });

    test("al cambiar de curso se cancela el modo crear", async () => {
      mockToken();
      mockAxiosExitoso();

      renderCalificaciones();

      await waitFor(() => screen.getByText(/Agregar Calificación/i));
      fireEvent.click(screen.getByText(/Agregar Calificación/i));

      // Estamos en modo crear, cambiamos de curso
      fireEvent.click(screen.getByText("2° Básico B"));

      await waitFor(() => {
        // Volvió a modo lectura
        expect(screen.getByText(/Agregar Calificación/i)).toBeInTheDocument();
      });
    });
  });

  // ── Botón volver ─────────────────────────────────────────────────────────
  describe("Botón Volver al Inicio", () => {
    test("llama a setSeccion('inicio') al hacer click en Volver", async () => {
      mockToken();
      mockAxiosExitoso();

      renderCalificaciones();

      await waitFor(() => screen.getByText(/Volver al Inicio/i));
      fireEvent.click(screen.getByText(/Volver al Inicio/i));

      expect(setSeccionMock).toHaveBeenCalledWith("inicio");
    });
  });
});
