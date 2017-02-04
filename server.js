const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const jsonParser = bodyParser.json();
const app = express();

const {BlogPosts} = require('./models');

BlogPosts.create('Test', 'this is a test', 'Mark Weigl', '01/31/17');
BlogPosts.create('Test 2', 'This is second blog post', 'Mark Weigl', '01/31/17');
BlogPosts.create('Test 3', 'This is our third blog post', 'Mark Weigl', '1/31/17');

app.get('/blog-posts', (req, res) => {
  const posts = BlogPosts.get();
  if (posts) {
    res.status(200).json(posts);
  }
  else {
    res.status(404).send('No Blog Posts Found');
  }
});

app.post('/blog-posts', jsonParser, (req, res) => {
  const requiredFields = ['title', 'content', 'author', 'publishDate'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }
  const post = BlogPosts.create(req.body.title, req.body.content, req.body.author, req.body.publishDate);
  if (post) {
    res.status(201).json(post);
  }
  else {
    res.status(404).send('No Blog Posts Found');
  }
});

app.delete('/blog-posts/:id', (req, res) => {
  const deletedItem = BlogPosts.delete(req.params.id);
  console.log(`Blog Post Deleted\`${req.params.ID}\``);
    res.status(204).end();
  
});

app.put('/blog-posts/:id', jsonParser, (req, res) => {
  const requiredFields = ['title', 'content', 'author', 'publishDate'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }
  if (req.params.id !== req.body.id) {
    const message = (
      `Request path id (${req.params.id}) and request body id `
      `(${req.body.id}) must match`);
    console.error(message);
    return res.status(400).send(message);
  }
  console.log(`Update Blog Post \`${req.params.id}\``);
  const updatedItem = BlogPosts.update({
    id: req.params.id,
    title: req.body.title,
    content: req.body.content
    author: req.body.author
    publishDate: req.body.publishDate
  });
  if (updatedItem) {
    res.status(200).json(updatedItem);
  }
  else {
    res.status(500).send('Failed to update Blog Post');
  }
  
});

app.listen(8080);