// src/components/Header.jsx
import React from 'react';
import './Header.css';

const Header = ({ cardStyle, onTogglePortfolioMode, socialLinks }) => {
  // Usamos URLs de SVG sin color (monocromáticos) de Simple Icons.
  const darkStyles = ["cyberpunk", "oscuro-premium"];
  const isDark = darkStyles.includes(cardStyle);
  const textColor = isDark ? "#fff" : "#000";
  const buttonText = portfolioModeActive => portfolioModeActive ? "Modo Menú" : "Modo Tarjeta";

  return (
    <header className="header-banner">
      <div className="header-left">
        <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
          <img src="https://cdn.jsdelivr.net/npm/simple-icons@v7/icons/linkedin.svg" alt="LinkedIn" className="social-icon"/>
        </a>
        <a href={socialLinks.github} target="_blank" rel="noopener noreferrer">
          <img src="https://cdn.jsdelivr.net/npm/simple-icons@v7/icons/github.svg" alt="GitHub" className="social-icon"/>
        </a>
        <a href={socialLinks.gitlab} target="_blank" rel="noopener noreferrer">
          <img src="https://cdn.jsdelivr.net/npm/simple-icons@v7/icons/gitlab.svg" alt="GitLab" className="social-icon"/>
        </a>
        <a href={socialLinks.mail} target="_blank" rel="noopener noreferrer">
          <img src="https://cdn.jsdelivr.net/npm/simple-icons@v7/icons/gmail.svg" alt="Mail" className="social-icon"/>
        </a>
      </div>
      <div className="header-center">
        <h1 style={{ color: textColor }}>Laureano Diez</h1>
        <h2 style={{ color: textColor }}>Portfolio</h2>
      </div>
      <div className="header-right">
        <button className="toggle-mode-button" onClick={onTogglePortfolioMode} style={{ color: textColor }}>
          {/* El botón cambiará su texto según el modo (lo controlamos en App.js) */}
          {onTogglePortfolioMode.buttonText || "Modo Tarjeta"}
        </button>
      </div>
    </header>
  );
};

export default Header;
