require('dotenv').config()
const { MongoClient } = require('mongodb');
const express = require('express')
const cors = require('cors')
const ObjectId = require('mongodb').ObjectId;


const app = express()
const port = process.env.PORT || 4000;

app.use(cors())
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.qwkqk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
  try {
    await client.connect();
    const database = client.db("Car-house");
    const userCollection = database.collection("User");
    const productCollection = database.collection("product");
    const productReviewCollection = database.collection("productReview");
    const CustomerBuyProductCollection = database.collection("CustomerBuyProduct");
    //   get all offers 
    app.get('/product', async (req, res) => {
      const products = productCollection.find({});
      const result = await products.toArray();
      res.json(result);
    });
    //   get all user own offers 
    app.get('/customerOrder/:email', async (req, res) => {
      const usersEmail = req.params.email;
      const offerNum = { userEmail: usersEmail };
      const offerCollect = CustomerBuyProductCollection.find(offerNum);
      const result = await offerCollect.toArray();
      res.json(result);
    });
    //   get all info Customer Buy Product
    app.get('/customerOrder', async (req, res) => {
      const products = CustomerBuyProductCollection.find({});
      const result = await products.toArray();
      res.json(result);
    });
    //   get all Customer Product rate
    app.get('/reviewOrder', async (req, res) => {
      const products = productReviewCollection.find({});
      const result = await products.toArray();
      res.json(result);
    });
    // find one offer 
    app.get('/product/:id', async (req, res) => {
      const productId = req.params.id;
      const productFind = { _id: ObjectId(productId) };
      const result = await productCollection.findOne(productFind);
      res.send(result);
    });
    //chack admin or not
    app.get('/user/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === 'admin') {
          isAdmin = true;
      }
      res.json({ admin: isAdmin });
  })
    //   insert offer 
    app.post('/product', async (req, res) => {
      const data = req.body;
      const result = await productCollection.insertOne(data);
      console.log(`product was insert : ${result.insertedId}`);
      res.send(result);
    });
    //   insert product review 
    app.post('/reviewOrder', async (req, res) => {
      const data = req.body;
      const result = await productReviewCollection.insertOne(data);
      console.log(`product was insert : ${result.insertedId}`);
      res.send(result);
    });
    //insert user name and mail
    app.post('/user', async (req, res) => {
      const userInfo = req.body;
      const result = await userCollection.insertOne(userInfo);
      res.json(result);
    })
    //   insert user Buy information 
    app.post('/customerOrder', async (req, res) => {
      const data = req.body;
      const result = await CustomerBuyProductCollection.insertOne(data);
      console.log(`order info inserted : ${result.insertedId}`);
      console.log(result);
      res.send(result);
    });
    // set a mamber as admin
    app.put('/user/admin', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const update = {
        $set: { role: 'admin' }
      }
      const result = await userCollection.updateOne(filter, update);
      res.json(result);
    })
    // delete product by admin 
    app.delete('/product/:id', async (req, res) => {
      const id = req.params.id;
      const data = { _id: ObjectId(id) };
      const result = await productCollection.deleteOne(data);
      res.json(result);
    });
    // delete customer Order by admin 
    app.delete('/customerOrder/:id', async (req, res) => {
      const id = req.params.id;
      const data = { _id: ObjectId(id) };
      const result = await CustomerBuyProductCollection.deleteOne(data);
      res.json(result);
    });
    // update order info by admin 
    app.put('/customerOrder/:id', async (req, res) => {
      const userId = req.params.id;
      const userInfo = req.body;
      console.log(userInfo);
      const userNumber = { _id: ObjectId(userId) };
      const options = { upsert: true };
      const updateInformation = {
        $set: {
          OrederState: userInfo.OrederState
        },
      };
      const result = await CustomerBuyProductCollection.updateOne(userNumber, updateInformation, options);
      res.json(result);
    })


  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Light House server : ${port}`)
})