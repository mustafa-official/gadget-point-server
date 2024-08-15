const express = require('express');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.elzgrcu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const productCollection = client.db("gadgetPointDB").collection('products');

        //get all products
        app.get('/products', async (req, res) => {
            const { search, brand, category, priceRange, sortPrice, sortDate } = req.query;

            let query = {};
            //for search
            if (search) {
                query.name = { $regex: search, $options: 'i' }
            }
            //for brand name
            const selectBrands = {
                "Lenovo": true,
                "HP": true,
                "Dell": true,
                "ASUS": true,
                "Acer": true,
                "Apple": true,
                "Microsoft": true,
                "CyberPowerPC": true,
                "MSI": true,
                "Samsung": true,
                "LG": true,
                "BenQ": true,
                "ViewSonic": true,
                "Philips": true,
                "AOC": true,
                "Canon": true,
                "Nikon": true,
                "Sony": true,
                "Fujifilm": true,
                "Olympus": true
            }

            if (selectBrands[brand]) {
                query.brand_name = brand;
            }

            //for category
            const selectCategory = {
                "Laptop": true,
                "Desktop": true,
                "Monitor": true,
                "Camera": true,
            }
            if (selectCategory[category]) {
                query.category = category;
            }

            //for price range
            if (priceRange) {
                if (priceRange === "25000-35000") {
                    query.price = { $gte: 25000, $lte: 35000 }
                } else if (priceRange === "41000-50000") {
                    query.price = { $gte: 41000, $lte: 50000 };
                } else if (priceRange === "51000-60000") {
                    query.price = { $gte: 51000, $lte: 60000 };
                } else if (priceRange === "61000-85000") {
                    query.price = { $gte: 61000, $lte: 85000 };
                }
            }

            //for price sorting
            let sorting = {};
            if (sortPrice) {
                if (sortPrice === "low-to-high") {
                    sorting.price = 1;
                } else if (sortPrice === "high-to-low") {
                    sorting.price = -1;
                }
            }

            //for date sorting
            if (sortDate) {
                if (sortDate === "newest-first") {
                    sorting.date_time = -1;
                }
            }

            const result = await productCollection.find(query).sort(sorting).toArray()
            res.send(result)
        })






        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('gadget point')
})

app.listen(port, () => {
    console.log(`gadget point port is ${port}`);
})