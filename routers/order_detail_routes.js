const orderDetailController = require("../controllers/order_detail/order_detail_controller");
const router = require("express").Router();
const verifyAuthJwt = require("../middleware/verify_auth_jwt");
const verifyUserType = require("../middleware/verify_user_type");

// index
router.get("/", verifyAuthJwt, orderDetailController.create);

module.exports = router;
