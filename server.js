const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
const Album = require("./models/albumModel")
const app = express();

app.use(express.json())
app.use(cors())


app.get("/albums", async(req, res) => {
    try {
        const albums = await Album.find()
        res.status(200).json(albums);
        console.log("received /albums GET")
    } catch (error) {
        console.log(error);
        res.status(500).json({message: error.message});
    }
})

app.delete("/albums/:id", async(req, res) => {
    try {
        await Album.deleteOne({_id: req.params.id});

        res.status(200).json(await Album.find());
    } catch (error) {
        console.log(error);
        res.status(500).json({message: error.message})
    }
})

app.get("/albums/:id", async(req, res) => {
    try {
        const album = await Album.findById(req.params.id);
        res.status(200).json(album);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: error.message});
    }
})

app.patch("/albums/:id", async(req, res) => {
    try {
        const albumId = req.params.id;
        const toUpdate = req.body;
        let fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
        console.log(fullUrl);

        await Album.updateOne({_id: albumId}, toUpdate);
        res.status(200).json(await Album.find());
    } catch (error) {
        console.log(error.message);
        res.status(500).json({message: error.message})
    }
})

app.patch("/album/:id", async(req, res) => {
    const albumId = req.params.id
    const toUpdate = req.body
    
    await Album.updateOne({_id: albumId}, toUpdate);
    res.status(200).json(await Album.findById(albumId));
})

app.post("/albums/add", async(req, res) => {
    try {
        const options = id => {
            return { 
                method: 'GET',
                url: 'https://spotify23.p.rapidapi.com/album_tracks/',
                params: {
                    id: id,
                    offset: '0',
                    limit: '300'
                },
                headers: {
                    'X-RapidAPI-Key': '44f624c25cmsh937cfb9044c8bddp1b35e2jsn0542bcf58aa0',
                    'X-RapidAPI-Host': 'spotify23.p.rapidapi.com'
                }
            }
        }

        const album = req.body;
        const apiRes = await axios.request(options(album.spotifyId));
        const songs = apiRes.data.data.album.tracks.items

        const songsList = songs.map(song => {
            return {
                name: song.track.name,
                listenedTo: false,
                favorited: false
            }
        })

        album.songs = songsList

        const newAlbum = new Album(album);
        await newAlbum.save();

        const albums = await Album.find()
        console.log(albums);
        res.status(200).json(albums);
        console.log("successfully added album!")
    } catch (error) {
        console.log(error);
        res.status(500).json({"message":  error.message})
    }
})

app.get("/album/search", async(req, res) => {
    try {
        const query = req.query.q;
        const options = { 
            method: "GET",
            url: "https://spotify23.p.rapidapi.com/search/",
            params: {
                q: query,
                type: "albums",
                numberOfTopResults: "5",
                limit: "3"
            },
            headers: {
                'X-RapidAPI-Key': '44f624c25cmsh937cfb9044c8bddp1b35e2jsn0542bcf58aa0',
                'X-RapidAPI-Host': 'spotify23.p.rapidapi.com'
            }
        }

        const apiRes = await axios.request(options);
        const albums = apiRes.data.albums.items

        console.log("request made")

        const albumsList = albums.map(album => {
            return {
                name: album.data.name,
                artists: album.data.artists.items.map(artist => artist.profile.name),
                spotifyId: album.data.uri.split(":")[2],
                coverArtUrl: album.data.coverArt.sources[0].url,
                year: album.data.date.year
            }
        })

        res.status(200).json(albumsList);
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message})
    }
})

mongoose.set("strictQuery", false)

main().catch(err => console.log(err))

async function main() {
    await mongoose.connect("mongodb+srv://schneider-inc:z3taF0nction@juliette.kn39dw3.mongodb.net/albums?retryWrites=true&w=majority")
    .then(() => {
        app.listen(3000, () => {
            console.log("Node API app is running on port 3000")
        })
        console.log("Connected to MongoDB")
    }).catch((error) => {
        console.log(error)
    })
}