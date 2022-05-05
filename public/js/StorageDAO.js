class StorageDAO {
  static async saveAlbum(uri) {
    await fetch(`/saveAlbum`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ albumUri: uri }),
    });
  }

  static async removeAlbum(uri) {
    await fetch(`/removeAlbum`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ albumUri: uri }),
    });
  }

  static async isLiked(uri) {
    await fetch(`/albumInfo/${uri}`).then(async (response) => {
      const data = await response.json();
      if (data.found === true) {
        document.getElementById("favorite").classList.remove("unliked");
        document.getElementById("favorite").classList.add("liked");
      } else if (
        document.getElementById("favorite").classList.contains("liked")
      ) {
        document.getElementById("favorite").classList.remove("liked");
        document.getElementById("favorite").classList.add("unliked");
      }
    });
  }
}
