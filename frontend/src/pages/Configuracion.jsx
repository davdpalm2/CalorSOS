import NavbarSmart from '../components/ui/NavbarSmart';
import "../assets/styles/Configuracion.css";
export default function Configuracion() {
    return (
        
        <div className="page-container">
            <NavbarSmart />
            <div className="page-content">
                <h1 className="page-title">Configuración</h1>
                {/* Contenido de la página de configuración */}
            </div>
        </div>
    );
}