// src/pages/Login.jsx
import { useContext, useState } from "react";
import { UserContext } from "../context/UserContext.jsx";
import Loader from "../components/Loader.jsx";
import logo from "../assets/logo.svg";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(UserContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault(); // Evita recargar la página

    if (!email || !password) {
      setError("Todos los campos son obligatorios");
      return;
    }

    setLoadingBtn(true);
    setError("");

    try {
      await login(email, password);
      navigate("/"); // Redirige al Home
    } catch (err) {
      setError("Credenciales incorrectas");
    }

    setLoadingBtn(false);
  };

  return (
    <div className="login-container">

      <img src={logo} alt="CalorSOS" className="login-logo" />

      <h1 className="login-title">Bienvenido</h1>
      <p className="login-subtitle">Inicia sesión para continuar</p>

      <form onSubmit={handleLogin} className="login-form">

        <input
          type="email"
          placeholder="Correo"
          className="login-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Contraseña"
          className="login-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="login-error">{error}</p>}

        <button
          type="submit"
          className="login-btn"
          disabled={loadingBtn}
        >
          {loadingBtn ? <Loader /> : "Ingresar"}
        </button>

      </form>

      <p className="small-text">
        ¿No tienes una cuenta?{" "}
        <a href="/register" className="link">
          Regístrate aquí
        </a>
      </p>

    </div>
  );
}