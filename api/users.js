const express = require('express');
const usersRouter = express.Router();
// this will fire when we arrive at /users


usersRouter.use((req, res, next) => {
  console.log("A request is being made to /users");

  res.send({ message: 'hello from /users!' });   // do I keep this?
  next();         // add a new route to do next
});


usersRouter.get('/', (req, res) => {
    res.send({
        users:[]
    });
});

module.exports = usersRouter;