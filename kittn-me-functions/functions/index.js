const functions = require("firebase-functions");
const express = require("express");
const app = express();

const FireBaseAuth = require('./util/fbAuth');

const cors = require('cors');
app.use(cors());

const {
    db
} = require('./util/admin');

const {
    getAllMeows,
    postOneMeow,
    getMeow,
    commentOnMeow,
    likeMeow,
    unLikeMeow,
    deleteMeow
} = require('./handlers/meows');
const {
    signUp,
    login,
    addUserDetails,
    getAuthenticatedUser,
    getUserDetails,
    uploadImage
} = require('./handlers/users');

// meow route
app.get("/meows", getAllMeows);
// post one meow route
app.post("/meow", FireBaseAuth, postOneMeow);
// with route parameter and not protected 
// even without having an account
app.get('/meow/:meowId', getMeow);
// delete meow route
app.delete('/meow/:meowId', FireBaseAuth, deleteMeow);
// like a meow route
app.get('/meow/:meowId/like', FireBaseAuth, likeMeow);
// unlike a meow route
app.get('/meow/:meowId/unlike', FireBaseAuth, unLikeMeow);
// comment route
app.post("/meow/:meowId/comment", FireBaseAuth, commentOnMeow);

// signUp route
app.post("/signup", signUp);
// login route
app.post("/login", login);
// add details route
app.post("/user", FireBaseAuth, addUserDetails);
// used for the feed route
app.get("/user", FireBaseAuth, getAuthenticatedUser);
// get user details
app.get("/user/:handle", getUserDetails);
// uploadImage route
app.post("/user/image", FireBaseAuth, uploadImage);

// turn it automatically to different routes
// https://kittn-me.com/api/
exports.api = functions.https.onRequest(app);

exports.onUserImageChange = functions.firestore
    .document('/user/{userId}')
    .onUpdate((change) => {
        console.log(change.before.data());
        console.log(change.after.data());
        // execute ?it? only if the image has changed
        if (change.before.data().imgUrl !== change.after.data().imageUrl) {
            console.log("Image has changed.");
            let dbBatch = db.batch();
            return db.collection("meows").where('userHandle', '==', change.before.data().handle()).get()
                .then((data) => {
                    data.forEach(doc => {
                        const meow = db.doc(`/meows/${doc.id}`);
                        batch.update(meow, {
                            userImage: change.after.data().imageUrl
                        });
                    });
                    return dbBatch.commit();
                });
        } else return true; // in case the user just changes their details
    });


// if you delete a meow it automatically deletes 
// all likes and comments
exports.onMeowDelete = functions.firestore
    .document('/meows/{meowId}')
    .onDelete((snapshot, context) => {
        const meowId = context.params.meowId;
        let dbBatch = db.batch();
        return db.collection("comments").where("meowId", "==", meowId).get()
            .then(data => {
                data.forEach(doc => {
                    dbBatch.delete(db.doc(`/comments/${doc.id}`));
                });
                return db.collection("likes").where("meowId", "==", meowId).get();
            })
            .then(data => {
                data.forEach(doc => {
                    dbBatch.delete(db.doc(`/likes/${doc.id}`));
                });
            }).catch(err => console.error(err));
    });