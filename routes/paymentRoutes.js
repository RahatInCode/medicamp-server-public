const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Camp = require('../models/camp');
const Payment = require('../models/Payment');
const ParticipantRegistration = require('../models/ParticipantRegistration');
const verifyJWT = require('../middlewares/verifyFirebaseJWT');

// ✅ STEP 1: Create Stripe Checkout Session
router.post('/create-checkout-session', verifyJWT, async (req, res) => {
  const { campId } = req.body;
  const userEmail = req.user.email;

  try {
    const camp = await Camp.findById(campId);
    if (!camp) {
      return res.status(404).json({ error: 'Camp not found' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: userEmail,
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
      success_url: `http://localhost:5173/payment/success?session_id={CHECKOUT_SESSION_ID}&campId=${camp._id}`,
      cancel_url: `http://localhost:5173/payment/cancel`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('❌ Error creating checkout session:', err.message);
    res.status(500).json({ error: err.message });
  }
});


// ✅ STEP 2: Handle Success (frontend hits this after redirect)
router.post('/payment-success', verifyJWT, async (req, res) => {
  const { sessionId, campId } = req.body;
  const userEmail = req.user.email;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not verified' });
    }

    const registration = await ParticipantRegistration.findOne({ campId, participantEmail: userEmail });
    if (!registration) return res.status(404).json({ error: 'Registration not found' });

    registration.paymentStatus = 'Paid';
    registration.confirmationStatus = 'Confirmed';
    registration.transactionId = session.payment_intent;
    await registration.save();

    await Payment.create({
      participantRegistrationId: registration._id,
      transactionId: session.payment_intent,
      status: 'Paid',
      timestamp: new Date(),
    });

    res.json({ success: true });
  } catch (err) {
    console.error('💥 Payment success error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Test route
router.get('/test', (req, res) => {
  res.send('✅ Payment route working fine');
});

module.exports = router;


