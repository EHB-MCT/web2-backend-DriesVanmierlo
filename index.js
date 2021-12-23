const bcrypt = require('bcryptjs');
const express = require('express');
const fs = require('fs/promises');
const bodyParser = require('body-parser');
const cors = require('cors');
const {
    MongoClient,
    ObjectId
} = require('mongodb');
require('dotenv').config();

//Create the mongo client to use
const client = new MongoClient(process.env.FINAL_URL);

const app = express();
const port = process.env.PORT;

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cors());

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

// /kapsalons/61b9df9cd5c8a1b90a90a5ff
app.get('/kapsalon/:id', async (req, res) => {
    // id is located in the query: req.query.id

    try {
        //Connect to the database
        await client.connect();

        //Retrieve the kapsalons collection data
        const colli = client.db("kapsamazing").collection("kapsalons");

        //Only look for the kapsalon with this kapid
        const query = {
            _id: ObjectId(req.params.id)
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

// /kapsalon?id=123456
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

    if (!req.body.kapid || !req.body.name || !req.body.city || !req.body.restaurant || !req.body.type || !req.body.delivered || !req.body.price || !req.body.ratings || !req.body.latitude || !req.body.longitude || !req.body.latestGeneralRating || !req.body.image || !req.body.link) {
        res.status(400).send('Bad request: missing id, name, city, restaurant, type, delivered, price, ratings, latitude, longitude, latestGeneralRating, image or rating');
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
            latitude: req.body.latitude,
            longitude: req.body.longitude,
            latestGeneralRating: req.body.latestGeneralRating,
            image: req.body.image,
            link: req.body.link
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

//Update a kapsalon
app.put('/updateKapsalon/:id', async (req, res) => {
    if (!req.body.kapid || !req.body.name || !req.body.city || !req.body.restaurant || !req.body.type || !req.body.delivered || !req.body.price || !req.body.ratings || !req.body.latitude || !req.body.longitude || !req.body.latestGeneralRating || !req.body.image || !req.body.link) {
        res.status(400).send('Bad request: missing id, name, city, restaurant, type, delivered, price, ratings, latitude, longitude, latestGeneralRating, image or link');
        return;
    }

    try {
        //Connect to the database
        await client.connect();

        //Retrieve the kapsalons collection data
        const colli = client.db("kapsamazing").collection("kapsalons");

        const query = {
            _id: ObjectId(req.params.id)
        };

        //Create the updated kapsalon object
        let updateKapsalon = {
            $set: {
                kapid: req.body.kapid,
                name: req.body.name,
                city: req.body.city,
                restaurant: req.body.restaurant,
                type: req.body.type,
                delivered: req.body.delivered,
                price: req.body.price,
                ratings: req.body.ratings,
                latitude: req.body.latitude,
                longitude: req.body.longitude,
                latestGeneralRating: req.body.latestGeneralRating,
                image: req.body.image,
                link: req.body.link
            }
        };

        //Update the database
        const updateResult = await colli.updateOne(query, updateKapsalon);

        if (updateResult) {
            res.status(201).send({
                succes: "Kapsalon is succesfull updated!",
                value: updateResult
            })
            return;
        } else {
            res.status(400).send({
                error: `Challenge with id "${req.body.id}" could not been found!.`,
                value: error,
            });
        }

    } catch (error) {
        res.status(500).send({
            error: 'Something went wrong',
            value: error
        });
    } finally {
        await client.close();
    }

})

//Update a kapsalon rating
app.put('/rateKapsalon/:id', async (req, res) => {
    if (!req.body.ratings) {
        res.status(400).send('Bad request: missing id, name, city, restaurant, type, delivered, price, ratings, mapboxToken or mapboxStyle');
        return;
    }

    try {
        //Connect to the database
        await client.connect();

        //Retrieve the kapsalons collection data
        const colli = client.db("kapsamazing").collection("kapsalons");

        const query = {
            _id: ObjectId(req.params.id)
        };

        //Create the updated kapsalon object
        let updateKapsalon = {
            $set: {
                ratings: req.body.ratings,
                latestGeneralRating: req.body.latestGeneralRating
            }
        };

        //Update the database
        const updateResult = await colli.updateOne(query, updateKapsalon);

        if (updateResult) {
            res.status(201).send({
                succes: "Kapsalon is succesfull updated!",
                value: updateResult
            })
            return;
        } else {
            res.status(400).send({
                error: `Challenge with id "${req.body.id}" could not been found!.`,
                value: error,
            });
        }

    } catch (error) {
        res.status(500).send({
            error: 'Something went wrong',
            value: error
        });
    } finally {
        await client.close();
    }

})

app.delete('/deleteKapsalon/:id', async (req, res) => {
    try {
        //Connect to the database
        await client.connect();

        //Retrieve the kapsalons collection data
        const colli = client.db("kapsamazing").collection("kapsalons");

        const query = {
            _id: ObjectId(req.params.id)
        };

        await colli.deleteOne(query)
        res.status(200).json({
            succes: 'Succesfully deleted!',
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: 'Something went wrong',
            value: error
        })
    }
})

//ADMINS

//Return all admins from the database
app.get('/admins', async (req, res) => {
    try {
        //Connect to the database
        await client.connect();

        //Retrieve the kapsalons collection data
        const colli = client.db("kapsamazing").collection("admins");

        const allAdmins = await colli.find({}).toArray();
        res.status(200).send(allAdmins);

    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: 'Something went wrong!',
            value: error
        });

    } finally {
        await client.close();
    }
});

//Register a new admin
app.post('/registerAdmin', async (req, res) => {
    try {
        if (!req.body.email || !req.body.password || !req.body.name) {
            res.status(400).send('Bad register: missing email or password!');
            return;
        }

        //Connect to the database
        await client.connect();

        //Retrieve the kapsalons collection data
        const colli = client.db("kapsamazing").collection("admins");

        const admin = await colli.findOne({
            email: req.body.email
        })

        if (admin) {
            res.status(400).send(`This account already exists, with email: "${req.body.email}" ! Use the right email.`);
            return;
        }

        const {
            email,
            password,
            name
        } = req.body

        const hash = await bcrypt.hash(password, 10);

        let Admin = {
            email: req.body.email,
            password: hash,
            name: req.body.name
        }

        await colli.insertOne(Admin);
        res.status(201).json("Succesful added new admin");
        return;

    } catch (error) {
        console.log(error)
        res.status(500).send({
            error: 'Something went wrong',
            value: error
        })

    } finally {
        await client.close()
    }
});

//Login admin
app.post('/loginAdmin', async (req, res) => {
    try {
        if (!req.body.email || !req.body.password) {
            res.status(400).send('Bad login: Missing email or password! Try again.');
            return;
        }

        //Connect to the database
        await client.connect();

        //Retrieve the kapsalons collection data
        const colli = client.db("kapsamazing").collection("admins");

        const admin = await colli.findOne({
            email: req.body.email
        })

        if (!admin) {
            res.status(400).send('No account found with this email! Use a correct email.');
            return;
        }

        const verifyPass = bcrypt.compareSync(req.body.password, admin.password);

        if (verifyPass) {
            res.status(200).json({
                login: true,
                id: admin._id,
                name: admin.name,
                email: admin.email
            });
        } else {
            res.status(400).send("Wrong password, try again.")
        }

    } catch (error) {
        console.log(error)
        res.status(500).send({
            error: 'Something went wrong',
            value: error
        })

    } finally {
        await client.close()
    }
});

app.listen(port, () => {
    console.log(`API is running at port http://localhost:${port}`);
});