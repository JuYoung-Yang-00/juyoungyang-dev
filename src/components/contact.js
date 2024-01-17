import React from 'react';

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
            <h2>Contact Me</h2>
            {sent ? (
                <div className="thanks-message">Thank you for your message!</div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your Full Name" 
                        required 
                    />
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Your Email" 
                        required 
                    />
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
            <div className="contact-details">
                <div className="cv-button">
                    <a href="https://drive.google.com/file/d/1U_0oxpZr2tBe_fbcIi9syGGs39KFUMPJ/view?usp=sharing" target="_blank">View my CV</a>
                </div>
            </div>
        </div>
    );
}

export default Contact;
