// created user table already, seeding allows us to write out database in js and this will send it over to postgress
const { client, getAllUsers, createUser } = require('./index');    // grab the client from export in db index


async function dropTables() {
    try {     // client.query is like using postgress terminal, grabbing something from the database
      console.log("Starting to drop tables...");

      await client.query(`  
      DROP TABLE IF EXISTS users;
      `);

      console.log("Finished dropping tables!");

    } catch (error) {
      console.error("Error dropping tables!");
      throw error; // we pass the error up to the function that calls dropTables
    }
  }
  
  // this function should call a query which creates all tables for our database 
  async function createTables() {      // creates the table
    try {         // format is create table with 3 columns in parentheses with fields and data types
      console.log("Starting to build tables...");

      await client.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          username varchar(255) UNIQUE NOT NULL,
          password varchar(255) NOT NULL
        );
      `);

      console.log("Finished building tables!");
    } catch (error) {
      console.error("Error building tables!");    // if the error populates this iwll "throw" the error with the message
      throw error; // we pass the error up to the function that calls createTables
    }
  }

  async function createInitialUsers() {        // fills in the rows
    try {
      console.log("Starting to create users...");
  
      const albert = await createUser({ username: 'albert', password: 'bertie99' });      // fill in with this information
      const sandra = await createUser({ username: 'sandra', password: 'imposter_albert' });
      const glamgal = await createUser({ username: 'glamgal', password: 'imposter_albert' });

      console.log(albert);
  
      console.log("Finished creating users!");
    } catch(error) {
      console.error("Error creating users!");
      throw error;
    }
  }

  
  async function rebuildDB() {     // runs allthe previous functions
    try {
      client.connect();
  
      await dropTables();
      await createTables();
      await createInitialUsers();
    } catch (error) {
      throw(error);           // console.error(error) only prints it, throw will break out of the block
    } 

  }
  

  async function testDB() {
    try {
        // client.connect();    // connect js to database, no need for this if you remove the finally

        //const {rows} = await client.query(`SELECT * FROM users;`);  // query the data from users table, query is promise so we need async await
        // this is coming from the root index file
        console.log("Starting to test database...");
        const users = await getAllUsers();        // save users as result of getAllUsers from index file, this connects to database

        console.log("getAllUsers:", users);   // print result
        console.log("Finished database tests!");

    }
    catch (error){
        console.error("Error testing database!");
        throw error;
    }

    // finally{
    //     client.end();     // close the client connection
    // }
}


// these are executed at the end, order matters here

rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end());




