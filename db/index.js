const { Client } = require('pg'); // imports the postgress module to access databases // this is postgress
const client = new Client('postgres://localhost:5432/juicebox-dev');   // supply db name and location of database

//=============== get user data ==============================================
async function getAllUsers(){     // function to fetch all the users table data
  try{
    const {rows} = await client.query(
        `SELECT id, username, name, location, active FROM users;`
    );
    return rows;    // why return with no error handling?
  } catch (error){
    throw error;
  }
}

//========??===== get user posts ===============================================

async function getAllPosts() {
  try {     // destructuring?
    const { rows: postIds } = await client.query(`
    SELECT id
    FROM posts;
    `);
    const posts = await Promise.all(postIds.map(
      post => getPostById(post.id)
    ));
    return posts;        // what does this look like?
  } catch (error) {
    throw error;
  }
}

// =================== get tags ===============================

async function getAllTags(){     // function to fetch all the users table data
  try{
  const {rows} = await client.query(
      `SELECT * 
      FROM tags;`
  );
  return rows;    // why return with no error handling?
  } catch (error){
    throw error;
  }
}

//================ get user by id ===============================

async function getUserById(userId){
  try{     // get user info that matches id number
    const { rows:[user]}= await client.query(`
    SELECT id, username, name, location, active
    FROM users
    WHERE id=${ userId }
    `);
      if (!user){
        return null; 
      }
    user.posts= await getPostsByUser(userId);  // grab posts by id // what does this do?? why user.posts? is this returned too
    return user; // return answer
  }
  catch (error){
    throw error;
  }
}

//============ get user by username ===============================

async function getUserByUsername(username) {
  try {
    const { rows: [user] } = await client.query(`
      SELECT *
      FROM users
      WHERE username=$1;
    `, [username]);

    return user;
  } catch (error) {
    throw error;
  }
}

// ============= get post by id ======================================

async function getPostById(postId) {
  try {
    const { rows: [ post ]  } = await client.query(`
      SELECT *
      FROM posts
      WHERE id=$1;
    `, [postId]);

    if (!post) {
      throw {
        name: "PostNotFoundError",
        message: "Could not find a post with that postId"
      };
    }

    const { rows: tags } = await client.query(`
      SELECT tags.*
      FROM tags
      JOIN post_tags ON tags.id=post_tags."tagId"
      WHERE post_tags."postId"=$1;
    `, [postId])

    const { rows: [author] } = await client.query(`
      SELECT id, username, name, location
      FROM users
      WHERE id=$1;
    `, [post.authorId])

    post.tags = tags;
    post.author = author;

    delete post.authorId;

    return post;
  } catch (error) {
    throw error;
  }
}


// ============ get posts by user =================================

async function getPostsByUser(userId) {
  try {      // gets the users posts information
    const { rows } = client.query(`
      SELECT * 
      FROM posts
      WHERE "authorId"=${ userId };
    `);
    const posts = await Promise.all(postIds.map(
      post => getPostById( post.id )
    ));
    return posts;   // not rows?
  } catch (error) {
    throw error;
  }
}

// ============ get posts by tag name ========================

async function getPostsByTagName(tagName) {
  try {
    const { rows: postIds } = await client.query(`
      SELECT posts.id
      FROM posts
      JOIN post_tags ON posts.id=post_tags."postId"
      JOIN tags ON tags.id=post_tags."tagId"
      WHERE tags.name=$1;
    `, [tagName]);

    return await Promise.all(postIds.map(
      post => getPostById(post.id)
    ));
  } catch (error) {
    throw error;
  }
} 

