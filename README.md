# ToDo Web App

Cliente web oficial del ecosistema ToDo, que ofrece una experiencia moderna de gestión de listas y tareas con una interfaz oscura interactiva, fluida y con diseños premium. 

## 🚀 Tecnologías Utilizadas
- **React 19**
- **Vite** (Empaquetador y servidor de desarrollo ultrarrápido)
- **Tailwind CSS** (Estilado con clases utilitarias)
- **Firebase Authentication** (Gestión de usuarios y tokens JWT)
- **Axios** (Cliente HTTP con instancia personalizada e interceptores)

## 🛠 Instalación

1. Clona el repositorio e ingresa a la carpeta del proyecto.
2. Asegúrate de tener instalado Node.js.
3. Descarga las dependencias del proyecto:
   ```bash
   npm install
   ```

## ⚙️ Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto (basado en la configuración provista). Deberá contener las siguientes variables:

```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_dominio.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_bucket.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id

# URL del backend (Producción o localhost)
VITE_API_URL=https://todo-backend-424512506456.europe-west1.run.app
```

## 🏃 Cómo Ejecutar el Proyecto

Para levantar el servidor de desarrollo en modo local:
```bash
npm run dev
```
La aplicación web estará disponible típicamente en `http://localhost:5173`.

## 🔗 Links Deployados
https://todo-web-omega-snowy.vercel.app/

## 👥 Usuarios de Prueba
Al utilizar Firebase, puedes registrarte fácilmente como un nuevo usuario directamente desde la página de inicio (`/register`) para comenzar a interactuar con las tareas, o ingresar con cualquier cuenta ya dada de alta en el proyecto de Firebase.
