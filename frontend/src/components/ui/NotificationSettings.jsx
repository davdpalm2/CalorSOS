// Inicio NotificationSettings.jsx

// frontend/src/components/ui/NotificationSettings.jsx

// Componente para configurar notificaciones push locales

import React, { useState, useEffect } from 'react';
import notificacionesService from '../../services/notificacionesService.js';
import "../../assets/styles/NotificationSettings.css";

const NotificationSettings = ({ isOpen, onClose }) => {
    const [settings, setSettings] = useState({
        sound: true,
        vibration: true,
        showAlerts: true
    });
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);

    // Cargar configuración al abrir
    useEffect(() => {
        if (isOpen) {
            const currentStatus = notificacionesService.getStatus();
            setStatus(currentStatus);
            setSettings(currentStatus.settings);
        }
    }, [isOpen]);

    // Solicitar permisos
    const handleRequestPermission = async () => {
        setLoading(true);
        try {
            const granted = await notificacionesService.requestPermission();
            setStatus(prev => ({ ...prev, permission: granted ? 'granted' : 'denied', hasPermission: granted }));
        } catch (error) {
            console.error('Error solicitando permisos:', error);
        } finally {
            setLoading(false);
        }
    };

    // Actualizar configuración
    const handleSettingChange = (setting, value) => {
        const newSettings = { ...settings, [setting]: value };
        setSettings(newSettings);
        notificacionesService.updateSettings(newSettings);
    };

    // Probar notificación
    const handleTestNotification = async () => {
        setLoading(true);
        try {
            await notificacionesService.showNotification(
                '🔔 Prueba de Notificación',
                {
                    body: 'Esta es una notificación de prueba de CalorSOS',
                    icon: '/assets/images/logo.svg',
                    tag: 'test-notification'
                }
            );
        } catch (error) {
            console.error('Error probando notificación:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="notification-settings-overlay">
            <div className="notification-settings-modal">
                <div className="notification-settings-header">
                    <h3>⚙️ Configuración de Notificaciones</h3>
                    <button className="notification-settings-close" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className="notification-settings-content">
                    {/* Estado de soporte */}
                    <div className="notification-status">
                        <h4>Estado del Navegador</h4>
                        <div className="status-item">
                            <span className="status-label">Notificaciones soportadas:</span>
                            <span className={`status-value ${status?.supported ? 'supported' : 'not-supported'}`}>
                                {status?.supported ? '✅ Sí' : '❌ No'}
                            </span>
                        </div>
                        <div className="status-item">
                            <span className="status-label">Permisos concedidos:</span>
                            <span className={`status-value ${status?.hasPermission ? 'granted' : 'denied'}`}>
                                {status?.hasPermission ? '✅ Sí' : '❌ No'}
                            </span>
                        </div>
                    </div>

                    {/* Solicitar permisos */}
                    {!status?.hasPermission && status?.supported && (
                        <div className="permission-section">
                            <p>Para recibir notificaciones, necesitas conceder permisos al navegador.</p>
                            <button
                                className="btn-primary"
                                onClick={handleRequestPermission}
                                disabled={loading}
                            >
                                {loading ? 'Solicitando...' : 'Solicitar Permisos'}
                            </button>
                        </div>
                    )}

                    {/* Configuración */}
                    {status?.hasPermission && (
                        <div className="settings-section">
                            <h4>Configuración</h4>

                            <div className="setting-item">
                                <label className="setting-label">
                                    <input
                                        type="checkbox"
                                        checked={settings.sound}
                                        onChange={(e) => handleSettingChange('sound', e.target.checked)}
                                    />
                                    <span className="checkmark"></span>
                                    Reproducir sonido
                                </label>
                            </div>

                            <div className="setting-item">
                                <label className="setting-label">
                                    <input
                                        type="checkbox"
                                        checked={settings.vibration}
                                        onChange={(e) => handleSettingChange('vibration', e.target.checked)}
                                    />
                                    <span className="checkmark"></span>
                                    Vibrar dispositivo (móviles)
                                </label>
                            </div>

                            <div className="setting-item">
                                <label className="setting-label">
                                    <input
                                        type="checkbox"
                                        checked={settings.showAlerts}
                                        onChange={(e) => handleSettingChange('showAlerts', e.target.checked)}
                                    />
                                    <span className="checkmark"></span>
                                    Mostrar alertas de calor
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Botón de prueba */}
                    {status?.hasPermission && (
                        <div className="test-section">
                            <button
                                className="btn-secondary"
                                onClick={handleTestNotification}
                                disabled={loading}
                            >
                                {loading ? 'Probando...' : '🔔 Probar Notificación'}
                            </button>
                        </div>
                    )}

                    {/* Información */}
                    <div className="info-section">
                        <p className="info-text">
                            💡 Las notificaciones se mostrarán automáticamente cuando haya alertas de calor activas.
                            Puedes cambiar estos ajustes en cualquier momento.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationSettings;

// Fin NotificationSettings.jsx
