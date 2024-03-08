import React, { useState, useEffect } from 'react';
import './TypingAnimation.css';

const TypingAnimation = () => {
  const phrases = ["Full-Stack Development", "Artificial Intelligence Research"];
  const [index, setIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isTyping) {
        const currentPhrase = phrases[index];
        setDisplayedText(currentPhrase.substring(0, displayedText.length + 1));
        if (displayedText === currentPhrase) {
          setIsTyping(false);
          setTimeout(() => setIsTyping(false), 1000); 
        }
      } else {
        setTimeout(() => {
          setDisplayedText(displayedText.substring(0, displayedText.length - 1));
          if (displayedText === '') {
            setIndex((index + 1) % phrases.length);
            setIsTyping(true);
          }
        }, 30); 
      }
    }, 60); 
    
    return () => clearInterval(interval);
  }, [index, displayedText, isTyping, phrases]);

  return <b className="typing-text">I am into <span className="highlight">{displayedText}</span></b>;
};

export default TypingAnimation;
