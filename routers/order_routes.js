const orderController = require("../controllers/order/order_controller");
const router = require("express").Router();
const verifyAuthJwt = require("../middleware/verify_auth_jwt");
const verifyUserType = require("../middleware/verify_user_type");
const order = require("../models/order");

router.get("/", verifyAuthJwt, orderController.index);

// cart-related
router.get("/cart", verifyAuthJwt, verifyUserType("Customer"), orderController.index);
router.post("/cart/add-items", verifyAuthJwt, verifyUserType("Customer"), orderController.addItem);
router.put("/cart/remove-items", verifyAuthJwt, verifyUserType("Customer"), orderController.removeItem);

// payment-related
router.post("/payments/intent/new", verifyAuthJwt, verifyUserType("Customer"), orderController.createStripePaymentIntent);
router.patch("/payments/confirm", verifyAuthJwt, verifyUserType("Customer"), orderController.updatePaymentStatus);

module.exports = router;
