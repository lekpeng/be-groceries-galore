const userController = require("../controllers/user/user_controller");
const tokenController = require("../controllers/user/token_controller");
const router = require("express").Router();

router.post("/register", userController.register);
router.patch("/confirm", userController.confirm);
router.post("/login", userController.login);
router.get("/refresh-token", tokenController.refreshAccessToken);

module.exports = router;
