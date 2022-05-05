const axios = require("axios");
const mongoose = require("mongoose");
const AlbumArtModel = require("./AlbumArtModel");

let art = mongoose.connection.collections.albumarts;

class StorageDAO {
  static async injectDB(conn) {
    art = await conn.db(process.env.ALBUM_ART_DB).collection("albumarts");
  }

  static async getAlbumArt(quantity) {
    let arr = [];
    const total = await this.getTotal();
    console.log(total);
    try {
      arr = await this.searchIt(quantity, total);
    } catch (err) {
      console.log(`Unable to find documents: ${err}`);
    }
    return arr;
  }

  static async findOne(exclude) {
    const search = await AlbumArtModel.findOne({
      uri: { $nin: exclude },
    }).exec();
    return Promise.all(search);
  }

  // Need to update mongo pull parameters to grab random album arts
  // Possibly go by genre or some other field
  // Could also go with giving each an actual simple id # and
  // just creating a random list of numbers;
  static async searchIt(quantity, total) {
    const random = Math.floor(Math.random() * (total - quantity));
    const array = await AlbumArtModel.find({}).skip(random).limit(quantity);

    return array;
  }

  static async getTotal() {
    const total = art.countDocuments();
    return total;
  }
}

module.exports = StorageDAO;
