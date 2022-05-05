const axios = require("axios");
require("dotenv").config();

// List of scopes for Spotify API
const scopes = [
  "streaming",
  "user-read-playback-position",
  "user-read-currently-playing",
  "playlist-modify-public",
  "user-read-playback-state",
  "streaming",
  "user-read-email",
  "user-read-private",
  "user-modify-playback-state",
];

class AuthenticationDAO {
  /**
   * Generates a random string containg numbers and letters
   * @param {number} length the length of the generated string
   * @returns {sting} The generated string
   */
  static generateRandomString(length) {
    let text = "";
    const possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < length; i += 1) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  /**
   * Generates a Spotify Authentication URL with app's specified scopes and information
   * @returns URL used for Spotify Authentication
   */
  static async getAuthURL() {
    const state = this.generateRandomString(16);
    const authParams = new URLSearchParams({
      response_type: "code",
      client_id: process.env.CLIENT_ID,
      scope: scopes,
      redirect_uri: process.env.REDIRECT_URI,
      state,
    });

    return new URL(`https://accounts.spotify.com/authorize?${authParams}`);
  }

  /**
   * Requests Access and Refresh Token to enable use of Spotify API
   * @param {string} code Parameter received from Spotify authorizing access
   * @returns An Axios response that contains access tokens in the .data body
   */
  static async reqAuthTokens(code) {
    const authOptions = {
      method: "POST",
      url: "https://accounts.spotify.com/api/token",
      params: {
        code,
        redirect_uri: process.env.REDIRECT_URI,
        grant_type: "authorization_code",
      },
      headers: {
        Authorization: "Basic ".concat(
          Buffer.from(
            process.env.CLIENT_ID.concat(":", process.env.CLIENT_SECRET)
          ).toString("base64")
        ),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      json: true,
    };

    const response = await axios(authOptions).catch((error) =>
      console.log(error)
    );

    return response;
  }

  static async refreshAccessToken(refreshToken) {
    const options = {
      method: "POST",
      url: "https://accounts.spotify.com/api/token",
      params: {
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      },
      headers: {
        Authorization: "Basic ".concat(
          Buffer.from(
            process.env.CLIENT_ID.concat(":", process.env.CLIENT_SECRET)
          ).toString("base64")
        ),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      json: true,
    };

    const response = await axios(options).catch((error) => {
      console.error(error);
    });

    return response;
  }
}

module.exports = AuthenticationDAO;
