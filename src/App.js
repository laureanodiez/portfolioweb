// src/App.js
import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import ContactCard from './components/ContactCard';
import Section from './components/Section';
import './App.css';

function App() {
  const [isFloating, setIsFloating] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);

  const handleSelectSection = (section) => {
    setSelectedSection(section);
  };

  const handleBack = () => {
    setSelectedSection(null);
  };

  return (
    <div className="App">
      <AnimatePresence exitBeforeEnter>
        {!selectedSection && (
          <ContactCard
            key="contact-card"
            isFloating={isFloating}
            setIsFloating={setIsFloating}
            onSelectSection={handleSelectSection}
          />
        )}
        {selectedSection && (
          <Section
            key="section"
            selectedSection={selectedSection}
            onBack={handleBack}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;