const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const RegisteredCamp = require('../models/RegisteredCamps');
const Payment = require('../models/Payment');

router.post('/create-payment-intent', async (req, res) => {
  const { amount } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: 'usd',
      payment_method_types: ['card'],
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.get('/registered-camps', async (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).json({ message: 'Email query is required.' });

  try {
    const result = await RegisteredCamp.find({ email });
    res.send(result);
  } catch (error) {
    console.error("Error fetching registered camps:", error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/payment-success/:id', async (req, res) => {
  const id = req.params.id;
  const { transactionId } = req.body;

  try {
    await RegisteredCamp.findByIdAndUpdate(id, {
      paymentStatus: "Paid",
      confirmationStatus: "Pending",
      transactionId,
    });

    await Payment.create({
      registeredCampId: id,
      transactionId,
      status: 'Paid',
      timestamp: new Date(),
    });

    res.send({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
