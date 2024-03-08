import React, { forwardRef} from 'react';
import logo_inverted from '../assets/logo-inverted.png';
import { Link } from 'react-router-dom';
import './post.css';


const Header = forwardRef((props, ref) => {



  const handleLogoClick = () => {
    window.location.reload();
  };


  return (
    <div id="Header" className='post-header-section' ref={ref}>
      <div id="Nav">
        <div className="logo-container" onClick={handleLogoClick}>
          <img src={logo_inverted} alt="Logo" className="logo" />
        </div>
      </div>
      <div className='post-nav' >
        <Link to="/" className="home-link">Home</Link>
      </div>
    </div>
  );
});

export default Header;

