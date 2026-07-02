#!/bin/bash

# 1. Configuración de accesos
URL_BASE="http://localhost:3000/api/v1"
EMAIL_PROFE="profesor@colegio.cl"     # 👈 Cambia aquí por el email real de tu BD
PASS_PROFE="password123"             # 👈 Cambia aquí por la clave real de tu BD

echo "🔐 Iniciando sesión para obtener un token JWT fresco..."

# 2. Obtenemos el token usando login y filtrando el JSON con 'sed' o 'grep'
RESPONSE=$(curl -s -X POST "$URL_BASE/auth/login" \
     -H "Content-Type: application/json" \
     -d "{\"email\": \"$EMAIL_PROFE\", \"password\": \"$PASS_PROFE\"}")

TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*' | grep -o '[^"]*$')

if [ -z "$TOKEN" ]; then
    echo "❌ Error al iniciar sesión. Revisa las credenciales del profesor o si el backend está encendido."
    echo "Respuesta del servidor: $RESPONSE"
    exit 1
fi

echo "✅ Token JWT obtenido con éxito."
echo "🚀 Registrando nuevo alumno en la base de datos..."

# 3. Enviamos la petición para agregar al estudiante usando el token recién creado
curl -X POST "$URL_BASE/estudiantes" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $TOKEN" \
     -d '{
           "rut": "19876543-2",
           "nombre": "Lionel",
           "apellido": "Messi",
           "curso": "4to Medio A"
         }'

echo -e "\n\n🎯 ¡Proceso terminado!"
