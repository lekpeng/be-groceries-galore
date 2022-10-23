const jwt = require("jsonwebtoken");

// middleware used to access routes that require a valid jwt token

const verifyAuthJwt = (req, res, next) => {
  // verify that the access token is present in the header
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({
      error: "Authentication details empty",
    });
  }

  const [authType, accessToken] = authHeader.split(" ");

  if (authType !== "Bearer") {
    return res.status(401).json({
      error: "Invalid auth type",
    });
  }

  if (!accessToken) {
    return res.status(401).json({
      error: "No access token",
    });
  }

  // verify jwt (also checks expiry)
  // TODO: need to differentiate if invalid due to wrong credentials or expired
  let decodedAccessToken = null;
  try {
    decodedAccessToken = jwt.verify(accessToken, process.env.JWT_AUTH_ACCESS_SECRET);
    req.user = decodedAccessToken.user;
  } catch (err) {
    return res.status(403).json({ error: "Invalid access token" });
  }

  next();
  return;
};

module.exports = verifyAuthJwt;
