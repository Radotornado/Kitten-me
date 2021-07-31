const admin = require("firebase-admin");

admin.initializeApp();

// makes the access to the db faster
const db = admin.firestore();

// export in order to use them in other files
module.exports = { admin, db };