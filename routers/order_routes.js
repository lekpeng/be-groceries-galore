const orderController = require("../controllers/order/order_controller");
const router = require("express").Router();
const verifyAuthJwt = require("../middleware/verify_auth_jwt");
const verifyUserType = require("../middleware/verify_user_type");

// index
router.get("/", verifyAuthJwt, orderController.index);
router.post("/new", verifyAuthJwt, verifyUserType("Customer"), orderController.create);

module.exports = router;
