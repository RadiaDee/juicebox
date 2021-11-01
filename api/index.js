// this file will pull all the routers (users, posts, tags) 
// and make them available
// for the root index file
const jwt = require('jsonwebtoken');
const { getUserById } = require('../db');
const { JWT_SECRET } = process.env;


const express = require('express');   // api router is a file we created on express to send user to specific route
const apiRouter = express.Router();   // this sets up the "forks in the road" of url paths



// check the token and then ge that user
apiRouter.use(async (req, res, next) => {    // request (sent to the next middleware), response (sent to user), next
  const prefix = 'Bearer ';
  const auth = req.header('Authorization');
  if (!auth) { // nothing to see here, no need to set the user
    next();
  } else if (auth.startsWith(prefix)) {      // if its set, remove bearer and get token
    const token = auth.slice(prefix.length);
    try {
      const { id } = jwt.verify(token, JWT_SECRET);    // decrypt token
      if (id) {
        req.user = await getUserById(id);      // if the id is present, add user to req
        next();
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  } else {      
    next({            // otherwise, incorrect header information, send this to next
      name: 'AuthorizationHeaderError',
      message: `Authorization token must start with ${ prefix }`
    });
  }
});


apiRouter.use((req, res, next) => {
    if (req.user) {
      console.log("User is set:", req.user);
    }
  
    next();
  });
  


const usersRouter = require('./users');
apiRouter.use('/users', usersRouter);   // if /users, use the usersrouter which exists in /users

const postsRouter = require('./posts');
apiRouter.use('/posts', postsRouter);

const tagsRouter = require('./tags');
apiRouter.use('/tags', tagsRouter);

// errors come in as json object
apiRouter.use((error, req, res, next) => {
    res.send(error);
  });
  

module.exports = apiRouter;

