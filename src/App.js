import React, { useState, useRef, useEffect } from "react";
import "./index.css";
import Home from "./components/home";
import About from "./components/about";
import Projects from "./components/projects";
import Contact from "./components/contact";
import Footer from "./components/footer";
import logo from './assets/logo.png';
import MenuIcon from './components/menuicon';

function App() {
  const handleLogoClick = () => {
    window.location.reload();
  };

  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => {
    console.log("Toggling menu...");
    setMenuOpen(!menuOpen);
  };

  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [menuOpen]);
  
  const scrollWithOffset = (elementId, offset) => {
    const element = document.getElementById(elementId);
    const y = element.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  return (
    <div className="App">
      <nav>
          <div className="logo-container" onClick={handleLogoClick}>
              <img src={logo} alt="Logo" className="logo" />
          </div>
          <MenuIcon onClick={toggleMenu} />
          {menuOpen && (
            <div className={`nav-links ${menuOpen ? 'open' : ''}`} ref={menuRef}>
              <a href="#home" onClick={toggleMenu}>HOME</a>
              <a href="#about" onClick={(e) => {
                  e.preventDefault();
                  toggleMenu();
                  scrollWithOffset('about', 80);
                }}>ABOUT
              </a>
              <a href="#projects" onClick={(e) => {
                  e.preventDefault();
                  toggleMenu();
                  scrollWithOffset('projects', 15);
                }}>PROJECTS
              </a>
              <a href="#contact" onClick={toggleMenu}>CONTACT</a>
            </div>
          )}
      </nav>
      <Home />
      <About />
      <Projects />
      <Contact />
      <Footer />
    </div>
  );
}

export default App;