//=============== create user data ===============================
async function createUser({ username, password, name, location }) {    // create user table
    try {       
        // on conflict allows duplicates
        // use {rows} to save into object and ONLY return the rows
      const {rows: [user ]} = await client.query(`
            INSERT INTO users(username, password, name, location) 
            VALUES($1, $2, $3, $4)
            ON CONFLICT (username) DO NOTHING
            RETURNING *;
      `, [username, password, name, location]);         // use values $1 and $2 to say which element in array corresponds with which value    
      return user;
    } catch (error) {
      throw error;
    }
  }

  // ============= create Post =================================================

  async function createPost({ authorId, title, content, tags=[] }){
    try{
      const {rows: [posts ]} = await client.query(`
        INSERT INTO posts("authorId", title, content) 
        VALUES($1, $2, $3)
        RETURNING *;
      `, [authorId, title, content ]);     
      const tagList= await createTags(tags);     // after creating post, grab the tags
      return await addTagsToPost(post.id, tagList);    // return posts with tags???
    } catch(error){
      throw error;
    }
  }

  // ============ create tags ============================

  async function createTags(tagList) {
    if (tagList.length === 0) {
      return;
    }
  
    const valuesStringInsert = tagList.map(
      (_, index) => `$${index + 1}`
    ).join('), (');
  
    const valuesStringSelect = tagList.map(
      (_, index) => `$${index + 1}`
    ).join(', ');
  
    try {
      // insert all, ignoring duplicates
      await client.query(`
        INSERT INTO tags(name)
        VALUES (${ valuesStringInsert })
        ON CONFLICT (name) DO NOTHING;
      `, tagList);
  
      // grab all and return
      const { rows } = await client.query(`
        SELECT * FROM tags
        WHERE name
        IN (${ valuesStringSelect });
      `, tagList);
  
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // =============== create post and tag ==============


async function createPostTag(postId, tagId) {
  try {
    await client.query(`
      INSERT INTO post_tags("postId", "tagId")
      VALUES ($1, $2)
      ON CONFLICT ("postId", "tagId") DO NOTHING;
    `, [postId, tagId]);
  } catch (error) {
    throw error;
  }
}

// ============= add tag to post  =================

async function addTagsToPost(postId, tagList) {
  try {
    const createPostTagPromises = tagList.map(
      tag => createPostTag(postId, tag.id)
    );

    await Promise.all(createPostTagPromises);

    return await getPostById(postId);
  } catch (error) {
    throw error;
  }
}
  
// ========== update user method ========================================
  async function updateUser(id, fields = {}) {         // function that is usd to automatically update the rows
    // build the set string          // object .key turns the keys part into array so we can map through it (we cant map through the object)
    const setString = Object.keys(fields).map(         // map through the fields and grab each key as data, and then the index w $ sign, then joined with commas
      (key, index) => `"${ key }"=$${ index + 1 }`
    ).join(', ');
      if (setString.length === 0) {
        return;
      }
    try {                 // convert to sql string  
      const {rows: [user ]} = await client.query(`
        UPDATE users
        SET ${ setString }
        WHERE id=${ id }
        RETURNING *;
      `, Object.values(fields));        // values method returns an array of the values in the object, takes fields object and convert all the properties into an array of values
      return user;            // object .values is an array makes fields into array
    } catch (error) {
      throw error;
    }
  }

// ====?===== update post method =============== ==================================

async function updatePost(postId, fields={} ) {    // why these parameters
  const {tags } = fields;
  delete fields.tags;
  const setString = Object.keys(fields).map(     // make fields into strings
    (key,index) => `"${key}"=$${ index+1 }`
  ).join(', ');
  try {
    if(setString.length >0){
      await client.query(`
      UPDATE posts
      SET ${setString}
      WHERE id=${postId }
      RETURNING *;
      `, Object.values(fields));    // if there is string then fill out posts with data
    }
    if (tags === undefined){      // if there arent tags, return
      return await getPostById(postId);
    }
    const tagList = await createTags(tags);  // make new tags
    const tagListIdString = tagList.map(
      tag => `${ tag.id}`).join(', ');   // ??
    await client.query(`
    DELETE FROM post_tags
    WHERE "tagId"
    NOT IN ( ${tagListIfString})
    AND "postId"=$1;
    `, [postId]);   // delete the post_tags that arent in taglist
    await addTagsToPost(postId, tagList);   // run adding the tags to the posts
    return await getPostById(postId);
  } catch (error) {
    throw error;
  }
}
  
//=============== export to other funcitons ==============================

module.exports = {

  client,
  createUser,
  updateUser,
  getAllUsers,
  getUserById,
  createPost,
  updatePost,
  getAllPosts,
  getPostsByUser,
  getPostsByTagName,
  createTags,
  getAllTags,
  createPostTag,
  addTagsToPost,
  getPostById
}