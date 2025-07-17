const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Camp = require('../models/camp');
const Payment = require('../models/Payment');
const ParticipantRegistration = require('../models/ParticipantRegistration');
const verifyJWT = require('../middlewares/verifyFirebaseJWT');

// ✅ STEP 1: Create Stripe Checkout Session
router.post('/create-checkout-session', verifyJWT, async (req, res) => {
  console.log('POST /payment/create-checkout-session hit by:', req.user.email);
  const { campId } = req.body;
  console.log('campId received:', campId);
  const userEmail = req.user.email;

  try {
    const camp = await Camp.findById(campId);
    if (!camp) {
      console.log('Camp not found for id:', campId);
      return res.status(404).json({ error: 'Camp not found' });
    }

   const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  mode: 'payment',
  customer_email: userEmail,
  payment_intent_data: {
    metadata: {
      campId: camp._id.toString(),
      participantEmail: userEmail
    }
  },
  line_items: [
    {
      price_data: {
        currency: 'usd',
        product_data: {
          name: camp.campName,
        },
        unit_amount: camp.campFees * 100,
      },
      quantity: 1,
    },
  ],
  success_url: `https://medicamp-1e9cc.web.app/payment/success?session_id={CHECKOUT_SESSION_ID}&campId=${camp._id}`,
  cancel_url: `https://medicamp-1e9cc.web.app/payment/cancel`,
});


    console.log('Stripe checkout session created:', session.id);
    res.json({ url: session.url });
  } catch (err) {
    console.error('❌ Error creating checkout session:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ STEP 2: Handle Success (frontend hits this after redirect)
router.post('/payment-success', verifyJWT, async (req, res) => {
  console.log('POST /payment/payment-success hit by:', req.user.email);
  const { sessionId, campId } = req.body;
  const userEmail = req.user.email;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== 'paid') {
      console.log('❌ Payment not verified for session:', sessionId);
      return res.status(400).json({ error: 'Payment not verified' });
    }

    const transactionId = session.payment_intent || session.id;

    if (!transactionId) {
      console.error('❌ Still no transactionId! Full session:', JSON.stringify(session, null, 2));
      return res.status(400).json({ error: 'Missing transaction ID' });
    }

    const registration = await ParticipantRegistration.findOne({ campId, participantEmail: userEmail });
    if (!registration) {
      console.log('❌ Registration not found for campId:', campId, 'user:', userEmail);
      return res.status(404).json({ error: 'Registration not found' });
    }

    registration.paymentStatus = 'Paid';
    registration.confirmationStatus = 'Confirmed';
    registration.transactionId = transactionId;
    await registration.save();

    await Payment.create({
      participantRegistrationId: registration._id,
      transactionId,
      status: 'Paid',
      timestamp: new Date(),
    });

    console.log('✅ Payment success processed for registration:', registration._id);
    res.json({ success: true });

  } catch (err) {
    console.error('💥 Payment success error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


// ✅ Test route
router.get('/test', (req, res) => {
  res.send('✅ Payment route working fine');
});

module.exports = router;

