// import the db
const {
  db
} = require("../util/admin");

exports.getAllMeows = (req, res) => {
  // get all meows sorted by newest first
  db.collection("meows")
    .orderBy("createdAt", "desc")
    .get()
    .then((data) => {
      let meows = [];
      data.forEach((doc) => {
        meows.push({
          // can't use ...body.data()
          // because node 8
          meowId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt,
          commentCount: doc.data().commentCount,
          likeCount: doc.data().likeCount,
          userImage: doc.data().userImage
        });
      });
      return res.json(meows);
    })
    .catch((err) => console.error(err));
};

exports.postOneMeow = (req, res) => {
  // check if it is a client or server error
  if (req.body.body.trim() === "") {
    return res.status(400).json({
      body: "Body must not be empty."
    });
  }
  // create the meow with 3 parameters
  const newMeow = {
    body: req.body.body,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl,
    createdAt: new Date().toISOString(),
    likeCount: 0,
    commentCount: 0
  };
  db.collection("meows")
    .add(newMeow)
    .then((doc) => {
      // technically you can edit a key in a constant 
      // (you cannot change the datatype or the complete value of the obj)
      const responseMeow = newMeow;
      responseMeow.meowId = doc.id;
      res.json(responseMeow);
    })
    .catch((err) => {
      res.status(500).json({
        error: "Oops. Something went wrong."
      });
      console.error(err);
    });
};

exports.getMeow = (req, res) => {
  let meowData = {};
  db.doc(`/meows/${req.params.meowId}`).get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({
          error: 'The requested meow was not found.'
        })
      }
      meowData = doc.data();
      meowData.meowId = doc.id;
      return db
        .collection('comments')
        .orderBy('createdAt', 'desc')
        .where('meowId', '==', req.params.meowId)
        .get();
    }).then(data => {
      meowData.comments = [];
      data.forEach(doc => {
        meowData.comments.push(doc.data());
      });
      return res.json(meowData)
    }).catch(err => {
      console.error(err);
      res.status(500).json({
        error: err.codeF
      })
    });
};

// creates a new document for comments
// because firebase allows only 4mb per
// document and because it will be slow
// and inefficient
exports.commentOnMeow = (req, res) => {
  if (req.body.body.trim() === '') {
    return res.status(400).json({
      comment: 'The comment must not be empty. '
    });
  }
  const newComment = {
    body: req.body.body,
    createdAt: new Date().toISOString(),
    meowId: req.params.meowId,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl
  };

  db.doc(`/meows/${req.params.meowId}`).get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({
          error: 'The meow was not found.'
        });
      }
      return doc.ref.update({
        commentCount: doc.data().commentCount + 1
      });
    })
    .then(() => {
      return db.collection('comments').add(newComment);
    })
    .then(() => {
      res.json(newComment);
    }).catch(err => {
      console.error(err);
      res.status(500).json({
        error: 'Something went wrong.'
      });
    })
};

exports.likeMeow = (req, res) => {
  const likeDocument = db.collection('likes').where('userHandle', '==', req.user.handle)
    .where('meowId', '==', req.params.meowId).limit(1);
  const meowDocument = db.doc(`/meows/${req.params.meowId}`);

  let meowData;

  // check wether a like document exists if this like doc already exists return "already liked" 
  meowDocument.get()
    .then(doc => {
      if (doc.exists) {
        meowData = doc.data();
        meowData.meowId = doc.id;
        return likeDocument.get();
      } else {
        return res.status(404).json({
          error: 'The requested meow was not found.'
        });
      }
    })
    .then(data => {
      if (data.empty) {
        // can't do a return here and handle the promice in the next then, 
        // because even if it's not empty it might go through  
        return db
          .collection('likes')
          .add({
            meowId: req.params.meowId,
            userHandle: req.user.handle
          }).then(() => {
            meowData.likeCount++;
            return meowDocument.update({
              likeCount: meowData.likeCount
            });
          }).then(() => {
            return res.json(meowData);
          });
      } else {
        // already liked by the user
        return res.status(400).json({
          error: 'The meow is already liked. '
        });
      }
    }).catch((err) => {
      console.error(err);
      res.status(500).json({
        error: err.code
      });
    });
};

exports.unLikeMeow = (req, res) => {
  const likeDocument = db.collection('likes').where('userHandle', '==', req.user.handle)
    .where('meowId', '==', req.params.meowId).limit(1);
  const meowDocument = db.doc(`/meows/${req.params.meowId}`);

  let meowData = {};

  // check wether a like document exists if this like doc already exists return "already liked" 
  meowDocument.get()
    .then(doc => {
      if (doc.exists) {
        meowData = doc.data();
        meowData.meowId = doc.id;
        return likeDocument.get();
      } else {
        return res.status(404).json({
          error: 'The requested meow was not found.'
        });
      }
    })
    .then(data => {
      if (data.empty) {
        // already liked by the user
        return res.status(400).json({
          error: 'The meow is not liked. '
        });
      } else {
        return db
          .doc(`/likes/${data.docs[0].id}`)
          .delete()
          .then(() => {
            meowData.likeCount--;
            return meowDocument.update({
              likeCount: meowData.likeCount
            });
          })
          .then(() => {
            res.json(meowData);
          });
      }
    }).catch((err) => {
      console.error(err);
      res.status(500).json({
        error: err.code
      });
    });
};

exports.deleteMeow = (req, res) => {
  const document = db.doc(`/meows/${req.params.meowId}`);
  document
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({
          error: 'The meow is not found.'
        });
      }
      // check if the user owns this meow
      if (doc.data().userHandle !== req.user.handle) {
        return res.status(403).json({
          error: 'Unauthorized.'
        })
      } else {
        return document.delete();
      }
    })
    .then(() => {
      res.json({
        message: 'The meow was deleted successfully.'
      })
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({
        error: err.code
      });
    });
};