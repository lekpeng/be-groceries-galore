const verifyUserType = (userTypeAllowed) => {
  return (req, res, next) => {
    if (!req?.user) {
      return res.status(401).json({
        error: "User object not set.",
      });
    }

    const isVerified = req.user.userType === userTypeAllowed;
    if (!isVerified) {
      return res.status(401).json({
        error: "User is not verified",
      });
    }
    next();
  };
};

module.exports = verifyUserType;
