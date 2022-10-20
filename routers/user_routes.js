const userController = require("../controllers/user/user");
const router = require("express").Router();

router.post("/register", userController.register);

module.exports = router;
