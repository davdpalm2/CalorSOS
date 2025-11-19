// Inicio Configuracion.jsx

// frontend/src/pages/Configuracion.jsx

// Página para configuración de usuario y aplicación

// Importaciones de React
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

// Importación del contexto de usuario
import { UserContext } from '../context/UserContext.jsx';

// Importación de componentes
import NavbarSmart from '../components/ui/NavbarSmart';

// Importación de estilos
import "../assets/styles/Configuracion.css";

export default function Configuracion() {
    const navigate = useNavigate();
    const { user, userSettings, setUserSettings } = useContext(UserContext);

    // Estado local para configuraciones
    const [settings, setSettings] = useState(userSettings);

    // Cargar configuraciones desde localStorage al montar (por usuario)
    useEffect(() => {
        if (user && user.id_usuario) {
            const userKey = `userSettings_${user.id_usuario}`;
            const savedSettings = localStorage.getItem(userKey);
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);
                setSettings(parsed);
                setUserSettings(parsed); // Actualizar contexto global
                // Aplicar tema inmediatamente
                applyTheme(parsed.theme);
            } else {
                // Si no hay configuraciones guardadas, usar valores por defecto
                const defaultSettings = {
                    theme: 'dark',
                    temperatureUnit: 'C',
                    notifications: { sound: true, vibration: false },
                    map: { type: 'street', defaultZoom: 13 }
                };
                setSettings(defaultSettings);
                setUserSettings(defaultSettings);
                localStorage.setItem(userKey, JSON.stringify(defaultSettings));
            }
        }
    }, [user]);

    // Aplicar tema al body
    const applyTheme = (theme) => {
        if (theme === 'light') {
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
        }
    };

    // Guardar configuraciones en localStorage y contexto global (por usuario)
    const saveSettings = (newSettings) => {
        if (user && user.id_usuario) {
            const userKey = `userSettings_${user.id_usuario}`;
            localStorage.setItem(userKey, JSON.stringify(newSettings));
        }
        setSettings(newSettings);
        setUserSettings(newSettings); // Actualizar contexto global
    };

    // Handlers para cambios
    const handleThemeChange = (theme) => {
        const newSettings = { ...settings, theme };
        saveSettings(newSettings);
        applyTheme(theme);
    };

    const handleTempUnitChange = (unit) => {
        const newSettings = { ...settings, temperatureUnit: unit };
        saveSettings(newSettings);
    };

    const handleNotificationChange = (type, value) => {
        const newSettings = {
            ...settings,
            notifications: { ...settings.notifications, [type]: value }
        };
        saveSettings(newSettings);
    };

    const handleMapChange = (key, value) => {
        const newSettings = {
            ...settings,
            map: { ...settings.map, [key]: value }
        };
        saveSettings(newSettings);
    };

    return (
        <div className="page-container">
            <NavbarSmart />
            <div className="page-content">
                <h1 className="page-title">Configuración</h1>

                <div className="config-sections">
                    {/* Sección de Apariencia */}
                    <div className="config-section">
                        <h2 className="section-title">Apariencia</h2>

                        <div className="config-item">
                            <label className="config-label">Tema</label>
                            <div className="toggle-group">
                                <button
                                    className={`toggle-btn ${settings.theme === 'dark' ? 'active' : ''}`}
                                    onClick={() => handleThemeChange('dark')}
                                >
                                    Oscuro
                                </button>
                                <button
                                    className={`toggle-btn ${settings.theme === 'light' ? 'active' : ''}`}
                                    onClick={() => handleThemeChange('light')}
                                >
                                    Claro
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sección de Perfil */}
                    <div className="config-section">
                        <h2 className="section-title">Cuenta</h2>

                        <div className="config-item">
                            <button
                                className="config-btn primary"
                                onClick={() => navigate('/perfil')}
                            >
                                Ver y Editar Perfil
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Fin Configuracion.jsx
