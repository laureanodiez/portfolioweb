// src/components/ContactCard.jsx

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import './ContactCard.css';

const neonColorsData = [
  { title: 'Desarrollo', color: 'red' },
  { title: 'Diseño Web', color: 'blue' },
  { title: 'Creativos', color: 'yellow' },
  { title: 'Música', color: 'green' },
];

const ContactCard = ({ onSelectSection, isFloating, setIsFloating, cardStyle }) => {
  const [hoveredSide, setHoveredSide] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  // Fijamos el eje de flip a 'y' para que siempre se realice la animación horizontal
  const [flipAxis] = useState('y');
  const [flipAngle] = useState(180);
  // Contador para detectar movimientos rápidos consecutivos
  const fastMoveCount = useRef(0);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // Al hacer click se activa el modo "flotante"
  const handleCardClick = () => {
    if (!isFloating) {
      setIsFloating(true);
    }
  };

  // Doble click resetea el estado de la tarjeta
  const handleDoubleClick = () => {
    if (isFloating) {
      setIsFloating(false);
      setIsFlipped(false);
      fastMoveCount.current = 0;
    }
  };

  const handleMouseEnter = (e) => {
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    fastMoveCount.current = 0;
  };

  const handleMouseMove = (e) => {
    if (!isFloating) return;
    // Calculamos únicamente la diferencia horizontal
    const deltaX = e.clientX - lastMousePos.current.x;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    const speed = Math.abs(deltaX);
    const threshold = 30; // umbral mínimo de velocidad para considerar el movimiento
    if (speed > threshold) {
      fastMoveCount.current += 1;
    } else {
      fastMoveCount.current = 0;
    }
    // Si se registran 3 movimientos rápidos consecutivos, se activa el flip
    if (fastMoveCount.current >= 3) {
      setIsFlipped(prev => !prev); // alterna el flip
      fastMoveCount.current = 0;
    }
  };

  const handleMouseLeave = () => {
    // No se resetea el flip para mantener la vista actual
  };

  return (
    <div className="card-container">
      {isFloating && !isFlipped && (
        <div className="neon-lights">
          {neonColorsData.map((item, index) => (
            <div
              key={index}
              className={`neon-side neon-${index}`}
              onMouseEnter={() => setHoveredSide(index)}
              onMouseLeave={() => setHoveredSide(null)}
              onClick={() => onSelectSection(item.title)}
            >
              {hoveredSide === index && (
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
      {/* Contenedor externo para animación de entrada y estado flotante */}
      <motion.div
        className={`contact-card ${isFloating ? 'floating' : ''} ${cardStyle}`}
        onClick={handleCardClick}
        onDoubleClick={handleDoubleClick}
        initial={{ y: '-100vh', rotateZ: -15, scale: 1 }}
        animate={{
          y: 0,
          rotateZ: isFloating ? 0 : -15,
          scale: isFloating ? 1.1 : 1,
          x: 0,
        }}
        transition={{ type: 'spring', stiffness: 70, damping: 15 }}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Contenedor interno para el flip */}
        <motion.div
          className="flip-container"
          animate={
            isFlipped
              ? { rotateY: flipAngle }
              : { rotateY: 0 }
          }
          transition={{ type: 'spring', stiffness: 70, damping: 15 }}
        >
          <div className="flip-card">
            {/* Cara frontal */}
            <div className="card-face card-front">
              <div className="card-content">
                <div className="card-header"></div>
                <div className="card-body">
                  <h2 className="card-name">Laureano Diez</h2>
                  <h4 className="card-title">Técnico Informático - Estudiante de IA</h4>
                </div>
              </div>
            </div>
            {/* Cara trasera */}
            <div className="card-face card-back">
              <div className="card-content scrollable">
                <div className="card-header">
                  <img
                    src="C:\Users\PC\Downloads\fotolaumic-mas-abajo.png"
                    alt="Foto Profesional"
                    className="card-photo"
                  />
                </div>
                <div className="card-body">
                  <h2 className="card-name">Laureano Diez</h2>
                  <p className="card-summary">
                  Soy Técnico en Informática Profesional y Personal y estudiante universitario de
                  tecnicatura en Inteligencia Artificial, en busca de empleo de medio tiempo para
                  continuar desarrollándome y creciendo permanentemente.
                  Tengo conocimientos académicos (grado técnico) y autodidactas de desarrollo de
                  software, soporte de hardware, networking, data management (Microsoft Office y
                  similares), diseño de páginas web (full-stack) y desarrollos creativos varios.
                  Soy eficaz para adaptarme y aprender. Tengo experiencia liderando proyectos y
                  habilidades de comunicación para mantener buenas relaciones de equipo y sociales.

                  </p>
                  <div className="cv-container">
                    <iframe
                      src="G:\Proyectos\Portfolio\portfolioweb\src\components\cv-espeng.pdf"
                      title="CV"
                      frameBorder="0"
                      className="cv-viewer"
                    ></iframe>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ContactCard;