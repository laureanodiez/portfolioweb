// src/App.js
import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import ContactCard from './components/ContactCard';
import Section from './components/Section';
import './App.css';

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
  const [background, setBackground] = useState(backgrounds[0]);
  const [cardStyle, setCardStyle] = useState(cardStyles[0]);
  
  const handleSelectSection = (section) => {
    setSelectedSection(section);
  };

  useEffect(() => {
    setBackground(backgrounds[Math.floor(Math.random() * backgrounds.length)]);
    setCardStyle(cardStyles[Math.floor(Math.random() * cardStyles.length)]);
  }, []);

  return (
    <div className="App">
      <div className={`background ${(isFloating) ? 'blurred' : ''}`} style={{ backgroundImage: `url(${background})` }} />
      <div className="content">
        <AnimatePresence exitBeforeEnter>
          {!selectedSection && (
            <ContactCard
              key="contact-card"
              isFloating={isFloating}
              setIsFloating={setIsFloating}
              onSelectSection={handleSelectSection}
              cardStyle={cardStyle}
            />
          )}
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

export default App;
