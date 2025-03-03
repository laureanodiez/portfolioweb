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

const ContactCard = ({ onSelectSection, isFloating, setIsFloating, cardStyle }) => {
  const [isLoading, setIsLoading] = useState(true); // Estado para indicar si la tarjeta está cargando
  const [activeSide, setActiveSide] = useState(null); // Estado para el lado activo al pasar el mouse
  const [lockedSide, setLockedSide] = useState(null); // Estado para el lado bloqueado tras click
  const [isFlipped, setIsFlipped] = useState(false); // Estado para determinar si la tarjeta está volteada
  const [isExpanded, setIsExpanded] = useState(false); // Estado para la expansión de la tarjeta
  const [mode, setMode] = useState(null); // Estado para el modo ("cv" o "section")
  
  // Estado para registrar la posición inicial del toque (para interacciones táctiles)
  const [touchStartPos, setTouchStartPos] = useState(null);
  
  const fastMoveCount = useRef(0); // Referencia para detectar movimientos rápidos con el mouse
  const lastMousePos = useRef({ x: 0, y: 0 }); // Referencia para la última posición del mouse
  const cardRef = useRef(null); // Referencia al elemento de la tarjeta

  // useEffect para simular una carga inicial de la tarjeta
  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false); // Se desactiva la pantalla de carga después de 2 segundos
    }, 2000);
  }, []);

  // useEffect para resetear la selección si se hace click fuera de la tarjeta (cuando no está expandida)
  useEffect(() => {
    const handleDocClick = (e) => {
      if (!isExpanded && lockedSide !== null) {
        if (cardRef.current && !cardRef.current.contains(e.target)) {
          setLockedSide(null); // Reinicia el lado bloqueado
          setActiveSide(null); // Reinicia el lado activo
        }
      }
    };
    document.addEventListener('click', handleDocClick); // Se agrega el listener a nivel de documento
    return () => document.removeEventListener('click', handleDocClick); // Se limpia el listener al desmontar
  }, [lockedSide, isExpanded]);

  // Si la tarjeta está en proceso de carga, se muestra la pantalla de carga
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
    if (!isFloating) return; // Si no está en estado flotante, no procesa el movimiento

    // Detección de movimiento rápido para activar modo "cv"
    const deltaX = e.clientX - lastMousePos.current.x; // Diferencia en X
    const speed = Math.abs(deltaX); // Velocidad del movimiento
    if (speed > 30) {
      fastMoveCount.current += 1; // Incrementa el contador si el movimiento es rápido
    } else {
      fastMoveCount.current = 0; // Reinicia el contador si el movimiento es lento
    }
    if (fastMoveCount.current >= 3 && !lockedSide && !isExpanded) {
      setMode("cv"); // Activa el modo "cv" si se detecta movimiento rápido
      setIsFlipped(true); // Voltea la tarjeta
      setIsExpanded(true); // Expande la tarjeta
      fastMoveCount.current = 0; // Reinicia el contador
    }
    lastMousePos.current = { x: e.clientX, y: e.clientY }; // Actualiza la última posición del mouse

    // Si no hay lado bloqueado y la tarjeta no está expandida, se determina el lado activo
    if (!lockedSide && !isExpanded) {
      const rect = cardRef.current.getBoundingClientRect(); // Obtiene la posición y dimensiones de la tarjeta
      const threshold = 30; // Umbral para detectar cercanía a los bordes
      let side = null;
      if (e.clientY - rect.top <= threshold) side = 0;          // Lado superior
      else if (rect.right - e.clientX <= threshold) side = 1;      // Lado derecho
      else if (rect.bottom - e.clientY <= threshold) side = 2;     // Lado inferior
      else if (e.clientX - rect.left <= threshold) side = 3;       // Lado izquierdo
      setActiveSide(side); // Se actualiza el lado activo
    }
  };

  // Manejador para cuando el mouse sale del área de la tarjeta
  const handleMouseLeave = () => {
    if (!isExpanded) setActiveSide(null); // Reinicia el lado activo si no está expandida
  };

  /* Manejo del clic en la tarjeta */
  const handleCardClick = (e) => {
    if (!isFloating) {
      setIsFloating(true); // Activa el estado flotante si no lo está
      return;
    }
    // Si ya hay un lado bloqueado y se clickea fuera del label, se revierte la selección
    if (lockedSide !== null) {
      if (!e.target.classList.contains('section-label')) {
        setLockedSide(null); // Reinicia el lado bloqueado
        setActiveSide(null); // Reinicia el lado activo
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
    e.stopPropagation(); // Evita que el evento se propague al contenedor
    setMode("section"); // Activa el modo sección
    setIsFlipped(true); // Voltea la tarjeta
    setIsExpanded(true); // Expande la tarjeta
  };

  // Doble clic en la tarjeta (ya sea en la tarjeta o en el contenedor) la colapsa y vuelve a la posición flotante
  const handleDoubleClick = (e) => {
    setIsExpanded(false); // Colapsa la tarjeta
    setIsFlipped(false); // Revierte el flip
    setLockedSide(null); // Reinicia el lado bloqueado
    setActiveSide(null); // Reinicia el lado activo
    setMode(null); // Reinicia el modo
  };

  // Si se hace clic en el fondo expandido (fuera del contenido), colapsa la tarjeta
  const handleCollapse = (e) => {
    handleDoubleClick(e);
  };

  // Evita que clics dentro de la tarjeta expandida provoquen colapso
  const stopPropagation = (e) => e.stopPropagation();

  /* NUEVA SECCIÓN: Manejadores de eventos táctiles para interacción en dispositivos móviles con CSS3D */

  // Registra la posición inicial del toque
  const handleTouchStart = (e) => {
    const touch = e.touches[0]; // Toma el primer toque
    setTouchStartPos({ x: touch.clientX, y: touch.clientY }); // Guarda la posición inicial
  };

  // Maneja el movimiento táctil para calcular la diferencia y aplicar efecto de giro
  const handleTouchMove = (e) => {
    if (!touchStartPos) return; // Si no hay posición inicial, no hace nada
    const touch = e.touches[0]; // Toma el primer toque
    const deltaX = touch.clientX - touchStartPos.x; // Diferencia en X
    const deltaY = touch.clientY - touchStartPos.y; // Diferencia en Y
    // Se podría agregar lógica para rotar la tarjeta en función del movimiento (CSS3D)
    // Por ejemplo, actualizar un estado que modifique la transformación de la tarjeta en tiempo real
  };

  // Al finalizar el toque, determina si se activa el flip de la tarjeta
  const handleTouchEnd = (e) => {
    if (!touchStartPos) return; // Si no hay posición inicial, no hace nada
    // Umbral para considerar un movimiento significativo
    const threshold = 50;
    // Se puede obtener la posición final usando el último evento de touchMove (aquí se simplifica)
    // Si el movimiento horizontal o vertical supera el umbral, se activa el flip
    setIsFlipped(true);
    setIsExpanded(true);
    // Reinicia la posición inicial del toque
    setTouchStartPos(null);
  };

  /* Cálculo de la inclinación (tilt) y sombra radial */
  const currentSide = lockedSide !== null ? lockedSide : activeSide; // Determina el lado actual
  let tilt = { rotateX: 0, rotateY: 0, x: 0, y: 0 }; // Objeto para almacenar la inclinación
  if (!isExpanded && isFloating && !isFlipped && currentSide !== null) {
    // Para top y bottom, se invierte la inclinación según lo pedido
    if (currentSide === 0) tilt = { rotateX: -15, y: -10 };      // Top: inclina hacia arriba
    else if (currentSide === 1) tilt = { rotateY: -15, x: 10 };  // Right: inclina hacia la izquierda
    else if (currentSide === 2) tilt = { rotateX: 15, y: 10 }; // Bottom: inclina hacia abajo
    else if (currentSide === 3) tilt = { rotateY: 15, x: -10 };  // Left: inclina hacia la derecha
  }
  
  let radialShadow = {}; // Objeto para la sombra radial
  if (lockedSide !== null && !isExpanded) {
    const color = neonColorsData[lockedSide].color; // Selecciona el color según el lado bloqueado
    if (lockedSide === 0) radialShadow = { boxShadow: `0 -20px 30px 10px ${color}` };
    else if (lockedSide === 1) radialShadow = { boxShadow: `20px 0 30px 10px ${color}` };
    else if (lockedSide === 2) radialShadow = { boxShadow: `0 20px 30px 10px ${color}` };
    else if (lockedSide === 3) radialShadow = { boxShadow: `-20px 0 30px 10px ${color}` };
  }
  
  /* Animación de flip (para expansión) */
  let flipAnimation = {}; // Objeto para almacenar la animación de flip
  if (isFlipped && isExpanded) {
    let currentSideForFlip = lockedSide !== null ? lockedSide : currentSide;
    if (currentSideForFlip !== null) {
      if (currentSideForFlip === 0 || currentSideForFlip === 2) flipAnimation = { rotateX: 180 };
      else flipAnimation = { rotateY: 180 };
    } else {
      flipAnimation = { rotateY: 180 };
    }
  }
  
  let expansionStyle = {}; // Estilo para la expansión de la tarjeta
  if (isExpanded) {
    expansionStyle = {
      width: "90vw", // Ancho al expandirse
      height: "90vh", // Alto al expandirse
      top: "50%", // Centrado vertical
      left: "50%", // Centrado horizontal
      transform: "translate(-50%, -50%)", // Ajuste para centrar
      position: "absolute", // Posicionamiento absoluto
    };
  }
  
  // El label se muestra únicamente cuando hay un lado bloqueado (no en hover)
  const showLabel = lockedSide !== null;
  
  return (
    // Contenedor de la tarjeta: si está expandida, ocupa toda la pantalla para detectar clics (doble click también)
    <div
      className="card-container"
      onClick={isExpanded ? handleCollapse : undefined} // Si está expandida, clic fuera colapsa la tarjeta
      onDoubleClick={isExpanded ? handleDoubleClick : undefined} // Doble clic para colapsar
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
          onClick={handleSectionTitleClick} // Al hacer clic en el label se activa el modo sección
          initial={getLabelOffset(lockedSide)} // Animación inicial para el label
          animate={{ x: 0, y: 0, opacity: 1 }} // Animación para posicionar y mostrar el label
          transition={{ duration: 0.3 }} // Duración de la animación
          style={{ pointerEvents: "auto", color: neonColorsData[lockedSide].color }} // Color del label según el lado
        >
          {neonColorsData[lockedSide].title} {/* Título del label */}
        </motion.span>
      )}
      <motion.div
        key={isExpanded ? "expanded" : "floating"} // Key para animación condicional
        ref={cardRef} // Referencia para acceder a la tarjeta
        className={`contact-card ${isFloating ? 'floating' : ''} ${cardStyle} ${isExpanded ? 'expanded' : ''}`} // Clases dinámicas según estado
        onClick={isExpanded ? stopPropagation : handleCardClick} // Maneja clics según estado
        onDoubleClick={handleDoubleClick} // Doble clic para colapsar
        onMouseMove={handleMouseMove} // Movimiento del mouse para detectar el lado
        onMouseLeave={handleMouseLeave} // Restaura el estado al salir el mouse
        onTouchStart={handleTouchStart} // Nuevo: inicia la detección táctil
        onTouchMove={handleTouchMove} // Nuevo: actualiza la interacción táctil
        onTouchEnd={handleTouchEnd} // Nuevo: al finalizar el toque, activa el flip
        initial={{ y: '-100vh', rotateZ: -15, scale: 1 }} // Estado inicial de la animación
        animate={{
          y: 0, // Anima a la posición original en Y
          rotateZ: isFloating ? 0 : -15, // Rotación condicional según estado flotante
          scale: isFloating ? 1.1 : 1, // Escala condicional para destacar la tarjeta
          x: 0, // Posición en X
          ...tilt, // Aplica inclinación calculada
          ...radialShadow, // Aplica sombra radial calculada
          ...expansionStyle, // Aplica estilo de expansión si corresponde
          ...flipAnimation, // Aplica animación de flip si corresponde
        }}
        transition={{ type: 'spring', stiffness: 70, damping: 15 }} // Transición con resorte para suavidad
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
            animate={{ rotateY: 0 }} // Sin rotación inicial en el flip
            transition={{ type: 'spring', stiffness: 70, damping: 15 }} // Transición suave
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

export default ContactCard; // Exporta el componente
