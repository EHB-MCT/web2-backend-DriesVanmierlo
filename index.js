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
    console.log(req.query.id);

    try {
        //Read file
        let kapsalons = JSON.parse(await fs.readFile('data/kapsalons.json'));

        //Try and find the kapsalon with provided id
        let kap = kapsalons[req.query.id]

        if (kap) {
            //Send back the file
            res.status(200).send(kap);
            return;
        } else {
            res.status(400).send('Kapsalon could not be found with id: ' + req.query.id);
        }

    } catch (error) {
        console.log(error)
        res.status(500).send('File could not be read! Try again later...')
    }

})

//Save a kapsalon
app.post('/saveKapsalon', async (req, res) => {

    if (!req.body.id || !req.body.name || !req.body.city || !req.body.restaurant || !req.body.type || !req.body.delivered || !req.body.price || !req.body.ratings || !req.body.mapboxToken || !req.body.mapboxStyle) {
        res.status(400).send('Bad request: missing id, name, city, restaurant, type, delivered, price, ratings, mapboxToken or mapboxStyle');
        return;
    }

    try {
        //Read the file
        let kapsalons = JSON.parse(await fs.readFile('data/kapsalons.json'));

        kapsalons[req.body.id] = {
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

        //Save the file
        await fs.writeFile('data/kapsalons.json', JSON.stringify(kapsalons));

        //Send back succesmessage
        res.status(201).send('Kapsalon succesfully saved with id: ' + req.body.id);
        return;

    } catch (error) {
        res.status(500).send('Could not save new kapsalon')
    }
})



app.listen(port, () => {
    console.log(`API is running at port http://localhost:${port}`);
});