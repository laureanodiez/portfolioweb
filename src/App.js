// src/App.js
import React, { useState, useEffect } from 'react'; // Importa React y hooks necesarios
import { AnimatePresence, motion } from 'framer-motion'; // Importa AnimatePresence y motion para animaciones
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
  const [isFloating, setIsFloating] = useState(false); // Indica si la tarjeta está flotando
  const [selectedSection, setSelectedSection] = useState(null); // Sección seleccionada
  const [background, setBackground] = useState(backgrounds[0]); // Fondo actual
  const [cardStyle, setCardStyle] = useState(cardStyles[0]); // Estilo de la tarjeta
  const [hasLoaded, setHasLoaded] = useState(false); // NUEVO: Indica si la tarjeta ya se cargó al menos una vez
  
  // Función para actualizar la sección seleccionada
  const handleSelectSection = (section) => {
    setSelectedSection(section);
  };

  useEffect(() => {
    setBackground(backgrounds[Math.floor(Math.random() * backgrounds.length)]);
    setCardStyle(cardStyles[Math.floor(Math.random() * cardStyles.length)]);
  }, []);

  return (
    <div className="App">
      <div className={`background ${isFloating ? 'blurred' : ''}`} style={{ backgroundImage: `url(${background})` }} />
      <div className="content">
        <AnimatePresence exitBeforeEnter>
          { !selectedSection ? (
            <motion.div
              key="contact-card"
              initial={{ opacity: 0, y: '100vh' }}   // La tarjeta entra desde abajo
              animate={{ opacity: 1, y: 0 }}            // Se posiciona en su lugar
              exit={{ opacity: 0, y: '100vh' }}         // Al salir, se desplaza hacia abajo
              transition={{ duration: 0.5 }}
            >
              <ContactCard
                isFloating={isFloating}
                setIsFloating={setIsFloating}
                onSelectSection={handleSelectSection}
                cardStyle={cardStyle}
                hasLoaded={hasLoaded}             // NUEVO: Se pasa el estado de carga
                setHasLoaded={setHasLoaded}       // NUEVO: Se pasa la función para marcar que ya cargó
              />
            </motion.div>
          ) : (
            <motion.div
              key="section"
              initial={{ opacity: 0, y: '100vh' }}   // La sección entra desde abajo
              animate={{ opacity: 1, y: 0 }}            // Se posiciona en su lugar
              exit={{ opacity: 0, y: '100vh' }}         // Al salir, se desplaza hacia abajo
              transition={{ duration: 0.5 }}
            >
              <Section
                selectedSection={selectedSection}
                onBack={() => setSelectedSection(null)}
                cardStyle={cardStyle}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App; // Exporta el componente principal
