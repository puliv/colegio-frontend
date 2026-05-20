import axios from "axios";

const API_URL = "http://localhost:8080/api";

// Auth
export const login = (credentials) => axios.post(`${API_URL}/auth/login`, credentials);

// Students
export const getAllStudents = () => axios.get(`${API_URL}/students`);
export const getStudentByRut = (rut) => axios.get(`${API_URL}/students/${rut}`);
export const createStudent = (student) => axios.post(`${API_URL}/students`, student);

// Grades
export const getGradesByRut = (rut) => axios.get(`${API_URL}/grades/${rut}`);
export const createGrade = (grade) => axios.post(`${API_URL}/grades`, grade);

// Attendance
export const getAttendanceByRut = (rut) => axios.get(`${API_URL}/attendance/${rut}`);
export const createAttendance = (attendance) => axios.post(`${API_URL}/attendance`, attendance);

// Annotations
export const getAnnotationsByRut = (rut) => axios.get(`${API_URL}/annotations/${rut}`);
export const createAnnotation = (annotation) => axios.post(`${API_URL}/annotations`, annotation);

// BFF
export const getStudentSummary = (rut) => axios.get(`${API_URL}/bff/student/${rut}`);