const express = require('express');
const postsRouter = express.Router();
const {getAllTags, getPostsByTagName } = require('../db');

tagsRouter.use((req, res, next) => {
    console.log("A request is being made to /posts");      // use the .use to see this
    //res.send({ message: 'hello from /users!' });   // do I keep this?
    next();         // add a new route to do next
  });
 
  
  tagsRouter.get('/:tagName/posts', async (req, res, next) => {
    const { tagName } = req.params;
    try {
      // use our method to get posts by tag name from the db
      const result = await getPostsByTagName(tagName);
      // send out an object to the client { posts: // the posts }
      res.send({ posts: result })
    } catch ( { name, message } ) {
      // forward the name and message to the error handler
      next({
        name,
        message
      })
    }
  });
  

  tagsRouter.get('/', async (req, res) => {
    const posts = await getAllTags();            // run this function when the user arrives at this url
    // the array gets stored in here
  
  
      res.send({ "tags":[] });      // res gives resulting/returns data to user, and then ends/doesnt do anything else
      // user data will populate here
  });
  


module.exports = tagsRouter;