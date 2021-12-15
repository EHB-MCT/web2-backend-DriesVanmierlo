const express = require('express');
const fs = require('fs/promises');
const app = express();
const port = 1500;

app.use(express.static('public'));

//Root route
app.get('/', (req, res) => {
    res.status(300).redirect('/info.html');
});

//Return all kapsalons from the file
app.get('/kapsalons', async (req, res) => {

    try {
        //Read file
        let data = await fs.readFile('data/kapsalons.json');

        //Send back the file
        res.status(200).send(JSON.parse(data));

    } catch (error) {
        res.status(500).send('File could not be read! Try again later...')
    }

});

app.listen(port, () => {
    console.log(`API is running at port http://localhost:${port}`);
});