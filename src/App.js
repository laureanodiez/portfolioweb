// src/App.js
import React, { useState, useEffect } from 'react'; // Importa React y hooks necesarios
import { AnimatePresence } from 'framer-motion'; // Importa AnimatePresence para animaciones al montar/desmontar
import ContactCard from './components/ContactCard'; // Importa el componente ContactCard
import Section from './components/Section'; // Importa el componente Section
import './App.css'; // Importa estilos globales

// Arreglo de URLs para fondos animados
const backgrounds = [
  'https://i.gifer.com/SVoq.gif',
  'https://mir-s3-cdn-cf.behance.net/project_modules/1400/47171428008799.56e41b3897dfb.gif',
  'https://mir-s3-cdn-cf.behance.net/project_modules/source/7099fc28008799.56e41b31e770e.gif',
  'https://mir-s3-cdn-cf.behance.net/project_modules/1400_opt_1/4e0cc328008799.56e41b35c50a5.gif',
  'https://i.gifer.com/4Cb2.gif',
  'https://i.gifer.com/4tZP.gif',
  'https://i.gifer.com/CTM.gif'
];

// Arreglo de estilos para la tarjeta
const cardStyles = ['minimalista', 'cyberpunk', 'clasico-elegante', 'futurista-transparente', 'oscuro-premium'];

function App() {
  const [isFloating, setIsFloating] = useState(false); // Estado para determinar si la tarjeta está flotando
  const [selectedSection, setSelectedSection] = useState(null); // Estado para la sección seleccionada
  const [background, setBackground] = useState(backgrounds[0]); // Estado para el fondo actual
  const [cardStyle, setCardStyle] = useState(cardStyles[0]); // Estado para el estilo de la tarjeta
  
  // Función para actualizar la sección seleccionada
  const handleSelectSection = (section) => {
    setSelectedSection(section);
  };

  // useEffect para seleccionar fondo y estilo de tarjeta de forma aleatoria al montar el componente
  useEffect(() => {
    setBackground(backgrounds[Math.floor(Math.random() * backgrounds.length)]);
    setCardStyle(cardStyles[Math.floor(Math.random() * cardStyles.length)]);
  }, []);

  return (
    <div className="App">
      {/* Fondo de pantalla completa con imagen y efecto de desenfoque cuando la tarjeta está flotante */}
      <div className={`background ${(isFloating) ? 'blurred' : ''}`} style={{ backgroundImage: `url(${background})` }} />
      <div className="content">
        <AnimatePresence exitBeforeEnter>
          {/* Renderiza el ContactCard si no hay sección seleccionada */}
          {!selectedSection && (
            <ContactCard
              key="contact-card"
              isFloating={isFloating}
              setIsFloating={setIsFloating}
              onSelectSection={handleSelectSection}
              cardStyle={cardStyle}
            />
          )}
          {/* Renderiza la sección seleccionada si existe */}
          {selectedSection && (
            <Section
              key="section"
              selectedSection={selectedSection}
              onBack={() => setSelectedSection(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App; // Exporta el componente principal
