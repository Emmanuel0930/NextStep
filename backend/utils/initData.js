const mongoose = require('mongoose');
const Cuenta = require('../../datos/modelos/Cuenta');
const Empleos = require('../../datos/modelos/Empleos');

const initData = async () => {
  try {
    // Verificar empleos existentes
    const empleosExistentes = await Empleos.find({});
    console.log(`Empleos actuales en DB: ${empleosExistentes.length}`);

    const todosLosEmpleos = [
      {
        nombre: "Desarrollador Frontend Senior",
        sueldo: 4500000,
        ciudad: "Bogotá",
        descripcion: "Buscamos desarrollador con experiencia en React y TypeScript",
        palabrasClave: ["react", "javascript", "frontend"],
        habilidades: ["React", "TypeScript", "CSS", "HTML5"],
        añosExperiencia: 3
      },
      {
        nombre: "Backend Developer",
        sueldo: 5000000,
        ciudad: "Medellín",
        descripcion: "Desarrollo de APIs con Node.js y MongoDB",
        palabrasClave: ["nodejs", "mongodb", "backend"],
        habilidades: ["Node.js", "MongoDB", "Express", "API REST"],
        añosExperiencia: 2
      },
      {
        nombre: "Diseñador UX/UI",
        sueldo: 3500000,
        ciudad: "Cali",
        descripcion: "Diseño de interfaces y experiencia de usuario",
        palabrasClave: ["ux", "ui", "diseño"],
        habilidades: ["Figma", "Adobe XD", "User Research", "Prototyping"],
        añosExperiencia: 2
      },
      {
        nombre: "Analista de Datos",
        sueldo: 3800000,
        ciudad: "Barranquilla",
        descripcion: "Análisis y visualización de datos empresariales",
        palabrasClave: ["datos", "analytics", "sql"],
        habilidades: ["SQL", "Python", "Tableau", "Excel"],
        añosExperiencia: 2
      },
      {
        nombre: "Gerente de Proyectos",
        sueldo: 5500000,
        ciudad: "Bogotá",
        descripcion: "Gestión de proyectos tecnológicos",
        palabrasClave: ["project", "management", "scrum"],
        habilidades: ["Scrum", "JIRA", "Gestión de equipos", "Planificación"],
        añosExperiencia: 4
      },
      {
        nombre: "Desarrollador Full Stack",
        sueldo: 4200000,
        ciudad: "Medellín",
        descripcion: "Desarrollo completo de aplicaciones web",
        palabrasClave: ["fullstack", "javascript", "nodejs"],
        habilidades: ["React", "Node.js", "MongoDB", "AWS"],
        añosExperiencia: 3
      },
      {
        nombre: "Especialista en Marketing Digital",
        sueldo: 3200000,
        ciudad: "Cartagena",
        descripcion: "Estrategias de marketing online",
        palabrasClave: ["marketing", "digital", "redes"],
        habilidades: ["SEO", "Google Ads", "Redes Sociales", "Analytics"],
        añosExperiencia: 2
      },
      {
        nombre: "DevOps Engineer",
        sueldo: 5200000,
        ciudad: "Bucaramanga",
        descripcion: "Automatización de infraestructura",
        palabrasClave: ["devops", "aws", "docker"],
        habilidades: ["Docker", "Kubernetes", "AWS", "CI/CD"],
        añosExperiencia: 3
      },
      {
        nombre: "Mobile Developer",
        sueldo: 4000000,
        ciudad: "Cali",
        descripcion: "Desarrollo de aplicaciones móviles",
        palabrasClave: ["mobile", "reactnative", "android"],
        habilidades: ["React Native", "iOS", "Android", "JavaScript"],
        añosExperiencia: 2
      },
      {
        nombre: "Data Scientist",
        sueldo: 4800000,
        ciudad: "Bogotá",
        descripcion: "Modelado predictivo y machine learning",
        palabrasClave: ["datascience", "python", "ml"],
        habilidades: ["Python", "Machine Learning", "Pandas", "TensorFlow"],
        añosExperiencia: 3
      },
      {
        nombre: "QA Engineer",
        sueldo: 3500000,
        ciudad: "Medellín",
        descripcion: "Aseguramiento de calidad de software",
        palabrasClave: ["qa", "testing", "automation"],
        habilidades: ["Testing", "Selenium", "Jest", "Cypress"],
        añosExperiencia: 2
      },
      {
        nombre: "Cloud Architect",
        sueldo: 6000000,
        ciudad: "Bogotá",
        descripcion: "Arquitectura de soluciones en la nube",
        palabrasClave: ["cloud", "aws", "azure"],
        habilidades: ["AWS", "Azure", "Terraform", "Cloud Security"],
        añosExperiencia: 5
      },
      {
        nombre: "Product Manager",
        sueldo: 5200000,
        ciudad: "Medellín",
        descripcion: "Gestión de producto digital",
        palabrasClave: ["product", "management", "strategy"],
        habilidades: ["Product Strategy", "Roadmapping", "User Stories", "Agile"],
        añosExperiencia: 4
      },
      {
        nombre: "Security Analyst",
        sueldo: 4500000,
        ciudad: "Barranquilla",
        descripcion: "Análisis de seguridad informática",
        palabrasClave: ["security", "cybersecurity", "soc"],
        habilidades: ["SIEM", "Network Security", "Incident Response", "Firewalls"],
        añosExperiencia: 3
      },
      {
        nombre: "Technical Lead",
        sueldo: 5800000,
        ciudad: "Bogotá",
        descripcion: "Liderazgo técnico de equipos de desarrollo",
        palabrasClave: ["lead", "technical", "architecture"],
        habilidades: ["Leadership", "System Design", "Code Review", "Mentoring"],
        añosExperiencia: 5
      }
    ];

    // Encontrar empleos que faltan
    const nombresEmpleosExistentes = empleosExistentes.map(emp => emp.nombre);
    const empleosFaltantes = todosLosEmpleos.filter(emp => 
      !nombresEmpleosExistentes.includes(emp.nombre)
    );

    console.log(`Empleos faltantes por agregar: ${empleosFaltantes.length}`);

    if (empleosFaltantes.length > 0) {
      await Empleos.insertMany(empleosFaltantes);
      console.log(`${empleosFaltantes.length} empleos agregados a la base de datos`);
      
      // Mostrar los empleos agregados
      empleosFaltantes.forEach(emp => {
        console.log(`${emp.nombre} - ${emp.ciudad}`);
      });
    } else {
      console.log('Todos los empleos ya están en la base de datos');
    }

    // VERIFICACIÓN MEJORADA DE USUARIOS DEMO - SOLO CREAR LOS QUE FALTAN
    const usuariosDemo = [
      {
        nombreUsuario: "usuariodemo",
        correo: "usuario@gmail.com",
        contraseña: "user123",
        puntos: 150,
        nivel: 1,
        porcentajePerfil: 40
      },
      {
        nombreUsuario: "maria_rodriguez",
        correo: "maria.rodriguez@gmail.com",
        contraseña: "maria123",
        puntos: 320,
        nivel: 2,
        porcentajePerfil: 60
      },
      {
        nombreUsuario: "carlos_gomez",
        correo: "carlos.gomez@gmail.com",
        contraseña: "carlos123",
        puntos: 580,
        nivel: 3,
        porcentajePerfil: 80
      },
      {
        nombreUsuario: "ana_martinez",
        correo: "ana.martinez@gmail.com",
        contraseña: "ana123",
        puntos: 750,
        nivel: 4,
        porcentajePerfil: 90
      },
      {
        nombreUsuario: "pedro_lopez",
        correo: "pedro.lopez@gmail.com",
        contraseña: "pedro123",
        puntos: 920,
        nivel: 5,
        porcentajePerfil: 100
      }
    ];

    let usuariosCreados = 0;
    for (const usuarioDemo of usuariosDemo) {
      const usuarioExistente = await Cuenta.findOne({
        $or: [
          { correo: usuarioDemo.correo },
          { nombreUsuario: usuarioDemo.nombreUsuario }
        ]
      });

      if (!usuarioExistente) {
        await Cuenta.create(usuarioDemo);
        usuariosCreados++;
        console.log(`Usuario demo creado: ${usuarioDemo.nombreUsuario}`);
      } else {
        console.log(`Usuario demo ya existe: ${usuarioDemo.nombreUsuario}`);
      }
    }

    if (usuariosCreados > 0) {
      console.log(`${usuariosCreados} usuarios demo creados`);
    } else {
      console.log('Todos los usuarios demo ya existen');
    }

  } catch (error) {
    console.error('Error inicializando datos:', error);
  }
};

module.exports = initData;