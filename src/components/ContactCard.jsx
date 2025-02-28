// src/components/ContactCard.jsx

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import './ContactCard.css';


const neonColorsData = [
  { title: 'Desarrollo', color: 'red' },
  { title: 'Diseño Web', color: 'blue' },
  { title: 'Creativos', color: 'yellow' },
  { title: 'Música', color: 'green' },
];

// Función que devuelve el offset inicial para la animación del label (opcional)
const getLabelOffset = (side) => {
  if (side === 0) return { y: 20, x: 0 };
  if (side === 1) return { x: -20, y: 0 };
  if (side === 2) return { y: -20, x: 0 };
  if (side === 3) return { x: 20, y: 0 };
  return { x: 0, y: 0 };
};

const ContactCard = ({ onSelectSection, isFloating, setIsFloating, cardStyle }) => {
  const [isLoading, setIsLoading] = useState(true);
  // Estado para el lado activo (cuando se pasa el mouse)
  const [activeSide, setActiveSide] = useState(null);
  // Estado para el lado bloqueado (tras click en el costado)
  const [lockedSide, setLockedSide] = useState(null);
  // Estado para el flip de la tarjeta
  const [isFlipped, setIsFlipped] = useState(false);
  // Estado para la expansión de la tarjeta
  const [isExpanded, setIsExpanded] = useState(false);
  // Estado "mode": "cv" o "section"
  const [mode, setMode] = useState(null);

  // Refs para detectar movimiento rápido (flip por movimiento)
  const fastMoveCount = useRef(0);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const cardRef = useRef(null);
  // 📌 Definir useEffect en la raíz
  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);

  // Listener global para resetear la selección si se clickea fuera de la tarjeta (cuando no está expandida)
  useEffect(() => {
    const handleDocClick = (e) => {
      if (!isExpanded && lockedSide !== null) {
        if (cardRef.current && !cardRef.current.contains(e.target)) {
          setLockedSide(null);
          setActiveSide(null);
        }
      }
    };
    document.addEventListener('click', handleDocClick);
    return () => document.removeEventListener('click', handleDocClick);
  }, [lockedSide, isExpanded]);

  // 📌 Si está cargando, mostramos la pantalla de carga
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="pentagon-loader"></div>
        <p className="loading-text">vALPHA - © Laureano Diez</p>
      </div>
    );
  }


  /* Manejo del movimiento del mouse */
  const handleMouseMove = (e) => {
    if (!isFloating) return;
    
    // Detección de movimiento rápido para activar modo "cv"
    const deltaX = e.clientX - lastMousePos.current.x;
    const speed = Math.abs(deltaX);
    if (speed > 30) {
      fastMoveCount.current += 1;
    } else {
      fastMoveCount.current = 0;
    }
    if (fastMoveCount.current >= 3 && !lockedSide && !isExpanded) {
      setMode("cv");
      setIsFlipped(true);
      setIsExpanded(true);
      fastMoveCount.current = 0;
    }
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    // Si no hay lado bloqueado y la tarjeta no está expandida, determinamos el lado activo
    if (!lockedSide && !isExpanded) {
      const rect = cardRef.current.getBoundingClientRect();
      const threshold = 30;
      let side = null;
      if (e.clientY - rect.top <= threshold) side = 0;          // Top
      else if (rect.right - e.clientX <= threshold) side = 1;      // Right
      else if (rect.bottom - e.clientY <= threshold) side = 2;     // Bottom
      else if (e.clientX - rect.left <= threshold) side = 3;       // Left
      setActiveSide(side);
    }
  };

  const handleMouseLeave = () => {
    if (!isExpanded) setActiveSide(null);
  };

  /* Manejo del clic en la tarjeta */
  const handleCardClick = (e) => {
    if (!isFloating) {
      setIsFloating(true);
      return;
    }
    // Si ya hay un lado bloqueado y se clickea fuera del label, se revierte la selección
    if (lockedSide !== null) {
      if (!e.target.classList.contains('section-label')) {
        setLockedSide(null);
        setActiveSide(null);
        return;
      }
    } else {
      // Si no hay lado bloqueado y hay un lado activo, se bloquea ese lado para mostrar el label
      if (!isExpanded && activeSide !== null) {
        setLockedSide(activeSide);
      }
    }
  };

  // Al hacer clic en el label, se activa el modo "section" y se expande la tarjeta para mostrar el contenido actualizado
  const handleSectionTitleClick = (e) => {
    e.stopPropagation();
    setMode("section");
    setIsFlipped(true);
    setIsExpanded(true);
    // En modo "section", el contenido se renderiza internamente (más abajo)
  };

  // Doble click en la tarjeta (ya sea en la tarjeta o en el contenedor) la colapsa y vuelve a la posición flotante
  const handleDoubleClick = (e) => {
    setIsExpanded(false);
    setIsFlipped(false);
    setLockedSide(null);
    setActiveSide(null);
    setMode(null);
  };

  // Si se hace clic en el fondo expandido (fuera del contenido), colapsa la tarjeta
  const handleCollapse = (e) => {
    handleDoubleClick(e);
  };

  // Evita que clics dentro de la tarjeta expandida provoquen colapso
  const stopPropagation = (e) => e.stopPropagation();

  /* Cálculo de la inclinación (tilt) y sombra radial */
  const currentSide = lockedSide !== null ? lockedSide : activeSide;
  let tilt = { rotateX: 0, rotateY: 0, x: 0, y: 0 };
  if (!isExpanded && isFloating && !isFlipped && currentSide !== null) {
    // Para top y bottom, se invierte la inclinación según lo pedido
    if (currentSide === 0) tilt = { rotateX: -15, y: -10 };      // Top: inclina hacia arriba
    else if (currentSide === 1) tilt = { rotateY: -15, x: 10 };  // Right: inclina hacia la izquierda
    else if (currentSide === 2) tilt = { rotateX: 15, y: 10 }; // Bottom: inclina hacia abajo
    else if (currentSide === 3) tilt = { rotateY: 15, x: -10 };  // Left: inclina hacia la derecha
  }
  
  let radialShadow = {};
  if (lockedSide !== null && !isExpanded) {
    const color = neonColorsData[lockedSide].color;
    if (lockedSide === 0) radialShadow = { boxShadow: `0 -20px 30px 10px ${color}` };
    else if (lockedSide === 1) radialShadow = { boxShadow: `20px 0 30px 10px ${color}` };
    else if (lockedSide === 2) radialShadow = { boxShadow: `0 20px 30px 10px ${color}` };
    else if (lockedSide === 3) radialShadow = { boxShadow: `-20px 0 30px 10px ${color}` };
  }
  
  /* Animación de flip (para expansión) */
  let flipAnimation = {};
  if (isFlipped && isExpanded) {
    let currentSideForFlip = lockedSide !== null ? lockedSide : currentSide;
    if (currentSideForFlip !== null) {
      if (currentSideForFlip === 0 || currentSideForFlip === 2) flipAnimation = { rotateX: 180 };
      else flipAnimation = { rotateY: 180 };
    } else {
      flipAnimation = { rotateY: 180 };
    }
  }
  
  let expansionStyle = {};
  if (isExpanded) {
    expansionStyle = {
      width: "90vw",
      height: "90vh",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      position: "absolute",
    };
  }
  
  // El label se muestra únicamente cuando hay un lado bloqueado (no en hover)
  const showLabel = lockedSide !== null;
  
  return (
    // Contenedor de la tarjeta: si está expandida, ocupa toda la pantalla para detectar clics (doble click también)
    <div
      className="card-container"
      onClick={isExpanded ? handleCollapse : undefined}
      onDoubleClick={isExpanded ? handleDoubleClick : undefined}
      style={
        isExpanded
          ? { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 100 }
          : {}
      }
    >
      {/* Renderizamos el label fuera de la tarjeta para que quede completamente visible */}
      {showLabel && (
        <motion.span
          className={`section-label ${
            lockedSide === 0
              ? "top"
              : lockedSide === 1
              ? "right"
              : lockedSide === 2
              ? "bottom"
              : "left"
          }`}
          onClick={handleSectionTitleClick}
          initial={getLabelOffset(lockedSide)}
          animate={{ x: 0, y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{ pointerEvents: "auto", color: neonColorsData[lockedSide].color }}
        >
          {neonColorsData[lockedSide].title}
        </motion.span>
      )}
      <motion.div
        key={isExpanded ? "expanded" : "floating"}
        ref={cardRef}
        className={`contact-card ${isFloating ? 'floating' : ''} ${cardStyle} ${isExpanded ? 'expanded' : ''}`}
        onClick={isExpanded ? stopPropagation : handleCardClick}
        onDoubleClick={handleDoubleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        initial={{ y: '-100vh', rotateZ: -15, scale: 1 }}
        animate={{
          y: 0,
          rotateZ: isFloating ? 0 : -15,
          scale: isFloating ? 1.1 : 1,
          x: 0,
          ...tilt,
          ...radialShadow,
          ...expansionStyle,
          ...flipAnimation,
        }}
        transition={{ type: 'spring', stiffness: 70, damping: 15 }}
      >
        {/*
          Renderizado condicional del contenido:
          - Si NO está expandida, se muestra el contenido normal (flip-container) para estado flotante.
          - Si está expandida y mode es "cv", se muestra el contenido del CV (flip-container con la cara trasera).
          - Si está expandida y mode es "section", se muestra el contenido actualizado de la sección.
        */}
        { !isExpanded && (
          <motion.div
            className="flip-container"
            animate={{ rotateY: 0 }}
            transition={{ type: 'spring', stiffness: 70, damping: 15 }}
          >
            <div className="flip-card">
              {/* Cara frontal (resumen) */}
              <div className="card-face card-front">
                <div className="card-content">
                  <div className="card-header"></div>
                  <div className="card-body">
                    <h2 className="card-name">Laureano Diez</h2>
                    <h4 className="card-title">Técnico Informático - Estudiante de IA</h4>
                  </div>
                </div>
              </div>
              {/* Cara trasera (CV) */}
              <div className="card-face card-back">
                <div className="card-content scrollable">
                  <div className="card-header">
                    <img
                      src="/cv-espeng.pdf"  /* Asegurate de mover el archivo a la carpeta public */
                      alt="CV"
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
                        src="/cv-espeng.pdf"
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
        )}
        { isExpanded && mode === "cv" && (
          <motion.div
            className="flip-container"
            animate={{ rotateY: 0 }}
            transition={{ type: 'spring', stiffness: 70, damping: 15 }}
          >
            <div className="flip-card">
              <div className="card-face card-back">
                <div className="card-content scrollable">
                  <div className="card-header">
                    <img
                      src="/cv-espeng.pdf"
                      alt="CV"
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
                        src="/cv-espeng.pdf"
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
        )}
        { isExpanded && mode === "section" && (
          <div className="section-content" onClick={stopPropagation}>
            <h2 style={{ color: neonColorsData[lockedSide].color }}>
              {neonColorsData[lockedSide].title}
            </h2>
            <p>
              Aquí se muestra el contenido actualizado de la sección {neonColorsData[lockedSide].title}.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ContactCard;
