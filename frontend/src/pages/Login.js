import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSocialLogin = (platform) => {
    alert(`Login con ${platform} aún no implementado.`);
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.length) setEmailError("El email es requerido.");
    else if (!re.test(email)) setEmailError("Email inválido.");
    else setEmailError("");
  };

  const validatePassword = (password) => {
    if (!password.length) setPasswordError("La contraseña es requerida.");
    else setPasswordError("");
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    
    validateEmail(email);
    validatePassword(password);
    
    if (emailError || passwordError || !email || !password) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await login(email, password);
      
      if (response.success) {
        alert("¡Bienvenido a NextStep! 🎉");
        
        // Guardar datos en localStorage
        if (response.profile) {
          localStorage.setItem('userProfile', JSON.stringify(response.profile));
          localStorage.setItem('userId', response.profile.id);
        }
        
        // Redirigir al dashboard
        navigate("/dashboard");
      } else {
        alert("Credenciales inválidas. Por favor, verifica tu email y contraseña.");
        setEmail("");
        setPassword("");
      }
    } catch (error) {
      console.error('Error en login:', error);
      
      if (error.response && error.response.status === 401) {
        alert("Credenciales inválidas. Por favor, verifica tu email y contraseña.");
      } else {
        alert("Error de conexión. Por favor, verifica que el servidor esté funcionando e intenta nuevamente.");
      }
      
      setEmail("");
      setPassword("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white m-6 p-8 rounded-xl shadow-lg text-center">
        <header>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">NextStep</h1>
          <p className="text-lg text-gray-700 mb-8">
            <b>¡Hola!</b> Ingresa a tu cuenta
          </p>
        </header>

        <div className="rounded-lg p-6 mb-5 bg-gray-50">
          <p className="text-base text-gray-800 mb-4 text-left">
            Con tus redes sociales:
          </p>
          <div className="flex flex-col gap-2">
            <button
              className="w-full py-2 rounded-full text-white bg-blue-500 hover:bg-blue-600"
              onClick={() => handleSocialLogin("LinkedIn")}
            >
              Ingresa con LinkedIn
            </button>
            <button
              className="w-full py-2 rounded-full text-white bg-blue-800 hover:bg-blue-900"
              onClick={() => handleSocialLogin("Facebook")}
            >
              Ingresa con Facebook
            </button>
            <button
              className="w-full py-2 rounded-full text-white bg-blue-700 hover:bg-blue-800"
              onClick={() => handleSocialLogin("Microsoft")}
            >
              Ingresa con Microsoft
            </button>
            <button
              className="w-full py-2 rounded-full text-white bg-red-500 hover:bg-red-600"
              onClick={() => handleSocialLogin("Google")}
            >
              Acceder con Google
            </button>
          </div>
        </div>

        <div className="rounded-lg p-6 mb-5 bg-gray-50">
          <p className="text-base text-gray-800 mb-4 text-left">
            O con tu correo y contraseña:
          </p>
          <form onSubmit={handleEmailLogin}>
            <input
              type="email"
              placeholder="Escribe tu email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                validateEmail(e.target.value);
              }}
              required
              className="w-full h-11 px-3 mb-2 bg-white border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <p className="text-sm text-red-700 px-2 py-1 mb-2 text-left min-h-[1.5em]">
              {emailError}
            </p>
            <input
              type="password"
              placeholder="Escribe tu contraseña"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                validatePassword(e.target.value);
              }}
              required
              className="w-full h-11 px-3 mb-2 bg-white border border-gray-300 rounded text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <p className="text-sm text-red-700 px-2 py-1 mb-2 text-left min-h-[1.5em]">
              {passwordError}
            </p>
            <button
              type="submit"
              className={`w-full py-2 rounded-full mt-2 mb-2 text-white ${
                emailError || passwordError || !email || !password || isLoading
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600"
              }`}
              disabled={emailError || passwordError || !email || !password || isLoading}
              onClick={handleEmailLogin}
            >
              {isLoading ? "Iniciando sesión..." : "Continuar"}
            </button>
          </form>
        </div>

        <div className="flex justify-between mt-6">
          <button
            className="w-[48%] py-2 rounded bg-white text-blue-900 border border-gray-300 hover:bg-gray-100"
            onClick={() => navigate("/signup")}
          >
            Crea una cuenta
          </button>
          <button
            className="w-[48%] py-2 rounded bg-white text-blue-900 border border-gray-300 hover:bg-gray-100"
            onClick={() => {
              // Si el usuario quiere ver empleos sin login, mostrar mensaje
              alert("Debes iniciar sesión para ver los empleos disponibles");
            }}
          >
            Ver empleos
          </button>
        </div>

        {/* Información adicional para usuarios */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            💡 <strong>¿Primera vez aquí?</strong> Crea una cuenta para acceder a todas las funciones de NextStep.
          </p>
        </div>
      </div>
    </div>
  );
}