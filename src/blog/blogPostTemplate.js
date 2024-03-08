import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

import Graph from '../components/animations/Graph';
import PostHeader from './postheader';
import BlogFooter from './blogfooter';





const BlogPostTemplate = () => {
  const { postId } = useParams(); 
  const [postMetadata, setPostMetadata] = useState({
    title: '',
    subtitle: '',
    category: '',
    date: '',
    imageSrc: '',
  });
  const [postContent, setPostContent] = useState('');

  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/posts/${postId}.md`)
      .then(response => response.text())
      .then(text => {
        const lines = text.split('\n');
        let metadata = {
          title: '',
          subtitle: '',
          category: '',
          date: '',
          imageSrc: '',
        };
        let contentStartIndex = 0;

        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith('# ')) {
            metadata.title = lines[i].substring(2).trim();
          } else if (lines[i].startsWith('## ')) {
            metadata.subtitle = lines[i].substring(3).trim();
          } else if (lines[i].startsWith('Category: ')) {
            const categoryDateLine = lines[i].split('|');
            metadata.category = categoryDateLine[0].split(':')[1].trim();
            metadata.date = categoryDateLine[1].split(':')[1].trim();
          } else if (lines[i].startsWith('![')) {
            metadata.imageSrc = lines[i].match(/\((.*?)\)/)[1];
          } else if (!lines[i].startsWith('![') && lines[i].trim() !== '') {
            contentStartIndex = i;
            break;
          }
        }

        // Set parsed metadata and content
        setPostMetadata(metadata);
        // The content is everything after the metadata lines
        setPostContent(lines.slice(contentStartIndex).join('\n'));
      })
      .catch(err => console.error("Error fetching post:", err));
  }, [postId]);

  return (

    <div className='blog-post-section'>
      <Graph />
      <PostHeader />
      <Link to="/blog" className="blog-link">←</Link>
      <div className='post-container'>
        <article className='article'>
          <h1>{postMetadata.title}</h1>
          <h2>{postMetadata.subtitle}</h2>
          <div className='article-meta'>{`${postMetadata.category} | ${postMetadata.date}`}</div>
          {postMetadata.imageSrc && <img src={postMetadata.imageSrc} alt="Post" />}
          <ReactMarkdown children={postContent} remarkPlugins={[remarkGfm]} />
        </article>
      </div>
      <BlogFooter />
    </div>
  );
};

export default BlogPostTemplate;

