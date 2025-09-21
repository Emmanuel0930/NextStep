import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SignUp() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSocialSignUp = (platform) => {
    alert(`Registro con ${platform} aún no implementado.`);
  };

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "firstName":
        if (!value.trim()) error = "El nombre es requerido.";
        else if (value.trim().length < 2)
          error = "El nombre debe tener al menos 2 caracteres.";
        break;
      case "lastName":
        if (!value.trim()) error = "El apellido es requerido.";
        else if (value.trim().length < 2)
          error = "El apellido debe tener al menos 2 caracteres.";
        break;
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) error = "El email es requerido.";
        else if (!emailRegex.test(value)) error = "Email inválido.";
        break;
      case "password":
        if (!value) error = "La contraseña es requerida.";
        else if (value.length < 8)
          error = "La contraseña debe tener al menos 8 caracteres.";
        else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value))
          error =
            "Debe contener al menos una mayúscula, una minúscula y un número.";
        break;
      case "confirmPassword":
        if (!value) error = "Confirma tu contraseña.";
        else if (value !== formData.password)
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

    if (name === "password" && formData.confirmPassword) {
      validateField("confirmPassword", formData.confirmPassword);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    Object.keys(formData).forEach((key) => {
      validateField(key, formData[key]);
    });

    const hasErrors = Object.values(errors).some((error) => error !== "");
    const hasEmptyFields = Object.values(formData).some(
      (value) => !value.trim()
    );

    if (!hasErrors && !hasEmptyFields) {
      try {
        alert("Registro exitoso");
        navigate("/login");
      } catch (error) {
        alert("Error en el registro. Por favor, intenta nuevamente más tarde.");
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
            <div className="flex gap-2 mb-2">
              <div className="w-1/2">
                <input
                  type="text"
                  name="firstName"
                  placeholder="Nombre"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full h-11 px-3 bg-white border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="w-1/2">
                <input
                  type="text"
                  name="lastName"
                  placeholder="Apellido"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full h-11 px-3 bg-white border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
            <div className="flex gap-2 mb-2">
              <p className="text-sm text-red-700 px-2 py-1 text-left min-h-[1.5em] w-1/2">
                {errors.firstName}
              </p>
              <p className="text-sm text-red-700 px-2 py-1 text-left min-h-[1.5em] w-1/2">
                {errors.lastName}
              </p>
            </div>

            <input
              type="email"
              name="email"
              placeholder="Escribe tu email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full h-11 px-3 mb-2 bg-white border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <p className="text-sm text-red-700 px-2 py-1 mb-2 text-left min-h-[1.5em]">
              {errors.email}
            </p>

            <input
              type="password"
              name="password"
              placeholder="Crea una contraseña"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full h-11 px-3 mb-2 bg-white border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <p className="text-sm text-red-700 px-2 py-1 mb-2 text-left min-h-[1.5em]">
              {errors.password}
            </p>

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirma tu contraseña"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full h-11 px-3 mb-2 bg-white border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <p className="text-sm text-red-700 px-2 py-1 mb-2 text-left min-h-[1.5em]">
              {errors.confirmPassword}
            </p>

            <button
              type="submit"
              className={`w-full py-2 rounded-full mt-2 mb-2 text-white ${
                !isFormValid()
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600"
              }`}
              disabled={!isFormValid()}
            >
              Crear cuenta
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
