import "./index.css";
import Home from "./components/home";
import About from "./components/about";
import Projects from "./components/projects";
import Contact from "./components/contact";
import Footer from "./components/footer";
import Header from './components/header';
import Blog from './components/blog';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; 
import MainBlog from './blog/mainBlogPage';
import BlogPostTemplate from './blog/blogPostTemplate'; 

function App() {

  console.log('The PUBLIC_URL is:', process.env.PUBLIC_URL);

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={
            <>
              <Header />
              <Home />
              <About />
              <Projects />
              {/* <Blog /> */}
              <Contact />
              <Footer />
            </>
          } />
          <Route path="/blog" element={<MainBlog />} />
          <Route path="/blog/:postId" element={<BlogPostTemplate />} /> 
        </Routes>
      </Router>
    </div>
  );
}

export default App;

