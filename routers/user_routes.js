const userController = require("../controllers/user/user");
const router = require("express").Router();

router.post("/register", userController.register);
router.patch("/confirm", userController.confirm);

module.exports = router;
