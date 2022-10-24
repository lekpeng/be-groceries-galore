const verifyUserType = (userTypeAllowed) => {
  return (req, res, next) => {
    if (!req?.user) {
      return res.status(401).json();
    }

    const isVerified = req.user.userType === userTypeAllowed;
    if (!isVerified) {
      return res.status(401).json();
    }
    next();
  };
};

module.exports = verifyUserType;
