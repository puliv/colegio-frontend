# Colegio Bernardo O'Higgins — Frontend

Interfaz web del sistema **Libro de Clases Digital**, desarrollada para el Colegio Bernardo O'Higgins. Permite a los profesores gestionar asistencia, calificaciones y anotaciones de sus alumnos.

Este repositorio corresponde al **frontend** del proyecto. El backend se encuentra en un repositorio separado: [colegio-backend](https://github.com/puliv/colegio-backend).

## Tecnologías

- React 19 + Vite
- React Router
- Axios
- Bootstrap
- Vitest + Testing Library (pruebas unitarias)
- Docker (build multietapa, servido con Nginx)
- GitHub Actions (CI/CD)
- AWS ECS Fargate + ECR (despliegue en la nube)

## Estructura del proyecto

```
colegio-frontend/
├── src/
│   ├── pages/          # Vistas principales (Login, Dashboard, Cursos, Calificaciones, etc.)
│   ├── api/             # Cliente Axios centralizado
│   └── test/             # Pruebas con Vitest + Testing Library
├── .github/workflows/
│   └── deploy.yml        # Pipeline CI/CD
├── Dockerfile             # Build multietapa (Vite build + Nginx)
├── nginx.conf              # Configuración de Nginx, incluye proxy reverso a /api
└── .env.example              # Plantilla de variables de entorno
```

## Requisitos previos

- Node.js 20+
- Docker (para levantar el entorno completo con `colegio-backend`)

## Instalación y ejecución local (sin Docker)

```bash
npm install
cp .env.example .env   # ver sección de variables de entorno
npm run dev
```

La app queda disponible en `http://localhost:5173` (puerto por defecto de Vite).

## Variables de entorno

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL base del backend. En desarrollo local: `http://localhost:3000`. En producción (Docker/AWS): se deja **vacío**, ya que el frontend accede al backend a través del proxy reverso configurado en Nginx (mismo origen, ruta `/api`). |

Importante: al usar Vite, esta variable se incorpora al código en **tiempo de build**, no en tiempo de ejecución — cualquier cambio requiere reconstruir la imagen (`docker build` / re-ejecutar el pipeline).

## Ejecución con Docker

### Solo el frontend

```bash
docker build -t colegio-frontend .
docker run -p 8080:80 colegio-frontend
```

### Entorno completo (recomendado)

El `docker-compose.yml` que orquesta los tres servicios (base de datos, backend y frontend) vive en el repositorio `colegio-backend`. Cloná ambos repositorios como carpetas hermanas y ejecutá:

```bash
cd colegio-backend
docker compose up --build
```

La app queda disponible en `http://localhost:8080`.

## Proxy reverso (Nginx)

En producción, el contenedor de Nginx no solo sirve los archivos estáticos del build de React, sino que además redirige internamente cualquier petición a `/api/*` hacia el backend (mismo Task de ECS, puerto 3000). Esto evita exponer el backend directamente a Internet y elimina problemas de CORS, ya que frontend y backend comparten el mismo origen desde el punto de vista del navegador.

```nginx
location /api {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

## Pruebas

```bash
npm test
```

Ejecuta la suite de Vitest. Los módulos de red (`axios`) están mockeados en cada archivo de test (`vi.mock("axios")`) para evitar peticiones reales durante las pruebas.

## CI/CD

Cada push a las ramas `main` o `paulina` dispara el workflow definido en `.github/workflows/deploy.yml`, que ejecuta:

1. Instalación de dependencias y ejecución de tests (Vitest)
2. Preparación de variables de entorno de producción (`VITE_API_URL` vacío)
3. Build de la imagen Docker (Vite build + Nginx)
4. Publicación de la imagen en Amazon ECR
5. Actualización del servicio en Amazon ECS (Fargate) con la nueva imagen

Requiere los siguientes **GitHub Secrets** configurados en el repositorio:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_SESSION_TOKEN`

> Nota: al tratarse de una cuenta de AWS Academy, las credenciales son temporales y expiran cada pocas horas — deben actualizarse en los Secrets antes de cada ejecución relevante del pipeline.

## Infraestructura en AWS

El frontend se despliega junto al backend y la base de datos dentro de la misma Task Definition de ECS (`colegio-task`), en el cluster `colegio-cluster`. Es el único de los tres contenedores expuesto públicamente (puerto 80), protegido por un Security Group que solo permite tráfico HTTP entrante desde Internet.

Los detalles completos de la arquitectura, diagrama y decisiones técnicas están documentados en el informe entregado junto a esta evaluación.

## Estrategia de ramas

Rama de trabajo individual: `paulina` → integrada a `main` mediante Pull Request.

## Autora

Paulina — DUOC UC, ISY1101 Introducción a Herramientas DevOps.