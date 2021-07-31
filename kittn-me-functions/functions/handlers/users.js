// import the db
const {
  admin,
  db
} = require("../util/admin");

const config = require("../util/config");

const firebase = require("firebase");
firebase.initializeApp(config);

const {
  validateSignUpData,
  validateLoginData,
  reduceUserDetails
} = require("../util/validators");

exports.signUp = (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };

  const {
    valid,
    errors
  } = validateSignUpData(newUser);

  if (!valid) {
    return res.status(400).json(errors);
  }

  const defImg = 'no-img.png';

  // check if user already exists
  let token;
  let userId;
  db.doc(`/users/${newUser.handle}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res
          .status(400)
          .json({
            handle: "Unfurtunately this handle is already taken."
          });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then((data) => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then((idToken) => {
      token = idToken;
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${defImg}?alt=media`,
        userId: userId
      };
      return db.doc(`/users/${newUser.handle}`).set(userCredentials);
    })
    .then(() => {
      return res.status(201).json({
        token
      });
    })
    .catch((err) => {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        return res.status(400).json({
          email: "Un-fur-tunately this E-mail is already in use"
        });
      } else {
        return res.status(500).json({
          general: 'Something went meowably wrong. Please try again.'
        });
      }
    });
};

exports.login = (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
  };

  const {
    valid,
    errors
  } = validateLoginData(user);

  if (!valid) {
    return res.status(400).json(errors);
  }

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then((data) => {
      return data.user.getIdToken();
    })
    .then((token) => {
      return res.json({
        token
      });
    })
    .catch((err) => {
      console.error(err);
      // auth/wrong-pass
      // auth/user-not-user
      return res.status(403).json({
        general: "Clawful! Your credentials are wrong, please try again."
      });
    });
};

exports.addUserDetails = (req, res) => {
  let userDetails = reduceUserDetails(req.body);


  db.doc(`/users/${req.user.handle}`).update(userDetails)
    .then(() => {
      return res.json({
        message: 'Purrrfect. User Details added successfully.'
      });
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({
        error: err.code
      });
    });
};

exports.getAuthenticatedUser = (req, res) => {
  // the response data
  let resData = {};
  db.doc(`/users/${req.user.handle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        resData.credentials = doc.data();
        return db.collection('likes').where('userHandle', '==', req.user.handle).get();
      }
    }).then(data => {
      resData.likes = [];
      data.forEach(doc => {
        resData.likes.push(doc.data());
      });
      return res.json(resData);
    }).catch(err => {
      console.error(err);
      return res.status(500).json({
        error: err.code
      });
    })
};

exports.getUserDetails = (req, res) => {
  let userData = {};
  db.doc(`/users/${req.params.handle}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        userData.user = doc.data();
        return db
          .collection("meows")
          .where("userHandle", "==", req.params.handle)
          .orderBy("createdAt", "desc")
          .get();
      } else {
        return res.status(404).json({ errror: "User not found" });
      }
    })
    .then((data) => {
      userData.meows = [];
      data.forEach((doc) => {
        userData.meows.push({
          body: doc.data().body,
          createdAt: doc.data().createdAt,
          userHandle: doc.data().userHandle,
          userImage: doc.data().userImage,
          likeCount: doc.data().likeCount,
          commentCount: doc.data().commentCount,
          meowId: doc.id,
        });
      });
      return res.json(userData);
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

// upload a profile image function using busboy
// https://github.com/mscdex/busboy
exports.uploadImage = (req, res) => {
  const BusBoy = require("busboy");
  const path = require("path");
  const os = require("os");
  const fs = require("fs"); // file system

  // a new instance of BusBoy
  const busboy = new BusBoy({
    headers: req.headers
  });

  let imageFileName;
  let imageToBeUploaded = {};

  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    console.log(fieldname, file, filename, encoding, mimetype);
    if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
      return res.status(400).json({
        error: 'Wrong file submitted.'
      });
    }
    // split it by dot (name cannot have a dot) in order to get filetype
    const imageExtension = filename.split('.')[filename.split('.').length - 1];
    //
    // TODO: save the name as a timestamp - THIS IS NOT SAFE!
    //
    // 234536532425234.png
    imageFileName = `${Math.round(Math.random() * 100000000000)}.${imageExtension}`;
    const filepath = path.join(os.tmpdir(), imageFileName);
    imageToBeUploaded = {
      filepath: filepath,
      mimetype: mimetype
    };
    file.pipe(fs.createWriteStream(filepath));
  });
  // once the object is created this will be executed
  busboy.on('finish', () => {
    // here bucket() but comments said smth
    // 
    // 
    //
    //
    admin.storage().bucket(config.storageBucket).upload(imageToBeUploaded.filepath, {
      resumable: false,
      meta: {
        metadata: {
          contentType: imageToBeUploaded.mimetype
        }
      }
    })
      .then(() => {
        const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
        return db.doc(`/users/${req.user.handle}`).update({
          imageUrl: imageUrl
        });
      })
      .then(() => {
        return res.json({
          message: 'Image uploaded successfully '
        });
      })
      .catch(err => {
        console.error(err);
        return res.status(500).json({
          error: err.code
        });
      });
  });
  busboy.end(req.rawBody);
};