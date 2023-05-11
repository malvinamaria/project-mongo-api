import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// If you're using one of our datasets, uncomment the appropriate import below
// to get started!
// import avocadoSalesData from "./data/avocado-sales.json";
// import booksData from "./data/books.json";
// import goldenGlobesData from "./data/golden-globes.json";
// import netflixData from "./data/netflix-titles.json";
// import topMusicData from "./data/top-music.json";

// connecting to mongoDB database running on localhost
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost/project-mongo';
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

// Defines the port the app will run on. Defaults to 8080, but can be overridden
// when starting the server. Example command to overwrite PORT env variable value:
// PORT=9000 npm start
const port = process.env.PORT || 7080;
const app = express();

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(express.json());

// set middlewear up to catch database errors
// using Connection.prototype.readyState
// 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
app.use((req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    next();
  } else {
    res.status(503).json({ error: 'Service unavailable' });
  }
});

// Start defining your routes here
app.get('/', (req, res) => {
  // how to deal with secret API key
  // fetch('...', {headers: {Authorization: `my secret api key`}})
  // res.send(process.env.API_KEY);
  // getting all users from mongoDB database running on localhost
  User.find().then((users) => {
    // fetch all users from the database
    res.json(users); // send this back to the browser
  });
  // res.send('Hello Technigo!');
});

// show UserChild data
app.get('/userchild', (req, res) => {
  UserChild.find().then((userchild) => {
    res.json(userchild);
  });
});

// schema for user data in mongoDB database
const { Schema } = mongoose;
const userSchema = new Schema({
  name: String,
  age: Number,
  alive: Boolean,
  email: String,
});

// model for user data in mongoDB database
const User = mongoose.model('User', userSchema);

// add another endpoint that will take age from the User model
const UserChild = mongoose.model('UserChild', userSchema);

const UserChildSchema = new Schema({
  favoriteFood: String,
  favoriteColour: String,
  // email: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'User',
  // },
});

// endpoint for getting all users
const songSchema = new Schema({
  id: Number,
  trackName: String,
  artistName: String,
  genre: String,
  bpm: Number,
  energy: Number,
  danceability: Number,
  loudness: Number,
  liveness: Number,
  valence: Number,
  length: Number,
  acousticness: Number,
  speechiness: Number,
  popularity: Number,
});

// model for song data in mongoDB database
const Song = mongoose.model('Song', songSchema);

// endpoint for getting all songs
app.get('/songs/id/:id', async (req, res) => {
  // async is used to make sure that the code is executed in the right order
  try {
    const singleSong = await Song.findById(req.params.id); // find song by id in the database and store it in a variable  called singleSong
    if (singleSong) {
      res.status(200).json({
        success: true,
        body: singleSong,
      });
    } else {
      res.status(404).json({
        success: false,
        body: {
          message: 'Song not found',
        },
      });
    }
    // try is connected with catch, for bad requests
  } catch (e) {
    res.status(500).json({
      success: false,
      body: {
        message: e,
      },
    });
  }
});

// first create new users and wrapping new User with deleteMany to prevent duplicates
// if (process.env.RESET_DB) {
//   console.log('Resetting database!');
User.deleteMany().then(() => {
  new User({
    name: 'Kalle',
    age: 30,
    alive: true,
    email: 'test@test.com',
  }).save();
  new User({
    name: 'Savanah',
    age: 1,
    alive: true,
    email: 'tepst@test.com',
  }).save();
  new User({
    name: 'Chester',
    age: 0,
    alive: true,
    email: 'lovet@test.com',
  }).save();
  new User({
    name: 'Luba',
    age: 0,
    alive: true,
    email: 'luba@test.com',
  }).save();
  // new UserChild({
  //   favoriteFood: 'pizza',
  //   favoriteColour: 'blue',
  //   email: '5f9f1b3b1c9d440000a0b0b1',
  // }).save();

  // new InsideUser({
  //   favoriteFood: 'pizza',
  //   age: '5f9f1b3b1c9d440000a0b0b1',
  // }).save();
});
// }

// with findOne we can search for a specific user
app.get('/:name', async (req, res) => {
  User.findOne({ name: req.params.name }).then((user) => {
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });
});
// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
