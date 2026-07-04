# ---- Etapa 1: Build ----
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Etapa 2: Servir con Nginx ----
FROM nginx:alpine AS production

# Copiamos el build estático generado por Vite
COPY --from=build /app/dist /usr/share/nginx/html

# Configuración personalizada de Nginx (para manejar rutas de React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]