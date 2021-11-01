require('dotenv').config();

//console.log(process.env.JWT_SECRET);

const PORT = 3000;
const express = require('express');
const server = express();  // root server
const { client } = require('./db');                  // connecting to database
client.connect();

//===================== token verifier =====================================================
// server.use(async (req, res, next) => {
//   const prefix = 'Bearer '
//   const auth = req.headers['Authorization'];
//   if (!auth) {
//     next(); // don't set req.user, no token was passed in
//   }
//   if (auth.startsWith(prefix)) {
//     // recover the token
//     const token = auth.slice(prefix.length);   // remove the bearer and space
//     try {
//       // recover the data
//       const { id } = jwt.verify(data, 'secret message');
//       // get the user from the database
//       const user = await getUserById(id);    // get user 
//       // note: this might be a user or it might be null depending on if it exists
//       // attach the user and move on
//       req.user = user;    // stores found user into request bc everytime you request a user, it can use this copy
//       next();
//     } catch (error) {
//       // there are a few types of errors here
//     }
//   }
// })




// =====================================================



server.listen(PORT, () => {
  console.log('The server is up on port', PORT)
});

// use npm run start:dev to run the router files


// write functions that need to be run in general/ aka middleware
const apiRouter = require('./api');     // need to import it in order to use it here when server gets to /api
server.use('/api', apiRouter);


const morgan = require('morgan');
server.use(morgan('dev'));    // morgan tells us the command get,push,post that the client is using to request data
server.use(express.json());   // the client needs to request to api with "Content-Type: application/json"
// express.json converts the incoming data into json objects

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

