import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

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
    try {
      const response = await axios.post("http://localhost:5000/api/login", {
        email,
        password,
      });
      alert("Login exitoso");
      navigate("/");
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert(
          "Credenciales inválidas. Por favor, verifica tu email y contraseña."
        );
      } else {
        alert("Error de login. Por favor, intenta nuevamente más tarde.");
      }
      setEmail("");
      setPassword("");
    }
  };

  return (
    <div className="container">
      <div className="login-container">
        <header>
          <h1>NextStep</h1>
          <p className="subtitle">
            <b>¡Hola!</b> Ingresa a tu cuenta
          </p>
        </header>

        <div className="login-box">
          <p>Con tus redes sociales:</p>
          <div className="social-buttons">
            <button onClick={() => handleSocialLogin("LinkedIn")}>
              Ingresa con LinkedIn
            </button>
            <button onClick={() => handleSocialLogin("Facebook")}>
              Ingresa con Facebook
            </button>
            <button onClick={() => handleSocialLogin("Microsoft")}>
              Ingresa con Microsoft
            </button>
            <button onClick={() => handleSocialLogin("Google")}>
              Acceder con Google
            </button>
          </div>
        </div>

        <div className="login-box">
          <p>O con tu correo y contraseña:</p>
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
            />
            <p className="error-message">{emailError}</p>
            <input
              type="password"
              placeholder="Escribe tu contraseña"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                validatePassword(e.target.value);
              }}
              required
            />
            <p className="error-message">{passwordError}</p>
            <button
              type="submit"
              className="continue-button"
              disabled={emailError || passwordError || !email || !password}
              onClick={handleEmailLogin}
            >
              Continuar
            </button>
          </form>
        </div>

        <div className="bottom-buttons">
          <button
            onClick={() => alert("Creación de cuenta aún no implementado")}
          >
            Crea una cuenta
          </button>
          <button onClick={() => navigate("/")}>Ir a ver empleos</button>
        </div>
      </div>
    </div>
  );
}
