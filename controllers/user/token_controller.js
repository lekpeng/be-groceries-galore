const models = require("../../models");
const jwt = require("jsonwebtoken");

const createEmailToken = (user) => {
  return jwt.sign({ user }, process.env.JWT_EMAIL_SECRET, {
    expiresIn: "1d",
  });
};

const createAccessToken = (user) => {
  return jwt.sign({ user }, process.env.JWT_AUTH_ACCESS_SECRET, {
    expiresIn: "20s",
  });
};
// use refresh token in cookie to get new access token
const refreshAccessToken = async (req, res) => {
  const cookies = req.cookies;
  const refreshToken = cookies?.jwtRefreshToken;

  if (!refreshToken) return res.status(401).json({ error: "No refresh token" });

  // verify refresh token (also checks expiry)
  let decodedRefreshToken = null;
  try {
    decodedRefreshToken = jwt.verify(refreshToken, process.env.JWT_AUTH_REFRESH_SECRET);
  } catch (err) {
    return res.status(403).json({ error: "Invalid access token" });
  }

  // check whether there is user with matching refresh token

  const user = await models[decodedRefreshToken.user.userType].findOne({
    where: { refreshToken },
  });

  if (!user) {
    return res.status(403).json({
      error: "No user with matching refresh token.",
    });
  }

  // check whether the email of the user and the refresh token matches (tampering)
  if (user.email !== decodedRefreshToken.user.email) {
    return res.status(403).json({
      error: "Invalid access token",
    });
  }

  // create new access token
  const accessToken = createAccessToken({
    name: user.name,
    email: user.email,
    userType: user.userType,
  });

  return res.status(201).json({ accessToken });
};

module.exports = { createEmailToken, createAccessToken, refreshAccessToken };
