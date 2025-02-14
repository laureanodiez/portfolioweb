// src/components/Menu.jsx
import React from 'react';
import './Menu.css';

const Menu = ({ selectedOption, onBack }) => {
  return (
    <div className={`menu menu-${selectedOption.toLowerCase()}`}>
      <button className="back-button" onClick={onBack}>← Volver</button>
      <h1>{selectedOption}</h1>
      <p>Información sobre {selectedOption}...</p>
      {/* Contenido adicional según la opción */}
    </div>
  );
};

export default Menu;