// src/components/Section.jsx
import React from 'react';
import { motion } from 'framer-motion';
import './Section.css';

const Section = ({ selectedSection, onBack }) => {
  return (
    <motion.div
      className="section-content"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button className="back-button" onClick={onBack}>← Volver</button>
      <h1>{selectedSection}</h1>
      <p>Contenido de {selectedSection}...</p>
      <p>Proyectos de desarrollo:</p>
      <ul>
        <li>Proyecto 1: Descripción...</li>
        <li>Proyecto 2: Descripción...</li>
      </ul>
      {/* Agrega el contenido del portafolio aquí */}
    </motion.div>
    
  );

};


export default Section;