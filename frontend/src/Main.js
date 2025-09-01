import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-5 flex justify-between items-center h-16">
            <button
              className="bg-transparent border-none p-2 rounded text-gray-800 text-xl hover:bg-gray-100"
              onClick={handleMenuClick}
            >
              ☰
            </button>
            <h1 className="text-xl font-bold text-gray-800 m-0 p-3">
              NextStep
            </h1>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 rounded-full border border-gray-200 bg-white text-gray-800 font-bold hover:bg-gray-100"
                onClick={handleLoginClick}
              >
                Ingresar
              </button>
              <button
                className="px-4 py-2 rounded-full bg-blue-500 text-white font-bold hover:bg-blue-600"
                onClick={handleRegisterClick}
              >
                Registrarse
              </button>
            </div>
          </div>
        </header>
        <div className="flex justify-center items-center py-16">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-5 flex justify-between items-center h-16">
            <button
              className="bg-transparent border-none p-2 rounded text-gray-800 text-xl hover:bg-gray-100"
              onClick={handleMenuClick}
            >
              ☰
            </button>
            <h1 className="text-xl font-bold text-gray-800 m-0">NextStep</h1>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 rounded-full border border-gray-200 bg-white text-gray-800 font-bold hover:bg-gray-100"
                onClick={handleLoginClick}
              >
                Ingresar
              </button>
              <button
                className="px-4 py-2 rounded-full bg-blue-500 text-white font-bold hover:bg-blue-600"
                onClick={handleRegisterClick}
              >
                Registrarse
              </button>
            </div>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-5 py-8">
          <div className="text-center text-red-600 text-lg p-8 bg-white rounded-xl my-6">
            {error}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div>
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-5 flex justify-between items-center h-16">
          <button
            className="bg-transparent border-none p-2 rounded text-gray-800 text-xl hover:bg-gray-100"
            onClick={handleMenuClick}
          >
            ☰
          </button>
          <h1 className="text-xl font-bold text-gray-800 m-0">NextStep</h1>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 rounded-full border border-gray-200 bg-white text-gray-800 font-bold hover:bg-gray-100"
              onClick={handleLoginClick}
            >
              Ingresar
            </button>
            <button
              className="px-4 py-2 rounded-full bg-blue-500 text-white font-bold hover:bg-blue-600"
              onClick={handleRegisterClick}
            >
              Registrarse
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-5 py-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Empleos Disponibles
          </h2>
          <p className="text-lg text-gray-700">
            Encuentra tu próxima oportunidad profesional
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-md border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition cursor-pointer"
              onClick={() => handleJobClick(job)}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                {job.title}
              </h3>
              <div className="flex items-center text-gray-700 mb-3">
                <span className="font-bold mr-2">{job.company}</span>
                <span className="mx-2 text-gray-400">|</span>
                <span>{job.contract}</span>
              </div>
              <div className="text-green-600 font-bold mb-3">{job.salary}</div>
              <div className="flex items-center text-gray-500 text-sm">
                <span className="mr-1">📍</span>
                <span>{job.city}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
