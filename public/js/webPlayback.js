let accessToken = "";

// TODO:
// 1. get rid of console log statements
// 2. Look through error messages to see what we can better catch
// 3. Incorporate better

window.onSpotifyWebPlaybackSDKReady = async () => {
  const playback = new WebPlaybackDAO();

  // Initialize a new Spotify Player
  const player = new Spotify.Player({
    name: "Album Art Display",
    getOAuthToken: async (callback) => {
      // Callback function to retrieve the AccessToken
      if (accessToken === "") {
        accessToken = await WebPlaybackDAO.getAccessToken();
        // If the AccessToken has expired, then refresh the AccessToken
      } else {
        accessToken = await WebPlaybackDAO.refreshAccessToken();
      }
      callback(accessToken);
    },
  });

  // Handle whenever the state of the player changes
  player.addListener("player_state_changed", (state) => {
    // If there is no state, only display album art that I like
    if (!state) {
      console.error(
        "OOP OOPUser is not playing music through the Web Playback SDK"
      );
      document.querySelector("#currentlyPlaying").style.display = "none";
      document.querySelector("#myCarousel").style.display = "block";
      return;
    }
    // If the player is on and listening through the window:
    // Display only the player and its functionality
    playback.setCurrTrack(
      state.position,
      state.duration,
      state.paused,
      state.track_window.current_track
    );

    StorageDAO.isLiked(playback.albumUri);

    document.getElementById("artistName").innerHTML = playback.artistName;
    document.getElementById("trackTitle").innerHTML = playback.trackName;
    SliderDAO.setMax(playback.duration);
    SliderDAO.setTime(
      "duration",
      WebPlaybackDAO.displayTime(playback.duration)
    );

    document.querySelector("#currentlyPlaying").style.display = "block";
    document.querySelector("#myCarousel").style.display = "none";

    document.getElementById("albumart").src = playback.trackImage;
  });

  // Add Listeners for any changes or errors to the player
  player.addListener("ready", ({ device_id }) => {
    document.querySelector("#currentlyPlaying").style.display = "none";
    document.querySelector("#myCarousel").style.display = "block";
    console.log(`Ready with Device ID: ${device_id}`);
  });

  player.addListener("not_ready", ({ device_id }) => {
    console.log(`Device ID is not ready for playback: ${device_id}`);
  });

  player.addListener("autoplay_failed", () => {
    console.log("Autoplay is not allowed by the browser autoplay rules");
  });

  player.on("initialization_error", ({ message }) => {
    console.error(`Failed to initilize: ${message}`);
  });

  player.on("authentication_error", ({ message }) => {
    console.error(`Failed to authenticate:  ${message}`);
  });

  player.on("account_error", ({ message }) => {
    console.error(`Failed to validate Spotify account: ${message}`);
  });

  player.on("playback_error", ({ message }) => {
    console.error(`Failed to perform playback: ${message}`);
  });

  // Display the Current Position of the track
  setInterval(() => {
    if (playback.paused === false) {
      const elapsed = playback.timeElapsed();
      const spoon = document.getElementById("seekSlider");
      const dongle = document.getElementById("rangeV");

      if (playback.seeking === false) {
        document.getElementById("seekSlider").value = elapsed;
        SliderDAO.setBubbler(spoon, dongle);
      }
      SliderDAO.setTime("current-time", WebPlaybackDAO.displayTime(elapsed));
    } else if (playback.paused === true) {
      SliderDAO.setTime(
        "current-time",
        WebPlaybackDAO.displayTime(playback.position)
      );
    }
  }, 1000);

  const slider = document.getElementById("seekSlider");

  slider.onmousedown = () => {
    playback.seeking = true;
  };

  slider.onmouseup = () => {
    player.seek(SliderDAO.getPosition());
    playback.seeking = false;
  };

  // Buttons
  // NEXT Track Button
  document.getElementById("next").onclick = () => {
    player.nextTrack();
    console.log("Skipped to next track");
  };

  // PREV Track Button
  document.getElementById("prev").onclick = () => {
    player.previousTrack();
    console.log("Skipped to Previous track");
  };

  // TOGGLE PLAY Button
  document.getElementById("togglePlay").onclick = () => {
    if (playback.paused === false) {
      document.getElementById("togglePlay").innerHTML =
        '<span class="material-icons md-48">play_circle_filled</span>';
    } else {
      document.getElementById("togglePlay").innerHTML =
        '<span class="material-icons md-48">pause_circle_filled</span>';
    }

    player.togglePlay().then(() => {
      console.log("Toggled playback!");
    });
  };

  // STOP Button --
  // Spotify has no remove-listener function, only transfer-listeners
  document.getElementById("stop").onclick = () => {
    location.reload();
  };

  // FAVORITE Button
  // Like the Album Art and save it to the Database
  const favorite = document.getElementById("favorite");
  favorite.onclick = async () => {
    if (favorite.classList.contains("liked")) {
      favorite.classList.remove("liked");
      favorite.classList.add("unliked");
      await StorageDAO.removeAlbum(playback.albumUri);
      console.log("Removed from album art");
    } else {
      favorite.classList.remove("unliked");
      favorite.classList.add("liked");
      await StorageDAO.saveAlbum(playback.albumUri);
      console.log("Added album art");
    }
  };

  // CONNECT to Spotify Web Playback SDK
  player.connect().then((success) => {
    if (success) {
      console.log("The Web Playback SDK successfully connected to Spotify!");
    }
  });
};
