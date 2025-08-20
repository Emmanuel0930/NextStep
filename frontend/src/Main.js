import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Main.css";

export default function Login() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/jobs");
      setJobs(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setError(
        "Error al cargar los empleos. Por favor, intenta nuevamente más tarde."
      );
      setLoading(false);
    }
  };

  const handleMenuClick = () => {
    alert("Menú aún no implementado");
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleRegisterClick = () => {
    alert("Registro aún no implementado");
  };

  const handleJobClick = (job) => {
    alert(`Ver detalles del trabajo: ${job.title} en ${job.company}`);
  };

  if (loading) {
    return (
      <div>
        <header className="header">
          <div className="header-container">
            <button className="menu-btn" onClick={handleMenuClick}>
              ☰
            </button>

            <h1 className="title">NextStep</h1>

            <div className="auth-buttons">
              <button className="btn btn-login" onClick={handleLoginClick}>
                Ingresar
              </button>
              <button
                className="btn btn-register"
                onClick={handleRegisterClick}
              >
                Registrarse
              </button>
            </div>
          </div>
        </header>

        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <header className="header">
          <div className="header-container">
            <button className="menu-btn" onClick={handleMenuClick}>
              ☰
            </button>

            <h1 className="title">NextStep</h1>

            <div className="auth-buttons">
              <button className="btn btn-login" onClick={handleLoginClick}>
                Ingresar
              </button>
              <button
                className="btn btn-register"
                onClick={handleRegisterClick}
              >
                Registrarse
              </button>
            </div>
          </div>
        </header>

        <main className="main-content">
          <div className="error-message">{error}</div>
        </main>
      </div>
    );
  }

  return (
    <div>
      <header className="header">
        <div className="header-container">
          <button className="menu-btn" onClick={handleMenuClick}>
            ☰
          </button>

          <h1 className="title">NextStep</h1>

          <div className="auth-buttons">
            <button className="btn btn-login" onClick={handleLoginClick}>
              Ingresar
            </button>
            <button className="btn btn-register" onClick={handleRegisterClick}>
              Registrarse
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="page-header">
          <h2 className="page-title">Empleos Disponibles</h2>
          <p className="page-subtitle">
            Encuentra tu próxima oportunidad profesional
          </p>
        </div>

        <div className="jobs-grid">
          {jobs.map((job, index) => (
            <div
              key={index}
              className="job-card"
              onClick={() => handleJobClick(job)}
            >
              <h3 className="job-title">{job.title}</h3>

              <div className="job-company">
                <span className="company-name">{job.company}</span>
                <span className="separator">|</span>
                <span>{job.contract}</span>
              </div>

              <div className="job-salary">{job.salary}</div>

              <div className="job-city">
                <span className="location-icon">📍</span>
                <span>{job.city}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
