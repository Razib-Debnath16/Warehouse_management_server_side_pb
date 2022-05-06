const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

//middleware 
app.use(cors());
app.use(express.json());

// dbUser1
// 85pjoDROrBPLC4OA

// DB connection

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.b2kk5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {

    await client.connect();
    const phoneCollection = client.db("products").collection("smartphone");

    app.get('/products', async (req, res) => {
        const query = {};
        const cursor = phoneCollection.find(query);
        const phones = await cursor.toArray();
        res.send(phones);
    })

    app.get('/product/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await phoneCollection.findOne(query);
        res.send(result);
    })
    app.delete('/product/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await phoneCollection.deleteOne(query);
        res.send(result);
    })
    app.post('/products', async (req, res) => {
        const newItem = req.body;
        const result = await phoneCollection.insertOne(newItem);
        res.send(result);

    })


}

run().catch(console.dir);

app.listen(port, () => {
    console.log('port is running on ', port);
});