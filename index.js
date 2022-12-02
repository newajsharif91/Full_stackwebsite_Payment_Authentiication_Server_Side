const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId, ObjectID } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken')

const port = process.env.PORT || 5000
const app = express()

// middleware
app.use(cors())
app.use(express.json())





//Mongo__DB_ID AND Password

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8ev4byy.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT(req, res, next) {

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send('Unauthorized access')
  }

  const token = authHeader.split(' ')[1];
  console.log(token);

  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.token.status(403).send({ message: 'forbidden access' })
    }

    req.decoded = decoded;
    next();
  })

}



async function run() {

  try {
    const bikesCollection = client.db("CrazyBikers").collection("bikes");
    const categoryCollection = client.db("CrazyBikers").collection("category");
    const bookingsCollection = client.db("CrazyBikers").collection("bookings");
    const usersCollection = client.db("CrazyBikers").collection("users");

    // get bikes data from database
    app.get("/bikes", async (req, res) => {
      const query = {};
      const options = await bikesCollection.find(query).toArray();
      res.send(options);
    });

    // post bike from add bike in database
    app.post("/bikes", async (req, res) => {
      const bike = req.body;
      const result = await bikesCollection.insertOne(bike);
      res.send(result);
    });

    // get data by category
    app.get("/bikes/:category", async (req, res) => {
      const categoryName = req.params.category;
      const query = { category: categoryName };
      const result = await bikesCollection.find(query).toArray();
      res.send(result);
    });

    // Get biker add by gmail
    app.get("/bikesemail", verifyJWT, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;

      if (email !== decodedEmail) {
        return res
          .status(403)
          .send({ message: "forbidden access from bike data" });
      }

      const query = { email: email };
      const bikes = await bikesCollection.find(query).toArray();
      res.send(bikes);
    });

    // post booking info in bike data
    app.put("/bikes/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          status: "booked",
          // transactionId: payment.transactionId
        },
      };
      const updatedResult = await bikesCollection.updateOne(
        filter,
        updatedDoc,
        options
      );

      res.send(updatedResult);
    });

    // post Report info in bike data
    app.put("/bikesReport/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          report: "reported",
          // transactionId: payment.transactionId
        },
      };
      const updatedResult = await bikesCollection.updateOne(
        filter,
        updatedDoc,
        options
      );

      res.send(updatedResult);
    });

    // post advertise info in bike data
    app.put("/bikesAdvertise/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          status: "advertised",
          // transactionId: payment.transactionId
        },
      };
      const updatedResult = await bikesCollection.updateOne(
        filter,
        updatedDoc,
        options
      );

      res.send(updatedResult);
    });

    // delete data by id from database
    app.delete("/bikes/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      console.log(filter);
      const result = await bikesCollection.deleteOne(filter);
      res.send(result);
    });

    // get bikes data by status booked or advertised name from database
    app.get("/bikesStatus", async (req, res) => {
      const statusAdd = req.query.status;
      const query = { status: statusAdd };
      const result = await bikesCollection.find(query).toArray();
      res.send(result);
    });

    // get bikes data by reported name from database
    app.get("/bikesReported", async (req, res) => {
      const reportAdd = req.query.report;
      const query = { report: reportAdd };
      const result = await bikesCollection.find(query).toArray();
      res.send(result);
    });

    //put verify in bike data
    app.put("/bikeVerify/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      // const options = ( upsert: true)
      const updatedDoc = {
        $set: {
          verify: true,
        },
      };
      const updateBike = await bikesCollection.updateMany(filter, updatedDoc);
      res.send(updateBike);
    });

    // get category data from database
    app.get("/category", async (req, res) => {
      const query = {};
      const options = await categoryCollection.find(query).toArray();
      res.send(options);
    });

    // get bookings data in database by email
    app.get("/bookings", async (req, res) => {
      const email = req.query.email;
      // const decodedEmail = req.decoded.email;

      // if (email !== decodedEmail) {
      //   return res.status(403).send({ message: 'forbidden access from bookings' })
      // }
      // const query = { email: email }

      const query = {};
      const bookings = await bookingsCollection.find(query).toArray();
      res.send(bookings);
    });

    // post or add booking data in database
    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      // console.log(booking)
      const result = await bookingsCollection.insertOne(booking);
      res.send(result);
    });

    // get bookings by id for payment
    app.get("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await bookingsCollection.findOne(query);
      res.send(result);
    });

    //    // STRIPT PAYMENT
    app.post("/create-payment-intent", async (req, res) => {
      const booking = req.body;
      const price = booking.price;
      const amount = price * 100;

      const paymentIntent = await stripe.paymentIntents.create({
        currency: "usd",
        amount: amount,
        payment_method_types: ["card"],
      });
      res.send({
        client_secret: paymentIntent.client_secret,
      });
    });

    // post or add user information in database
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    // get user by role
    app.get("/userRole", async (req, res) => {
      const user = req.query.role;
      // const decodedEmail = req.decoded.email

      const query = { role: user };
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });

    // Delete user by id
    app.delete("/usersDelete/:id", verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const query = { email: decodedEmail };
      const user = await usersCollection.findOne(query);

      if (user?.role !== "admin") {
        return res.status(403).send({ message: "Only Admin Can Delete!!" });
      }

      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await usersCollection.deleteOne(filter);
      res.send(result);
    });

    // add verify in users database
    app.put("/usersVerify/:id", verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const query = { email: decodedEmail };
      const user = await usersCollection.findOne(query);

      if (user?.role !== "admin") {
        return res.status(403).send({ message: "Only Admin Can Verify!!" });
      }

      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const option = { upsert: true };
      const updatedDoc = {
        $set: {
          verify: "seller",
        },
      };
      const updatedREsult = await usersCollection.updateOne(
        filter,
        updatedDoc,
        option
      );
      res.send(updatedREsult);
    });

    // get user by email
    app.get("/userEmail", async (req, res) => {
      const userEmail = req.query.email;
      const query = { email: userEmail };
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });

    // verify admin
    app.get("/userAdmin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);

      res.send({ isAdmin: user?.role === "admin" });
    });
    // verify Seller using name
    app.get("/userSeller/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);

      res.send({ isSeller: user?.role === "seller" });
    });

    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);

      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
          expiresIn: "7d",
        });
        return res.send({ accessToken: token });
      }

      console.log(user);
      res.status(403).send({ accessToken: "" });
    });
  }




  finally {

  }
}



run().catch(error => console.error(error))


app.get('/', async (req, res) => {
  res.send('crazy bikes running')
})


app.listen(port, () => console.log(`Crazy Bikes running on port ${port}`))