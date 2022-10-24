const userController = require("../controllers/user/user_controller");
const tokenController = require("../controllers/user/token_controller");
const router = require("express").Router();

router.post("/register", userController.register);
router.patch("/confirm", userController.confirm);
router.post("/login", userController.login);
router.delete("/logout", userController.logout);
router.post("/refresh-token", tokenController.refreshAccessToken);
router.get("/customers-only", userController.customersOnly);

module.exports = router;
