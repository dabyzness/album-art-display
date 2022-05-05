const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
  {
    access_token: {
      type: String,
      required: true,
      index: { unique: true },
    },
    refresh_token: {
      type: String,
      required: true,
      index: { unique: true },
    },
    expires_in: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
