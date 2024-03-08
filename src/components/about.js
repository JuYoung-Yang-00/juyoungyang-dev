import React from 'react';
import profile from '../assets/profile.jpg';
import python from '../assets/icons/python.svg';
import pytorch from '../assets/icons/pytorch.svg';
import tensorflow from '../assets/icons/tensorflow.svg';
import scikitlearn from '../assets/icons/scikitlearn.svg';
import pandas from '../assets/icons/pandas.svg';
import huggingface from '../assets/icons/huggingface.svg';
import git from '../assets/icons/git.svg';
import reactIcon from '../assets/icons/react.svg';
import nextjs from '../assets/icons/nextjs.svg';
import nodejs from '../assets/icons/nodejs.svg';
import flask from '../assets/icons/flask.svg';
import mongodb from '../assets/icons/mongodb.svg';
import sql from '../assets/icons/sql.svg';
import aws from '../assets/icons/aws.svg';


const About = () => {
    return (
      <div id="about" className="section-content about-section">
          <div className="about-container">
            <h1> About Me</h1>
            <div className="about-content">
              <div className='about-image-container'>
                <img src={profile} alt="profile" className="about-image" />
              </div>
              <div className='about-text'>
                <h2> I'm <b>Justin</b></h2>
                <h3> Full Stack Developer / AI Researcher </h3>
                <p>
                I'm an incoming graduate from Duke University with a major in Computer Science.
                I value constant growth, and I always seek to demonstrate the synergy
                of knowledge and passion across my work ethics and personal life.
                </p>
              </div>

            </div>
            <div className="about-skills">
              <h2> Technology Box </h2>
              <div className="technology-box">
                <img src={python} alt="python" className="python-icon" />
                <img src={pytorch} alt="pytorch" className="pytorch-icon" />
                <img src={tensorflow} alt="tensorflow" className="tensorflow-icon" />
                <img src={scikitlearn} alt="scikitlearn" className="scikitlearn-icon" />
                <img src={pandas} alt="pandas" className="pandas-icon" />
                <img src={huggingface} alt="huggingface" className="huggingface-icon" />
                <img src={git} alt="git" className="git-icon" />
                <img src={reactIcon} alt="react" className="react-icon" />
                <img src={nextjs} alt="nextjs" className="nextjs-icon" />
                <img src={nodejs} alt="nodejs" className="nodejs-icon" />
                <img src={flask} alt="flask" className="flask-icon" />
                <img src={mongodb} alt="mongodb" className="mongodb-icon" />
                <img src={sql} alt="sql" className="sql-icon" />
                <img src={aws} alt="aws" className="aws-icon" />
              </div>
            </div>
        </div>
      </div>
    );
}

export default About;
