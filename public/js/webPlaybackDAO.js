class WebPlaybackDAO {
  constructor() {
    this.position = null;
    this.duration = null;
    this.paused = null;
    this.updateTime = null;
    this.trackName = null;
    this.trackUri = null;
    this.trackImage = null;
    this.artistName = null;
    this.albumUri = null;
    this.seeking = false;
  }

  setPosition(position) {
    this.position = position;
  }

  setCurrTrack(position, duration, paused, track) {
    this.position = position;
    this.duration = duration;
    this.paused = paused;
    this.updateTime = performance.now();
    this.trackName = track.name;
    this.trackUri = track.uri;
    this.trackImage = track.album.images[0].url;
    this.artistName = track.artists[0].name;
    const albumString = track.album.uri.split(":")[2];
    this.albumUri = albumString;
  }

  static async getAccessToken() {
    let data = {};
    try {
      await fetch("/auth/token").then(async (response) => {
        data = await response.json();
      });

      return data.access_token;
    } catch (err) {
      return `Could not fetch access token ${err}`;
    }
  }

  static async refreshAccessToken() {
    let data = {};
    try {
      await fetch("/auth/token/refresh").then(async (response) => {
        data = await response.json();
      });
      return data.access_token;
    } catch (err) {
      return `Could not refresh access token ${err}`;
    }
  }

  static displayTime(timeInMs) {
    const minutes = Math.floor(timeInMs / 1000 / 60);
    const seconds = Math.floor((timeInMs / 1000) % 60);
    const returnedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;

    return `${minutes}:${returnedSeconds}`;
  }

  timeElapsed() {
    const elapsed = this.position + (performance.now() - this.updateTime);
    return elapsed > this.duration ? this.duration : elapsed;
  }
}

// module.exports = WebPlaybackDAO;
