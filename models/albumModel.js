const mongoose = require("mongoose");

const albumSchema = new mongoose.Schema(
    {
        name: String,
        artists: Array,
        year: Number,
        price: Number,
        borrowed: Boolean,
        lentOut: Boolean,
        borrowedFrom: String,
        lentOutTo: String,
        liked: Boolean,
        borrowedReturnDate: String,
        lentOutReturnDate: String,
        spotifyId: String,
        coverArtUrl: String,
        wishlist: Boolean,
        songs: Array
    }
)

const Album = mongoose.model("Album", albumSchema);

module.exports = Album;