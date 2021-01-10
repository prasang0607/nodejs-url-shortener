const mongoose = require("mongoose");
const { customAlphabet } = require("nanoid");
const dictionary = require("nanoid-dictionary");

const nanoid = customAlphabet(
  dictionary.lowercase + dictionary.uppercase + dictionary.numbers,
  10
);

const shortUrlSchema = new mongoose.Schema(
  {
    path: {
      type: String,
      required: true,
      unique: true,
    },
    code: {
      type: String,
      default: nanoid,
      unique: true,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    kind: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const ShortUrl = mongoose.model("UrlShortener", shortUrlSchema);

module.exports = ShortUrl;
