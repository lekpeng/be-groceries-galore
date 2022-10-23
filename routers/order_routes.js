const orderController = require("../controllers/order/order_controller");
const router = require("express").Router();
const verifyAuthJwt = require("../middleware/verify_auth_jwt");

// index
router.get("/", verifyAuthJwt, orderController.index);

module.exports = router;
