import React, { forwardRef, useState, useEffect, useRef } from 'react';
import blog_logo from '../assets/blog-logo.png';
import { Link } from 'react-router-dom';
import './blog.css';

const Header = forwardRef((props, ref) => {
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowHeader(currentScrollY <= lastScrollY || currentScrollY <= 0);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  const handleLogoClick = () => {
    window.location.reload();
  };

  return (
    <div id="Header" className={`blog-header-section ${showHeader ? '' : 'hidden'}`} ref={ref}>
      <div id="Nav">
        <div className="logo-container" onClick={handleLogoClick}>
          <img src={blog_logo} alt="Logo" className="blog-logo" />
        </div>
      </div>
      <div className='blog-nav'>
        <Link to="/" className="homelink">Home</Link>
      </div>
    </div>
  );
});

export default Header;
