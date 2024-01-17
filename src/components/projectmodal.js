import React from 'react';
import './projectmodal.css';
import GithubIcon from '../assets/github2.svg';

const iconClassMapping = {
  'MongoDB.png': 'modal-MongoDBIcon',
  'openai.png': 'modal-OpenAIIcon',
  'pytorch.svg': 'modal-PytorchIcon',
  'nextjs.svg': 'modal-NextIcon',
};


function ProjectModal({ project, onClose }) {
    if (!project) {
      return null;
    }
  
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose}>X</button>
          <h3>{project.title}</h3>
          <div className="modal-icons">
            {project.icons.map((icon, iconIndex) => {
              const filename = icon.split('/').pop();
              const modalIconClass = iconClassMapping[filename] || 'modal-icon';
              return (
                <img 
                  key={iconIndex} 
                  className={`modal-icon ${modalIconClass}`} 
                  src={icon} 
                  alt={`${filename.split('.')[0]} icon`} 
                />
              );
            })}
          </div>
          <h4>{project.subtitle}</h4>
          <p className="modal-description">{project.description}</p>
          <ul className="modal-details">
            {project.details && project.details.map((detail, detailIndex) => (
              <li key={detailIndex}>{detail}</li>
            ))}
          </ul>
          {project.githubRepo && (
            <div className="github-link">
              <a href={project.githubRepo} target="_blank" rel="noopener noreferrer">
                <img src={GithubIcon} alt="GitHub Repository" />
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  
  export default ProjectModal;