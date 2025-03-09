// src/components/MenuPortfolio.jsx
import React from 'react';
import './MenuPortfolio.css';
import { sectionsContent } from '../sectionsContent';

const MenuPortfolio = ({ onSelectSection, onCloseMenu }) => {
  // Orden deseado: CV, Música, Desarrollo, Diseño y Creativos
  const sectionsOrder = ["cv", "Música", "Desarrollo", "Diseño", "Creativos"];

  return (
    <div className="menu-portfolio-wrapper" onClick={(e) => { if(e.currentTarget === e.target) onCloseMenu(); }}>
      <div className="menu-portfolio-container">
        <h2>Menú de Secciones</h2>
        <ul className="menu-portfolio-list">
          {sectionsOrder.map((key) => {
            if (!sectionsContent[key]) return null;
            return (
              <li key={key} onClick={() => onSelectSection(key)}>
                {sectionsContent[key].title}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default MenuPortfolio;
