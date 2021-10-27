const { Client } = require('pg'); // imports the postgress module to access databases // is this always called pg?
const client = new Client('postgres://localhost:5432/juicebox-dev');   // supply db name and location of database


//=============== fetch user data ==============================================
async function getAllUsers(){     // function to fetch all the users table data
    const {rows} = await client.query(
        `SELECT id, username, name, location, active FROM users`
    );
    return rows;    // why return with no error handling?
}

//=============== create user data/ update table ===============================
async function createUser({ username, password, name, location }) {    // takes users information that they entered and using that to create database
    try {       // this will automatically create users for us without typing into the terminal
        // put into users columns, the respective values
        // on conflict command allows us to have duplicates
        // use {rows} to save that into object and ONLY return the rows
      const {rows} = await client.query(`
            INSERT INTO users(username, password, name, location) 
            VALUES($1, $2, $3, $4)
            ON CONFLICT (username) DO NOTHING
            RETURNING *;
      `, [username, password, name, location]);         // use values $1 and $2 to say which element we put in values for the array    
      return rows;
    } catch (error) {
      throw error;
    }
  }
  
// ========== update existing user method ========================================
  async function updateUser(id, fields = {}) {         // function that is usd to automatically update the rows
    // build the set string
    const setString = Object.keys(fields).map(         // map through the fields and grab each key as data, and then the index w $ sign, then joined with commas
      (key, index) => `"${ key }"=$${ index + 1 }`
    ).join(', ');
    // return early if this is called without fields
    if (setString.length === 0) {
      return;
    }
    try {                 // 
      const result = await client.query(`
        UPDATE users
        SET ${ setString }
        WHERE id=${ id }
        RETURNING *;
      `, Object.values(fields));        // values method returns an array of the values in the object, takes fields object and convert all the properties into an array of values
      return result;
    } catch (error) {
      throw error;
    }
  }
  
//=============== export to other funcitons ==============================

module.exports = {

    client,
    getAllUsers,
    createUser,
    updateUser
}