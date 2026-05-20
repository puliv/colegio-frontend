// src/services/useDashboardData.js
import { useState, useEffect } from "react";

const BASE_URL = "http://localhost:8080/api";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function calcAttendancePct(records) {
  if (!records || records.length === 0) return null;
  const present = records.filter(
    (r) =>
      r.present === true ||
      r.presente === true ||
      r.status === "PRESENTE" ||
      r.status === "present"
  ).length;
  return Math.round((present / records.length) * 100 * 10) / 10;
}

function calcGradeAvg(grades) {
  if (!grades || grades.length === 0) return null;
  const values = grades
    .map((g) => parseFloat(g.grade ?? g.nota ?? g.value))
    .filter((v) => !isNaN(v));
  if (values.length === 0) return null;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}

export function useDashboardData() {
  const [stats, setStats] = useState({
    totalCursos: 0,
    totalAlumnos: 0,
    asistenciaPromedio: null,
    alertasCriticas: 0,
    cursos: [],
  });
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        setError(null);

        // 1. Todos los estudiantes
        const studentsRes = await fetch(`${BASE_URL}/students`, {
          headers: getAuthHeaders(),
        });
        if (!studentsRes.ok) throw new Error("Error al obtener estudiantes");
        const students = await studentsRes.json();

        // 2. Cursos únicos
        const cursosSet = new Set(
          students
            .map((s) => s.course ?? s.curso ?? s.classroom ?? s.grade)
            .filter(Boolean)
        );
        const cursosUnicos = [...cursosSet];

        // 3. Asistencia, notas y anotaciones de cada alumno en paralelo
        const studentDetails = await Promise.all(
          students.map(async (student) => {
            const rut = student.rut;
            try {
              const [attendanceRes, gradesRes, annotationsRes] = await Promise.all([
                fetch(`${BASE_URL}/attendance/${rut}`, { headers: getAuthHeaders() }),
                fetch(`${BASE_URL}/grades/${rut}`, { headers: getAuthHeaders() }),
                fetch(`${BASE_URL}/annotations/${rut}`, { headers: getAuthHeaders() }),
              ]);
              const attendance = attendanceRes.ok ? await attendanceRes.json() : [];
              const grades = gradesRes.ok ? await gradesRes.json() : [];
              const annotations = annotationsRes.ok ? await annotationsRes.json() : [];
              return { student, attendance, grades, annotations };
            } catch {
              return { student, attendance: [], grades: [], annotations: [] };
            }
          })
        );

        // 4. Asistencia promedio global
        const pctList = studentDetails
          .map(({ attendance }) => calcAttendancePct(attendance))
          .filter((v) => v !== null);
        const asistenciaPromedio =
          pctList.length > 0
            ? Math.round((pctList.reduce((a, b) => a + b, 0) / pctList.length) * 10) / 10
            : null;

        // 5. Alertas automáticas
        const nuevasAlertas = [];
        studentDetails.forEach(({ student, attendance, grades, annotations }) => {
          const nombre =
            student.fullName ?? student.nombre ?? student.name ?? student.rut;
          const curso =
            student.course ?? student.curso ?? student.classroom ?? student.grade ?? "";

          const pct = calcAttendancePct(attendance);
          if (pct !== null && pct < 85) {
            nuevasAlertas.push({
              tipo: "critica",
              texto: `${nombre} (${curso}): Asistencia en ${pct}% — Riesgo de repitencia.`,
            });
          }

          const avg = calcGradeAvg(grades);
          if (avg !== null && avg < 4.0) {
            nuevasAlertas.push({
              tipo: "critica",
              texto: `${nombre} (${curso}): Promedio actual deficiente (${avg}).`,
            });
          }

          const unaSemanAtras = new Date();
          unaSemanAtras.setDate(unaSemanAtras.getDate() - 7);
          const annotNegRecientes = annotations.filter((a) => {
            const esNegativa =
              a.type === "NEGATIVA" ||
              a.tipo === "NEGATIVA" ||
              a.type === "negative" ||
              a.positive === false;
            const fecha = new Date(a.date ?? a.fecha ?? a.createdAt);
            return esNegativa && fecha >= unaSemanAtras;
          });
          if (annotNegRecientes.length > 0) {
            nuevasAlertas.push({
              tipo: "advertencia",
              texto: `${nombre} (${curso}): ${annotNegRecientes.length} anotación(es) negativa(s) esta semana.`,
            });
          }

          const condicion =
            student.medicalCondition ?? student.condicionMedica ?? student.medical;
          if (condicion) {
            nuevasAlertas.push({
              tipo: "medica",
              texto: `${nombre} (${curso}): Recordatorio: Condición médica (${condicion}).`,
            });
          }
        });

        setStats({
          totalCursos: cursosUnicos.length,
          totalAlumnos: students.length,
          asistenciaPromedio,
          alertasCriticas: nuevasAlertas.filter((a) => a.tipo === "critica").length,
          cursos: cursosUnicos,
        });
        setAlertas(nuevasAlertas);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  return { stats, alertas, loading, error };
}