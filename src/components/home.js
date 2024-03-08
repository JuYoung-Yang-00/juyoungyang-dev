import React from 'react';
import bitmoji from '../assets/bitmoji.png';
import github from '../assets/github.svg';
import linkedin from '../assets/linkedin.svg';
import TypingAnimation from './animations/TypingAnimation';
import '../styles.css'; 
import Graph from './animations/Graph';


function Home() {
    return (
        <div id="home" className="section-content home-section">
            <Graph/>
            <div className="home-content-container">
                <div className="home-content">
                    <h1>Hi There!</h1>
                    <h1>I'm Justin Yang</h1>
                    <p>Open to Full-time Opportunities</p>
                    <TypingAnimation /> 
                    <div className="external-link-container">
                        <div className='to-resume'>
                            <a href="https://drive.google.com/file/d/1u8M_PvPomk0TvB79zDL2HcaC-Er3rmZN/view?usp=sharing" target="_blank" rel="noopener noreferrer">
                                <button>Resume</button>
                            </a>
                        </div>
                        <div className='external-links'>
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
                </div>  
                <div className="home-image">
                    <div className="home-image-container">
                        <img src={bitmoji} alt="bitmoji" className="bitmoji" />
                    </div>
                </div> 
            </div>
        </div>
    );
}

export default Home;
