const { Client } = require('pg'); // imports the postgress module to access databases // is this always called pg?

const client = new Client('postgres://localhost:5432/juicebox-dev');   // supply db name and location of database

async function getAllUsers(){
    const {rows} = await client.query(
        `SELECT id, username FROM users`
    );

    return rows;    // why return with no error handling?
}


async function createUser({ username, password }) {
    try {       // this will automatically create users for us without typing into the terminal
        // put into users columns, the respective values

        // on conflict command allows us to have duplicates

        // use {rows} to save that into object and ONLY return the rows
      const {rows} = await client.query(`
            INSERT INTO users(username, password) 
            VALUES($1, $2)
            ON CONFLICT (username) DO NOTHING
            RETURNING *;

      `, [username, password]);         // use values $1 and $2 to say which element we put in values for the array  
  
      return rows;
    } catch (error) {
      throw error;
    }
  }
  



module.exports = {

    client,
    getAllUsers,
    createUser
}