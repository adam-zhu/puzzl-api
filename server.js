const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_KEY);
const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(
  `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PW}@cluster0.ph0pk.mongodb.net/${process.env.MONGO_DB_NAME}?retryWrites=true&w=majority`,
  { useNewUrlParser: true },
);
const app = express();
const PORT = Number(process.env.PORT);

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

client.connect(async (err) => {
  const snacks = client.db('puzzl').collection('snacks');
  const orders = client.db('puzzl').collection('orders');

  app.get('/snacks', async (req, res, next) => {
    try {
      const snack_items = await snacks.find().toArray();

      res.json(snack_items);
    } catch (e) {
      next(e);
    }
  });

  app.get('/orders', async (req, res, next) => {
    try {
      const order_items = await orders.find().toArray();

      res.json(order_items);
    } catch (e) {
      next(e);
    }
  });
});

app.post('/create-payment-intent', async (req, res, next) => {
  const { items } = req.body;
  const amount = items.reduce((acc, item) => acc + Number(item.price_cents), 0);

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (e) {
    next(e);
  }
});

app.listen(PORT, function () {
  console.log(`listening on http://localhost:${PORT}`);
});
