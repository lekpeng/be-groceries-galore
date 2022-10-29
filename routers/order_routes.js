const orderController = require("../controllers/order/order_controller");
const router = require("express").Router();
const verifyAuthJwt = require("../middleware/verify_auth_jwt");
const verifyUserType = require("../middleware/verify_user_type");

router.get("/", verifyAuthJwt, orderController.index);

// cart-related
router.get("/cart", verifyAuthJwt, verifyUserType("Customer"), orderController.index);
// 8 quantities of a single product or different products = 8 items
router.post("/cart/add-items", verifyAuthJwt, verifyUserType("Customer"), orderController.addItem);
router.put(
  "/cart/remove-items",
  verifyAuthJwt,
  verifyUserType("Customer"),
  orderController.removeItem
);

module.exports = router;
