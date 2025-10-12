import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useNotification } from "../components/NotificationProvider";

export default function SignUp() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({
    nombreUsuario: "",
    correo: "",
    contraseña: "",
    confirmarContraseña: "",
  });

  const [errors, setErrors] = useState({
    nombreUsuario: "",
    correo: "",
    contraseña: "",
    confirmarContraseña: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSocialSignUp = (platform) => {
    alert(`Registro con ${platform} aún no implementado.`);
  };

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "nombreUsuario":
        if (!value.trim()) error = "El nombre de usuario es requerido.";
        else if (value.trim().length < 3)
          error = "El nombre de usuario debe tener al menos 3 caracteres.";
        else if (!/^[a-zA-Z0-9_]+$/.test(value))
          error = "Solo se permiten letras, números y guion bajo.";
        break;
      case "correo":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) error = "El email es requerido.";
        else if (!emailRegex.test(value)) error = "Email inválido.";
        break;
      case "contraseña":
        if (!value) error = "La contraseña es requerida.";
        else if (value.length < 6)
          error = "La contraseña debe tener al menos 6 caracteres.";
        break;
      case "confirmarContraseña":
        if (!value) error = "Confirma tu contraseña.";
        else if (value !== formData.contraseña)
          error = "Las contraseñas no coinciden.";
        break;
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);

    if (name === "contraseña" && formData.confirmarContraseña) {
      validateField("confirmarContraseña", formData.confirmarContraseña);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar todos los campos
    Object.keys(formData).forEach((key) => {
      validateField(key, formData[key]);
    });

    const hasErrors = Object.values(errors).some((error) => error !== "");
    const hasEmptyFields = Object.values(formData).some(
      (value) => !value.trim()
    );

    if (!hasErrors && !hasEmptyFields) {
      setIsLoading(true);
      
      try {
        const response = await axios.post('http://localhost:5000/api/registro', {
          nombreUsuario: formData.nombreUsuario,
          correo: formData.correo,
          contraseña: formData.contraseña
        });

        if (response.data.success) {
          showNotification("¡Registro exitoso! Ahora puedes iniciar sesión.");
          navigate("/login");
        }
      } catch (error) {
        console.error('Error en registro:', error);
        
        if (error.response && error.response.data) {
          alert(error.response.data.message || "Error en el registro");
        } else {
          alert("Error en el registro. Por favor, intenta nuevamente más tarde.");
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const isFormValid = () => {
    const hasErrors = Object.values(errors).some((error) => error !== "");
    const hasEmptyFields = Object.values(formData).some(
      (value) => !value.trim()
    );
    return !hasErrors && !hasEmptyFields;
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 py-6">
      <div className="w-full max-w-md bg-white m-6 p-8 rounded-xl shadow-lg text-center">
        <header>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">NextStep</h1>
          <p className="text-lg text-gray-700 mb-8">
            <b>¡Hola!</b> Crea tu cuenta
          </p>
        </header>

        <div className="rounded-lg p-6 mb-5 bg-gray-50">
          <p className="text-base text-gray-800 mb-4 text-left">
            Con tus redes sociales:
          </p>
          <div className="flex flex-col gap-2">
            <button
              className="w-full py-2 rounded-full text-white bg-blue-500 hover:bg-blue-600"
              onClick={() => handleSocialSignUp("LinkedIn")}
            >
              Registrarse con LinkedIn
            </button>
            <button
              className="w-full py-2 rounded-full text-white bg-blue-800 hover:bg-blue-900"
              onClick={() => handleSocialSignUp("Facebook")}
            >
              Registrarse con Facebook
            </button>
            <button
              className="w-full py-2 rounded-full text-white bg-blue-700 hover:bg-blue-800"
              onClick={() => handleSocialSignUp("Microsoft")}
            >
              Registrarse con Microsoft
            </button>
            <button
              className="w-full py-2 rounded-full text-white bg-red-500 hover:bg-red-600"
              onClick={() => handleSocialSignUp("Google")}
            >
              Registrarse con Google
            </button>
          </div>
        </div>

        <div className="rounded-lg p-6 mb-5 bg-gray-50">
          <p className="text-base text-gray-800 mb-4 text-left">
            O con tu información personal:
          </p>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="nombreUsuario"
              placeholder="Nombre de usuario"
              value={formData.nombreUsuario}
              onChange={handleInputChange}
              className="w-full h-11 px-3 mb-2 bg-white border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <p className="text-sm text-red-700 px-2 py-1 mb-2 text-left min-h-[1.5em]">
              {errors.nombreUsuario}
            </p>

            <input
              type="email"
              name="correo"
              placeholder="Escribe tu email"
              value={formData.correo}
              onChange={handleInputChange}
              className="w-full h-11 px-3 mb-2 bg-white border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <p className="text-sm text-red-700 px-2 py-1 mb-2 text-left min-h-[1.5em]">
              {errors.correo}
            </p>

            <input
              type="password"
              name="contraseña"
              placeholder="Crea una contraseña"
              value={formData.contraseña}
              onChange={handleInputChange}
              className="w-full h-11 px-3 mb-2 bg-white border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <p className="text-sm text-red-700 px-2 py-1 mb-2 text-left min-h-[1.5em]">
              {errors.contraseña}
            </p>

            <input
              type="password"
              name="confirmarContraseña"
              placeholder="Confirma tu contraseña"
              value={formData.confirmarContraseña}
              onChange={handleInputChange}
              className="w-full h-11 px-3 mb-2 bg-white border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <p className="text-sm text-red-700 px-2 py-1 mb-2 text-left min-h-[1.5em]">
              {errors.confirmarContraseña}
            </p>

            <button
              type="submit"
              className={`w-full py-2 rounded-full mt-2 mb-2 text-white ${
                !isFormValid() || isLoading
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600"
              }`}
              disabled={!isFormValid() || isLoading}
            >
              {isLoading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>
        </div>

        <div className="flex justify-between mt-6">
          <button
            className="w-[48%] py-2 rounded bg-white text-blue-900 border border-gray-300 hover:bg-gray-100"
            onClick={() => navigate("/login")}
          >
            Ya tengo cuenta
          </button>
          <button
            className="w-[48%] py-2 rounded bg-white text-blue-900 border border-gray-300 hover:bg-gray-100"
            onClick={() => navigate("/")}
          >
            Ir a ver empleos
          </button>
        </div>
      </div>
    </div>
  );
}