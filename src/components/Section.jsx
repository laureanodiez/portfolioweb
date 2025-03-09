// src/components/Section.jsx
import React from 'react';
import { sectionsContent } from '../sectionsContent'; // Importa el contenido de secciones
import './Section.css'; // Estilos para Section

const Section = ({ selectedSection, onBack, cardStyle }) => {
  const content = sectionsContent[selectedSection];

  if (!content) {
    return <div>No se encontró contenido para la sección.</div>;
  }

  return (
    // Wrapper que cubre toda la pantalla para detectar clicks en el fondo
    <div className="section-wrapper" onClick={(e) => { if(e.currentTarget === e.target) onBack(); }}>
      {/* Contenedor del contenido con doble click para salir */}
      <div className={`section-container ${cardStyle}`} onDoubleClick={onBack}>
        <h1 className="section-title">{content.title}</h1>
        <div className="section-description">
          {content.description.split('\n').map((line, idx) => (
            <p key={idx}>{line.trim()}</p>
          ))}
        </div>
        <div className="section-media">
          {content.media && content.media.map((item, index) => {
            if (item.type === "video") {
              return (
                <div key={index} className="media-item video">
                  <iframe
                    src={item.url}
                    title={`video-${index}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              );
            }
            if (item.type === "image") {
              return (
                <img key={index} className="media-item image" src={item.url} alt={`media-${index}`} />
              );
            }
            if (item.type === "code") {
              return (
                <div key={index} className="media-item code">
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    Ver Proyecto en GitHub
                  </a>
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
};

export default Section;
