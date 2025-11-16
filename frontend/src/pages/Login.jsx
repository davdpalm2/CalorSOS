// src/pages/Login.jsx
import { useContext, useState } from "react";
import { UserContext } from "../context/UserContext.jsx";
import { useNavigate } from "react-router-dom";
import LoaderPremium from "../components/common/LoaderPremium.jsx";
import logo from "../assets/images/logo.svg";
import "../assets/styles/Auth.css";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(UserContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Todos los campos son obligatorios");
      return;
    }

    setLoadingBtn(true);
    setError("");

    try {
      await login(email, password);
      navigate("/");
    } catch {
      setError("Credenciales incorrectas");
    }

    setLoadingBtn(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <img src={logo} alt="CalorSOS" className="auth-logo" />

        <h1 className="auth-title">Bienvenido</h1>
        <p className="auth-subtitle">Inicia sesión para continuar</p>

        <form onSubmit={handleLogin}>
          
          <div className="input-group">
            <i className="fa-solid fa-envelope"></i>
            <input
              type="email"
              placeholder="Correo"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <i className="fa-solid fa-lock"></i>
            <input
              type={showPass ? "text" : "password"}
              placeholder="Contraseña"
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <i
              className="fa-solid fa-eye toggle-password"
              onClick={() => setShowPass(!showPass)}
            ></i>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-btn" disabled={loadingBtn}>
            {loadingBtn ? <LoaderPremium mini /> : "Ingresar"}
          </button>

        </form>

        <p className="small-text" style={{ marginTop: "12px", color: "#8fa3bf" }}>
          ¿No tienes una cuenta?{" "}
          <a href="/register" className="auth-link">Regístrate aquí</a>
        </p>

        <footer className="auth-footer">
          <p>© {new Date().getFullYear()} CalorSOS — Todos los derechos reservados</p>
        </footer>

      </div>
    </div>
  );
}
