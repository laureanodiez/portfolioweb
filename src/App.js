// src/App.js
import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ContactCard from './components/ContactCard';
import Section from './components/Section';
import LoadingScreen from './components/LoadingScreen'; // NUEVO: Importamos la pantalla de carga
import './App.css';

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
  const [background, setBackground] = useState(null); // Fondo actual
  const [cardStyle, setCardStyle] = useState(null); // Estilo de la tarjeta
  const [hasLoaded, setHasLoaded] = useState(false); // Indica si la tarjeta ya se cargó
  const [isLoading, setIsLoading] = useState(true); // NUEVO: Estado para la pantalla de carga

  // Función para actualizar la sección seleccionada
  const handleSelectSection = (section) => {
    setSelectedSection(section);
  };

  // Simula la carga de los recursos (fondo y estilos) antes de mostrar la tarjeta
  useEffect(() => {
    setTimeout(() => {
      // Se elige un fondo y un estilo de tarjeta aleatorio después de la carga
      setBackground(backgrounds[Math.floor(Math.random() * backgrounds.length)]);
      setCardStyle(cardStyles[Math.floor(Math.random() * cardStyles.length)]);
      setIsLoading(false); // Se desactiva la pantalla de carga
    }, 2000); // Simulación de carga de 2 segundos
  }, []);

  return (
    <div className="App">
      {/* Pantalla de carga: se muestra hasta que los recursos estén listos */}
      {isLoading && <LoadingScreen />}

      {/* Una vez que termina la carga, se muestra el contenido */}
      {!isLoading && (
        <>
          {/* Fondo de la aplicación */}
          <div className={`background ${isFloating ? 'blurred' : ''}`} style={{ backgroundImage: `url(${background})` }} />

          {/* Contenedor del contenido principal */}
          <div className="content">
            <AnimatePresence exitBeforeEnter>
              {!selectedSection ? (
                <motion.div
                  key="contact-card"
                  initial={{ opacity: 0, y: '100vh' }}   // Aparece desde abajo
                  animate={{ opacity: 1, y: 0 }}        
                  exit={{ opacity: 0, y: '100vh' }}     
                  transition={{ duration: 0.5 }}
                >
                  <ContactCard
                    isFloating={isFloating}
                    setIsFloating={setIsFloating}
                    onSelectSection={handleSelectSection}
                    cardStyle={cardStyle}
                    hasLoaded={hasLoaded}
                    setHasLoaded={setHasLoaded}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="section"
                  initial={{ opacity: 0, y: '100vh' }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: '100vh' }}
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
        </>
      )}
    </div>
  );
}

export default App;
