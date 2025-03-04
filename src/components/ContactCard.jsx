// src/components/ContactCard.jsx

import React, { useState, useRef, useEffect } from 'react'; // Importación de React y hooks necesarios
import { motion } from 'framer-motion'; // Importación de motion para animaciones
import './ContactCard.css'; // Importación de estilos

// Datos para los colores y títulos de neón en cada lado
const neonColorsData = [
  { title: 'Desarrollo', color: 'red' },
  { title: 'Diseño Web', color: 'blue' },
  { title: 'Creativos', color: 'yellow' },
  { title: 'Música', color: 'green' },
];

// Función que devuelve el offset inicial para la animación del label (opcional)
const getLabelOffset = (side) => {
  if (side === 0) return { y: 20, x: 0 }; // Desplazamiento para el lado superior
  if (side === 1) return { x: -20, y: 0 }; // Desplazamiento para el lado derecho
  if (side === 2) return { y: -20, x: 0 }; // Desplazamiento para el lado inferior
  if (side === 3) return { x: 20, y: 0 }; // Desplazamiento para el lado izquierdo
  return { x: 0, y: 0 }; // Sin desplazamiento si no se cumple ningún caso
};

const ContactCard = ({ onSelectSection, isFloating, setIsFloating, cardStyle, hasLoaded, setHasLoaded }) => {
  const [isLoading, setIsLoading] = useState(!hasLoaded); // Estado para indicar si la tarjeta está cargando
  const [activeSide, setActiveSide] = useState(null); // Estado para el lado activo al pasar el mouse
  const [lockedSide, setLockedSide] = useState(null); // Estado para el lado bloqueado tras click o arrastre
  const [isFlipped, setIsFlipped] = useState(false); // Estado para determinar si la tarjeta está volteada
  const [isExpanded, setIsExpanded] = useState(false); // Estado para la expansión de la tarjeta
  const [mode, setMode] = useState(null); // Estado para el modo ("cv" o "section")
  // Estado para determinar si se está arrastrando con mouse
  const [isDragging, setIsDragging] = useState(false);
  // Estado para registrar la rotación durante el arrastre
  const [dragRotation, setDragRotation] = useState({ rotateX: 0, rotateY: 0 });
  
  // Estados para interacciones táctiles
  const [touchStartPos, setTouchStartPos] = useState(null); // Posición inicial del toque
  const [touchCurrentPos, setTouchCurrentPos] = useState(null); // Posición actual del toque
  const [isTouchDragging, setIsTouchDragging] = useState(false); // NUEVO: Bandera para diferenciar arrastre táctil
  
  const fastMoveCount = useRef(0);
  const lastMousePos = useRef({ x: 0, y: 0 }); // Referencia para la última posición del mouse
  const cardRef = useRef(null); // Referencia al elemento de la tarjeta

  // Simula la carga inicial de la tarjeta
  useEffect(() => {
    if (!hasLoaded) {
      setTimeout(() => {
        setIsLoading(false);
        setHasLoaded(true); // NUEVO: Marca que ya se cargó
      }, 2000);
    }
  }, [hasLoaded, setHasLoaded]);


  // Resetea la selección si se hace clic fuera de la tarjeta (cuando no está expandida)
  useEffect(() => {
    const handleDocClick = (e) => {
      if (!isExpanded && lockedSide !== null) {
        if (cardRef.current && !cardRef.current.contains(e.target)) {
          setLockedSide(null); // Reinicia el lado bloqueado
          setActiveSide(null); // Reinicia el lado activo
        }
      }
    };
    document.addEventListener('click', handleDocClick);
    return () => document.removeEventListener('click', handleDocClick);
  }, [lockedSide, isExpanded]);

  // Forzar modo "cv" si la tarjeta está volteada y expandida (para otros casos que no sean sección)
  useEffect(() => {
    if (isFlipped && isExpanded && mode !== "section") {
      setMode("cv");
    }
  }, [isFlipped, isExpanded, mode]);

  // Si la tarjeta está cargando, muestra la pantalla de carga
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="pentagon-loader"></div>
        <p className="loading-text">vAlpha - Laureano Diez ©</p>
      </div>
    );
  }

  /* Manejo del movimiento del mouse */
  const handleMouseMove = (e) => {
    if (!isFloating || isDragging) return; // Solo procesa si está flotante y no se está arrastrando
    const rect = cardRef.current.getBoundingClientRect(); // Obtiene la posición y dimensiones de la tarjeta
    const threshold = 30; // Umbral para detectar cercanía a los bordes
    let side = null;
    if (e.clientY - rect.top <= threshold) side = 0;          // Lado superior
    else if (rect.right - e.clientX <= threshold) side = 1;     // Lado derecho
    else if (rect.bottom - e.clientY <= threshold) side = 2;    // Lado inferior
    else if (e.clientX - rect.left <= threshold) side = 3;      // Lado izquierdo
    setActiveSide(side); // Actualiza el lado activo

    lastMousePos.current = { x: e.clientX, y: e.clientY };

    const deltaX = e.clientX - lastMousePos.current.x;
    const speed = Math.abs(deltaX);
    if (speed > 30) {
      fastMoveCount.current += 1;
    } else {
      fastMoveCount.current = 0;
    }
    if (fastMoveCount.current >= 3 && !lockedSide && !isExpanded) {
      fastMoveCount.current = 0;
    }
  };

  const handleMouseLeave = () => {
    if (!isExpanded && !isDragging) setActiveSide(null);
  };

  /* Manejo del clic en la tarjeta */
  const handleCardClick = (e) => {
    if (!isFloating) {
      setIsFloating(true); // Activa el estado flotante
      return;
    }
    if (lockedSide !== null) {
      if (!e.target.classList.contains('section-label')) {
        setLockedSide(null);
        setActiveSide(null);
        return;
      }
    } else {
      if (!isExpanded && activeSide !== null) {
        setLockedSide(activeSide);
      }
    }
  };

  const handleSectionTitleClick = (e) => {
    e.stopPropagation(); // Evita que el evento se propague al contenedor
    if (lockedSide !== null) {
      const sectionName = neonColorsData[lockedSide].title; // Obtiene el nombre de la sección
      onSelectSection(sectionName); // NUEVO: Llama al callback para seleccionar la sección
    }
    // NUEVO: Se oculta la tarjeta (para que no se muestre el estado expandido detrás de la sección)
    setIsExpanded(false);
  };

  const handleDoubleClick = (e) => {
    setIsExpanded(false);
    setIsFlipped(false);
    setLockedSide(null);
    setActiveSide(null);
    setMode(null);
    setDragRotation({ rotateX: 0, rotateY: 0 });
    setIsFloating(false); // Vuelve la tarjeta al estado de "suelo"
  };

  const handleCollapse = (e) => {
    handleDoubleClick(e);
  };

  const stopPropagation = (e) => e.stopPropagation();

  /* NUEVA SECCIÓN: Manejadores de eventos táctiles para dispositivos móviles */

  // En dispositivos móviles, al iniciar el toque se activa el modo flotante (si aún no lo está)
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setTouchStartPos({ x: touch.clientX, y: touch.clientY }); // Guarda la posición inicial
    setTouchCurrentPos({ x: touch.clientX, y: touch.clientY }); // Inicializa la posición actual
    setIsTouchDragging(false); // Reinicia la bandera de arrastre táctil
    if (!isFloating) {
      setIsFloating(true); // Activa el modo flotante al primer toque en móvil
    }
  };

  // Maneja el movimiento táctil; si el movimiento supera 5px, lo interpreta como arrastre
  const handleTouchMove = (e) => {
    if (!touchStartPos) return;
    const touch = e.touches[0];
    const currentPos = { x: touch.clientX, y: touch.clientY };
    setTouchCurrentPos(currentPos);
    const deltaX = currentPos.x - touchStartPos.x;
    const deltaY = currentPos.y - touchStartPos.y;
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      setIsTouchDragging(true); // Marca que se está arrastrando en móvil
    }
    // Actualiza la rotación similar al manejo con mouse
    const factor = 0.5;
    setDragRotation({
      rotateX: -deltaY * factor,
      rotateY: deltaX * factor,
    });
  };

  // Al finalizar el toque se decide si fue un toque simple o un arrastre
  const handleTouchEnd = (e) => {
    // Si se detectó arrastre, se aplica el "snap" sin activar el flip al CV
    if (isTouchDragging && touchStartPos && touchCurrentPos) {
      const deltaX = touchCurrentPos.x - touchStartPos.x;
      const deltaY = touchCurrentPos.y - touchStartPos.y;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);
      const flipThreshold = 150; // Umbral mayor para evitar flip accidental en móvil
      // Si el movimiento supera el umbral, se podría activar el flip; de lo contrario, se ajusta la inclinación
      if (absDeltaX > flipThreshold || absDeltaY > flipThreshold) {
        // Opcional: Si se desea permitir el flip tras un arrastre muy marcado, se podría activar el modo "cv"
        // setMode("cv");
        // setIsFlipped(true);
        // setIsExpanded(true);
        // En este ejemplo, preferimos solo ajustar la inclinación sin flip
      } else {
        let selectedSide = null;
        if (absDeltaX > absDeltaY) {
          selectedSide = deltaY < 0 ? 0 : 2; // Determina top o bottom
        } else {
          selectedSide = deltaX < 0 ? 1 : 3; // Determina right o left
        }
        setLockedSide(selectedSide);
        let snappedRotation = { rotateX: 0, rotateY: 0 };
        if (selectedSide === 0) snappedRotation = { rotateX: -15, rotateY: 0 };
        else if (selectedSide === 1) snappedRotation = { rotateX: 0, rotateY: -15 };
        else if (selectedSide === 2) snappedRotation = { rotateX: 15, rotateY: 0 };
        else if (selectedSide === 3) snappedRotation = { rotateX: 0, rotateY: 15 };
        setDragRotation(snappedRotation);
      }
    } else {
      // Si no se detectó arrastre, se trata como un toque simple; en este caso no activamos el flip al CV
      // Esto permite que el usuario active el modo flotante sin que se abra el CV
    }
    // Reinicia las variables táctiles
    setTouchStartPos(null);
    setTouchCurrentPos(null);
    setIsTouchDragging(false);
  };

  /* NUEVA SECCIÓN: Manejadores para arrastre (drag) con mouse (sin cambios) */
  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDrag = (event, info) => {
    const factor = 0.5;
    setDragRotation({
      rotateX: -info.offset.y * factor,
      rotateY: info.offset.x * factor,
    });
  };

  const handleDragEnd = (event, info) => {
    setIsDragging(false);
    const { rotateX, rotateY } = dragRotation;
    const absX = Math.abs(rotateX);
    const absY = Math.abs(rotateY);
    const smallThreshold = 10;
    const flipThreshold = 120;
    if (absX < smallThreshold && absY < smallThreshold) {
      setDragRotation({ rotateX: 0, rotateY: 0 });
      return;
    }
    if (absX > flipThreshold || absY > flipThreshold) {
      setMode("cv");
      setIsFlipped(true);
      setIsExpanded(true);
      setDragRotation({ rotateX: 0, rotateY: 0 });
      return;
    }
    let selectedSide = null;
    if (absX > absY) {
      selectedSide = rotateX < 0 ? 0 : 2;
    } else {
      selectedSide = rotateY < 0 ? 1 : 3;
    }
    setLockedSide(selectedSide);
    let snappedRotation = { rotateX: 0, rotateY: 0 };
    if (selectedSide === 0) snappedRotation = { rotateX: -15, rotateY: 0 };
    else if (selectedSide === 1) snappedRotation = { rotateX: 0, rotateY: -15 };
    else if (selectedSide === 2) snappedRotation = { rotateX: 15, rotateY: 0 };
    else if (selectedSide === 3) snappedRotation = { rotateX: 0, rotateY: 15 };
    setDragRotation(snappedRotation);
  };

  /* Cálculo de la inclinación (tilt) y sombra radial */
  const currentSide = lockedSide !== null ? lockedSide : activeSide;
  let tilt = { rotateX: 0, rotateY: 0, x: 0, y: 0 };
  if (!isExpanded && isFloating && !isFlipped && !isDragging && currentSide !== null) {
    if (currentSide === 0) tilt = { rotateX: -15, y: -10 };
    else if (currentSide === 1) tilt = { rotateY: -15, x: 10 };
    else if (currentSide === 2) tilt = { rotateX: 15, y: 10 };
    else if (currentSide === 3) tilt = { rotateY: 15, x: -10 };
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
    if (mode === "cv") {
      flipAnimation = { rotateY: 180 };
    } else {
      let currentSideForFlip = lockedSide !== null ? lockedSide : activeSide;
      if (currentSideForFlip !== null) {
        if (currentSideForFlip === 0 || currentSideForFlip === 2) flipAnimation = { rotateX: 180 };
        else flipAnimation = { rotateY: 180 };
      } else {
        flipAnimation = { rotateY: 180 };
      }
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
  
  const showLabel = lockedSide !== null;
  
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
          ...(isDragging ? dragRotation : tilt),
          ...radialShadow,
          ...expansionStyle,
          ...flipAnimation,
        }}
        transition={{ type: 'spring', stiffness: 70, damping: 15 }}
      >
        { !isExpanded && (
          <motion.div
            className="flip-container"
            animate={{ rotateY: 0 }}
            transition={{ type: 'spring', stiffness: 70, damping: 15 }}
          >
            <div className="flip-card">
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
            </div>
            { isFloating && (
              (() => {
                const factor = 2;
                const reflectionX = 50 - (dragRotation.rotateX * factor);
                const reflectionY = 50 - (dragRotation.rotateY * factor);
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

        { isExpanded && mode === "cv" && (
          <motion.div 
            className="expanded-cv" 
            style={{ 
              position: 'absolute', 
              width: '95vw',      // NUEVO: Ancho casi completo con márgenes
              height: '95vh',     // NUEVO: Alto casi completo con márgenes
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
                <p /*className="card-summary"*/>
                      Soy Técnico en Informática Profesional y Personal y estudiante universitario de
                      tecnicatura en Inteligencia Artificial, en busca de empleo de medio tiempo para
                      continuar desarrollándome y creciendo permanentemente.
                      Tengo conocimientos académicos (grado técnico) y autodidactas de desarrollo de
                      software, soporte de hardware, networking, data management (Microsoft Office y
                      similares), diseño de páginas web (full-stack) y desarrollos creativos varios.
                      Soy eficaz para adaptarme y aprender. Tengo experiencia liderando proyectos y
                      habilidades de comunicación para mantener buenas relaciones de equipo y sociales.
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
