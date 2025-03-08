// src/components/ContactCard.jsx
// Componente de la tarjeta de contacto con efecto 3D, flip y simulación de grosor.
// La lógica de carga ha sido removida para concentrarse únicamente en la funcionalidad de la tarjeta.

import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import './ContactCard.css'; // Estilos específicos para la tarjeta

// Datos para los colores y títulos de neón en cada lado
const neonColorsData = [
  { title: 'Desarrollo', color: 'red' },
  { title: 'Diseño Web', color: 'blue' },
  { title: 'Creativos', color: 'yellow' },
  { title: 'Música', color: 'green' },
];

// Función para obtener el offset inicial del label según el lado
const getLabelOffset = (side) => {
  if (side === 0) return { y: 20, x: 0 }; // Lado superior
  if (side === 1) return { x: -20, y: 0 }; // Lado derecho
  if (side === 2) return { y: -20, x: 0 }; // Lado inferior
  if (side === 3) return { x: 20, y: 0 }; // Lado izquierdo
  return { x: 0, y: 0 };
};

const ContactCard = ({ onSelectSection, isFloating, setIsFloating, cardStyle, hasLoaded, setHasLoaded }) => {
  // Estados propios de la tarjeta (sin incluir la pantalla de carga)
  const [activeSide, setActiveSide] = useState(null); // Lado activo al pasar el mouse
  const [lockedSide, setLockedSide] = useState(null);   // Lado bloqueado tras click/arrastre
  const [isFlipped, setIsFlipped] = useState(false);      // Estado de flip (parte trasera visible)
  const [isExpanded, setIsExpanded] = useState(false);    // Estado de expansión (pantalla completa)
  const [mode, setMode] = useState(null);                 // Modo: "cv" o "section"
  const [isDragging, setIsDragging] = useState(false);    // Si se está arrastrando con el mouse

  // Motion values "raw" para la rotación (sin suavizar)
  const rawRotateX = useMotionValue(0);
  const rawRotateY = useMotionValue(0);
  // Se utiliza useSpring para suavizar los cambios en la rotación
  const rotateX = useSpring(rawRotateX, { stiffness: 150, damping: 20 });
  const rotateY = useSpring(rawRotateY, { stiffness: 150, damping: 20 });

  // Estados para interacciones táctiles
  const [touchStartPos, setTouchStartPos] = useState(null);
  const [touchCurrentPos, setTouchCurrentPos] = useState(null);
  const [isTouchDragging, setIsTouchDragging] = useState(false);

  const fastMoveCount = useRef(0);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const cardRef = useRef(null);

  // Efecto para actualizar la inclinación (tilt) cuando no se arrastra
  useEffect(() => {
    if (!isDragging) {
      let computedTiltX = 0, computedTiltY = 0;
      const currentSide = lockedSide !== null ? lockedSide : activeSide;
      if (!isExpanded && isFloating && !isFlipped && currentSide !== null) {
        if (currentSide === 0) computedTiltX = -15;
        else if (currentSide === 1) computedTiltY = -15;
        else if (currentSide === 2) computedTiltX = 15;
        else if (currentSide === 3) computedTiltY = 15;
      }
      rawRotateX.set(computedTiltX);
      rawRotateY.set(computedTiltY);
    }
  }, [activeSide, lockedSide, isDragging, isExpanded, isFloating, isFlipped, rawRotateX, rawRotateY]);

  // Manejo del movimiento del mouse
  const handleMouseMove = (e) => {
    if (!isFloating || isDragging) return;
    const rect = cardRef.current.getBoundingClientRect();
    const threshold = 30;
    let side = null;
    if (e.clientY - rect.top <= threshold) side = 0;
    else if (rect.right - e.clientX <= threshold) side = 1;
    else if (rect.bottom - e.clientY <= threshold) side = 2;
    else if (e.clientX - rect.left <= threshold) side = 3;
    setActiveSide(side);

    const prevPos = lastMousePos.current;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    const deltaX = e.clientX - prevPos.x;
    if (Math.abs(deltaX) > 30) fastMoveCount.current += 1;
    else fastMoveCount.current = 0;
    if (fastMoveCount.current >= 3 && !lockedSide && !isExpanded) fastMoveCount.current = 0;
  };

  const handleMouseLeave = () => {
    if (!isExpanded && !isDragging) setActiveSide(null);
  };

  // Manejo de clic: activa el estado flotante y bloquea el lado según interacción
  const handleCardClick = (e) => {
    if (!isFloating) {
      setIsFloating(true);
      return;
    }
    if (lockedSide !== null) {
      if (!e.target.classList.contains('section-label')) {
        setLockedSide(null);
        setActiveSide(null);
        return;
      }
    } else {
      if (!isExpanded && activeSide !== null) setLockedSide(activeSide);
    }
  };

  // Al hacer clic en el label se selecciona la sección y se oculta la tarjeta expandida
  const handleSectionTitleClick = (e) => {
    e.stopPropagation();
    if (lockedSide !== null) {
      const sectionName = neonColorsData[lockedSide].title;
      onSelectSection(sectionName);
    }
    setIsExpanded(false);
  };

  // Doble clic para reiniciar estados y volver a la posición original
  const handleDoubleClick = (e) => {
    setIsExpanded(false);
    setIsFlipped(false);
    setLockedSide(null);
    setActiveSide(null);
    setMode(null);
    rawRotateX.set(0);
    rawRotateY.set(0);
    setIsFloating(false);
  };

  const handleCollapse = (e) => {
    handleDoubleClick(e);
  };

  const stopPropagation = (e) => e.stopPropagation();

  /* --- Manejo de eventos táctiles (touch) --- */
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setTouchStartPos({ x: touch.clientX, y: touch.clientY });
    setTouchCurrentPos({ x: touch.clientX, y: touch.clientY });
    setIsTouchDragging(false);
    if (!isFloating) setIsFloating(true);
  };

  const handleTouchMove = (e) => {
    if (!touchStartPos) return;
    const touch = e.touches[0];
    const currentPos = { x: touch.clientX, y: touch.clientY };
    setTouchCurrentPos(currentPos);
    const deltaX = currentPos.x - touchStartPos.x;
    const deltaY = currentPos.y - touchStartPos.y;
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) setIsTouchDragging(true);
    const factor = 0.5;
    rawRotateX.set(-deltaY * factor);
    rawRotateY.set(deltaX * factor);
  };

  const handleTouchEnd = (e) => {
    if (isTouchDragging && touchStartPos && touchCurrentPos) {
      const deltaX = touchCurrentPos.x - touchStartPos.x;
      const deltaY = touchCurrentPos.y - touchStartPos.y;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);
      const flipThreshold = 150;
      if (absDeltaX > flipThreshold || absDeltaY > flipThreshold) {
        // No se activa flip en este ejemplo
      } else {
        let selectedSide = absDeltaX > absDeltaY ? (deltaY < 0 ? 0 : 2) : (deltaX < 0 ? 1 : 3);
        setLockedSide(selectedSide);
        let snappedRotation = { rotateX: 0, rotateY: 0 };
        if (selectedSide === 0) snappedRotation = { rotateX: -15, rotateY: 0 };
        else if (selectedSide === 1) snappedRotation = { rotateX: 0, rotateY: -15 };
        else if (selectedSide === 2) snappedRotation = { rotateX: 15, rotateY: 0 };
        else if (selectedSide === 3) snappedRotation = { rotateX: 0, rotateY: 15 };
        rawRotateX.set(snappedRotation.rotateX);
        rawRotateY.set(snappedRotation.rotateY);
      }
    }
    setTouchStartPos(null);
    setTouchCurrentPos(null);
    setIsTouchDragging(false);
  };

  /* --- Manejo de arrastre (drag) con mouse --- */
  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDrag = (event, info) => {
    const factor = 0.5;
    rawRotateX.set(-info.offset.y * factor);
    rawRotateY.set(info.offset.x * factor);
  };

  const handleDragEnd = (event, info) => {
    setIsDragging(false);
    const currentRotateX = rawRotateX.get();
    const currentRotateY = rawRotateY.get();
    const absX = Math.abs(currentRotateX);
    const absY = Math.abs(currentRotateY);
    const smallThreshold = 10;
    const flipThreshold = 120;
    if (absX < smallThreshold && absY < smallThreshold) {
      rawRotateX.set(0);
      rawRotateY.set(0);
      return;
    }
    if (absX > flipThreshold || absY > flipThreshold) {
      setMode("cv");
      setIsFlipped(true);
      setIsExpanded(true);
      rawRotateX.set(0);
      rawRotateY.set(0);
      return;
    }
    let selectedSide = absX > absY ? (currentRotateX < 0 ? 0 : 2) : (currentRotateY < 0 ? 1 : 3);
    setLockedSide(selectedSide);
    let snappedRotation = { rotateX: 0, rotateY: 0 };
    if (selectedSide === 0) snappedRotation = { rotateX: -15, rotateY: 0 };
    else if (selectedSide === 1) snappedRotation = { rotateX: 0, rotateY: -15 };
    else if (selectedSide === 2) snappedRotation = { rotateX: 15, rotateY: 0 };
    else if (selectedSide === 3) snappedRotation = { rotateX: 0, rotateY: 15 };
    rawRotateX.set(snappedRotation.rotateX);
    rawRotateY.set(snappedRotation.rotateY);
  };

  /* --- Sombra radial según lado seleccionado --- */
  let radialShadow = {};
  if (lockedSide !== null && !isExpanded) {
    const color = neonColorsData[lockedSide].color;
    if (lockedSide === 0) radialShadow = { boxShadow: `0 -20px 30px 10px ${color}` };
    else if (lockedSide === 1) radialShadow = { boxShadow: `20px 0 30px 10px ${color}` };
    else if (lockedSide === 2) radialShadow = { boxShadow: `0 20px 30px 10px ${color}` };
    else if (lockedSide === 3) radialShadow = { boxShadow: `-20px 0 30px 10px ${color}` };
  }
  
  /* --- Configuración del flip --- */
  // El flip se aplica al contenedor que agrupa front, edge y back.
  const flipRotation = isFlipped && isExpanded ? 180 : 0;
  
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
  
  const showLabel = lockedSide !== null;
  
  // Cálculo del reflejo (se mantiene el factor)
  const currentRotateXVal = rawRotateX.get();
  const currentRotateYVal = rawRotateY.get();
  const reflectionFactor = 2;
  const reflectionX = 50 - (currentRotateXVal * reflectionFactor);
  const reflectionY = 50 - (currentRotateYVal * reflectionFactor);

  return (
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
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        drag={isFloating}
        dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        initial={{ y: '-100vh', rotateZ: -15, scale: 1 }}
        animate={{
          y: 0,
          rotateZ: isFloating ? 0 : -15,
          scale: isFloating ? 1.1 : 1,
          x: 0,
          ...radialShadow,
          ...expansionStyle,
        }}
        transition={{ type: 'spring', stiffness: 70, damping: 15 }}
        // Aplicación de las rotaciones suavizadas
        style={{ rotateX, rotateY }}
      >
        {/* Contenedor de flip que incluye la cara frontal, el edge y la cara trasera */}
        {!isExpanded && (
          <motion.div
            className="flip-container"
            animate={{ rotateY: flipRotation }}
            transition={{ type: 'spring', stiffness: 70, damping: 15 }}
          >
            {/* Cara frontal de la tarjeta */}
            <div className="card-face card-front">
              <div className="card-content" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%'
              }}>
                <div
                  className="pentagon-logo"
                  style={{
                    width: '100px',
                    height: '100px',
                    clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'
                  }}
                ></div>
                <h2 className="card-name" style={{
                  marginTop: '10px',
                  textAlign: 'center'
                }}>
                  Laureano Diez
                </h2>
              </div>
            </div>
            {/* Elemento que simula la profundidad (edge) */}
            <div className="card-edge"></div>
            {/* Cara trasera de la tarjeta */}
            <div className="card-face card-back">
              <div className="card-content" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                textAlign: 'center'
              }}>
                <div className="card-header">
                  <h2 className="card-name">Laureano Diez</h2>
                  <h4 className="card-title">Técnico Informático - Estudiante de IA</h4>
                </div>
                <div className="card-body">
                  <div className="contact-details">
                    <p>Email: ejemplo@correo.com</p>
                    <p>Tel: +54 1234 5678</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Reflejo dinámico basado en la rotación */}
            {isFloating && (
              (() => {
                const factor = 2;
                const reflectionX = 50 - (rawRotateX.get() * factor);
                const reflectionY = 50 - (rawRotateY.get() * factor);
                return (
                  <div
                    className="card-reflection"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      pointerEvents: 'none',
                      background: `radial-gradient(circle at ${reflectionX}% ${reflectionY}%, rgba(255,255,255,0.4), transparent 70%)`,
                      transform: 'translateZ(1px)'
                    }}
                  ></div>
                );
              })()
            )}
          </motion.div>
        )}

        {/* Contenido para el modo "cv" (expandido) */}
        {isExpanded && mode === "cv" && (
          <motion.div
            className="expanded-cv"
            style={{
              position: 'absolute',
              width: '95vw',
              height: '95vh',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 100
            }}
            transition={{ type: 'spring', stiffness: 70, damping: 15 }}
          >
            <div
              className="cv-content"
              style={{ overflowY: 'auto', padding: '20px', boxSizing: 'border-box', height: '100%' }}
            >
              <div style={{ textAlign: 'center' }}>
                <h2 className="card-name">Laureano Diez</h2>
                <h4 className="card-title">Técnico Informático - Estudiante de IA</h4>
              </div>
              <div className="contact-details" style={{ textAlign: 'center', margin: '10px 0' }}>
                <p>Email: contactolaureanodiez@gmail.com</p>
                <p>
                  Soy Técnico en Informática Profesional y Personal y estudiante universitario de
                  tecnicatura en Inteligencia Artificial, en busca de empleo de medio tiempo para
                  continuar desarrollándome y creciendo permanentemente. Tengo conocimientos académicos 
                  (grado técnico) y autodidactas de desarrollo de software, soporte de hardware, networking, 
                  data management (Microsoft Office y similares), diseño de páginas web (full-stack) y 
                  desarrollos creativos varios. Soy eficaz para adaptarme y aprender. Tengo experiencia 
                  liderando proyectos y habilidades de comunicación para mantener buenas relaciones 
                  de equipo y sociales.
                </p>
              </div>
              <div className="cv-container" style={{ marginTop: '10px' }}>
                <iframe
                  src={`${process.env.PUBLIC_URL}/cv-espeng.pdf`}
                  title="CV"
                  frameBorder="0"
                  className="cv-viewer"
                  style={{ width: '100%', height: '400px' }}
                ></iframe>
              </div>
            </div>
          </motion.div>
        )}

        {/* Contenido para el modo "section" (expandido) */}
        {isExpanded && mode === "section" && (
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
