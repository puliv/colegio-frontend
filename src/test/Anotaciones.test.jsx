import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, test, expect, beforeEach } from "vitest";
import axios from "axios";
import Anotaciones from "../pages/Anotaciones";

// ─── Mocks ────────────────────────────────────────────────────────────────────
vi.mock("axios");
vi.mock("../styles/", () => ({}));

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

const setSeccionMock = vi.fn();

const renderAnotaciones = () =>
  render(<Anotaciones setSeccion={setSeccionMock} />);

// Espera a que el formulario esté completamente listo
const esperarFormulario = async () => {
  await waitFor(() =>
    expect(screen.getByText(/Seleccionar Estudiante/i)).toBeInTheDocument()
  );
};

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("Anotaciones", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Carga inicial ────────────────────────────────────────────────────────
  describe("Carga inicial", () => {
    test("muestra spinner mientras cargan los cursos", () => {
      mockToken();
      axios.get.mockImplementation(() => new Promise(() => {}));

      renderAnotaciones();

      expect(
        screen.getByText(/Cargando asignaturas desde MySQL/i)
      ).toBeInTheDocument();
    });

    test("muestra error si no hay token", async () => {
      mockSinToken();

      renderAnotaciones();

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

      renderAnotaciones();

      await waitFor(() => {
        expect(
          screen.getByText(/Error al cargar la lista de cursos/i)
        ).toBeInTheDocument();
      });
    });

    test("renderiza los tabs de cursos al cargar correctamente", async () => {
      mockToken();
      mockAxiosExitoso();

      renderAnotaciones();

      await waitFor(() => {
        expect(screen.getByText("1° Básico A")).toBeInTheDocument();
        expect(screen.getByText("2° Básico B")).toBeInTheDocument();
      });
    });

    test("selecciona el primer curso automáticamente", async () => {
      mockToken();
      mockAxiosExitoso();

      renderAnotaciones();

      await waitFor(() => {
        expect(screen.getByText("1° Básico A").closest("button")).toHaveClass(
          "active"
        );
      });
    });

    test("muestra el título del curso activo en el encabezado", async () => {
      mockToken();
      mockAxiosExitoso();

      renderAnotaciones();

      await waitFor(() => {
        expect(
          screen.getByText(/Nueva Hoja de Vida - 1° Básico A/i)
        ).toBeInTheDocument();
      });
    });
  });

  // ── Formulario de anotación ──────────────────────────────────────────────
  describe("Formulario de anotación", () => {
    test("muestra el selector de alumno con la opción por defecto", async () => {
      mockToken();
      mockAxiosExitoso();

      renderAnotaciones();
      await esperarFormulario();

      expect(
        screen.getByText(/Seleccione un alumno de la lista/i)
      ).toBeInTheDocument();
    });

    test("lista los alumnos del curso en el select ordenados por apellido", async () => {
      mockToken();
      mockAxiosExitoso();

      renderAnotaciones();
      await esperarFormulario();

      const opciones = screen.getAllByRole("option");
      // [0] = opción vacía, [1] = Araya (A), [2] = Soto (S)
      expect(opciones[1]).toHaveTextContent("Araya");
      expect(opciones[2]).toHaveTextContent("Soto");
    });

    test("el radio 'Negativa' está seleccionado por defecto", async () => {
      mockToken();
      mockAxiosExitoso();

      renderAnotaciones();
      await esperarFormulario();

      const radioNegativa = screen.getByDisplayValue("Negativa");
      expect(radioNegativa).toBeChecked();
    });

    test("se puede cambiar el tipo de anotación a Positiva", async () => {
      mockToken();
      mockAxiosExitoso();

      renderAnotaciones();
      await esperarFormulario();

      const radioPositiva = screen.getByDisplayValue("Positiva");
      fireEvent.click(radioPositiva);

      expect(radioPositiva).toBeChecked();
      expect(screen.getByDisplayValue("Negativa")).not.toBeChecked();
    });

    test("se puede escribir en el textarea de descripción", async () => {
      mockToken();
      mockAxiosExitoso();

      const user = userEvent.setup();
      renderAnotaciones();
      await esperarFormulario();

      const textarea = screen.getByPlaceholderText(/Escriba aquí/i);
      await user.type(textarea, "Conducta disruptiva en clases.");

      expect(textarea).toHaveValue("Conducta disruptiva en clases.");
    });

    test("el botón de envío está habilitado cuando no se está guardando", async () => {
      mockToken();
      mockAxiosExitoso();

      renderAnotaciones();
      await esperarFormulario();

      const boton = screen.getByRole("button", {
        name: /Guardar Observación en Hoja de Vida/i,
      });
      expect(boton).not.toBeDisabled();
    });

    test("muestra 'Sin alumnos' cuando el curso no tiene estudiantes", async () => {
      mockToken();
      axios.get.mockImplementation((url) => {
        if (url.includes("/cursos"))
          return Promise.resolve({ data: { cursos: cursosMock } });
        if (url.includes("/estudiantes"))
          return Promise.resolve({ data: { alumnos: [] } });
      });

      renderAnotaciones();

      await waitFor(() => {
        expect(
          screen.getByText(/No se encontraron alumnos matriculados/i)
        ).toBeInTheDocument();
      });
    });
  });

  // ── Validaciones del formulario ──────────────────────────────────────────
  describe("Validaciones al guardar", () => {
    test("muestra alerta si no se seleccionó alumno", async () => {
      mockToken();
      mockAxiosExitoso();
      const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});

      const user = userEvent.setup();
      renderAnotaciones();
      await esperarFormulario();

      // Descripción sí, pero alumno no
      await user.type(screen.getByPlaceholderText(/Escriba aquí/i), "Detalle");
      fireEvent.submit(
        screen.getByText(/Guardar Observación/i).closest("form")
      );

      expect(alertMock).toHaveBeenCalledWith(
        expect.stringMatching(/seleccione un alumno/i)
      );
      expect(axios.post).not.toHaveBeenCalled();
    });

    test("muestra alerta si la descripción está vacía", async () => {
      mockToken();
      mockAxiosExitoso();
      const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});

      renderAnotaciones();
      await esperarFormulario();

      // Seleccionar alumno pero sin descripción
      const select = screen.getByRole("combobox");
      fireEvent.change(select, { target: { value: "10" } });

      fireEvent.submit(
        screen.getByText(/Guardar Observación/i).closest("form")
      );

      expect(alertMock).toHaveBeenCalledWith(
        expect.stringMatching(/ingrese el detalle/i)
      );
      expect(axios.post).not.toHaveBeenCalled();
    });
  });

  // ── Guardado exitoso ─────────────────────────────────────────────────────
  describe("Guardado exitoso", () => {
    const prepararYEnviar = async () => {
      mockToken();
      mockAxiosExitoso();
      axios.post.mockResolvedValue({ data: { ok: true } });
      vi.spyOn(window, "alert").mockImplementation(() => {});

      const user = userEvent.setup();
      renderAnotaciones();
      await esperarFormulario();

      // Seleccionar alumno
      const select = screen.getByRole("combobox");
      fireEvent.change(select, { target: { value: "10" } });

      // Escribir descripción
      await user.type(
        screen.getByPlaceholderText(/Escriba aquí/i),
        "Excelente participación."
      );

      // Enviar
      fireEvent.submit(
        screen.getByText(/Guardar Observación/i).closest("form")
      );
    };

    test("llama a POST con el payload correcto", async () => {
      await prepararYEnviar();

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          "http://localhost:3000/api/v1/anotaciones",
          expect.objectContaining({
            alumnoId: 10,
            tipo: "Negativa",
            descripcion: "Excelente participación.",
            fecha: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
          }),
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: expect.stringContaining("Bearer"),
            }),
          })
        );
      });
    });

    test("muestra alerta de éxito después de guardar", async () => {
      const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});
      await prepararYEnviar();

      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith(
          "Anotación registrada con éxito."
        );
      });
    });

    test("limpia la descripción tras guardar pero mantiene al alumno seleccionado", async () => {
      await prepararYEnviar();

      await waitFor(() => {
        const textarea = screen.getByPlaceholderText(/Escriba aquí/i);
        expect(textarea).toHaveValue("");
        // El select mantiene el alumno
        expect(screen.getByRole("combobox")).toHaveValue("10");
      });
    });

    test("el botón cambia a 'Registrando...' mientras se guarda", async () => {
      mockToken();
      mockAxiosExitoso();
      // POST que nunca resuelve → quedamos en estado guardando
      axios.post.mockImplementation(() => new Promise(() => {}));

      const user = userEvent.setup();
      renderAnotaciones();
      await esperarFormulario();

      fireEvent.change(screen.getByRole("combobox"), {
        target: { value: "10" },
      });
      await user.type(screen.getByPlaceholderText(/Escriba aquí/i), "Detalle.");

      fireEvent.submit(
        screen.getByText(/Guardar Observación/i).closest("form")
      );

      await waitFor(() => {
        expect(screen.getByText("Registrando...")).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: "Registrando..." })
        ).toBeDisabled();
      });
    });
  });

  // ── Error al guardar ─────────────────────────────────────────────────────
  describe("Error al guardar", () => {
    test("muestra el mensaje de error del servidor si el POST falla", async () => {
      mockToken();
      mockAxiosExitoso();
      axios.post.mockRejectedValue({
        response: { data: { msg: "Alumno no encontrado." } },
      });
      const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});

      const user = userEvent.setup();
      renderAnotaciones();
      await esperarFormulario();

      fireEvent.change(screen.getByRole("combobox"), {
        target: { value: "10" },
      });
      await user.type(screen.getByPlaceholderText(/Escriba aquí/i), "Detalle.");
      fireEvent.submit(
        screen.getByText(/Guardar Observación/i).closest("form")
      );

      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith("Alumno no encontrado.");
      });
    });

    test("muestra mensaje genérico si el error no trae msg del servidor", async () => {
      mockToken();
      mockAxiosExitoso();
      axios.post.mockRejectedValue(new Error("Network Error"));
      const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});

      const user = userEvent.setup();
      renderAnotaciones();
      await esperarFormulario();

      fireEvent.change(screen.getByRole("combobox"), {
        target: { value: "10" },
      });
      await user.type(screen.getByPlaceholderText(/Escriba aquí/i), "Detalle.");
      fireEvent.submit(
        screen.getByText(/Guardar Observación/i).closest("form")
      );

      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith(
          expect.stringMatching(/Error en el servidor/i)
        );
      });
    });
  });

  // ── Cambio de curso ──────────────────────────────────────────────────────
  describe("Cambio de curso", () => {
    test("cambia el tab activo al hacer click en otro curso", async () => {
      mockToken();
      mockAxiosExitoso();

      renderAnotaciones();

      await waitFor(() => screen.getByText("2° Básico B"));
      fireEvent.click(screen.getByText("2° Básico B"));

      await waitFor(() => {
        expect(screen.getByText("2° Básico B").closest("button")).toHaveClass(
          "active"
        );
      });
    });

    test("resetea el select de alumno al cambiar de curso", async () => {
      mockToken();
      mockAxiosExitoso();

      renderAnotaciones();
      await esperarFormulario();

      // Seleccionar alumno en curso 1
      fireEvent.change(screen.getByRole("combobox"), {
        target: { value: "10" },
      });
      expect(screen.getByRole("combobox")).toHaveValue("10");

      // Cambiar de curso
      fireEvent.click(screen.getByText("2° Básico B"));

      // El select debe volver al estado vacío
      await waitFor(() => {
        expect(screen.getByRole("combobox")).toHaveValue("");
      });
    });

    test("consulta la API de estudiantes con el nuevo cursoId", async () => {
      mockToken();
      mockAxiosExitoso();

      renderAnotaciones();
      await esperarFormulario();

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

  // ── Botón volver ─────────────────────────────────────────────────────────
  describe("Botón Volver al Inicio", () => {
    test("llama a setSeccion('inicio') al hacer click en Volver", async () => {
      mockToken();
      mockAxiosExitoso();

      renderAnotaciones();

      await waitFor(() => screen.getByText(/Volver al Inicio/i));
      fireEvent.click(screen.getByText(/Volver al Inicio/i));

      expect(setSeccionMock).toHaveBeenCalledWith("inicio");
    });
  });
});
