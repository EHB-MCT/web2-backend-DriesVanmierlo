const express = require('express');
const fs = require('fs/promises');
const bodyParser = require('body-parser');
const {
    MongoClient
} = require('mongodb');
const config = require('./config.json');

//Create the mongo client to use
const client = new MongoClient(config.finalUrl);

const app = express();
const port = 1500;

app.use(express.static('public'));
app.use(bodyParser.json());

//Root route
app.get('/', (req, res) => {
    res.status(300).redirect('/info.html');
});

//Return all kapsalons from the database
app.get('/kapsalons', async (req, res) => {

    try {

        //Connect to the database
        await client.connect();

        //Retrieve the kapsalons collection data
        const colli = client.db("kapsamazing").collection("kapsalons");
        const kapsalons = await colli.find({}).toArray();


        //Send back the file
        res.status(200).send(kapsalons);

    } catch (error) {
        console.log(error)
        res.status(500).send({
            error: 'Something went wrong',
            value: error
        });
    } finally {
        await client.close();
    }
});

// /kapsalons?id=123456
app.get('/kapsalon', async (req, res) => {
    // id is located in the query: req.query.id

    try {
        //Connect to the database
        await client.connect();

        //Retrieve the kapsalons collection data
        const colli = client.db("kapsamazing").collection("kapsalons");

        //Only look for the kapsalon with this kapid
        const query = {
            kapid: req.query.id
        };

        const kap = await colli.findOne(query);

        if (kap) {
            //Send back the file
            res.status(200).send(kap);
            return;
        } else {
            res.status(400).send('Kapsalon could not be found with id: ' + req.query.id);
        }

    } catch (error) {
        console.log(error)
        res.status(500).send({
            error: 'Something went wrong',
            value: error
        })
    } finally {
        await client.close();
    }

})

//Save a kapsalon
app.post('/saveKapsalon', async (req, res) => {

    if (!req.body.kapid || !req.body.name || !req.body.city || !req.body.restaurant || !req.body.type || !req.body.delivered || !req.body.price || !req.body.ratings || !req.body.mapboxToken || !req.body.mapboxStyle) {
        res.status(400).send('Bad request: missing id, name, city, restaurant, type, delivered, price, ratings, mapboxToken or mapboxStyle');
        return;
    }

    try {

        //Connect to the database
        await client.connect();

        //Retrieve the kapsalons collection data
        const colli = client.db("kapsamazing").collection("kapsalons");

        //Validation for double boardgames
        const kap = await colli.findOne({
            kapid: req.body.kapid
        });
        if (kap) {
            res.status(400).send('Bad request: kapsalon already exists with kapid: ' + req.body.kapid);
            return;
        }

        //Create the new kapsalon object
        let newKapsalon = {
            kapid: req.body.kapid,
            name: req.body.name,
            city: req.body.city,
            restaurant: req.body.restaurant,
            type: req.body.type,
            delivered: req.body.delivered,
            price: req.body.price,
            ratings: req.body.ratings,
            mapboxToken: req.body.mapboxToken,
            mapboxStyle: req.body.mapboxStyle
        }

        //Insert into the database
        let insertResult = await colli.insertOne(newKapsalon);

        //Send back succesmessage
        res.status(201).send('Kapsalon succesfully saved with kapid: ' + req.body.kapid);
        return;

    } catch (error) {
        res.status(500).send({
            error: 'Something went wrong',
            value: error
        });
    } finally {
        await client.close();
    }
})



app.listen(port, () => {
    console.log(`API is running at port http://localhost:${port}`);
});