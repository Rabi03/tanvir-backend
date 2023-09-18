const express=require('express');
const router=express.Router();
const { isUserAuthenticated} = require('../middleware/auth');
const {processPayment, sendStripeApi, paymentCallback}=require('../controllers/PaymentControllers')

router.route('/payment/process').post(isUserAuthenticated,processPayment);
router.route('/payment/callback/:id').post(paymentCallback);
router.route('/payment/callback/:id').get(paymentCallback);
router.route('/stripeapi').get(isUserAuthenticated,sendStripeApi);

module.exports = router;