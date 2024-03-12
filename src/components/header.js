import React, { forwardRef, useState, useEffect, useRef } from 'react';
import logo from '../assets/logo.png';
import { Link } from 'react-router-dom'; 

const Header = forwardRef((props, ref) => {
  const [selectedSection, setSelectedSection] = useState("home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth > 920);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showNav, setShowNav] = useState(true);

  const menuRef = useRef();

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      setSelectedSection(sectionId);
      if (!isLargeScreen) {
        setIsMenuOpen(false); 
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  const handleLogoClick = () => {
    window.location.reload();
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth > 920);
      if (window.innerWidth > 920) {
        setIsMenuOpen(false); 
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setSelectedSection(entry.target.id);
        }
      });
    }, { threshold: 0.7 }); 

    ["home", "about", "projects", "blog", "contact"].forEach(sectionId => {
      const section = document.getElementById(sectionId);
      if (section) observer.observe(section);
    });

    return () => {
      ["home", "about", "projects", "blog", "contact"].forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) observer.unobserve(section);
      });
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowNav(currentScrollY < lastScrollY || currentScrollY <= 0);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  return (
    <div id="Header" className={`header-section ${showNav ? '' : 'hide-nav'}`} ref={ref}>
      <div id="Nav">
        <div className="logo-container" onClick={handleLogoClick}>
          <img src={logo} alt="Logo" className="logo" />
        </div>
      </div>
      <div className='nav' ref={menuRef}>
        {isLargeScreen ? (
          <>
            <button onClick={() => scrollToSection("home")} className={selectedSection === "home" ? "selected" : ""}>Home</button>
            <button onClick={() => scrollToSection("about")} className={selectedSection === "about" ? "selected" : ""}>About</button>
            <button onClick={() => scrollToSection("projects")} className={selectedSection === "projects" ? "selected" : ""}>Projects</button>
            <button onClick={() => scrollToSection("contact")} className={selectedSection === "contact" ? "selected" : ""}>Contact</button>
            <Link to="/blog" className="blog-main-page-link"> Blog</Link>
          </>
        ) : (
          <>
            <button className="menu-button" onClick={toggleMenu}>
              {isMenuOpen ? '✕' : '☰'}
            </button>
            {isMenuOpen && (
              <div className="menu-items">
                <button className="close-menu-button" onClick={toggleMenu}>✕</button>
                <button onClick={() => scrollToSection("home")} className={selectedSection === "home" ? "selected" : ""}>Home</button>
                <button onClick={() => scrollToSection("about")} className={selectedSection === "about" ? "selected" : ""}>About</button>
                <button onClick={() => scrollToSection("projects")} className={selectedSection === "projects" ? "selected" : ""}>Projects</button>
                <button onClick={() => scrollToSection("contact")} className={selectedSection === "contact" ? "selected" : ""}>Contact</button>
                <Link to="/blog" className="menu-blog-main-page-link"> Blog</Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
});

export default Header;
