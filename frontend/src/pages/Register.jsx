// src/pages/Register.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoaderPremium from "../components/common/LoaderPremium.jsx";
import logo from "../assets/images/logo.svg";
import { registerUser } from "../services/usuariosService.js";
import "../assets/styles/Auth.css";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await registerUser(formData);

      if (res.status === 200 || res.status === 201) {
        alert("Registro exitoso. Ahora inicia sesión.");
        navigate("/login");
      } else {
        const data = await res.json();
        setErrorMsg(data?.detail || "Error registrando usuario.");
      }
    } catch {
      setErrorMsg("Error de conexión.");
    }

    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        {loading && (
          <div className="auth-overlay">
            <div className="thermal-loader btn-mini"></div>
          </div>
        )}

        <img src={logo} alt="CalorSOS Logo" className="auth-logo" />

        <h2 className="auth-title">Crear Cuenta</h2>
        <p className="auth-subtitle">Regístrate para continuar</p>

        <form className="login-form" onSubmit={handleSubmit}>

          <div className="input-group">
            <i className="fa-solid fa-user"></i>
            <input
              type="text"
              name="nombre"
              placeholder="Nombre completo"
              className="auth-input"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <i className="fa-solid fa-envelope"></i>
            <input
              type="email"
              name="correo"
              placeholder="Correo electrónico"
              className="auth-input"
              value={formData.correo}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <i className="fa-solid fa-lock"></i>
            <input
              type={showPass ? "text" : "password"}
              name="password"
              placeholder="Contraseña"
              className="auth-input"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <i
              className="fa-solid fa-eye toggle-password"
              onClick={() => setShowPass(!showPass)}
            ></i>
          </div>

          {errorMsg && <p className="auth-error">{errorMsg}</p>}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <LoaderPremium mini /> : "Registrarse"}
          </button>
        </form>

        <p className="small-text" style={{ marginTop: "12px", color: "#8fa3bf" }}>
          ¿Ya tienes una cuenta?{" "}
          <a href="/login" className="auth-link">Inicia sesión</a>
        </p>
        
        <footer className="auth-footer">
          <p>© {new Date().getFullYear()} CalorSOS — Todos los derechos reservados</p>
        </footer>
      </div>
    </div>
  );
}
