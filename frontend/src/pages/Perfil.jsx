import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../context/UserContext.jsx";
import NavbarSmart from "../components/ui/NavbarSmart";
import "../assets/styles/Perfil.css";

export default function Perfil() {
  const { user, logout, updateProfile, changePassword } = useContext(UserContext);
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    telefono: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  // Actualizar formData cuando cambie el user
  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        correo: user.correo || '',
        telefono: user.telefono || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      console.log('Actualizando perfil con:', formData);
      await updateProfile(formData);
      setIsEditing(false);
      alert('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      alert('Error al actualizar el perfil: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      console.log('Cambiando contraseña...');
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      alert('Contraseña cambiada correctamente');
      setShowChangePassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      alert('Error al cambiar la contraseña: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setFormData({
      nombre: user?.nombre || '',
      correo: user?.correo || '',
      telefono: user?.telefono || ''
    });
    setIsEditing(false);
  };

  const cancelPasswordChange = () => {
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowChangePassword(false);
  };

  if (!user) {
    return <div>Cargando...</div>;
  }

  return (
    <>
      <NavbarSmart />
      <div className="pr-container">
        <div className="pr-content">
          <div className="pr-header">
            <h1 className="pr-title">Mi Perfil</h1>
            <p className="pr-subtitle">Gestiona tu información personal y seguridad</p>
          </div>

          <div className="pr-grid">
            {/* Columna izquierda: Información personal */}
            <div className="pr-card">
              <h2 className="pr-card__title">Información Personal</h2>
              
              <div className="pr-info-group">
                <div className="pr-info-label">Nombre</div>
                {isEditing ? (
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className="pr-input"
                    placeholder="Tu nombre completo"
                    disabled={loading}
                  />
                ) : (
                  <div className="pr-info-value">
                    {user.nombre || 'No especificado'}
                  </div>
                )}
              </div>

              <div className="pr-info-group">
                <div className="pr-info-label">Correo electrónico</div>
                {isEditing ? (
                  <input
                    type="email"
                    name="correo"
                    value={formData.correo}
                    onChange={handleInputChange}
                    className="pr-input"
                    placeholder="tu@email.com"
                    disabled={loading}
                  />
                ) : (
                  <div className="pr-info-value">
                    {user.correo || 'No especificado'}
                  </div>
                )}
              </div>

              <div className="pr-info-group">
                <div className="pr-info-label">Teléfono</div>
                {isEditing ? (
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className="pr-input"
                    placeholder="+1 234 567 8900"
                    disabled={loading}
                  />
                ) : (
                  <div className="pr-info-value">
                    {user.telefono || 'No especificado'}
                  </div>
                )}
              </div>

              <div className="pr-actions">
                {!isEditing ? (
                  <button 
                    className="pr-btn pr-btn--primary"
                    onClick={() => setIsEditing(true)}
                    disabled={loading}
                  >
                    Editar Perfil
                  </button>
                ) : (
                  <>
                    <button 
                      className="pr-btn pr-btn--primary"
                      onClick={handleSaveProfile}
                      disabled={loading}
                    >
                      {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                    <button 
                      className="pr-btn pr-btn--secondary"
                      onClick={cancelEdit}
                      disabled={loading}
                    >
                      Cancelar
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Columna derecha: Seguridad */}
            <div className="pr-card">
              <h2 className="pr-card__title">Seguridad</h2>
              
              {!showChangePassword ? (
                <>
                  <div className="pr-info-group">
                    <div className="pr-info-label">Estado de la cuenta</div>
                    <div className="pr-info-value" style={{ color: '#90EE90' }}>
                      Activa
                    </div>
                  </div>

                  <div className="pr-actions">
                    <button 
                      className="pr-btn pr-btn--secondary"
                      onClick={() => setShowChangePassword(true)}
                      disabled={loading}
                    >
                      Cambiar Contraseña
                    </button>
                    <button 
                      className="pr-btn pr-btn--danger" 
                      onClick={logout}
                      disabled={loading}
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                </>
              ) : (
                <div className="pr-password-form">
                  <div className="pr-info-group">
                    <div className="pr-info-label">Contraseña Actual</div>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="pr-input"
                      placeholder="Ingresa tu contraseña actual"
                      disabled={loading}
                    />
                  </div>

                  <div className="pr-info-group">
                    <div className="pr-info-label">Nueva Contraseña</div>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="pr-input"
                      placeholder="Mínimo 6 caracteres"
                      disabled={loading}
                    />
                  </div>

                  <div className="pr-info-group">
                    <div className="pr-info-label">Confirmar Contraseña</div>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="pr-input"
                      placeholder="Repite la nueva contraseña"
                      disabled={loading}
                    />
                  </div>

                  <div className="pr-actions">
                    <button 
                      className="pr-btn pr-btn--primary"
                      onClick={handleChangePassword}
                      disabled={loading}
                    >
                      {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
                    </button>
                    <button 
                      className="pr-btn pr-btn--secondary"
                      onClick={cancelPasswordChange}
                      disabled={loading}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}