import React from 'react';
import writing_svg from '../assets/writing.svg';
import { Link } from 'react-router-dom'; 
import preview1 from '../assets/img/data-splitting-1.png';


function Blog() {
    return (
        <div id="blog" className="section-content blog-section">
            <div className='blog-container'>
                <div className='blog-content'>
                    <h1>Blog</h1>
                    {/* <i> More blog posts will be uploaded soon! </i> */}
                    {/* link to the main blog page here */}
                    <Link to="/blog" className="blog-main-page-link"> Blog Page</Link>
                    <div className='blog-post-container'>
                        <Link to={`/blog/240306`}>
                            <div className='blog-preview-container'> 
                                <div className='blog-preview-text-container'>
                                    <h2> Test, Train, & Validation Dataset </h2>
                                    <h3> Understanding the basics of dataset splitting </h3>
                                    <p> AI & ML - 2024-03-06</p>
                                </div>
                                <div className='blog-preview-image-container'>
                                    <img src={preview1} alt="preview" className="preview-image"/>
                                </div>
                                
                            </div>                       
                        </Link>
                        <Link to={`/blog`}>
                            <div className='blog-preview-container'> 
                                <i> 
                                <    img src={writing_svg} alt="writing" className="writing" />
                                    on the way...
                                 </i>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Blog;
