const mongoose = require("mongoose");

const AlbumArtSchema = mongoose.Schema(
  {
    uri: {
      type: String,
      required: true,
      index: { unique: true },
    },
    albumImage: {
      type: String,
      required: true,
      index: { unique: true },
    },
    albumName: {
      type: String,
      required: true,
    },
    artistName: {
      type: String,
      required: true,
    },
    genres: {
      type: Array,
      required: false,
    },
    popularTrackUri: {
      type: String,
      required: true,
    },
    popularTrackPosition: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AlbumArt", AlbumArtSchema);
