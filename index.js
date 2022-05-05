const http = require("http");
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const axios = require("axios");
const pug = require("pug");
const AlbumArtModel = require("./AlbumArtModel");
const PlaybackDAO = require("./PlaybackDAO");
const StorageDAO = require("./StorageDAO");
const AuthenticationDAO = require("./AuthenticationDAO");
const { appendFileSync } = require("fs");
require("dotenv").config();

const port = process.env.PORT || 3000;

const app = express();

app.locals.tokens = {
  access_token: "",
  refresh_token: "",
  expires_in: 0,
  eol: new Date(),
  deviceId: "",
};

app.set("port", port);
app.set("view engine", "pug");
app.set("views", "./public");

app.use(express.static(path.join(__dirname, "/public")));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.render("index.pug");
});

app.get("/login", async (req, res) => {
  res.redirect(await AuthenticationDAO.getAuthURL());
});

app.get("/callback", async (req, res) => {
  if (app.locals.tokens.access_token === "") {
    const response = await AuthenticationDAO.reqAuthTokens(req.query.code);
    if (!response.data) {
      console.log(`Something went wrong. Redirecting to Home.`);
      res.redirect("/");
    }

    if (!response.status || response.status !== 200) {
      console.error(`Something went wrong: Status Code: ${response.status}`);
      res.redirect("/");
    } else {
      app.locals.tokens.access_token = response.data.access_token;
      app.locals.tokens.refresh_token = response.data.refresh_token;
      app.locals.tokens.expires_in = response.data.expires_in;
    }
  }
  const albumImages = await StorageDAO.getAlbumArt(10);

  res.render("currentlyPlaying", { albumImages });
});

app.get("/albums", async (req, res) => {
  const albumImages = await StorageDAO.getAlbumArt(10);
  res.json(albumImages);
});

app.get("/albumInfo/:albumURI", async (req, res) => {
  await AlbumArtModel.find({ uri: req.params.albumURI }).then((cursor) => {
    if (cursor.length === 0) {
      res.json({ found: false });
    } else if (cursor.length > 1) {
      res.json({
        found: true,
      });
      console.log("There is more than one entry");
    } else if (cursor[0].uri === req.params.albumURI) {
      res.json({ found: true });
    }
  });
});

app.get("/auth/token", (req, res) => {
  res.json({
    access_token: app.locals.tokens.access_token,
  });
});

app.get("/auth/token/refresh", async (req, res) => {
  const response = await AuthenticationDAO.refreshAccessToken(
    app.locals.tokens.refresh_token
  );
  app.locals.tokens.access_token = response.data.access_token;
  res.json({ access_token: app.locals.tokens.access_token });
});

app.post("/saveAlbum", async (req, res) => {
  try {
    const { albumUri } = req.body;

    const albumInfo = await PlaybackDAO.albumInfo(app.locals.tokens, albumUri);

    const tracks = albumInfo.tracks.items;
    let popularity = 0;
    let mostPopularTrack = "";
    let mostPopularPosition;
    const trackIds = [];
    for (let i = 0; i < albumInfo.total_tracks; i += 1) {
      trackIds.push(tracks[i].id);
    }

    const trackList = await PlaybackDAO.getTracksInfo(
      app.locals.tokens,
      trackIds
    );

    for (let i = 0; i < trackList.tracks.length; i += 1) {
      if (trackList.tracks[i].popularity > popularity) {
        popularity = trackList.tracks[i].popularity;
        mostPopularTrack = trackList.tracks[i].id;
        mostPopularPosition = i;
      }
    }

    const album = new AlbumArtModel({
      uri: albumUri,
      albumImage: albumInfo.images[0].url,
      albumName: albumInfo.name,
      artistName: albumInfo.artists[0].name,
      genres: albumInfo.genres,
      popularTrackUri: mostPopularTrack,
      popularTrackPosition: mostPopularPosition,
    });

    await album.save();
  } catch (err) {
    console.log(err);
  }
});

app.post("/removeAlbum", async (req, res) => {
  try {
    const { albumUri } = req.body;

    await AlbumArtModel.find({ uri: albumUri }).then((result) =>
      AlbumArtModel.deleteOne({ _id: result[0]._id })
    );
  } catch (err) {
    console.log(err);
  }
});

app.post("/playSample", async (req, res) => {
  try {
    const { uri } = req.body;
    const album = await AlbumArtModel.find({ uri });

    await PlaybackDAO.getAvailableDevices(app.locals.tokens)
      .then(async (data) => {
        for (let i = 0; i < data.devices.length; i += 1) {
          if (data.devices[i].name === "Album Art Display") {
            app.locals.tokens.deviceId = data.devices[i].id;
          }
        }
      })
      .then(async () => {
        await PlaybackDAO.playTrack(
          app.locals.tokens,
          uri,
          album[0].popularTrackPosition
        );
      });
  } catch (err) {
    console.log(err);
  }
});

app.get("/stop", async (req, res) => {
  await PlaybackDAO.getAvailableDevices(app.locals.tokens).then((data) => {
    console.log(data.devices);
  });
});

app.get("/search/:searchQuery/:searchTerm", async (req, res) => {
  const { searchQuery, searchTerm } = req.params;
  console.log(searchQuery);

  const options = {
    method: "GET",
    url: "https://api.spotify.com/v1/search",
    headers: {
      Authorization: "Bearer ".concat(app.locals.tokens.access_token),
      "Content-Type": "application/json",
    },
    params: {
      q: searchTerm,
      type: searchQuery,
      limit: 12,
    },
  };
  try {
    await axios(options).then(async (response) => {
      const data = await response.data;
      const results = data.tracks.items;
      const simplifiedResults = [];

      for (let i = 0; i < results.length; i += 1) {
        const eachResult = {
          image: results[i].album.images[0].url,
          trackName: results[i].name,
          artistName: results[i].album.artists[0].name,
          albumUri: results[i].album.uri.split(":")[2],
          trackNumber: results[i].track_number,
        };
        simplifiedResults.push(eachResult);
      }
      res.send(simplifiedResults);
    });
  } catch (err) {
    console.log(err);
  }
});

app.post("/playTrack", async (req, res) => {
  const { albumUri, trackNumber } = req.body;
  console.log(albumUri);
  console.log(trackNumber);
  try {
    await PlaybackDAO.playTrack(app.locals.tokens, albumUri, trackNumber - 1);
  } catch (err) {
    console.log("WHOOPS");
  }
});

const server = http.createServer(app);

mongoose
  .connect(process.env.ALBUM_ART_DB)
  .then(() => {
    console.log("Connected to MongoDB");
    server.listen(port);
  })
  .catch((err) => {
    console.error(err);
  });
