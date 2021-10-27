// this file will pull all the routers (users, posts, tags) 
// and make them available
// for the root index file


const express = require('express');
const apiRouter = express.Router();   // this sets up the "forks in the road" of url paths

const usersRouter = require('./users');
apiRouter.use('/users', usersRouter);   // if /users, send request to usersRouter

module.exports = apiRouter;

