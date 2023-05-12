import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import listEndpoints from 'express-list-endpoints';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

// If you're using one of our datasets, uncomment the appropriate import below
// to get started!
// import avocadoSalesData from "./data/avocado-sales.json";
// import booksData from "./data/books.json";
// import goldenGlobesData from "./data/golden-globes.json";
import topMusicData from './data/top-music.json';

const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost/project-mongo';
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

// Defines the port the app will run on. Defaults to 8080, but can be overridden
// when starting the server. Example command to overwrite PORT env variable value:
// PORT=9000 npm start
const port = process.env.PORT || 8080;
const app = express();

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(express.json());

const { Schema } = mongoose;
// const userSchema = new Schema({
//   name: String,
//   age: Number,
//   alive: Boolean,
// });

// const User = mongoose.model('User', userSchema);
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

const Song = mongoose.model('Song', songSchema);

if (process.env.RESET_DB) {
  const resetDatabase = async () => {
    await Song.deleteMany();
    topMusicData.forEach((singleSong) => {
      const newSong = new Song(singleSong);
      newSong.save();
    });
  };
  resetDatabase();
}
// Start defining your routes here
app.get('/', (req, res) => {
  res.json({
    reponseMessage: 'Welcome to the Top Music API',
    data: listEndpoints(app),
  });
});
// here we are creating a new endpoint
// for example http://localhost:8080/songs?genre=flow  >> will return all songs with the genre flow
// for example http://localhost:8080/songs?genre=flow&danceability=81  >> will return all songs with the genre flow and danceability greater than 81
app.get('/songs', async (req, res) => {
  // async await is a way to handle promises in a more readable way (instead of .then)
  const { genre, danceability } = req.query; // destructuring the query string to get the genre and danceability values from the request query string
  const response = {
    // creating a response object
    success: true, // setting the success property to true
    body: {}, // setting the body property to an empty object
  };
  const genreRegex = new RegExp(genre); // creating a regular expression to use in the query to find songs by genre
  const danceabilityQuery = { $gt: danceability ? danceability : 0 }; // creating a query object to use in the query to find songs by danceability

  try {
    // try catch block to handle errors
    const searchResultFromDB = await Song.find({
      // using the mongoose find method to find songs in the database
      genre: genreRegex, // using the genre regular expression to find songs by genre
      danceability: danceabilityQuery, // using the danceability query object to find songs by danceability
    });
    if (searchResultFromDB) {
      // if the search result is not empty
      response.body = searchResultFromDB; // set the response body to the search result
      res.status(200).json(response); // send the response
    } else {
      // if the search result is empty
      (response.success = false), res.status(500).json(response); // set the response success property to false and send the response
    }
  } catch (e) {
    // if there is an error
    res.status(500).json(response); // send the response with the error message in the body property
  }
});

// here we are creating a new endpoint to get a single song by artist name
// for example http://localhost:8080/songs/artist/Drake  >> will return all songs by Drake
app.get('/songs/artist/:artistName', async (req, res) => {
  const { artistName } = req.params; // destructuring the params object to get the artistName value from the request params
  const response = {
    // creating a response object
    success: true, // setting the success property to true
    body: {}, // setting the body property to an empty object
  };
  const artistNameRegex = new RegExp(artistName); // creating a regular expression to use in the query to find songs by artist name
  try {
    // try catch block to handle errors
    const searchResultFromDB = await Song.find({
      // using the mongoose find method to find songs in the database
      artistName: artistNameRegex, // using the artistName regular expression to find songs by artist name
    });
    if (searchResultFromDB) {
      // if the search result is not empty
      response.body = searchResultFromDB; // set the response body to the search result
      res.status(200).json(response); // send the response
    } else {
      // if the search result is empty
      (response.success = false), res.status(500).json(response); // set the response success property to false and send the response
    }
  } catch (e) {
    // if there is an error
    res.status(500).json(response); // send the response with the error message in the body property
  }
});

app.get('/songs/id/:id', async (req, res) => {
  try {
    // try catch block to handle errors
    const singleSong = await Song.findById(req.params.id); // using the mongoose findById method to find a song by id
    if (singleSong) {
      // if the song is found
      res.status(200).json({
        // send the response
        success: true, // set the success property to true
        body: singleSong, // set the body property to the song
      });
    } else {
      // if the song is not found
      res.status(404).json({
        // send the response
        success: false, // set the success property to false
        body: {
          // set the body property to an object with a message property
          message: 'Song not found', // set the message property to a message
        },
      });
    }
  } catch (e) {
    // if there is an error
    res.status(500).json({
      // send the response
      success: false, // set the success property to false
      body: {
        // set the body property to an object with a message property
        message: e, // set the message property to the error message
      },
    });
  }
});

//// implement swagger documentation
// http://localhost:8080/api-docs/
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Wine Reviews API',
      version: '1.0.0',
      description: 'A simple Express Library API',
    },
    servers: [
      {
        url: 'http://localhost:8080',
      },
    ],
  },
  apis: ['./server.js'],
};

const specs = require('./swagger.json');
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(specs, { explorer: true })
);

// Start the server
app.listen(port, () => {
  // starting the server and listening to the port defined above
  console.log(`Server running on http://localhost:${port}`); // logging a message to the console to confirm that the server is running and on which port
});
