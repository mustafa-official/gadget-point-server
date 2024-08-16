const express = require('express');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

const corsOptions = {
    origin: [
        "http://localhost:5173",
        "https://gadget-point-1.web.app",
        "https://gadget-point-1.firebaseapp.com"
    ],
    credentials: true,
    optionSuccessStatus: 200,

}

//middleware
app.use(cors(corsOptions));
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
            const { search, brand, category, priceRange, sortPrice, sortDate, page, size } = req.query;
            let query = {};
            //for search
            if (search) {
                query.name = { $regex: search, $options: 'i' }
            }
            //for brand name
            if (brand) {
                query.brand_name = { $in: brand.split(',') }
            }
            //for category
            if (category) {
                query.category = { $in: category.split(',') }
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
                } else if (sortDate === "oldest-first") {
                    sorting.date_time = 1
                }
            }

            //for pagination
            const totalPage = parseInt(page) - 1;
            const pageSize = parseInt(size);
            const result = await productCollection.find(query).skip(totalPage * pageSize).limit(pageSize).sort(sorting).toArray()
            res.send(result)
        })

        app.get('/page-count', async (req, res) => {
            const { search, category, brand, priceRange } = req.query;
            let query = {}
            if (category) query = { category: category }
            if (brand) query = { brand_name: brand }
            if (search) query = { name: search }

            //for price range
            if (priceRange) {
                if (priceRange === "25000-35000") {
                    query = { price: { $gte: 25000, $lte: 35000 } }
                } else if (priceRange === "41000-50000") {
                    query = { price: { $gte: 41000, $lte: 50000 } };
                } else if (priceRange === "51000-60000") {
                    query = { price: { $gte: 51000, $lte: 60000 } };
                } else if (priceRange === "61000-85000") {
                    query = { price: { $gte: 61000, $lte: 85000 } };
                }
            }


            const count = await productCollection.countDocuments(query);
            res.send({ count })
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