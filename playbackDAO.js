const axios = require("axios");

class PlaybackDAO {
  static async getPlaylists(auth) {
    const options = {
      method: "GET",
      url: "https://api.spotify.com/v1/me/playlists",
      headers: {
        Authorization: "Bearer ".concat(auth.access_token),
        "Content-Type": "application/json",
      },
    };

    return new Promise((resolve, reject) => {
      axios(options).then(async (response) => {
        const playlists = response.data;
        resolve(playlists.items);
      });
    });
  }

  static async getPlaylist(auth, id) {
    if (id === "") {
      console.log("shit busted");
    }
    const options = {
      method: "GET",
      url: `https://api.spotify.com/v1/playlists/${id}`,
      headers: {
        Authorization: "Bearer ".concat(auth.access_token),
        "Content-Type": "application/json",
      },
    };

    return new Promise((resolve, reject) => {
      axios(options).then(async (response) => {
        const playlist = await response.data;
        resolve(playlist);
      });
    });
  }

  static async getCurrentlyPlayingingTrack(auth) {
    const options = {
      method: "GET",
      url: "https://api.spotify.com/v1/me/player/currently-playing",
      headers: {
        Authorization: `Bearer ${auth.access_token}`,
        "Content-Type": "application/json",
      },
    };

    return new Promise((resolve, reject) => {
      axios(options).then(async (response) => {
        const data = await response.data;
        if (response.status !== 200 || !data) {
          reject(new Error("Nothing is currently playing"));
        } else {
          const currentTrack = {
            songTitle: data.item.name,
            image: data.item.album.images[0].url,
            id: data.item.id,
          };
          resolve(currentTrack);
        }
      });
    });
  }

  static async isCurrentlyPlaying(auth) {
    const options = {
      method: "GET",
      url: "https://api.spotify.com/v1/me/player",
      headers: {
        Authorization: `Bearer ${auth.access_token}`,
        "Content-Type": "application/json",
      },
    };

    return new Promise((resolve, reject) => {
      axios(options).then(async (response) => {
        const data = await response.data;
        console.log(data.is_playing);

        if (data.is_playing === true) {
          resolve(true);
        }
        resolve(false);
      });
    });
  }

  static async albumInfo(auth, uri) {
    const options = {
      method: "GET",
      url: `https://api.spotify.com/v1/albums/${uri}`,
      headers: {
        Authorization: "Bearer ".concat(auth.access_token),
        "Content-Type": "application/json",
      },
    };

    return new Promise((resolve, reject) => {
      axios(options).then(async (response) => {
        const data = await response.data;
        console.log(data.genres);

        resolve(data);
      });
    });
  }

  static async getTrackInfo(auth, uri) {
    const options = {
      method: "GET",
      url: `https://api.spotify.com/v1/tracks/${uri}`,
      headers: {
        Authorization: "Bearer ".concat(auth.access_token),
        "Content-Type": "application/json",
      },
    };

    return new Promise((resolve, reject) => {
      axios(options).then(async (response) => {
        const data = await response.data;

        resolve(data);
      });
    });
  }

  static async getTracksInfo(auth, uris) {
    let uriString = uris[0];
    for (let i = 1; i < uris.length; i += 1) {
      uriString += `,${uris[i]}`;
    }

    console.log(uriString);

    const options = {
      method: "GET",
      url: `https://api.spotify.com/v1/tracks`,
      headers: {
        Authorization: "Bearer ".concat(auth.access_token),
        "Content-Type": "application/json",
      },
      params: {
        ids: uriString,
      },
    };

    return new Promise((resolve, reject) => {
      axios(options).then(async (response) => {
        const data = await response.data;

        resolve(data);
      });
    });
  }

  static async getAvailableDevices(auth) {
    const options = {
      method: "GET",
      url: `https://api.spotify.com/v1/me/player/devices`,
      headers: {
        Authorization: "Bearer ".concat(auth.access_token),
        "Content-Type": "application/json",
      },
    };

    return new Promise((resolve, reject) => {
      axios(options).then(async (response) => {
        const data = await response.data;
        resolve(data);
      });
    });
  }

  static async transferPlayback(auth) {
    const options = {
      method: "PUT",
      url: "https://api.spotify.com/v1/me/player",
      headers: {
        Authorization: "Bearer ".concat(auth.access_token),
        "Content-Type": "application/json",
      },
      data: {
        device_ids: [auth.deviceId],
      },
    };

    await axios(options);
  }

  static async playTrack(auth, uri, position) {
    const options = {
      method: "PUT",
      url: `https://api.spotify.com/v1/me/player/play?device_id=${auth.deviceId}`,
      headers: {
        Authorization: "Bearer ".concat(auth.access_token),
        "Content-Type": "application/json",
      },
      data: {
        context_uri: `spotify:album:${uri}`,
        offset: { position },
      },
    };

    await axios(options);
  }
}

module.exports = PlaybackDAO;
