import React, { useState } from 'react';
import { motion } from 'framer-motion'; 
import not_uber_img from '../assets/img/not-uber.png';
import esj_img from '../assets/img/esj.png';
import bbb_img from '../assets/img/bbb.png';
import mid_fild_img from '../assets/img/mid-fild.png';
import pca_img from '../assets/img/pca.png';
import recurrent_transformer_img from '../assets/img/recurrent-transformer.png';
import link_svg from '../assets/link.svg';
import github_svg from '../assets/github.svg';

function Projects() {
    const [hoverStates, setHoverStates] = useState({});

    const handleMouseEnter = (id) => {
        setHoverStates({ ...hoverStates, [id]: true });
    };

    const handleMouseLeave = (id) => {
        setHoverStates({ ...hoverStates, [id]: false });
    };

    const contentVariants = {
        hidden: { y: 100, opacity: 0 },
        visible: { y: 0, opacity: 1 },
    };

    const enmaoDiaoUrl = "https://diaoenmao.com/"

    return (
        <div id="projects" className="section-content projects-section">
          <div className="projects-container">
            <h2>Projects</h2>
            <div id="Projects" className='project-cards'>
                <div
                    id="not-uber"
                    className="project-card"
                    onMouseEnter={() => handleMouseEnter("not-uber")}
                    onMouseLeave={() => handleMouseLeave("not-uber")}
                >
                    <img className="not-uber-img" src={not_uber_img} alt="Not Uber" />
                    <h3>Not Uber</h3>
                    {hoverStates["not-uber"] && (
                        <motion.section
                            className='project-content'
                            initial="hidden"
                            animate="visible"
                            variants={contentVariants}
                            transition={{ duration: 1 }} 
                        >
                            <h4>Not Uber</h4>
                            <i>
                                Python, Graph Theory, Search Algorithms
                            </i>
                            <p>
                                Not Uber is an academic project that simulate Manhattan using a graph-based model with
                                over 50,000 nodes, 2,000 passengers, and 200 drivers to optimize driver-passenger matching.
                                A variety of event-driven decision algorithms (A*, Dijkstra's, Floyd-Warshall) was used
                                to minimize passenger wait and travel time and maximize driver profit. 
                            </p>
                            <section className="project-buttons">
                                {/* <a href="https://apple.com" target="_blank" rel="noopener noreferrer">
                                    <img src={link_svg} alt="Link Icon" />
                                </a> */}
                                <a href="https://github.com/JuYoung-Yang-00/case-study-Not-Uber" target="_blank" rel="noopener noreferrer">
                                    <img src={github_svg} alt="Github Icon" />
                                </a>
                            </section>
                        </motion.section>
                    )}
                </div>
                <div
                    id="esj"
                    className="project-card"
                    onMouseEnter={() => handleMouseEnter("esj")}
                    onMouseLeave={() => handleMouseLeave("esj")}
                >
                    <img className="esj-img" src={esj_img} alt="esj" />
                    <h3>Earth Street Journal</h3>
                    {hoverStates["esj"] && (
                        <motion.section
                            className='project-content'
                            initial="hidden"
                            animate="visible"
                            variants={contentVariants}
                            transition={{ duration: 1 }} 
                        >
                            <h4>Earth Street Journal</h4>
                            <i>
                                Flask, Flutter, MongoDB, OpenAI fine-tuning
                            </i>
                            <p>
                                Earth Street journal is a web-application that scrapes environmental news articles summarizes them.
                                Backend API was built using Flask and MongoDB to handle scraping, summarization, and user data. GPT 3.5-turbo model was 
                                fine-tuned with custom training and validation dataset to enhance data consistency and summarization quality.
                            </p>
                            <section className="project-buttons">
                                {/* <a href="https://google.com" target="_blank" rel="noopener noreferrer">
                                    <img src={link_svg} alt="Link Icon" />
                                </a> */}
                                <a href="https://github.com/JuYoung-Yang-00/earthstreetjournal" target="_blank" rel="noopener noreferrer">
                                    <img src={github_svg} alt="Github Icon" />
                                </a>
                            </section>
                        </motion.section>
                    )}
                </div>
                <div
                    id="bbb"
                    className="project-card"
                    onMouseEnter={() => handleMouseEnter("bbb")}
                    onMouseLeave={() => handleMouseLeave("bbb")}
                >
                    <img className="bbb-img" src={bbb_img} alt="bbb" />
                    <h3>Bulk Buy Buddies</h3>
                    {hoverStates["bbb"] && (
                        <motion.section
                            className='project-content'
                            initial="hidden"
                            animate="visible"
                            variants={contentVariants}
                            transition={{ duration: 1 }} 
                        >
                            <h4>Bulk Buy Buddies</h4>
                            <i>
                                Flask, Flutter, MongoDB, OpenAI fine-tuning
                            </i>
                            <p>
                                Bulk Buy Buddies is a web-application built simplify bulk purchase decisions by matching Costco customers 
                                who wish to split purchased items. Backend was built with Flask and MongoDB to handle user, store location, product data, 
                                and product inventories. Frontend was built with Next.js. 
                            </p>

                            <section className="project-buttons">
                                {/* <a href="https://google.com" target="_blank" rel="noopener noreferrer">
                                    <img src={link_svg} alt="Link Icon" />
                                </a> */}
                                <a href="https://github.com/wgdevworld/bulk-buy-buddies" target="_blank" rel="noopener noreferrer">
                                    <img src={github_svg} alt="Github Icon" />
                                </a>
                            </section>
                        </motion.section>
                    )}
                </div>
                <div
                    id="mid-fild"
                    className="project-card"
                    onMouseEnter={() => handleMouseEnter("mid-fild")}
                    onMouseLeave={() => handleMouseLeave("mid-fild")}
                >
                    <img className="mid-fild-img" src={mid_fild_img} alt="mid-fild" />
                    <h3>MID-FiLD</h3>
                    {hoverStates["mid-fild"] && (
                        <motion.section
                            className='project-content'
                            initial="hidden"
                            animate="visible"
                            variants={contentVariants}
                            transition={{ duration: 1 }} 
                        >
                            <h4>MID-FiLD: MIDI Dataset for Fine-Level Dynamics</h4>
                            <i>
                                Flask, Flutter, MongoDB, OpenAI fine-tuning
                            </i>
                            <p>
                                MID-FiLD is a research paper I worked on with ML Team at POZalabs. MID-FiLD aims to enhance 
                                dynamics in music generation by using annotated data (cc#1 value in the modulation wheel).
                                I conducted EDA and valence mood classification task using SVM. Paper is accepted to AAAI 2023.
                            </p>
                            <section className="project-buttons">
                                <a href="https://juyoung-yang-00.github.io/paper/MID-FiLD.pdf" target="_blank" rel="noopener noreferrer">
                                    <img src={link_svg} alt="Link Icon" />
                                </a>
                                <a href="https://github.com/JuYoung-Yang-00/MID-FiLD_demo" target="_blank" rel="noopener noreferrer">
                                    <img src={github_svg} alt="Github Icon" />
                                </a>
                            </section>
                        </motion.section>
                    )}
                </div>
                <div
                    id="stock"
                    className="project-card"
                    onMouseEnter={() => handleMouseEnter("stock")}
                    onMouseLeave={() => handleMouseLeave("stock")}
                >
                    <img className="pca_image" src={pca_img} alt="stock" />
                    <h3>S&P500 vs Crypto</h3>
                    {hoverStates["stock"] && (
                        <motion.section
                            className='project-content'
                            initial="hidden"
                            animate="visible"
                            variants={contentVariants}
                            transition={{ duration: 1 }} 
                        >
                            <h4>S&P500 vs Crypto</h4>
                            <i>
                                Flask, Flutter, MongoDB, OpenAI fine-tuning
                            </i>
                            <p>
                                S&P500 vs Crypto is a project aimed to predict the Monday opening value of S&P 500
                                based on Crypto market data over the weekend. Major cryptocurrencies were set as
                                independent binary variables and logistic regression was used for prediction. prediction
                                accuracy was improved by 7.5% from 64.9% to 72.4% by using PCA to reduce dimensionality.
                            </p>
                            <section className="project-buttons">
                                <a href="https://juyoung-yang-00.github.io/paper/S&P500vsCrypto.pdf" target="_blank" rel="noopener noreferrer">
                                    <img src={link_svg} className='Link' alt="Linkedin Icon" />
                                </a>
                                <a href="https://github.com/JuYoung-Yang-00/stock_bitcoin" target="_blank" rel="noopener noreferrer">
                                    <img src={github_svg} className="github_icon" alt="Github Icon" />
                                </a>
                            </section>

                        </motion.section>
                    )}
                </div>
                <div
                    id="recurrent-transformer"
                    className="project-card"
                    onMouseEnter={() => handleMouseEnter("recurrent-transformer")}
                    onMouseLeave={() => handleMouseLeave("recurrent-transformer")}
                >
                    <img className="recurrent-transformer-img" src={recurrent_transformer_img} alt="recurrent-transformer" />
                    <h3>Recurrent Transformer</h3>
                    {hoverStates["recurrent-transformer"] && (
                        <motion.section
                            className='project-content'
                            initial="hidden"
                            animate="visible"
                            variants={contentVariants}
                            transition={{ duration: 1 }} 
                        >
                            <h4>Recurrent Transformer</h4>
                            <i>
                                Flask, Flutter, MongoDB, OpenAI fine-tuning
                            </i>
                            <p>
                                Recurrent Transformer is a current project I am working on with {' '}
                                <a href={enmaoDiaoUrl}> PostDoc Researcher at Duke</a>. I am currently focused on
                                studying relevant literatures on topics including RetNET, Mamba, and RoPE.
                            </p>
                            <section className="project-buttons">
                                {/* <a href="https://github.com/Collaborative-AI" target="_blank" rel="noopener noreferrer">
                                    <img src={link_svg} alt="Link Icon" />
                                </a> */}
                                <a href="https://github.com/Collaborative-AI" target="_blank" rel="noopener noreferrer">
                                    <img src={github_svg} alt="Github Icon" />
                                </a>
                            </section>
                        </motion.section>
                    )}
                </div>
            </div>
          </div>
        </div>
    );
}

export default Projects;
