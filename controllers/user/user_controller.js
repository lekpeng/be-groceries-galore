const models = require("../../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { createAccessToken, createEmailToken, createRefreshToken } = require("./token_controller");

const transporter = nodemailer.createTransport({
  service: "hotmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const otherUserType = (userType) => (userType === "Customer" ? "Merchant" : "Customer");

const sendConfirmationEmail = async (user) => {
  const emailToken = createEmailToken(user);

  const url = `${process.env.REACT_APP_FRONTEND_URL}/confirm/${emailToken}`;
  try {
    await transporter.sendMail({
      from: `"Groceries Galore" <${process.env.EMAIL}>`, // sender address
      to: user.email, // list of receivers
      subject: "Groceries Galore: Confirm your email", // Subject line
      html: `Please click this link to confirm your email: <a href="${url}">${url}</a>`,
    });
    return "success";
  } catch (err) {
    return err;
  }
};

const confirm = async (req, res) => {
  const emailToken = req.body.emailToken;

  let decodedEmailToken = null;
  try {
    decodedEmailToken = jwt.verify(emailToken, process.env.JWT_EMAIL_SECRET);
  } catch (err) {
    return res.status(500).json({ error: "Email token could not be verified" });
  }

  const { email, userType } = decodedEmailToken.user;
  try {
    await models[userType].update(
      { isConfirmed: true },
      {
        where: {
          email,
        },
      }
    );
    return res.status(200).json();
  } catch (err) {
    return res.status(500).json({ error: "User confirmation failed. Error: " + err });
  }
};

const register = async (req, res) => {
  const { formData, userType } = req.body;
  const { name, email, password, confirmPassword, address, phoneNumber } = formData;

  const existingUser = await models[userType].findOne({
    where: { email },
  });

  if (existingUser) {
    return res.status(400).json({
      error: "There is an existing account with this email. Please log in instead.",
    });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({
      error: "Passwords do not match. Please try again!",
    });
  }

  // create user
  const passwordHash = await bcrypt.hash(password, 10);
  const userDetails = {
    name,
    email,
    passwordHash,
    address,
    phoneNumber,
  };
  try {
    await models[userType].create(userDetails);
  } catch (err) {
    return res.status(500).json({ error: "Failed to add user to DB" });
  }

  // send confirmation email
  const statusOfSentEmail = await sendConfirmationEmail({
    email,
    name,
    userType,
  });
  if (statusOfSentEmail === "success") {
    return res.status(201).json();
  } else {
    return res.status(502).json({
      error: "User added to DB but confirmation email failed to send. Error: " + statusOfSentEmail,
    });
  }
};

const login = async (req, res) => {
  const { formData, userType } = req.body;
  const { email, password } = formData;

  let errorMsg = `Email or password is incorrect. Did you mean to login as a ${otherUserType(userType)} user?`;

  const user = await models[userType].findOne({
    where: { email },
  });

  if (!user) {
    return res.status(401).json({
      error: errorMsg,
    });
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordCorrect) {
    return res.status(401).json({
      error: errorMsg,
    });
  }

  // check whether user is confirmed

  if (!user.isConfirmed) {
    return res.status(403).json({
      error: "Email not verified. Please click on link in our confirmation email.",
    });
  }

  const name = user.name;

  // change to 10 min later
  const accessToken = createAccessToken({ name, email, userType });
  const refreshToken = createRefreshToken({ name, email, userType });

  try {
    // add refresh token to user in DB
    await user.update({ refreshToken });

    res.cookie("jwtRefreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({ accessToken });
  } catch (err) {
    return res.status(500).json({ error: "User confirmation failed." });
  }
};

const logout = async (req, res) => {
  const cookies = req.cookies;
  const refreshToken = cookies?.jwtRefreshToken;

  if (!refreshToken) return res.status(204).json();

  // remove refresh token
  res.clearCookie("jwtRefreshToken", { httpOnly: true, secure: true, sameSite: "None" });
  // verify refresh token (ignores expiry)
  let decodedRefreshToken = null;
  try {
    decodedRefreshToken = jwt.verify(refreshToken, process.env.JWT_AUTH_REFRESH_SECRET, {
      ignoreExpiration: true,
    });
  } catch (err) {
    return res.status(204).json();
  }

  // check whether there is user with matching refresh token and delete entry in DB

  const user = await models[decodedRefreshToken.user.userType].findOne({
    where: { refreshToken },
  });

  if (user && user.email === decodedRefreshToken.user.email) {
    await user.update({ refreshToken: "" });
  }

  return res.status(204).json();
};

const customersOnly = async (req, res) => {
  return res.status(200).json({ hey: "you are in customers only route" });
};

module.exports = { sendConfirmationEmail, confirm, register, login, logout, customersOnly };
