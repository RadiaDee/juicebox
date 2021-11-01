
// helper function sends an error when there is no user
// do I need to import anything here or connect this to api index?

function requireUser(req, res, next) {
    if (!req.user) {
      next({
        name: "MissingUserError",
        message: "You must be logged in to perform this action"
      });
    }
    next();
  }
  
  module.exports = {
    requireUser
  }