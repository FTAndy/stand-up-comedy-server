const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/stand-up-comedy');

mongoose.Promise = global.Promise

const Schema = mongoose.Schema

const ComedianSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  website: String,
  avatarUrl: String,
  backgroundUrls: [String],
  description: String,
  country: String,
  specials: [{
    name: {
      type: String,
      required: true,
      unique: true
    },
    headPicture: {
      type: String,
      required: true
    },
    pictureUrls: [String],
    playAddress: [String],
    date: Number,
    star: {
      type: Number,
      min: 0,
      max: 10
    }
  }]
})

const db = {}

db.Comedian = mongoose.model("Comedian", ComedianSchema)
module.exports = db
