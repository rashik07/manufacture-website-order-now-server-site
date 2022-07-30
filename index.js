const express = require("express");
const cors = require("cors");
const jwt = require('jsonwebtoken');
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
  function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).send({ message: 'UnAuthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
      if (err) {
        return res.status(403).send({ message: 'Forbidden access' })
      }
      req.decoded = decoded;
      next();
    });
  }

  async function run() {
    try {
      await client.connect();
      const productCollection = client.db("motor_parts").collection("products");
      const ordersCollection = client.db("motor_parts").collection("orders");
      const userCollection = client.db("motor_parts").collection("users");


      const verifyAdmin = async (req, res, next) => {
        const requester = req.decoded.email;
        const requesterAccount = await userCollection.findOne({ email: requester });
        if (requesterAccount.role === 'admin') {
          next();
        }
        else {
          res.status(403).send({ message: 'forbidden' });
        }
      }
      //get method
      app.get('/user', verifyJWT, async (req, res) => {
        const users = await userCollection.find().toArray();
        res.send(users);
      });
      app.get('/admin/:email', async (req, res) => {
        const email = req.params.email;
        const user = await userCollection.findOne({ email: email });
        const isAdmin = user.role === 'admin';
        res.send({ admin: isAdmin })
      })
  
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
  
      app.get("/orders", verifyJWT,async (req, res) => {
        const email= req.query.email;
        const decodedEmail = req.decoded.email;
        if (email === decodedEmail) {
        const query = {email: email};
      
        const order = await ordersCollection.find(query).toArray();
        res.send(order);
        }
        
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
      app.put('/user/admin/:email',verifyJWT,verifyAdmin, async (req, res) => {
        const email = req.params.email;
        const filter = { email: email };
        const updateDoc = {
          $set: { role: 'admin' },
        };
        const result = await userCollection.updateOne(filter, updateDoc);
        res.send(result);
      })

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

      app.put('/user/:email', async (req, res) => {
        const email = req.params.email;
        const user = req.body;
        const filter = { email: email };
        const options = { upsert: true };
        const updateDoc = {
          $set: user,
        };
        const result = await userCollection.updateOne(filter, updateDoc, options);
        const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
        res.send({ result, token });
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