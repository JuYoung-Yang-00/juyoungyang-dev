import React, { forwardRef, useState, useEffect, useRef } from 'react';
import logo_inverted from '../assets/logo-inverted.png';
import { Link } from 'react-router-dom';
import './blog.css';


const Header = forwardRef((props, ref) => {



  const handleLogoClick = () => {
    window.location.reload();
  };


  return (
    <div id="Header" className='blog-header-section' ref={ref}>
      <div id="Nav">
        <div className="logo-container" onClick={handleLogoClick}>
          <img src={logo_inverted} alt="Logo" className="logo" />
        </div>
      </div>
      <div className='blog-nav' >
        <Link to="/" className="home-link">Home</Link>
      </div>
    </div>
  );
});

export default Header;
