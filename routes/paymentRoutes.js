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

    console.log(`POST /payment/create-checkout-session hit by: ${userEmail}`);
    console.log(`campId received: ${campId}`);
    console.log(`Stripe checkout session created: ${session.id}`);

    res.json({ url: session.url });
  } catch (err) {
    console.error('❌ Error creating checkout session:', err.message);
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

    const transactionId = session?.payment_intent;
    if (!transactionId) {
      console.error('❌ Missing transactionId in session:', session);
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
      transactionId: transactionId,
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


// ✅ Get all payments by logged-in user
// ✅ Get paginated payments for logged-in user
router.get('/history', verifyJWT, async (req, res) => {
  const userEmail = req.user.email;

  // 📦 Get page and limit from query, fallback to 1 & 5
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const skip = (page - 1) * limit;

  try {
    // 🧠 First, get all registrations by user
    const registrations = await ParticipantRegistration.find({ participantEmail: userEmail });
    const regIds = registrations.map(reg => reg._id);

    // 💰 Then, get paginated payments for those registrations
    const payments = await Payment.find({
      participantRegistrationId: { $in: regIds },
    })
      .populate({
        path: 'participantRegistrationId',
        populate: {
          path: 'campId',
          model: 'Camp',
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // 🧮 Get total count for frontend pagination
    const total = await Payment.countDocuments({
      participantRegistrationId: { $in: regIds },
    });

    res.json({ payments, total });
  } catch (err) {
    console.error("❌ Error fetching paginated payment history:", err);
    res.status(500).json({ error: 'Server error' });
  }
});


// ✅ Test route
router.get('/test', (req, res) => {
  res.send('✅ Payment route working fine');
});

module.exports = router;



