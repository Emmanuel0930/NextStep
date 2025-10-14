import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/api";
import { useNotification } from "../components/NotificationProvider";

export default function SignUp() {

  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [step, setStep] = useState(1);

  const countries = [
    { name: "Colombia", code: "+57", flag: "🇨🇴" },
    { name: "México", code: "+52", flag: "🇲🇽" },
    { name: "Argentina", code: "+54", flag: "🇦🇷" },
    { name: "España", code: "+34", flag: "🇪🇸" },
    { name: "Chile", code: "+56", flag: "🇨🇱" },
    { name: "Perú", code: "+51", flag: "🇵🇪" }
  ];

  const [country, setCountry] = useState(countries[0].name);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneCode, setPhoneCode] = useState(countries[0].code);
  const [phone, setPhone] = useState("");

  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [confirmEmailError, setConfirmEmailError] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);

  const [gender, setGender] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const handleSocialSignUp = (platform) => {
    alert(`Registro con ${platform} aún no implementado`);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (!value.trim()) {
      setEmailError("Campo requerido");
    } else if (!validateEmail(value)) {
      setEmailError("Por favor ingresa un correo electrónico válido");
    } else {
      setEmailError("");
    }
  };

  const handleConfirmEmailChange = (e) => {
    const value = e.target.value;
    setConfirmEmail(value);
    if (!value.trim()) {
      setConfirmEmailError("Campo requerido");
    } else if (!validateEmail(value)) {
      setConfirmEmailError("Por favor ingresa un correo electrónico válido");
    } else if (value !== email) {
      setConfirmEmailError("Los correos electrónicos no coinciden");
    } else {
      setConfirmEmailError("");
    }
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      const response = await register({
        correo: email,
        contraseña: password
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
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg">
        {step === 1 && (
          <div className="p-8">
            <p className="text-sm text-gray-600 mb-2">Aquí comienza tu éxito laboral</p>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">¿Cómo deseas crear tu cuenta?</h1>

            <p className="text-sm font-semibold text-gray-700 mb-3">Con tus redes sociales:</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg border border-gray-300 hover:bg-gray-50"
                onClick={() => handleSocialSignUp("LinkedIn")}
              >
                <span className="text-blue-600 font-bold">in</span>
                <span className="text-sm">LinkedIn</span>
              </button>
              <button
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg border border-gray-300 hover:bg-gray-50"
                onClick={() => handleSocialSignUp("Facebook")}
              >
                <span className="text-blue-600 font-bold">f</span>
                <span className="text-sm">Facebook</span>
              </button>
              <button
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg border border-gray-300 hover:bg-gray-50"
                onClick={() => handleSocialSignUp("Google")}
              >
                <span className="text-red-500 font-bold">G</span>
                <span className="text-sm">Google</span>
              </button>
              <button
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg border border-gray-300 hover:bg-gray-50"
                onClick={() => handleSocialSignUp("Microsoft")}
              >
                <span className="text-blue-500 font-bold">M</span>
                <span className="text-sm">Microsoft</span>
              </button>
            </div>

            <p className="text-sm font-semibold text-gray-700 mb-3">Con tu correo electrónico:</p>
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={handleEmailChange}
              className={`w-full px-4 py-3 mb-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                emailError ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {emailError && (
              <p className="text-sm text-red-500 mb-3 px-1">{emailError}</p>
            )}
            <input
              type="email"
              placeholder="Confirmación correo electrónico"
              value={confirmEmail}
              onChange={handleConfirmEmailChange}
              className={`w-full px-4 py-3 mb-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                confirmEmailError ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {confirmEmailError && (
              <p className="text-sm text-red-500 mb-4 px-1">{confirmEmailError}</p>
            )}

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <label className="flex items-start gap-3 mb-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedPolicy}
                  onChange={(e) => setAcceptedPolicy(e.target.checked)}
                  className="mt-1"
                />
                <span className="text-sm text-gray-700">
                  He leído y autorizo el <a href="https://www.magneto365.com/co/politicas?content=autorizacion-de-tratamiento-de-datos-personales-magneto-global-s-a-s-nit-901-645-620-3" target="_blank" rel="noopener noreferrer" className="underline text-purple-600 hover:text-purple-800">tratamiento de datos personales</a> de la plataforma
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1"
                />
                <span className="text-sm text-gray-700">
                  He leído y acepto los <a href="https://www.magneto365.com/co/politicas?content=terminos-condiciones-uso-plataforma-magneto" target="_blank" rel="noopener noreferrer" className="underline text-purple-600 hover:text-purple-800">términos y Condiciones de uso</a> de la plataforma
                </span>
              </label>
            </div>

            <button
              onClick={handleNext}
              disabled={!email || !confirmEmail || !acceptedTerms || !acceptedPolicy || email !== confirmEmail || emailError || confirmEmailError}
              className="w-full py-3 rounded-full bg-purple-600 text-white font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed mb-4"
            >
              Siguiente
            </button>

            <div className="text-center">
              <span className="text-sm text-gray-600">¿Ya tienes una cuenta? </span>
              <button
                onClick={handleLogin}
                className="text-sm text-purple-600 font-semibold hover:underline"
              >
                Iniciar sesión
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-8">
            <div className="flex items-center gap-2 mb-6 overflow-x-auto">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
              <span className="font-semibold text-sm whitespace-nowrap">Información personal</span>
              <div className="w-8 h-8 rounded-full bg-gray-300 text-white flex items-center justify-center flex-shrink-0">2</div>
              <span className="text-gray-400 text-sm whitespace-nowrap">Contraseña</span>
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-2">Información personal</h2>
            <p className="text-sm text-gray-600 mb-6">Completa tus datos personales y de contacto para iniciar tu registro</p>

            <label className="block text-sm font-semibold text-gray-700 mb-2">¿Cuál es tu país de residencia?</label>
            <select
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
                const selected = countries.find(c => c.name === e.target.value);
                if (selected) setPhoneCode(selected.code);
              }}
              className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {countries.map((c) => (
                <option key={c.code} value={c.name}>{c.name}</option>
              ))}
            </select>

            <label className="block text-sm font-semibold text-gray-700 mb-2">¿Quién eres?</label>
            <div className="grid grid-cols-1 gap-3 mb-4">
              <input
                type="text"
                placeholder="Nombre(s)"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="text"
                placeholder="Apellido(s)"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <label className="block text-sm font-semibold text-gray-700 mb-2">¿Cuál es tu número de teléfono?</label>
            <div className="grid grid-cols-5 gap-3 mb-6">
              <select
                value={phoneCode}
                onChange={(e) => setPhoneCode(e.target.value)}
                className="col-span-2 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                ))}
              </select>
              <input
                type="tel"
                placeholder="Número teléfono"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="col-span-3 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleBack}
                className="px-6 py-3 rounded-full border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
              >
                Atrás
              </button>
              <button
                onClick={handleNext}
                className="flex-1 py-3 rounded-full bg-purple-600 text-white font-semibold hover:bg-purple-700"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="p-8">
            <div className="flex items-center gap-2 mb-6 overflow-x-auto">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
              <span className="font-semibold text-sm whitespace-nowrap">Información personal</span>
              <div className="w-8 h-8 rounded-full bg-gray-300 text-white flex items-center justify-center flex-shrink-0">2</div>
              <span className="text-gray-400 text-sm whitespace-nowrap">Contraseña</span>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <div className="flex gap-3">
                <span className="text-blue-500 font-bold">ℹ</span>
                <div>
                  <p className="font-semibold text-gray-800 mb-1">Dato requerido por el Servicio Público de Empleo</p>
                  <p className="text-sm text-gray-600">Ten en cuenta que este dato es indispensable para la creación de tu cuenta. Solo tendrás que diligenciarlo una vez.</p>
                </div>
              </div>
            </div>

            <h2 className="text-lg font-semibold text-gray-700 mb-4">Sexo registrado en tu documento de identidad</h2>

            <div className="space-y-3 mb-6">
              <label
                className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer ${
                  gender === "male" ? "border-purple-600 bg-purple-50" : "border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={gender === "male"}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-5 h-5"
                />
                <div>
                  <p className="font-semibold text-gray-800">Hombre</p>
                  <p className="text-sm text-gray-600">Sexo registrado como masculino en tu documento</p>
                </div>
              </label>

              <label
                className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer ${
                  gender === "female" ? "border-purple-600 bg-purple-50" : "border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={gender === "female"}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-5 h-5"
                />
                <div>
                  <p className="font-semibold text-gray-800">Mujer</p>
                  <p className="text-sm text-gray-600">Sexo registrado como femenino en tu documento</p>
                </div>
              </label>

              <label
                className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer ${
                  gender === "intersex" ? "border-purple-600 bg-purple-50" : "border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="gender"
                  value="intersex"
                  checked={gender === "intersex"}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-5 h-5"
                />
                <div>
                  <p className="font-semibold text-gray-800">Intersexual</p>
                  <p className="text-sm text-gray-600">Sexo registrado que no corresponde únicamente a masculino o femenino</p>
                </div>
              </label>

              <label
                className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer ${
                  gender === "other" ? "border-purple-600 bg-purple-50" : "border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="gender"
                  value="other"
                  checked={gender === "other"}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-5 h-5"
                />
                <div>
                  <p className="font-semibold text-gray-800">Otro</p>
                  <p className="text-sm text-gray-600">Sexo registrado distinto a hombre, mujer o intersexual</p>
                </div>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleBack}
                className="px-6 py-3 rounded-full border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
              >
                Atrás
              </button>
              <button
                onClick={handleNext}
                disabled={!gender}
                className="flex-1 py-3 rounded-full bg-purple-600 text-white font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="p-8">
            <div className="flex items-center gap-2 mb-6 overflow-x-auto">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">✓</div>
              <span className="text-gray-400 text-sm">Información personal</span>
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
              <span className="font-semibold text-sm">Contraseña</span>
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-2">Contraseña</h2>
            <p className="text-sm text-gray-600 mb-6">Escriba una contraseña para ingresar a su cuenta</p>

            <div className="relative mb-4">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Nueva contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                )}
              </button>
            </div>

            <div className="relative mb-6">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirmar nueva contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                )}
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleBack}
                className="px-6 py-3 rounded-full border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
              >
                Atrás
              </button>
              <button
                onClick={handleSubmit}
                disabled={!password || !confirmPassword || password !== confirmPassword || isLoading}
                className="flex-1 py-3 rounded-full bg-purple-600 text-white font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isLoading ? "Registrando..." : "Finalizar"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}