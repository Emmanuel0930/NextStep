# NextStep - Prototipo

Este proyecto es un prototipo de aplicación web para incentivar la búsqueda de empleo en la plataforma **Magneto X NextStep**.  
El sistema está dividido en **Frontend (React)** y **Backend (Node.js + Express)** con **Jobbie**, un chatbot de IA integrado.

---

## 🚀 Requisitos
- [Node.js](https://nodejs.org/) instalado en tu máquina  
- npm (viene incluido con Node.js)
- Cuenta en [Groq](https://console.groq.com/) para obtener API Key del chatbot
- MongoDB instalado localmente o conexión a MongoDB Atlas

---

## 📂 Estructura del proyecto
```
NextStep/
│── frontend/   # Interfaz de usuario (React + Tailwind)
│── backend/    # Servidor API (Node.js + Express)
│── package.json   # Scripts principales en la raíz
```

---

## ▶️ Cómo ejecutar el proyecto

### 1. Clonar el repositorio
```bash
git clone https://github.com/Emmanuel0930/NextStep.git
cd NextStep
```

### 2. Configurar variables de entorno
Antes de instalar las dependencias, configura las variables de entorno para el chatbot:

```bash
# En la carpeta backend/
cd backend
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales reales:
```bash
# Configuración de base de datos
MONGODB_URI=mongodb://localhost:27017/magneto-engage

# API Keys (REQUERIDO para el chatbot)
GROQ_API_KEY=tu_groq_api_key_aqui

# JWT Secret
JWT_SECRET=tu_jwt_secret_aqui
```

**🔑 Para obtener tu GROQ_API_KEY:**
1. Ve a [Groq Console](https://console.groq.com/)
2. Crea una cuenta gratuita
3. Genera una nueva API Key
4. Copia la key y reemplaza `tu_groq_api_key_aqui` en tu archivo `.env`

### 3. Instalar dependencias
Para instalar **frontend y backend** juntos:
```bash
npm run install-all
```

(O puedes hacerlo por separado: `npm run install-frontend` o `npm run install-backend`).


### 4. Levantar el proyecto
Para ver la aplicación funcionando (frontend y backend):

Ejecuta este comando en la raíz del proyecto:
```bash
npm run dev
```
Esto iniciará:
- El frontend en: [http://localhost:3000](http://localhost:3000)
- El backend en: [http://localhost:5000](http://localhost:5000)

**Asegúrate de tener las dependencias instaladas antes de correr el proyecto:**
```bash
npm run install-all
```

---

## Usando el Chatbot (Jobbie)

Una vez que el proyecto esté ejecutándose:

1. **Abrir el chat**: Haz clic en el ícono de chat en la esquina inferior derecha
2. **Iniciar sesión**: Para usar los retos y ganar puntos, debes estar logueado
3. **Comandos disponibles**:
   - Escribe `reto` para practicar habilidades laborales
   - Escribe `puntos` para ver tu progreso
   - Pregunta sobre empleos, habilidades o funciones de la plataforma


## 🟣 Navegación y visualización

Al abrir [http://localhost:3000](http://localhost:3000) en tu navegador, verás:
- Menú de navegación superior (Inicio, Dashboard, Ingresar, Registrarse)
- Página principal con empleos simulados
- Dashboard con estadísticas, racha diaria y notificaciones push simuladas
- **Chatbot Jobbie** disponible en todas las páginas (esquina inferior derecha)

Si ves errores de carga, verifica que el backend esté corriendo correctamente en el puerto 5000.

---

## 📝 Notas
- **No se suben las carpetas `node_modules`** al repo (usar `npm run install-all` después de clonar).  
- **No se sube el archivo `.env`** por seguridad - configurar según `.env.example`
- Los scripts definidos en la raíz (`package.json`) facilitan el manejo de todo el proyecto.
- **El chatbot requiere conexión a internet** para funcionar (API de Groq)