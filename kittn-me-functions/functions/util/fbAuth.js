const { admin, db } = require("./admin");

// authenticate if a user can post a meow
// take request, response, and proceed
module.exports = (req, res, next) => {
  let idToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    // the array after the split has 2 items 'Bearer ' and the token as 2nd element
    idToken = req.headers.authorization.split("Bearer ")[1];
  } else {
    // stop the request
    console.error("No token found.");
    return res.status(403).json({ error: "Unauthorized." });
  }
  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      req.user = decodedToken;
      return db
        .collection("users")
        .where("userId", "==", req.user.uid)
        .limit(1)
        .get();
    })
    .then((data) => {
      req.user.handle = data.docs[0].data().handle;
      req.user.imageUrl = data.docs[0].data().imageUrl;
      return next();
    })
    .catch((err) => {
      // check if the token is expired or blacklisted
      console.error("Error while verifying token. ", err);
      return res.status(403).json(err);
    });
};
