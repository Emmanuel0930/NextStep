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
