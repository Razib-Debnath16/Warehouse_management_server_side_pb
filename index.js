const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

//middleware 
app.use(cors());
app.use(express.json());

// verify jwt

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden Access' })
        }
        console.log('decoded', decoded);
        req.decoded = decoded;
        next();
    })
}





// dbUser1
// 85pjoDROrBPLC4OA

// DB connection

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.b2kk5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {

    await client.connect();
    const phoneCollection = client.db("products").collection("smartphone");
    const myCollection = client.db("products").collection("myPhones");

    // Auth
    app.post('/login', async (req, res) => {
        const user = req.body;
        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '1d'
        });
        res.send({ accessToken });
    })

    app.get('/myProducts', async (req, res) => {
        const query = {};
        const cursor = myCollection.find(query);
        const phones = await cursor.toArray();
        res.send(phones);
    })
    // products api
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
    app.get('/products/email', verifyJWT, async (req, res) => {
        const decodedEmail = req.decoded.email;
        const email = req.query.email;

        const query = { email: email };
        const cursor = phoneCollection.find(query);
        const phones = await cursor.toArray();
        res.send(phones);
        // else {
        //     return res.status(403).send({ message: 'Forbidden' })
        // }


    })
    app.put('/product/:id', async (req, res) => {
        const id = req.params.id;
        const user = req.body;
        const filter = { _id: ObjectId(id) };
        const options = { upsert: true };
        const updateDoc = {
            $set: {
                quantity: user.quantity,
                sold: user.sold,
                name: user.name,
                email: user.email,
                description: user.description,
                supplierName: user.supplierName,
                price: user.price
            },
        };
        const result = await phoneCollection.updateOne(filter, updateDoc, options);
        res.send(result);
    })


}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('hello world');
})
app.listen(port, () => {
    console.log('port is running on ', port);
});