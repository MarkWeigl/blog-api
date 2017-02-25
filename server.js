const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const {PORT, DATABASE_URL} = require('./config');
const {Blog} = require('./models');
const router = express.Router();
const jsonParser = bodyParser.json();
const app = express();
app.use(bodyParser.json());

mongoose.Promise = global.Promise;

Blog.create({title: 'Test',content: 'this is a test',author: 'Mark Weigl',created: '01/31/17'},
  function(err, entry){
    if(err){
      console.log(err);
    }
    else {
      console.log(entry);
    }

});

//Blog.create('Test 2', 'This is second blog post', 'Mark Weigl', '01/31/17');
//Blog.create('Test 3', 'This is our third blog post', 'Mark Weigl', '1/31/17');

app.get('/posts', (req, res) => {
  Blog
    .find()
    // we're limiting because restaurants db has > 25,000
    // documents, and that's too much to process/return
    .exec()
    // success callback: for each restaurant we got back, we'll
    // call the `.apiRepr` instance method we've created in
    // models.js in order to only expose the data we want the API return.
    .then(blog => {
      res.json(blog);
      
      //  blog: blog.map(
        //  (entries) => entries.apiRepr())
      //});
    })
    .catch(
      err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
    });
});

app.get('/posts/:id', (req, res) => {
  Blog
    .findById(req.params.id)
    // we're limiting because restaurants db has > 25,000
    // documents, and that's too much to process/return
    .exec()
    // success callback: for each restaurant we got back, we'll
    // call the `.apiRepr` instance method we've created in
    // models.js in order to only expose the data we want the API return.
    .then(blog => {
      res.json(blog);
      
      //  blog: blog.map(
        //  (entries) => entries.apiRepr())
      //});
    })
    .catch(
      err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
    });
});

app.post('/posts', jsonParser, (req, res) => {
  const requiredFields = ['title', 'content', 'author', 'created'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }
   
   Blog
    .create({
      title: req.body.title,
      content: req.body.content,
      author: req.body.author,
      created: req.body.created
    })
    .then(blogPost => res.status(201).json(blogPost.apiRepr()))
    .catch(err => {
        console.error(err);
        res.status(500).json({error: 'Unable to post'});
    });

});

app.delete('/posts/:id', (req, res) => {
  Blog
    .findByIdAndRemove(req.params.id)
    .exec()
    .then(() => {
      res.status(204).json({message: 'Removed'});
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'Unable to remove'});
    });
});


app.put('/posts/:id', jsonParser, (req, res) => {
  const requiredFields = ['title', 'content', 'author', 'created'];
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
  
  const updated = {};
  const updateableFields = ['title', 'content', 'author', 'created'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  Blog
    .findByIdAndUpdate(req.params.id, {$set: updated}, {new: true})
    .exec()
    .then(updatedPost => res.status(200).json(updatedPost.apiRepr()))
    .catch(err => res.status(500).json({message: 'Error encountered'}));
});

//app.listen(8080);

// closeServer needs access to a server object, but that only
// gets created when `runServer` runs, so we declare `server` here
// and then assign a value to it in run
let server;

// this function connects to our database, then starts the server
function runServer(databaseUrl=DATABASE_URL, port=PORT) {

  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
function closeServer() {
  return mongoose.disconnect().then(() => {
     return new Promise((resolve, reject) => {
       console.log('Closing server');
       server.close(err => {
           if (err) {
               return reject(err);
           }
           resolve();
       });
     });
  });
}

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
  runServer().catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};
