// src/pages/Register.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../components/common/Loader.jsx";
import logo from "../assets/images/logo.svg";
import { registerUser } from "../services/usuariosService.js";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await registerUser(formData);

      if (res.status === 200 || res.status === 201) {
        alert("Registro exitoso. Ahora inicia sesión con tu usuario.");
        navigate("/login"); // Redirigir a Login
      } else {
        const data = await res.json();
        setErrorMsg(data?.detail || "Error registrando usuario.");
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || "Error de conexión.");
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      {loading && <Loader />}

      <img src={logo} alt="CalorSOS Logo" className="login-logo" />

      <h2 className="login-title">Crear Cuenta</h2>
      <p className="login-subtitle">Regístrate para continuar</p>

      <form className="login-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre completo"
          className="login-input"
          value={formData.nombre}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="correo"
          placeholder="Correo electrónico"
          className="login-input"
          value={formData.correo}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          className="login-input"
          value={formData.password}
          onChange={handleChange}
          required
        />

        {errorMsg && <p className="login-error">{errorMsg}</p>}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Procesando..." : "Registrarse"}
        </button>
      </form>

      <p className="small-text">
        ¿Ya tienes una cuenta?{" "}
        <a href="/login" className="link">
          Iniciar sesión
        </a>
      </p>
    </div>
  );
}