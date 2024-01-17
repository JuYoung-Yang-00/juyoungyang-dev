import React, { useState } from 'react';
import FlutterIcon from '../assets/flutter.png';
import MongoDBIcon from '../assets/MongoDB.png';
import NextIcon from '../assets/nextjs.svg';
import PythonIcon from '../assets/python.png';
import PytorchIcon from '../assets/pytorch.svg';
import OpenAIIcon from '../assets/openai.png';
import ProjectModal from './projectmodal';

const projectsData = [
    {
      title: 'Earth Street Journal',
      subtitle: 'Climate Advocacy Platform',
      icons: [PythonIcon, FlutterIcon, MongoDBIcon, OpenAIIcon],
      description: 'In support of the pressing need to address climate change, I aimed to raise and expand awareness on critical climate-related issues, news, and topics through this project. Recognizing the importance of delivering information in a digestible format, this project stands out in ensuring that users receive climate information without the burden of dense, heavy reading.',
      details: [
        'Building this project, I utilized LLM to ensure the optimal balance between readability and user engagement. My goal was to present information that\'s easy-to-read, quick to grasp, and free from unnecessary complexities.',
        'Developed a REST API specifically tailored for Flutter integration. This was paired with MongoDB, establishing a foundation for user management and article curation.',
        'Not just stopping at integration, this project delved deeper into the GPT model. By creating a tailored training and validation dataset, the quality of the GPT\'s summarization was significantly enhanced, ensuring consistent, high-quality article summaries for the users.',
        'Implemented OAuth2.0 to fortify platform security and bolster user trust. This ensures the platform\'s readiness for scalability, allowing room for the inclusion of user-friendly features in the future.'
      ],
      githubRepo: 'https://github.com/JuYoung-Yang-00/earthstreetjournal'
    },
    {
      title: 'Bulk Buy Buddies',
      subtitle: 'Costco Family-Friendly Shopping Assistant',
      icons: [NextIcon, PythonIcon, MongoDBIcon],
      description: 'Addressing the unique needs of smaller families shopping at Costco, this web-application makes bulk purchasing experience easier. By providing a solution-centric approach, the platform simplifies the decision-making process, ensuring smaller families can make the most out of their Costco shopping trips without the hassle of over-purchasing.',
      details: [
        'Leveraged the power of MongoDB for streamlined management of user data, store locations, and product inventories. This ensures that users receive up-to-date information, enhancing their shopping efficiency.',
        'Introduced product recommendation feature, ensuring users discover products that align with their preferences and needs. This feature not only enhances the user experience but also maximizes the value of each shopping trip.',
        'Incorporated the Google Maps API to offer location-specific services. Whether it\'s finding the nearest Costco store or navigating through its vast aisles, users can rely on the platform for an easy and convenient shopping experience.'
      ],
      githubRepo: 'https://github.com/wgdevworld/bulk-buy-buddies'
    },
    {
      title: 'MID-FiLD',
      subtitle: 'MID-FiLD: MIDI Dataset for Fine-Level Dynamics',
      icons: [PythonIcon, PytorchIcon],
      description: 'Following my internship in summer 2022 at POZAlabs, a South Korean startup specializing in automatic background-music generation, I was invited to partner with the researchers at the startup in writing the paper. Our goal was to address a significant gap in the research area; MID-FiLD is dedicated to capturing the nuanced musical dynamics, which are pivotal in producing music that resonates with human-composed pieces.',
      details: [
        'MID-FiLD stands out with its custom annotations, specifically targeting musical dynamics like modulation.',
        'Our efforts culminated in 80% success rate in the valence mood classification task using SVM. The paper was submitted to AAAI 2023 conference in August. As of November 1st, 2023, we are in the process of rebuttal prior to decision on final acceptance.'
      ],
      githubRepo: ''
    },
    {
      title: 'Pacman',
      subtitle: 'AI Search Algorithms for Pacman Game',
      icons: [PythonIcon],
      description: 'In this project, I leveraged foundational search algorithms like breadth-first-search (BFS), depth-first-search (DFS), uniform-cost-search, and A*. Grasping foundational algorithms is crucial in gaining a better understanding of graph theory and the basics of AI. Through this project, I deepened my understanding of these principles, enhancing both my theoretical knowledge and practical application.',
      details: [
        'Grasping foundational algorithms is crucial in gaining a better understanding of graph theory and the basics of AI. Through this project, I deepened my understanding of these principles, enhancing both my theoretical knowledge and practical application.',
        'Through these adaptations and customizations, the algorithms demonstrated a 90% win-rate across various game objectives.'
      ],
      githubRepo: 'https://github.com/JuYoung-Yang-00/Search-Pacman'
    },
  ];
  

const iconClassMapping = {
    [PythonIcon]: 'PythonIcon',
    [FlutterIcon]: 'FlutterIcon',
    [MongoDBIcon]: 'MongoDBIcon',
    [OpenAIIcon]: 'OpenAIIcon',
    [NextIcon]: 'NextIcon',
    [PytorchIcon]: 'PytorchIcon',
  };
  
function Projects() {
    const [selectedProject, setSelectedProject] = useState(null);

    const handleProjectClick = (project) => {
        setSelectedProject(project);
    }

    const handleCloseModal = () => {
        setSelectedProject(null);
    }

    return (
        <div id="projects" className="section-content projects-section">
            <h2>Projects</h2>
    
            {projectsData.map((project, index) => (
                <div className="project-card" key={index} onClick={() => handleProjectClick(project)}>
                    <h3>{project.title}</h3>
                    <div className="project-icons">
                        {project.icons.map((icon, iconIndex) => {
                            const iconName = iconClassMapping[icon];
                            return (
                                <img 
                                    key={iconIndex} 
                                    className={`modal-icon ${iconName}`} 
                                    src={icon} 
                                    alt={project.title} 
                                />
                            );
                        })}
                    </div>
                </div>
            ))}
    
            {selectedProject && <ProjectModal project={selectedProject} onClose={handleCloseModal} />}
        </div>
    );
}

export default Projects;
