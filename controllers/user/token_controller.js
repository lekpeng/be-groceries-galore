const models = require("../../models");
const jwt = require("jsonwebtoken");

const createEmailToken = (user) => {
  return jwt.sign({ user }, process.env.JWT_EMAIL_SECRET, {
    expiresIn: "1d",
  });
};

const createAccessToken = (user) => {
  return jwt.sign({ user }, process.env.JWT_AUTH_ACCESS_SECRET, {
    expiresIn: "10s",
  });
};

const createRefreshToken = (user) => {
  return jwt.sign({ user }, process.env.JWT_AUTH_REFRESH_SECRET, {
    expiresIn: "1d",
  });
};
// use refresh token in cookie to get new access token
const refreshAccessToken = async (req, res) => {
  console.log("----> REFRESHING ACCESS TOKEN <-------");
  const cookies = req.cookies;
  const refreshToken = cookies?.jwtRefreshToken;

  if (!refreshToken) return res.status(401).json({ error: "No refresh token" });

  // verify refresh token

  let decodedRefreshToken = null;

  try {
    decodedRefreshToken = jwt.verify(refreshToken, process.env.JWT_AUTH_REFRESH_SECRET);
  } catch (err) {
    res.clearCookie("jwtRefreshToken", { secure: true, sameSite: "none" });
    return res.status(403).json({ error: "Invalid refresh token" });
  }

  // check whether there is user with matching refresh token

  const user = await models[decodedRefreshToken.user.userType].findOne({
    where: { refreshToken },
  });

  if (!user) {
    // remove token from cookie
    res.clearCookie("jwtRefreshToken", { secure: true, sameSite: "none" });
    return res.status(403).json({
      error: "No user with matching refresh token.",
    });
  }

  // check whether the email of the user and the refresh token matches (tampering)
  if (user.email !== decodedRefreshToken.user.email) {
    res.clearCookie("jwtRefreshToken", { secure: true, sameSite: "none" });
    return res.status(403).json({
      error: "Invalid refresh token",
    });
  }

  // create new access token
  const accessToken = createAccessToken({
    name: user.name,
    email: user.email,
    userType: decodedRefreshToken.user.userType,
  });

  return res.status(201).json({ accessToken });
};

module.exports = { createEmailToken, createAccessToken, createRefreshToken, refreshAccessToken };
