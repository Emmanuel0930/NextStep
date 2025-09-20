const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

let demoUser = {
    email: "usuario@gmail.com",
    password: "user123",
};

const jobs = [
    {
        title: "Cajero",
        company: "Éxito",
        contract: "Término indefinido",
        salary: "$1.500.000 a $1.800.000",
        city: "Medellín"
    },
    {
        title: "Asesor Comercial",
        company: "Bancolombia",
        contract: "Término fijo",
        salary: "$2.000.000 a $2.500.000",
        city: "Bogotá"
    },
    {
        title: "Diseñador Gráfico",
        company: "Crehana",
        contract: "Temporal",
        salary: "$1.800.000 a $2.200.000",
        city: "Cali"
    },
    {
        title: "Auxiliar Administrativo",
        company: "Postobón",
        contract: "Término indefinido",
        salary: "$1.600.000 a $1.900.000",
        city: "Bucaramanga"
    },
    {
        title: "Técnico en Soporte",
        company: "Claro Colombia",
        contract: "Temporal",
        salary: "$1.800.000",
        city: "Barranquilla"
    },
    {
        title: "Recepcionista",
        company: "Hotel Movich",
        contract: "Término indefinido",
        salary: "$1.400.000 a $1.700.000",
        city: "Cartagena"
    },
    {
        title: "Asistente de Marketing",
        company: "Rappi",
        contract: "Término fijo",
        salary: "A convenir",
        city: "Medellín"
    },
    {
        title: "Auxiliar de Logística",
        company: "Alpina",
        contract: "Término indefinido",
        salary: "$1.500.000 a $1.800.000",
        city: "Bogotá"
    },
    {
        title: "Consultor de Ventas",
        company: "Davivienda",
        contract: "Temporal",
        salary: "$2.000.000 a $2.500.000",
        city: "Cali"
    },
    {
        title: "Asesor de Servicio al Cliente",
        company: "Grupo Éxito",
        contract: "Término indefinido",
        salary: "$1.600.000 a $1.900.000",
        city: "Medellín"
    }
];

// Simulación de postulaciones realizadas por el usuario
let userApplications = [
    { jobId: 1, date: "2025-09-18" },
    { jobId: 2, date: "2025-09-19" },
    { jobId: 3, date: "2025-09-20" }
];

// Simulación de racha diaria de actividad
let userStreak = {
    currentStreak: 3, // días consecutivos
    lastLogin: "2025-09-20T08:00:00Z"
};

// Simulación de notificaciones push
let pushNotifications = [
    {
        id: 1,
        message: "¡Sigue así! Llevas 3 días de racha.",
        time: "08:00"
    }
];

// Simulación de estadísticas adicionales
let userStats = {
    totalApplications: userApplications.length,
    recommendedCount: jobs.slice(0, 3).length,
    imagesOptimized: true
};

// Endpoint para racha diaria
app.get('/api/streak', (req, res) => {
    res.json(userStreak);
});

// Endpoint para notificaciones push
app.get('/api/notifications', (req, res) => {
    res.json(pushNotifications);
});

// Endpoint para estadísticas adicionales
app.get('/api/stats', (req, res) => {
    res.json(userStats);
});
// Endpoint para dashboard
app.get('/api/dashboard', (req, res) => {
    // Simula cantidad de postulaciones
    const applicationsCount = userApplications.length;
    // Simula recomendaciones (primeras 3 ofertas)
    const recommendedJobs = jobs.slice(0, 3);
    res.json({
        applicationsCount,
        recommendedJobs
    });
});

app.get('/api/jobs', (req, res) => {
    res.json(jobs);
});

app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    if (email === demoUser.email && password === demoUser.password) {
        res.json({ success: true, profile: demoUser.profile });
    } else {
        res.status(401).json({ success: false, message: "Credenciales inválidas" });
    }
});

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
