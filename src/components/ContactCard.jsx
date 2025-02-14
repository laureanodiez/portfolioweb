// src/components/ContactCard.jsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './ContactCard.css';
import perfil from '../assets/images/perfil.png';

const neonColorsData = [
  { title: 'Desarrollo', color: 'red' },
  { title: 'Diseño Web', color: 'blue' },
  { title: 'Creativos', color: 'yellow' },
  { title: 'Música', color: 'green' },
];

const ContactCard = ({ onSelectSection, isFloating, setIsFloating }) => {
  const [hoveredSide, setHoveredSide] = useState(null);

  const handleCardClick = () => {
    if (!isFloating) {
      setIsFloating(true);
    }
  };

  const handleDoubleClick = () => {
    if (isFloating) {
      setIsFloating(false);
    }
  };

  const handleMouseEnter = (side) => {
    setHoveredSide(side);
  };

  const handleMouseLeave = () => {
    setHoveredSide(null);
  };

  return (
    <div className="card-container">
      {isFloating && (
        <div className="neon-lights">
          {neonColorsData.map((item, index) => (
            <div
              key={index}
              className={`neon-side neon-${index}`}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
              onClick={() => onSelectSection(item.title)}
            >
              {(hoveredSide === index) && (
                <motion.span
                  className="section-title"
                  style={{ color: item.color }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  {item.title}
                </motion.span>
              )}
            </div>
          ))}
        </div>
      )}

      <motion.div
        className={`contact-card ${isFloating ? 'floating' : ''}`}
        onClick={handleCardClick}
        onDoubleClick={handleDoubleClick}
        initial={{ y: '-100vh', rotate: -15 }}
        animate={{
          y: 0,
          rotate: isFloating ? 0 : -15,
          scale: isFloating ? 1.2 : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 70,
          damping: 15,
        }}
      >
        <div className="card-content">
          <div className="card-header">
            <img src="/path/to/your/photo.jpg" alt="Foto Profesional" className="card-photo" />
          </div>
          <div className="card-body">
            <h2 className="card-name">Tu Nombre</h2>
            <h4 className="card-title">Título Profesional</h4>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Funciones auxiliares para posicionar el título
const getTitlePositionX = (index) => {
  switch (index) {
    case 0: // Desarrollo (Arriba)
      return 0;
    case 1: // Diseño Web (Derecha)
      return 50;
    case 2: // Creativos (Abajo)
      return 0;
    case 3: // Música (Izquierda)
      return -50;
    default:
      return 0;
  }
};

const getTitlePositionY = (index) => {
  switch (index) {
    case 0: // Desarrollo (Arriba)
      return -50;
    case 1: // Diseño Web (Derecha)
      return 0;
    case 2: // Creativos (Abajo)
      return 50;
    case 3: // Música (Izquierda)
      return 0;
    default:
      return 0;
  }
};


export default ContactCard;