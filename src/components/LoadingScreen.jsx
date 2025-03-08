// src/components/LoadingScreen.jsx
// Componente independiente para la pantalla de carga.
// Se muestra mientras se cargan recursos críticos (fondo, etc.) y luego se oculta.

import React from 'react';
import './LoadingScreen.css'; // Se pueden definir estilos específicos para la pantalla de carga

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      {/* Animación del pentágono */}
      <div className="pentagon-loader"></div>
      {/* Texto del loader */}
      <p className="loading-text">vAlpha - Laureano Diez ©</p>
    </div>
  );
};

export default LoadingScreen;
