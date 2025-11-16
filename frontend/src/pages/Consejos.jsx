import React, { useState } from "react";
import "../assets/styles/Consejos.css";
import Navbar from "../components/ui/NavbarSmart.jsx";
import { consejosData } from "../data/consejosData.js";

export default function Consejos() {

    const categoriasUnicas = [
        "Hidratación",
        "Exposición al sol",
        "Protección personal",
        "Actividad física",
        "Hogar",
        "Control corporal",
        "Alimentación",
        "Comunidad",
        "Emergencias",
    ];

    // Estado del filtro
    const [filtros, setFiltros] = useState([]);

    const toggleFiltro = (categoria) => {
        if (filtros.includes(categoria)) {
            setFiltros(filtros.filter((f) => f !== categoria));
        } else {
            setFiltros([...filtros, categoria]);
        }
    };

    const limpiarFiltros = () => setFiltros([]);

    // --- NUEVO: Contar cantidad de consejos por categoría ---
    const cuentaPorCategoria = categoriasUnicas.reduce((acc, categoria) => {
        acc[categoria] = consejosData.filter(c => c.categoria === categoria).length;
        return acc;
    }, {});

    const totalConsejos = consejosData.length;
    const totalCategorias = categoriasUnicas.length;

    // Aplicar filtros
    const consejosFiltrados =
        filtros.length === 0
            ? consejosData
            : consejosData.filter(c => filtros.includes(c.categoria));

    return (
        <div className="consejos-container">
            <Navbar />

            <div className="consejos-layout">

                {/* SIDEBAR */}
                <aside className="consejos-sidebar">
                    <h2 className="sidebar-title">
                        Filtrar por categoría
                    </h2>
                    <p className="sidebar-subtitle-categorias">
                        Categorias: {totalCategorias} <br />
                    </p>
                    <p className="sidebar-subtitle-consejos">
                        Consejos: {totalConsejos}
                    </p>
                    <button className="sidebar-clear" onClick={limpiarFiltros}>
                        Ver todos
                    </button>

                    <div className="sidebar-checklist">
                        {categoriasUnicas.map((cat) => (
                            <label key={cat} className="sidebar-item">
                                <input
                                    type="checkbox"
                                    checked={filtros.includes(cat)}
                                    onChange={() => toggleFiltro(cat)}
                                />
                                {cat} ({cuentaPorCategoria[cat]})
                            </label>
                        ))}
                    </div>
                </aside>

                {/* CONTENIDO */}
                <main className="consejos-content">
                    <h1 className="consejos-title">CONSEJOS PARA PREVENIR RIESGOS POR CALOR</h1>

                    <div className="consejos-grid">
                        {consejosFiltrados.map((consejo, idx) => (
                            <div className="consejo-card" key={idx}>
                                <div className="consejo-header">
                                    <h3>{consejo.titulo}</h3>
                                </div>
                                <p className="consejo-desc">{consejo.descripcion}</p>

                                <span
                                    className="consejo-tag"
                                    data-categoria={consejo.categoria}
                                >
                                    {consejo.categoria}
                                </span>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
}
