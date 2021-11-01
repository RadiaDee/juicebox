// created user table already, seeding allows us to write out database in js and this will send it over to postgress
const { client,
  createUser,
  updateUser,
  getAllUsers,
  getUserById,
  createPost,
  updatePost,
  getAllPosts,
  getAllTags,
  getPostsByTagName } = require('./index');    // grab the client from export in db index

//============= delete the current tables ==============================
async function dropTables() {
    try {     // client.query is like using postgress terminal, grabbing something from the database
      console.log("Starting to drop tables...");
      // if you drop table that doesnt exists itll error, we need IF EXISTS
      await client.query(`  
      DROP TABLE IF EXISTS post_tags;
      DROP TABLE IF EXISTS tags;
      DROP TABLE IF EXISTS users;
      DROP TABLE IF EXISTS posts;
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
      // connect to client and query, we await for all this to be entered into query
      await client.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          username varchar(255) UNIQUE NOT NULL,
          password varchar(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          location VARCHAR(255) NOT NULL,
          active BOOLEAN DEFAULT true
        );

        CREATE TABLE posts (
          id SERIAL PRIMARY KEY,
          "authorId" INTEGER REFERENCES users(id),
          title varchar(255) NOT NULL,
          content TEXT NOT NULL,
          active BOOLEAN DEFAULT true
        );
        CREATE TABLE tags (
          id SERIAL PRIMARY KEY,
          name varchar(255) UNIQUE NOT NULL
        );

        CREATE TABLE post_tags (
          "postId" INTEGER REFERENCES posts(id),
          "tagId" INTEGER REFERENCES tags(id),
          UNIQUE ("postId", "tagId")
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
      
      // const albertTwo = await createUser({ username: 'albert', password: 'imposter_albert', name:"Al bert", location: "Sidney" });
      const sandra = await createUser({ username: 'sandra', password: 'imposter_albert', name: 'Just Sandra', location: 'Aint tellin' });
      const glamgal = await createUser({ username: 'glamgal', password: 'imposter_albert', name: 'Joshua', location: 'Upper East Side' });
      console.log(albert);
      console.log("Finished creating users!");
    } catch(error) {
      console.error("Error creating users!");
      throw error;
    }
  }

  // ============= fill in posts table =====================================

  async function createInitialPosts() {
    try {
      const [albert, sandra, glamgal] = await getAllUsers();
  
      console.log("Starting to create posts...");
      await createPost({
        authorId: albert.id,
        title: "First Post",
        content: "This is my first post. I hope I love writing blogs as much as I love writing them.",
        tags: ["#happy", "#youcandoanything"]
      });
  
      await createPost({
        authorId: sandra.id,
        title: "How does this work?",
        content: "Seriously, does this even do anything?",
        tags: ["#happy", "#worst-day-ever"]
      });
  
      await createPost({
        authorId: glamgal.id,
        title: "Living the Glam Life",
        content: "Do you even? I swear that half of you are posing.",
        tags: ["#happy", "#youcandoanything", "#canmandoeverything"]
      });
      console.log("Finished creating posts!");
    } catch (error) {
      console.log("Error creating posts!");
      throw error;
    }
  }

//====================== run all the funcitons ==============================
  async function rebuildDB() {     // deletes all data and repopulates is
    try {
      client.connect();                  // this is where the client connection is started

      await dropTables();
      await createTables();
      await createInitialUsers();
      await createInitialPosts();
    } catch (error) {
      console.log("Error during the rebuilding process");
      throw(error);           // console.error(error) only prints it, throw will break out of the block
    } 
  }
  
//==========================is test db necessary? ==============================
  async function testDB() {       // the container function to run dtabase adapters (stuff in index file) see if they work
    try {             // checks that the values are inserted
        // client.connect();    // connect js to database, no need for this if you remove the finally
        //const {rows} = await client.query(`SELECT * FROM users;`);  // query the data from users table, shows ALL results
        // this is coming from the root index file

        console.log("Starting to test database...");
        console.log("Calling get all users")
        const users = await getAllUsers();        // this will run and show all the users, this connects to database
        console.log("Result:", users);   // print result

        console.log("Calling updateUser on users[0]")       // this tests the function update user
        const updateUserResult = await updateUser(users[0].id, {
          name: "Newname Sogood",
          location: "Lesterville, KY"
        });
        console.log("Result:", updateUserResult);

        console.log("Calling getAllPosts");
        const posts = await getAllPosts();
        console.log("Result:", posts);

        console.log("Calling updatePost on posts[0]");
        const updatePostResult = await updatePost(posts[0].id, {
          title: "New Title",
          content: "Updated Content"
        });
        console.log("Result:", updatePostResult);

        console.log("Calling updatePost on posts[1], only updating tags");
        const updatePostTagsResult = await updatePost(posts[1].id, {
          tags: ["#youcandoanything", "#redfish", "#bluefish"]
        });
        console.log("Result:", updatePostTagsResult);

        console.log("Calling getUserById with 1");
        const albert = await getUserById(1);
        console.log("Result:", albert);

        console.log("Calling getAllTags");
        const allTags = await getAllTags();
        console.log("Result:", allTags);

        console.log("Calling getPostsByTagName with #happy");
        const postsWithHappy = await getPostsByTagName("#happy");
        console.log("Result:", postsWithHappy);

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
  .catch(console.error)              // catch any errors that happen in test db
  .finally(() => client.end());      // end the client at the end to the server




