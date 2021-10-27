const PORT = 3000;
const express = require('express');
const server = express();  // root server

server.listen(PORT, () => {
  console.log('The server is up on port', PORT)
});

// use npm run start:dev to run the router files


// write functions that need to be run in general/ aka middleware
const apiRouter = require('./api');
server.use('/api', apiRouter);


const morgan = require('morgan');
server.use(morgan('dev'));    // morgan tells us the command that the client is using the request data

server.use(express.json())   // the client needs to request to api with "Content-Type: application/json"


// server.use assigns the routing job to api/apirouter

// server.use means ALWAYS used this function
// req: object from the client request
// res: object with methods to create response
// next: function to send computer to next middleware
server.use((req, res, next) => {
    console.log("<____Body Logger START____>");
    console.log(req.body);   // this is the body coming in the from http request with req
    console.log("<_____Body Logger END_____>");
  
    next();
  });

