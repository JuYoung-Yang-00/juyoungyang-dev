import React from 'react';


function MenuIcon({ onClick }) {
    return (
        <div className="menu-icon" onClick={onClick}>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
        </div>
    );
}

export default MenuIcon;
