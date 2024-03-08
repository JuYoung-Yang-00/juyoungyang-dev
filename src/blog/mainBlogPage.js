import React, { useState, useEffect } from 'react';
import Graph from '../components/animations/Graph';
import BlogHeader from './blogheader';
import BlogFooter from './blogfooter';
import { Link } from 'react-router-dom';
import './blog.css';

function MainBlog() {
  const [allPosts, setAllPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [filter, setFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/metadata.json`)
      .then(response => response.json())
      .then(data => {
        setAllPosts(data); 
        setFilteredPosts(data); 
      })
      .catch(error => console.error("Failed to fetch posts metadata:", error));
  }, []);

  useEffect(() => {
    let posts = allPosts;

    if (filter) {
      posts = posts.filter(post => post.category === filter);
    }

    if (searchQuery) {
      const searchTerms = searchQuery.toLowerCase().split(' ');
      posts = posts.filter(post =>
        searchTerms.every(term =>
          post.title.toLowerCase().includes(term) ||
          (post.subtitle && post.subtitle.toLowerCase().includes(term)) ||
          post.category.toLowerCase().includes(term)
        )
      );
    }

    posts.sort((a, b) => b.id - a.id);

    setFilteredPosts(posts);
  }, [filter, searchQuery, allPosts]);

  const handleCategoryChange = (category) => {
    setFilter(category);
  };

  return (
    <div className='main-blog-section'>
      <Graph />
      <BlogHeader />
      <div className='main-blog-container'>
        <h1>Blog Home</h1>
        <div className='search-and-filter'>
          <div className='search-bar-container'>
            <input
              type="text"
              placeholder="Search posts"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-bar"
            />
          </div>
          <div className='filter-container'>
            <p>Filter by Category:</p>
            <button onClick={() => handleCategoryChange('AI & ML')}>AI & ML</button>
            <button onClick={() => handleCategoryChange('Programming')}>Programming</button>
            <button onClick={() => handleCategoryChange('Random')}>Random</button>
            <button onClick={() => handleCategoryChange('')}>All</button>
          </div>
        </div>
        <div className="blog-posts">
          {filteredPosts.map((post) => (
            <div key={post.id} className="post">
              <Link to={`/blog/${post.id}`}>
                <div className='post-info-container'>
                  <h2>{post.title}</h2>
                  <h3>{post.subtitle}</h3>
                  <p>{`${post.category} - ${post.date}`}</p>
                </div>
                <div className='post-image-container'>
                  {post.image && <img src={post.image} alt="Post preview"/>}
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
      <BlogFooter />
    </div>
  );
}

export default MainBlog;
