const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;
require("dotenv").config();
const { MongoClient, ServerApiVersion , ObjectId} = require('mongodb');

const app = express();

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pmwqx.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
  });

  async function run() {
    try {
      await client.connect();
      const productCollection = client.db("motor_parts").collection("products");
      const ordersCollection = client.db("motor_parts").collection("orders");
  
      app.get("/products", async (req, res) => {
        const query = {};
        const cursor = productCollection.find(query);
        const products = await cursor.toArray();
        res.send(products);
      });
  
      app.get("/products/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
  
        const products = await productCollection.findOne(query);
        res.send(products);
      });
  
      app.get("/orders", async (req, res) => {
        const customer= req.query.email;
        const query = {customer:customer};
        const cursor = ordersCollection.find(query);
        const products = await cursor.toArray();
        res.send(products);
      });



      //POST
      app.post("/products", async (req, res) => {
        const newProduct = req.body;
        const result = await productCollection.insertOne(newProduct);
        res.send(result);
      });

      app.post("/orders", async (req, res) => {
        const newProduct = req.body;
        const result = await ordersCollection.insertOne(newProduct);
        res.send(result);
      });
  
      // update product
      app.put("/products/:id", async (req, res) => {
        const id = req.params.id;
        const updatedProduct = req.body;
        const filter = { _id: ObjectId(id) };
        const options = { upsert: true };
        const updatedDoc = {
          $set: {
            available_quantity: updatedProduct.quantity,
           
          },
        };
        const result = await productCollection.updateOne(
          filter,
          updatedDoc,
          options
        );
        res.send(result);
      });
  
      // DELETE
      app.delete('/products/:id', async (req, res) => {
          const id = req.params.id;
          const query = { _id: ObjectId(id) };
          const result = await productCollection.deleteOne(query);
          res.send(result);
      });

      app.delete('/orders/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await ordersCollection.deleteOne(query);
        res.send(result);
    });
      
    } finally {
    }
  }




run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("running runningfvhgfhfgh");
});

app.listen(port, () => {
  console.log("listening");
});