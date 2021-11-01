const express = require('express');
const postsRouter = express.Router();
const {getAllPosts, createPost, updatePost, getPostById } = require('../db');

const { requireUser } = require('./utils');


//============= route for creating post ===============
postsRouter.post('/', requireUser, async (req, res, next) => {
  const { title, content, tags = "" } = req.body;
  const tagArr = tags.trim().split(/\s+/)
  const postData = {title, content, authorId: req.user.id };
  // only send the tags if there are some to send
  if (tagArr.length) {
    postData.tags = tagArr;
  }
  try {
    const post = await createPost(postData);
    // this will create the post and the tags for us
    // if the post comes back, res.send({ post });
    if(post) {
      res.send({post});
    }
    else{ next( { message: "post cannot be created" }); }
    // otherwise, next an appropriate error object 
  } catch ({ name, message }) {
    next({ name, message });
  }
});

//============= route for updating post ==============

postsRouter.patch('/:postId', requireUser, async (req, res, next) => {
  const { postId } = req.params;
  const { title, content, tags } = req.body;
  const updateFields = {};
  if (tags && tags.length > 0) {
    updateFields.tags = tags.trim().split(/\s+/);
  }
  if (title) {
    updateFields.title = title;
  }
  if (content) {
    updateFields.content = content;
  }
  try {
    const originalPost = await getPostById(postId);
    if (originalPost.author.id === req.user.id) {
      const updatedPost = await updatePost(postId, updateFields);
      res.send({ post: updatedPost })
    } else {
      next({
        name: 'UnauthorizedUserError',
        message: 'You cannot update a post that is not yours'
      })
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});


// ============== route for deleting posts ======================================

postsRouter.delete('/:postId', requireUser, async (req, res, next) => {
  try {
    const post = await getPostById(req.params.postId);
    if (post && post.author.id === req.user.id) {
      const updatedPost = await updatePost(post.id, { active: false });
      res.send({ post: updatedPost });
    } else {
      // if there was a post, throw UnauthorizedUserError, otherwise throw PostNotFoundError
      next(post ? { 
        name: "UnauthorizedUserError",
        message: "You cannot delete a post which is not yours"
      } : {
        name: "PostNotFoundError",
        message: "That post does not exist"
      });
    }

  } catch ({ name, message }) {
    next({ name, message })
  }
});


//====================== rest of the code that grabs posts =======================


postsRouter.use((req, res, next) => {
    console.log("A request is being made to /posts");      // use the .use to see this
    //res.send({ message: 'hello from /users!' });   // do I keep this?
    next();         // add a new route to do next
  });
  
  
  postsRouter.get('/', async (req, res) => {
    try {
    const posts = await getAllPosts();            // run this function when the user arrives at this url
    // the array gets stored in here
    
    const posts = allPosts.filter(post => {
      // keep a post if it is either active, or if it belongs to the current user

       // the post is active, doesn't matter who it belongs to
        if (post.active) {
          return true;
        }

        // the post is not active, but it belogs to the current user
        if (req.user && post.author.id === req.user.id) {
          return true;
        }

        // none of the above are true
        return false;
          });
      res.send({ posts });      // res gives resulting/returns data to user, and then ends/doesnt do anything else
      // user data will populate here
  }
  catch ({ name, message }) {
    next({ name, message} );
  }
  });
  


module.exports = postsRouter;




