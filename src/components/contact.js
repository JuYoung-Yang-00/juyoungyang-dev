import React from 'react';
import linkedin from '../assets/linkedin.svg';
import github from '../assets/github.svg';

function Contact() {
    const [message, setMessage] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [name, setName] = React.useState("");
    const [sent, setSent] = React.useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch("https://api.juyoungyang.dev/send-email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, email, message }),
        });
        if (response.ok) {
            setSent(true);
            setMessage("");
            setEmail("");
            setName("");
        }
    };

    return (
        <div id="contact" className="section-content contact-section">
            <div className='contact-container'>
                <h2>Contact</h2>
                <div className='contact-content'>
                    <div className='contact-form'>
                        <h3> Connect with Me </h3>
                        <p> 
                            If you want to know more about me, or if you would just 
                            <br />
                            like to say hello, send me a message. I'd love to hear from you!
                        </p>
                        {sent ? (
                            <div className="thanks-message">Thank you for your message!</div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <p>Name</p>
                                <input 
                                    type="text" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your Full Name" 
                                    required 
                                />
                                <p>Email</p>
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Your Email" 
                                    required 
                                />
                                <p>Message</p>
                                <textarea 
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Your Message" 
                                    required 
                                ></textarea>
                                <p className="email-info">Your message sent to: jyy@juyoungyang.dev</p>
                                <button type="submit">Send</button>
                            </form>
                        )}
                    </div>
                    <div className="contact-details">
                        <div className='contact-details-container'>
                        <h3>Email</h3>
                        <p>jyy@juyoungyang.dev</p>                    
                        </div>
                        
                        <div className='social-container'>
                            <h3>Social</h3>
                            <div className='social-icons'>
                                <a href="https://github.com/juyoung-yang-00" target="_blank" rel="noreferrer">
                                    <img src={github} alt="Github" />
                                </a>
                                <a href="https://www.linkedin.com/in/juyoung-yang/" target="_blank" rel="noreferrer">
                                    <img src={linkedin} alt="LinkedIn" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Contact;
