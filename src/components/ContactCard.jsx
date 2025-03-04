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
  const [lockedSide, setLockedSide] = useState(null); // Estado para el lado bloqueado tras click o arrastre
  const [isFlipped, setIsFlipped] = useState(false); // Estado para determinar si la tarjeta está volteada
  const [isExpanded, setIsExpanded] = useState(false); // Estado para la expansión de la tarjeta
  const [mode, setMode] = useState(null); // Estado para el modo ("cv" o "section")
  
  // NUEVO: Estado para determinar si se está arrastrando la tarjeta
  const [isDragging, setIsDragging] = useState(false);
  // NUEVO: Estado para registrar la rotación durante el arrastre
  const [dragRotation, setDragRotation] = useState({ rotateX: 0, rotateY: 0 });
  
  // Estado para registrar la posición inicial del toque (para interacciones táctiles)
  const [touchStartPos, setTouchStartPos] = useState(null);
  // NUEVO: Estado para registrar la posición actual del toque en movimiento
  const [touchCurrentPos, setTouchCurrentPos] = useState(null);
  
  // Se mantiene fastMoveCount para el cálculo de movimientos rápidos (aunque no se usará para activar "cv")
  const fastMoveCount = useRef(0);
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

  // NUEVO: useEffect que fuerza el modo "cv" si la tarjeta está volteada y expandida (media vuelta)
  useEffect(() => {
    if (isFlipped && isExpanded && mode !== "section") {
      setMode("cv"); // Fuerza el modo "cv" cuando se muestra la parte trasera
    }
  }, [isFlipped, isExpanded, mode]);

  // Si la tarjeta está en proceso de carga, se muestra la pantalla de carga
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="pentagon-loader"></div>
        <p className="loading-text">vPROTOTYPE - © Laureano Diez</p>
      </div>
    );
  }

  /* Manejo del movimiento del mouse */
  const handleMouseMove = (e) => {
    if (!isFloating || isDragging) return; // Si no está en estado flotante o se está arrastrando, no procesa el movimiento

    // Se mantiene la detección del lado activo (hover)
    const rect = cardRef.current.getBoundingClientRect(); // Obtiene la posición y dimensiones de la tarjeta
    const threshold = 30; // Umbral para detectar cercanía a los bordes
    let side = null;
    if (e.clientY - rect.top <= threshold) side = 0;          // Lado superior
    else if (rect.right - e.clientX <= threshold) side = 1;      // Lado derecho
    else if (rect.bottom - e.clientY <= threshold) side = 2;     // Lado inferior
    else if (e.clientX - rect.left <= threshold) side = 3;       // Lado izquierdo
    setActiveSide(side); // Se actualiza el lado activo

    lastMousePos.current = { x: e.clientX, y: e.clientY }; // Actualiza la última posición del mouse

    // Se mantiene el contador de movimientos rápidos, aunque ya no activa el modo "cv"
    const deltaX = e.clientX - lastMousePos.current.x;
    const speed = Math.abs(deltaX);
    if (speed > 30) {
      fastMoveCount.current += 1; // Incrementa el contador si el movimiento es rápido
    } else {
      fastMoveCount.current = 0; // Reinicia el contador si el movimiento es lento
    }
    if (fastMoveCount.current >= 3 && !lockedSide && !isExpanded) {
      // Esta parte se dejó para fines de registro, pero no activa el modo "cv"
      fastMoveCount.current = 0;
    }
  };

  // Manejador para cuando el mouse sale del área de la tarjeta
  const handleMouseLeave = () => {
    if (!isExpanded && !isDragging) setActiveSide(null); // Reinicia el lado activo si no está expandida ni se arrastra
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

  // Doble clic en la tarjeta: colapsa la tarjeta y devuelve la instancia a estar en el suelo
  const handleDoubleClick = (e) => {
    setIsExpanded(false);         // Colapsa la tarjeta
    setIsFlipped(false);          // Revierte el flip
    setLockedSide(null);          // Reinicia el lado bloqueado
    setActiveSide(null);          // Reinicia el lado activo
    setMode(null);                // Reinicia el modo
    setDragRotation({ rotateX: 0, rotateY: 0 }); // Reinicia la rotación de arrastre
    setIsFloating(false);         // NUEVO: Vuelve la tarjeta al suelo
  };

  // Si se hace clic en el fondo expandido (fuera del contenido), colapsa la tarjeta
  const handleCollapse = (e) => {
    handleDoubleClick(e);
  };

  // Evita que clics dentro de la tarjeta expandida provoquen colapso
  const stopPropagation = (e) => e.stopPropagation();

  /* NUEVA SECCIÓN: Manejadores de eventos táctiles para interacción en dispositivos móviles */

  // Registra la posición inicial del toque
  const handleTouchStart = (e) => {
    const touch = e.touches[0]; // Toma el primer toque
    setTouchStartPos({ x: touch.clientX, y: touch.clientY }); // Guarda la posición inicial
    setTouchCurrentPos({ x: touch.clientX, y: touch.clientY }); // NUEVO: Inicializa la posición actual del toque
  };

  // Maneja el movimiento táctil para calcular la diferencia y aplicar efecto de giro
  const handleTouchMove = (e) => {
    // NUEVO: Verificamos que exista una posición inicial guardada
    if (!touchStartPos) return; 
    const touch = e.touches[0]; // Obtenemos el toque actual
    // NUEVO: Actualizamos la posición actual del toque
    setTouchCurrentPos({ x: touch.clientX, y: touch.clientY });
    // NUEVO: Calculamos la diferencia (delta) entre la posición actual y la posición inicial
    const deltaX = touch.clientX - touchStartPos.x;
    const deltaY = touch.clientY - touchStartPos.y;
    // NUEVO: Factor para ajustar la sensibilidad de la rotación (similar al arrastre con mouse)
    const factor = 0.5;
    // NUEVO: Actualizamos la rotación en función del movimiento táctil
    setDragRotation({
      rotateX: -deltaY * factor, // Se invierte deltaY para que mover hacia arriba rote hacia el top
      rotateY: deltaX * factor,  // deltaX se utiliza directamente para la rotación horizontal
    });
  };

  // Al finalizar el toque, se decide si se activa el flip o se "ajusta" el ángulo (snap) según el movimiento
  const handleTouchEnd = (e) => {
    // NUEVO: Si no hubo posición actual registrada, se considera un toque sin movimiento y se activa el flip
    if (!touchCurrentPos || !touchStartPos) {
      setIsFlipped(true);
      setIsExpanded(true);
      setMode("cv");
      setTouchStartPos(null);
      setTouchCurrentPos(null);
      return;
    }
    // NUEVO: Calculamos la diferencia total en X e Y entre el inicio y el final del toque
    const deltaX = touchCurrentPos.x - touchStartPos.x;
    const deltaY = touchCurrentPos.y - touchStartPos.y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);
    // NUEVO: Definimos umbrales para diferenciar un toque simple de un arrastre
    const smallThreshold = 10;   // Umbral mínimo para considerar que no hubo movimiento significativo
    const flipThreshold = 120;   // Umbral de movimiento para activar el flip completo
    // NUEVO: Si el movimiento es ínfimo, se considera un toque simple: se activa el flip y la expansión
    if (absDeltaX < smallThreshold && absDeltaY < smallThreshold) {
      setIsFlipped(true);
      setIsExpanded(true);
      setMode("cv");
      // NUEVO: Se reinician las posiciones y la rotación
      setDragRotation({ rotateX: 0, rotateY: 0 });
    } else if (absDeltaX > flipThreshold || absDeltaY > flipThreshold) {
      // NUEVO: Si el movimiento supera el umbral de flip, se activa el flip completo similar al arrastre con mouse
      setMode("cv");
      setIsFlipped(true);
      setIsExpanded(true);
      setDragRotation({ rotateX: 0, rotateY: 0 });
    } else {
      // NUEVO: Si el movimiento es significativo pero no alcanza el umbral de flip, se "ajusta" la inclinación (snap)
      let selectedSide = null;
      if (absDeltaX > absDeltaY) {
        selectedSide = deltaY < 0 ? 0 : 2; // Si el movimiento horizontal es mayor, se determina top o bottom
      } else {
        selectedSide = deltaX < 0 ? 1 : 3; // Si el movimiento vertical es mayor, se determina right o left
      }
      setLockedSide(selectedSide); // Bloquea el lado seleccionado
      // NUEVO: Se define la rotación "ajustada" según el lado seleccionado
      let snappedRotation = { rotateX: 0, rotateY: 0 };
      if (selectedSide === 0) snappedRotation = { rotateX: -15, rotateY: 0 }; // Top
      else if (selectedSide === 1) snappedRotation = { rotateX: 0, rotateY: -15 }; // Right
      else if (selectedSide === 2) snappedRotation = { rotateX: 15, rotateY: 0 };  // Bottom
      else if (selectedSide === 3) snappedRotation = { rotateX: 0, rotateY: 15 };  // Left
      setDragRotation(snappedRotation); // Actualiza la rotación con el "snap" para mantener la inclinación
    }
    // NUEVO: Se reinician las posiciones de toque al finalizar la interacción táctil
    setTouchStartPos(null);
    setTouchCurrentPos(null);
  };

  /* NUEVA SECCIÓN: Manejadores para arrastre (drag) y rotación de la tarjeta */

  // Handler al iniciar el arrastre
  const handleDragStart = () => {
    setIsDragging(true); // Activa el estado de arrastre
  };

  // Handler durante el arrastre; 'info' contiene el offset del arrastre
  const handleDrag = (event, info) => {
    // Factor de multiplicación para ajustar la sensibilidad de la rotación
    const factor = 0.5;
    setDragRotation({
      // Se invierte deltaY para que mover hacia arriba rote hacia el top
      rotateX: -info.offset.y * factor,
      rotateY: info.offset.x * factor,
    });
  };

  // Handler al finalizar el arrastre (drag)
  const handleDragEnd = (event, info) => {
    setIsDragging(false); // Desactiva el estado de arrastre

    // Calculamos la magnitud de la rotación acumulada a partir del drag
    const { rotateX, rotateY } = dragRotation;
    const absX = Math.abs(rotateX);
    const absY = Math.abs(rotateY);

    const smallThreshold = 10;   // Umbral mínimo para considerar cualquier movimiento
    const flipThreshold = 120;    // Umbral de rotación para activar el flip completo

    // Si el movimiento es ínfimo, se reinicia la rotación sin hacer nada
    if (absX < smallThreshold && absY < smallThreshold) {
      setDragRotation({ rotateX: 0, rotateY: 0 });
      return;
    }

    // Si el movimiento supera el umbral de flip (media vuelta o más)
    if (absX > flipThreshold || absY > flipThreshold) {
      setMode("cv");         // Activa el modo "cv" para mostrar CV y resumen
      setIsFlipped(true);    // Voltea la tarjeta
      setIsExpanded(true);   // Expande la tarjeta para mostrar el contenido completo
      setDragRotation({ rotateX: 0, rotateY: 0 }); // Reinicia la rotación (el flip se manejará con flipAnimation)
      return; // Termina la función, ya que se realizó el flip completo
    }

    // Si no se alcanzó el umbral de flip pero sí hay un movimiento significativo,
    // se procede a determinar el lado para el "snap" de la inclinación
    let selectedSide = null;
    if (absX > absY) {
      selectedSide = rotateX < 0 ? 0 : 2; // Lado superior si rotateX negativo, inferior si positivo
    } else {
      selectedSide = rotateY < 0 ? 1 : 3; // Lado derecho si rotateY negativo, izquierdo si positivo
    }
    setLockedSide(selectedSide); // Bloquea el lado seleccionado

    // Se define el "snap" de la rotación a valores predefinidos según el lado seleccionado
    let snappedRotation = { rotateX: 0, rotateY: 0 };
    if (selectedSide === 0) snappedRotation = { rotateX: -15, rotateY: 0 }; // Top
    else if (selectedSide === 1) snappedRotation = { rotateX: 0, rotateY: -15 }; // Right
    else if (selectedSide === 2) snappedRotation = { rotateX: 15, rotateY: 0 };  // Bottom
    else if (selectedSide === 3) snappedRotation = { rotateX: 0, rotateY: 15 };  // Left
    setDragRotation(snappedRotation); // Actualiza la rotación con el "snap" para mantener la inclinación
  };

  /* Cálculo de la inclinación (tilt) y sombra radial */
  const currentSide = lockedSide !== null ? lockedSide : activeSide; // Determina el lado actual
  let tilt = { rotateX: 0, rotateY: 0, x: 0, y: 0 }; // Objeto para almacenar la inclinación
  if (!isExpanded && isFloating && !isFlipped && !isDragging && currentSide !== null) {
    // Para top y bottom, se invierte la inclinación según lo pedido
    if (currentSide === 0) tilt = { rotateX: -15, y: -10 }; // Top: inclina hacia arriba
    else if (currentSide === 1) tilt = { rotateY: -15, x: 10 }; // Right: inclina hacia la izquierda
    else if (currentSide === 2) tilt = { rotateX: 15, y: 10 };  // Bottom: inclina hacia abajo
    else if (currentSide === 3) tilt = { rotateY: 15, x: -10 }; // Left: inclina hacia la derecha
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
  // Calcular animación de flip; si el modo es "cv", forzamos un flip de 180° en Y.
  let flipAnimation = {};
  if (isFlipped && isExpanded) {
    if (mode === "cv") {
      flipAnimation = { rotateY: 180 }; // Forzamos flip de 180° para ver el reverso
    } else {
      // Mantener lógica anterior si hubiera otros modos (por ejemplo, sección)
      let currentSideForFlip = lockedSide !== null ? lockedSide : activeSide;
      if (currentSideForFlip !== null) {
        if (currentSideForFlip === 0 || currentSideForFlip === 2) flipAnimation = { rotateX: 180 };
        else flipAnimation = { rotateY: 180 };
      } else {
        flipAnimation = { rotateY: 180 };
      }
    }
  }

  
  let expansionStyle = {}; // Estilo para la expansión de la tarjeta
  if (isExpanded) {
    expansionStyle = {
      width: "90vw",   // Ancho al expandirse
      height: "90vh",  // Alto al expandirse
      top: "50%",      // Centrado vertical
      left: "50%",     // Centrado horizontal
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
        onDoubleClick={handleDoubleClick} // Doble clic para colapsar y regresar al suelo
        onMouseMove={handleMouseMove} // Movimiento del mouse para detectar el lado
        onMouseLeave={handleMouseLeave} // Restaura el estado al salir el mouse
        onTouchStart={handleTouchStart} // Inicia la detección táctil
        onTouchMove={handleTouchMove}   // NUEVO: Actualiza la interacción táctil con el movimiento
        onTouchEnd={handleTouchEnd}     // NUEVO: Al finalizar el toque, decide la acción (flip o snap)
        // Se activa la funcionalidad de arrastre (drag) con restricción para no mover la tarjeta de su centro
        drag={isFloating}
        dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
        onDragStart={handleDragStart} // Al iniciar el arrastre
        onDrag={handleDrag}         // Durante el arrastre
        onDragEnd={handleDragEnd}   // Al finalizar el arrastre: se evaluará si se activa el modo "cv" según el giro
        initial={{ y: '-100vh', rotateZ: -15, scale: 1 }} // Estado inicial de la animación
        animate={{
          y: 0, // Anima a la posición original en Y
          rotateZ: isFloating ? 0 : -15, // Rotación condicional según estado flotante
          scale: isFloating ? 1.1 : 1, // Escala condicional para destacar la tarjeta
          x: 0, // Posición en X
          // Se utiliza la rotación por arrastre si se está arrastrando; de lo contrario, se aplica la inclinación (tilt)
          ...(isDragging ? dragRotation : tilt),
          ...radialShadow, // Aplica sombra radial calculada
          ...expansionStyle, // Aplica estilo de expansión si corresponde
          ...flipAnimation, // Aplica animación de flip si corresponde
        }}
        transition={{ type: 'spring', stiffness: 70, damping: 15 }} // Transición con resorte para suavidad
      >
        { !isExpanded && (
          // Contenedor flip que agrupa ambas caras de la tarjeta
          <motion.div
            className="flip-container"
            // La animación de flip se combina con la animación global del contenedor
            animate={{ rotateY: 0 }}
            transition={{ type: 'spring', stiffness: 70, damping: 15 }}
          >
            <div className="flip-card">
              {/* CARA FRONTAL: Logo pentágono y nombre centrados */}
              <div className="card-face card-front">
                {/* Contenedor centrado usando Flexbox para agrupar logo y nombre */}
                <div className="card-content" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%'
                }}>
                  {/* NUEVO: Logo pentágono, ahora de 100x100 px */}
                  <div
                    className="pentagon-logo"
                    style={{
                      width: '100px',             // Ancho aumentado
                      height: '100px',            // Alto aumentado
                      clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'
                    }}
                  ></div>
                  {/* NUEVO: Nombre centrado debajo del logo */}
                  <h2 className="card-name" style={{
                    marginTop: '10px',
                    textAlign: 'center'
                  }}>
                    Laureano Diez
                  </h2>
                </div>
              </div>
              
              {/* CARA TRASERA: Datos de contacto centrados */}
              <div className="card-face card-back">
                {/* Contenedor centrado para la cara trasera */}
                <div className="card-content" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  textAlign: 'center'
                }}>
                  <div className="card-header">
                    {/* Se muestran nombre y título */}
                    <h2 className="card-name">Laureano Diez</h2>
                    <h4 className="card-title">Técnico Informático - Estudiante de IA</h4>
                  </div>
                  <div className="card-body">
                    {/* NUEVO: Datos de contacto */}
                    <div className="contact-details">
                      <p>Email: ejemplo@correo.com</p> {/* Reemplazar con el email real */}
                      <p>Tel: +54 1234 5678</p>       {/* Reemplazar con el teléfono real */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* NUEVO: Elemento para el efecto de reflejo dinámico */}
            { isFloating && (
              // Se calcula la posición del punto de luz según la rotación del drag
              (() => {
                // Factor para amplificar el efecto del drag en el reflejo
                const factor = 2;
                // Se usa dragRotation para calcular el punto de origen del gradiente
                const reflectionX = 50 - (dragRotation.rotateY * factor);
                const reflectionY = 50 - (dragRotation.rotateX * factor);
                // Se retorna el elemento con estilo dinámico
                return (
                  <div 
                    className="card-reflection"
                    style={{
                      position: 'absolute',  // Sobrepone la tarjeta
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      pointerEvents: 'none', // No bloquea interacciones
                      // Gradiente radial cuyo "punto de origen" se mueve según la rotación
                      background: `radial-gradient(circle at ${reflectionX}% ${reflectionY}%, rgba(255,255,255,0.4), transparent 70%)`,
                      transform: 'translateZ(1px)' // Asegura que se vea por encima
                    }}
                  ></div>
                );
              })()
            )}
          </motion.div>
        )}

        { isExpanded && mode === "cv" && (
          // NUEVO: Contenedor independiente para el modo expandido "CV"
          // Se posiciona igual que la tarjeta expandida, usando las mismas dimensiones y centrado.
          <motion.div 
            className="expanded-cv" 
            // Estilo inline igual que el de expansión (sin flip)
            style={{ 
              position: 'absolute', 
              width: '90vw', 
              height: '90vh', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)', 
              zIndex: 100 
            }}
            // Transición de aparición suave
            transition={{ type: 'spring', stiffness: 70, damping: 15 }}
          >
            {/* NUEVO: Contenedor para el contenido del reverso (CV y datos) */}
            <div 
              className="cv-content" 
              // Se usa overflow para permitir scroll si el contenido es extenso
              style={{ overflowY: 'auto', padding: '20px', boxSizing: 'border-box', height: '100%' }}
            >
              {/* Encabezado centrado */}
              <div style={{ textAlign: 'center' }}>
                <h2 className="card-name">Laureano Diez</h2>
                <h4 className="card-title">Técnico Informático - Estudiante de IA</h4>
              </div>
              {/* Datos de contacto centrados */}
              <div className="contact-details" style={{ textAlign: 'center', margin: '10px 0' }}>
                <p>Email: contactolaureanodiez@gmail.com</p>
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
              </div>
              {/* Contenedor para el CV en iframe */}
              <div className="cv-container" style={{ marginTop: '10px' }}>
                <iframe
                  src={`${process.env.PUBLIC_URL}/cv-espeng.pdf`}  // NUEVA FORMA DE ACCEDER AL PDF
                  title="CV"
                  frameBorder="0"
                  className="cv-viewer"
                  style={{ width: '100%', height: '400px' }}  // Se asegura un alto fijo
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

export default ContactCard; // Exporta el componente
