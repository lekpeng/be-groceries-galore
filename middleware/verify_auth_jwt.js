const jwt = require("jsonwebtoken");

// middleware used to access routes that require a valid jwt token

const verifyAuthJwt = (req, res, next) => {
  // verify that the access token is present in the header
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    console.log("MIDDLEWARE 401", "no auth header");
    return res.status(401).json({
      error: "Authentication details empty",
    });
  }

  const [authType, accessToken] = authHeader.split(" ");

  if (authType !== "Bearer") {
    console.log("MIDDLEWARE 401", "invalid auth type");
    return res.status(401).json({
      error: "Invalid auth type",
    });
  }

  if (!accessToken) {
    console.log("MIDDLEWARE 401", "no access token");
    return res.status(401).json({
      error: "No access token",
    });
  }

  // verify jwt (also checks expiry)
  let decodedAccessToken = null;
  try {
    decodedAccessToken = jwt.verify(accessToken, process.env.JWT_AUTH_ACCESS_SECRET);
    req.user = decodedAccessToken.user;
    console.log("DECODED ACCESS TOKEN IN VERIFY FUNC", decodedAccessToken);
  } catch (err) {
    // in the front end, we will call refreshAccessToken from the token_controller
    // perhaps want to implement it so that we only refresh access token if the reason jwt.verify is due to expiration
    console.log("MIDDlEWARE 403", "invalid token");
    return res.status(403).json({ error: "Invalid access token" });
  }
  console.log("passed verifyAuthJwt middleware");
  next();
  return;
};

module.exports = verifyAuthJwt;
