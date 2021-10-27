// created user table already, seeding allows us to write out database in js and this will send it over to postgress
const { client, getAllUsers, createUser } = require('./index');    // grab the client from export in db index

//============= delete the current tables ==============================
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
  
  // =========== create all the users tables ===========================
  async function createTables() {      // creates the table, the users table
    try {         // format is create table with 3 columns in parentheses with fields and data types
      console.log("Starting to build tables...");
      // we dont need anything for active, will automatically be true, anytime theres a row itll say true
      await client.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          username varchar(255) UNIQUE NOT NULL,
          password varchar(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          location VARCHAR(255) NOT NULL,
          active BOOLEAN DEFAULT true
        );
      `);
      console.log("Finished building tables!");
    } catch (error) {
      console.error("Error building tables!");    // if the error populates this iwll "throw" the error with the message
      throw error; // we pass the error up to the function that calls createTables
    }
  }

//================= fill in the rows of the table =======================
  async function createInitialUsers() {        // fills in the rows with the create user function
    try {
      console.log("Starting to create users...");
      const albert = await createUser({ username: 'albert', password: 'bertie99', name: 'Al Bert', location: 'Sidney, Australia' });      // fill in with this information
      const sandra = await createUser({ username: 'sandra', password: 'imposter_albert', name: 'Just Sandra', location: 'Aint tellin' });
      const glamgal = await createUser({ username: 'glamgal', password: 'imposter_albert', name: 'Joshua', location: 'Upper East Side' });
      console.log(albert);
      console.log("Finished creating users!");
    } catch(error) {
      console.error("Error creating users!");
      throw error;
    }
  }

//====================== fun all the funcitons ==============================
  async function rebuildDB() {     // runs allthe previous functions
    try {
      client.connect();                  // this is where the client connection is started
      await dropTables();
      await createTables();
      await createInitialUsers();
    } catch (error) {
      throw(error);           // console.error(error) only prints it, throw will break out of the block
    } 
  }
  
//==========================is test db necessary? ==============================
  async function testDB() {       // the container function to run dtabase adapters (stuff in index file) see if they work
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

//================= do we need another rebuild db? =============================
// these are executed at the end, order matters here

rebuildDB()
  .then(testDB)
  .catch(console.error)              // catch any errors for running the entire process
  .finally(() => client.end());      // end the client at the end to the server




