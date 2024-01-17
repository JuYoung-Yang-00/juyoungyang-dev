import React from 'react';
import profile from '../assets/profile.jpg';

const About = () => {
    return (
      <div id="about" className="section-content about-section">
          <div className="about-container">
            <h1 className="about-title">About</h1>
            <div className="about-content">
                <img src={profile} alt="profile" className="about-image"/>
                <div className="about-text">
                    <p>
                    I'm an incoming graduate from Duke University with a major in Computer Science.
                    I value constant growth, and I always seek to demonstrate the synergy
                    of knowledge and passion across my work ethics and personal life.
                    </p>
              </div>
          </div>
        </div>
      </div>
    );
}

export default About;
