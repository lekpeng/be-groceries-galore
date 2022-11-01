const userController = require("../controllers/user/user_controller");
const tokenController = require("../controllers/user/token_controller");
const profileController = require("../controllers/user/profile_controller");
const router = require("express").Router();
const verifyAuthJwt = require("../middleware/verify_auth_jwt");
const verifyUserType = require("../middleware/verify_user_type");

// Auth
router.post("/register", userController.register);
router.patch("/confirm", userController.confirm);
router.post("/login", userController.login);
router.delete("/logout", userController.logout);
router.post("/refresh-token", tokenController.refreshAccessToken);

// Profiles
router.get("/profiles/:userType", profileController.index);
router.get("/profiles/:userType/:email", profileController.show);

module.exports = router;
