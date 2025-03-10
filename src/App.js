// src/App.js
import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ContactCard from './components/ContactCard';
import Section from './components/Section';
import MenuPortfolio from './components/MenuPortfolio';
import Header from './components/Header';
import LoadingScreen from './components/LoadingScreen';
import './App.css';

// Array de URLs de fondo y estilos de tarjeta
const backgrounds = [
  'https://i.gifer.com/SVoq.gif',
  'https://mir-s3-cdn-cf.behance.net/project_modules/1400/47171428008799.56e41b3897dfb.gif',
  'https://mir-s3-cdn-cf.behance.net/project_modules/source/7099fc28008799.56e41b31e770e.gif',
  'https://mir-s3-cdn-cf.behance.net/project_modules/1400_opt_1/4e0cc328008799.56e41b35c50a5.gif',
  'https://i.gifer.com/4Cb2.gif',
  'https://i.gifer.com/4tZP.gif',
  'https://i.gifer.com/CTM.gif'
];

const cardStyles = ['minimalista', 'cyberpunk', 'clasico-elegante', 'futurista-transparente', 'oscuro-premium'];

function App() {
  const [isFloating, setIsFloating] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [background, setBackground] = useState(null);
  const [cardStyle, setCardStyle] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [portfolioMode, setPortfolioMode] = useState(false);

  // Selecciona aleatoriamente un fondo y estilo de tarjeta
  useEffect(() => {
    const newBackground = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    const newCardStyle = cardStyles[Math.floor(Math.random() * cardStyles.length)];
    const img = new Image();
    img.src = newBackground;
    img.onload = () => {
      setBackground(newBackground);
      setCardStyle(newCardStyle);
      setIsLoading(false);
    };
  }, []);

  // Funciones para manejar la selección de secciones y el modo portfolio
  const handleSelectSection = (section) => {
    setSelectedSection(section);
  };

  const handleBackFromSection = () => {
    setSelectedSection(null);
  };

  const togglePortfolioMode = () => {
    setPortfolioMode(prev => !prev);
  };

  return (
    <div className="App">
      <Header 
        cardStyle={cardStyle} 
        onTogglePortfolioMode={togglePortfolioMode} 
        socialLinks={{
          linkedin: "https://linkedin.com/in/laureanodiez",
          github: "https://github.com/laureanodiez",
          gitlab: "https://gitlab.com/laureanodiez",
          mail: "mailto:contactolaureanodiez@gmail.com"
        }}
      />
      
      {isLoading && <LoadingScreen />}
      
      {!isLoading && (
        <>
          {/* Fondo de pantalla con desenfoque condicional */}
          <div className={`background ${isFloating ? 'blurred' : ''}`} style={{ backgroundImage: `url(${background})` }} />
          
          <div className="content">
            <AnimatePresence exitBeforeEnter>
              {selectedSection ? (
                <motion.div
                  key="section"
                  initial={{ opacity: 0, y: '100vh' }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: '100vh' }}
                  transition={{ duration: 0.5 }}
                >
                  <Section
                    selectedSection={selectedSection}
                    onBack={handleBackFromSection}
                    cardStyle={cardStyle}
                  />
                </motion.div>
              ) : portfolioMode ? (
                <motion.div
                  key="menu"
                  initial={{ opacity: 0, y: '100vh' }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: '100vh' }}
                  transition={{ duration: 0.5 }}
                >
                  <MenuPortfolio onSelectSection={handleSelectSection} onCloseMenu={() => setPortfolioMode(true)} />
                </motion.div>
              ) : (
                // MODIFICACIÓN: Cambiar animación para que deslice desde arriba
                <motion.div
                  key="contact-card"
                  initial={{ opacity: 0, y: '-100vh' }}  // Partir desde arriba
                  animate={{ opacity: 1, y: 0 }}           // Animar hasta el centro
                  exit={{ opacity: 0, y: '-100vh' }}       // Salir deslizando hacia arriba
                  transition={{ duration: 0.5, ease: 'easeInOut' }}  // Transición suave
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
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
