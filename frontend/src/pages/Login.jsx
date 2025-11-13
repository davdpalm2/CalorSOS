import { useContext, useState } from "react";
import { UserContext } from "../context/UserContext.jsx";
import Loader from "../components/Loader.jsx";
import logo from "../assets/logo.svg";

export default function Login() {
  const { login } = useContext(UserContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Todos los campos son obligatorios");
      return;
    }

    setLoadingBtn(true);
    setError("");

    try {
      await login(email, password);
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

      <button className="login-btn" onClick={handleLogin} disabled={loadingBtn}>
        {loadingBtn ? <Loader /> : "Ingresar"}
      </button>
    </div>
  );
}
