import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, test, expect, beforeEach } from "vitest";
import axios from "axios";
import Asistencia from "../pages/Asistencia";

// ─── Mocks ────────────────────────────────────────────────────────────────────
vi.mock("axios");
vi.mock("../styles/Asistencia.css", () => ({}));

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
const mockToken = () =>
  vi.spyOn(Storage.prototype, "getItem").mockReturnValue("token-test-123");

const mockAxiosExitoso = () => {
  axios.get.mockImplementation((url) => {
    if (url.includes("/cursos"))
      return Promise.resolve({ data: { cursos: cursosMock } });
    if (url.includes("/estudiantes"))
      return Promise.resolve({ data: { alumnos: alumnosMock } });
  });
};

const setSeccionMock = vi.fn();

const renderAsistencia = () =>
  render(<Asistencia setSeccion={setSeccionMock} />);

// Espera a que la tabla de alumnos esté visible
const esperarTabla = async () => {
  await waitFor(() => expect(screen.getByText("Araya")).toBeInTheDocument());
};

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("Asistencia", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Carga inicial ────────────────────────────────────────────────────────
  describe("Carga inicial", () => {
    test("muestra spinner mientras cargan los cursos", () => {
      mockToken();
      axios.get.mockImplementation(() => new Promise(() => {}));

      renderAsistencia();

      expect(screen.getByText(/Cargando módulos/i)).toBeInTheDocument();
    });

    test("muestra error si falla la petición de cursos", async () => {
      mockToken();
      axios.get.mockRejectedValue(new Error("Network Error"));

      renderAsistencia();

      await waitFor(() => {
        expect(
          screen.getByText(/No se pudieron cargar los cursos/i)
        ).toBeInTheDocument();
      });
    });

    test("renderiza los tabs de cursos correctamente", async () => {
      mockToken();
      mockAxiosExitoso();

      renderAsistencia();

      await waitFor(() => {
        expect(screen.getByText("1° Básico A")).toBeInTheDocument();
        expect(screen.getByText("2° Básico B")).toBeInTheDocument();
      });
    });

    test("selecciona el primer curso automáticamente", async () => {
      mockToken();
      mockAxiosExitoso();

      renderAsistencia();

      await waitFor(() => {
        expect(screen.getByText("1° Básico A").closest("button")).toHaveClass(
          "active"
        );
      });
    });

    test("acepta la lista de cursos como array directo (sin wrapper)", async () => {
      mockToken();
      axios.get.mockImplementation((url) => {
        if (url.includes("/cursos"))
          return Promise.resolve({ data: cursosMock }); // array directo
        if (url.includes("/estudiantes"))
          return Promise.resolve({ data: { alumnos: [] } });
      });

      renderAsistencia();

      await waitFor(() => {
        expect(screen.getByText("1° Básico A")).toBeInTheDocument();
      });
    });
  });

  // ── Tabla de alumnos ─────────────────────────────────────────────────────
  describe("Tabla de alumnos", () => {
    test("muestra los alumnos ordenados por apellido", async () => {
      mockToken();
      mockAxiosExitoso();

      renderAsistencia();
      await esperarTabla();

      const filas = screen.getAllByRole("row");
      expect(filas[1]).toHaveTextContent("Araya"); // A antes que S
      expect(filas[2]).toHaveTextContent("Soto");
    });

    test("muestra el nombre del curso activo en el encabezado", async () => {
      mockToken();
      mockAxiosExitoso();

      renderAsistencia();

      await waitFor(() => {
        expect(
          screen.getByText(/Alumnos del 1° Básico A/i)
        ).toBeInTheDocument();
      });
    });

    test("muestra la fecha actual en el encabezado", async () => {
      mockToken();
      mockAxiosExitoso();

      renderAsistencia();
      await esperarTabla();

      const hoy = new Date().toLocaleDateString("es-CL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      expect(screen.getByText(new RegExp(hoy))).toBeInTheDocument();
    });

    test("cada alumno inicia con el switch desmarcado (ausente)", async () => {
      mockToken();
      mockAxiosExitoso();

      renderAsistencia();
      await esperarTabla();

      const checkboxes = screen.getAllByRole("checkbox");
      checkboxes.forEach((cb) => expect(cb).not.toBeChecked());
    });

    test("los inputs de justificación inician vacíos", async () => {
      mockToken();
      mockAxiosExitoso();

      renderAsistencia();
      await esperarTabla();

      const inputs = screen.getAllByPlaceholderText(/Licencia médica/i);
      inputs.forEach((inp) => expect(inp).toHaveValue(""));
    });

    test("muestra alerta si no hay alumnos para el curso", async () => {
      mockToken();
      axios.get.mockImplementation((url) => {
        if (url.includes("/cursos"))
          return Promise.resolve({ data: { cursos: cursosMock } });
        if (url.includes("/estudiantes"))
          return Promise.resolve({ data: { alumnos: [] } });
      });

      renderAsistencia();

      await waitFor(() => {
        expect(
          screen.getByText(/No se encontraron alumnos/i)
        ).toBeInTheDocument();
      });
    });
  });

  // ── Interacción con switches y justificación ──────────────────────────────
  describe("Switch de presencia y justificación", () => {
    test("marcar el switch cambia el checkbox a checked", async () => {
      mockToken();
      mockAxiosExitoso();

      renderAsistencia();
      await esperarTabla();

      const checkboxes = screen.getAllByRole("checkbox");
      fireEvent.click(checkboxes[0]);

      expect(checkboxes[0]).toBeChecked();
    });

    test("desmarcar el switch vuelve a unchecked", async () => {
      mockToken();
      mockAxiosExitoso();

      renderAsistencia();
      await esperarTabla();

      const checkboxes = screen.getAllByRole("checkbox");
      fireEvent.click(checkboxes[0]); // marcar
      fireEvent.click(checkboxes[0]); // desmarcar

      expect(checkboxes[0]).not.toBeChecked();
    });

    test("el input de justificación se deshabilita cuando el alumno está presente", async () => {
      mockToken();
      mockAxiosExitoso();

      renderAsistencia();
      await esperarTabla();

      const checkboxes = screen.getAllByRole("checkbox");
      fireEvent.click(checkboxes[0]); // marcar como presente

      const inputs = screen.getAllByRole("textbox");
      expect(inputs[0]).toBeDisabled();
    });

    test("el input de justificación se habilita cuando el alumno está ausente", async () => {
      mockToken();
      mockAxiosExitoso();

      renderAsistencia();
      await esperarTabla();

      // Por defecto ausente → input habilitado
      const inputs = screen.getAllByRole("textbox");
      expect(inputs[0]).not.toBeDisabled();
    });

    test("marcar como presente limpia el texto de justificación", async () => {
      mockToken();
      mockAxiosExitoso();

      const user = userEvent.setup();
      renderAsistencia();
      await esperarTabla();

      const inputs = screen.getAllByRole("textbox");
      await user.type(inputs[0], "Licencia médica");
      expect(inputs[0]).toHaveValue("Licencia médica");

      const checkboxes = screen.getAllByRole("checkbox");
      fireEvent.click(checkboxes[0]); // marcar presente → limpia justificación

      expect(inputs[0]).toHaveValue("");
    });

    test("se puede escribir justificación para un alumno ausente", async () => {
      mockToken();
      mockAxiosExitoso();

      const user = userEvent.setup();
      renderAsistencia();
      await esperarTabla();

      const inputs = screen.getAllByRole("textbox");
      await user.type(inputs[0], "Citación médica");

      expect(inputs[0]).toHaveValue("Citación médica");
    });
  });

  // ── Guardar asistencia ───────────────────────────────────────────────────
  describe("Guardar asistencia", () => {
    test("llama a POST con el payload correcto al guardar", async () => {
      mockToken();
      mockAxiosExitoso();
      axios.post.mockResolvedValue({ data: { ok: true } });
      vi.spyOn(window, "alert").mockImplementation(() => {});

      renderAsistencia();
      await esperarTabla();

      fireEvent.click(screen.getByText("Guardar Asistencia"));

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          "http://localhost:3000/api/v1/asistencia",
          expect.objectContaining({
            cursoId: 1,
            fecha: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
            registros: expect.arrayContaining([
              expect.objectContaining({
                estudianteId: expect.any(Number),
                presente: false,
              }),
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

    test("muestra alerta de éxito tras guardar correctamente", async () => {
      mockToken();
      mockAxiosExitoso();
      axios.post.mockResolvedValue({ data: { ok: true } });
      const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});

      renderAsistencia();
      await esperarTabla();

      fireEvent.click(screen.getByText("Guardar Asistencia"));

      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith(
          "¡Asistencia guardada con éxito!"
        );
      });
    });

    test("muestra alerta de error si el POST falla", async () => {
      mockToken();
      mockAxiosExitoso();
      axios.post.mockRejectedValue(new Error("Error de red"));
      const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});

      renderAsistencia();
      await esperarTabla();

      fireEvent.click(screen.getByText("Guardar Asistencia"));

      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith(
          "Hubo un error al guardar el registro."
        );
      });
    });

    test("el payload incluye la justificación escrita por el profesor", async () => {
      mockToken();
      mockAxiosExitoso();
      axios.post.mockResolvedValue({ data: { ok: true } });
      vi.spyOn(window, "alert").mockImplementation(() => {});

      const user = userEvent.setup();
      renderAsistencia();
      await esperarTabla();

      // Escribir justificación para el primer alumno (Araya, id=11)
      const inputs = screen.getAllByRole("textbox");
      await user.type(inputs[0], "Licencia médica");

      fireEvent.click(screen.getByText("Guardar Asistencia"));

      await waitFor(() => {
        const payload = axios.post.mock.calls[0][1];
        const registro = payload.registros.find((r) => r.estudianteId === 11);
        expect(registro.justificacion).toBe("Licencia médica");
      });
    });
  });

  // ── Cambio de curso ──────────────────────────────────────────────────────
  describe("Cambio de curso", () => {
    test("cambia el tab activo al hacer click en otro curso", async () => {
      mockToken();
      mockAxiosExitoso();

      renderAsistencia();

      await waitFor(() => screen.getByText("2° Básico B"));
      fireEvent.click(screen.getByText("2° Básico B"));

      await waitFor(() => {
        expect(screen.getByText("2° Básico B").closest("button")).toHaveClass(
          "active"
        );
      });
    });

    test("consulta la API con el nuevo cursoId al cambiar de curso", async () => {
      mockToken();
      mockAxiosExitoso();

      renderAsistencia();

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

    test("reinicia el estado de asistencia al cambiar de curso", async () => {
      mockToken();
      mockAxiosExitoso();

      renderAsistencia();
      await esperarTabla();

      // Marcar un alumno como presente
      const checkboxes = screen.getAllByRole("checkbox");
      fireEvent.click(checkboxes[0]);
      expect(checkboxes[0]).toBeChecked();

      // Cambiar de curso → debe reiniciar
      fireEvent.click(screen.getByText("2° Básico B"));

      await waitFor(() => {
        const newCheckboxes = screen.getAllByRole("checkbox");
        newCheckboxes.forEach((cb) => expect(cb).not.toBeChecked());
      });
    });
  });

  // ── Botón volver ─────────────────────────────────────────────────────────
  describe("Botón Volver al Inicio", () => {
    test("llama a setSeccion('inicio') al hacer click en Volver", async () => {
      mockToken();
      mockAxiosExitoso();

      renderAsistencia();

      await waitFor(() => screen.getByText(/Volver al Inicio/i));
      fireEvent.click(screen.getByText(/Volver al Inicio/i));

      expect(setSeccionMock).toHaveBeenCalledWith("inicio");
    });
  });
});
