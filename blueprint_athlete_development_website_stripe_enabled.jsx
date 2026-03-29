// FULL BLUEPRINT ATHLETE DEVELOPMENT PLATFORM (ENHANCED)
// Includes: Stripe + Onboarding + Redirect + Email Flow (Frontend + Backend)

import React from "react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe("YOUR_STRIPE_PUBLISHABLE_KEY");

const plans = [
  { name: "Lifting Program", price: "$25/month", priceId: "price_lifting" },
  { name: "Throwing Program", price: "$25/month", priceId: "price_throwing" },
  { name: "Mobility Program", price: "$10/month", priceId: "price_mobility" },
  { name: "Training Plus", price: "$35/month", priceId: "price_plus" },
  { name: "Training Premium", price: "$40/month", priceId: "price_premium", highlight: true },
];

export default function Home() {
  const handleCheckout = async (priceId) => {
    const stripe = await stripePromise;

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId }),
    });

    const data = await res.json();
    await stripe.redirectToCheckout({ sessionId: data.sessionId });
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-4xl font-bold text-center mb-4">Blueprint Athlete Development</h1>
      <p className="text-center mb-10">Build Your Blueprint. Perform at Your Peak.</p>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.name} className={`p-6 rounded-2xl border ${plan.highlight ? "border-yellow-400" : "border-gray-700"}`}>
            <h2 className="text-xl font-semibold mb-2">{plan.name}</h2>
            <p className="mb-4">{plan.price}</p>
            <button onClick={() => handleCheckout(plan.priceId)} className="bg-white text-black px-4 py-2 rounded-xl w-full">
              Get Started
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ================= BACKEND: STRIPE CHECKOUT =================
// /pages/api/checkout.js

import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const { priceId } = req.body;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: "http://localhost:3000/success",
    cancel_url: "http://localhost:3000/",
  });

  res.status(200).json({ sessionId: session.id });
}

// ================= SUCCESS PAGE =================
// /pages/success.js

export default function Success() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-3xl font-bold mb-4">You're In 🚀</h1>
      <p className="mb-6">Next step: Complete your athlete assessment to receive your custom program.</p>
      <a href="https://YOUR_GOOGLE_FORM_LINK" className="bg-black text-white px-6 py-3 rounded-xl">
        Complete Assessment
      </a>
    </div>
  );
}

// ================= EMAIL AUTOMATION (OPTIONAL - NODEMAILER) =================
// /pages/api/email.js

import nodemailer from "nodemailer";

export default async function handler(req, res) {
  const { email } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Welcome to Blueprint Athlete Development",
    text: `Welcome! Complete your onboarding here: https://YOUR_GOOGLE_FORM_LINK`,
  });

  res.status(200).json({ success: true });
}

// ================= WHAT YOU STILL NEED =================

/*
1. Replace Stripe Keys
2. Add real Stripe price IDs
3. Create Google Form with:
   - Mobility test
   - Strength test
   - Body measurements
   - Video upload
   - Training history
   - Injury history
4. Paste form link into success page + email
5. (Optional) Connect Zapier:
   Stripe → Send Email → Store Athlete Data
*/

// ================= OPTIONAL NEXT STEP =================
// Add database + login system later (Firebase or Supabase)
