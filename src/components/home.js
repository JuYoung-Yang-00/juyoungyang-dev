import React from 'react';
import bitmoji from '../assets/bitmoji.png';
import github from '../assets/github.svg';
import linkedin from '../assets/linkedin.svg';

function Home() {
    return (
        <div id="home" className="section-content home-section">
            <div className="home-content-container">
                <div className="home-content">
                    <h1>HELLO!</h1>
                    <div className="home-image-container">
                        <img src={bitmoji} alt="bitmoji" className="bitmoji" />
                    </div>
                    <p>Welcome to my portfolio!</p>
                    <p>My name is Ju Young (Justin) Yang, <br/>
                    and I am an aspiring software engineer.</p>
                </div>
            </div>
            <div className="external-link-container">
                <div>
                    <a href="https://github.com/JuYoung-Yang-00" target="_blank" rel="noopener noreferrer">
                        <img src={github} alt="github" className="github" />
                    </a>
                </div>
                <div>
                    <a href="https://www.linkedin.com/in/juyoung-yang/" target="_blank" rel="noopener noreferrer">
                        <img src={linkedin} alt="linkedin" className="linkedin" />
                    </a>
                </div>
            </div>
        </div>
    );
}


export default Home;
