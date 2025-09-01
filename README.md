# NextStep - Prototipo

Este proyecto es un prototipo de aplicación web para incentivar la búsqueda de empleo en la plataforma **Magneto**.  
El sistema está dividido en **Frontend (React)** y **Backend (Node.js + Express)**.

---

## 🚀 Requisitos
- [Node.js](https://nodejs.org/) instalado en tu máquina  
- npm (viene incluido con Node.js)

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
git clone https://github.com/Emmanuel0930/Magneto-engage.git
cd Magneto-engage
```

### 2. Instalar dependencias
Para instalar **frontend y backend** juntos:
```bash
npm run install-all
```

(O puedes hacerlo por separado: `npm run install-frontend` o `npm run install-backend`).

### 3. Levantar el proyecto
Ejecutar **frontend y backend al mismo tiempo**:
```bash
npm run dev
```
👉 Frontend en: [http://localhost:3000](http://localhost:3000)  
👉 Backend en: [http://localhost:5000](http://localhost:5000)  

---

## 📝 Notas
- **No se suben las carpetas `node_modules`** al repo (usar `npm run install-all` después de clonar).  
- Los scripts definidos en la raíz (`package.json`) facilitan el manejo de todo el proyecto.  
