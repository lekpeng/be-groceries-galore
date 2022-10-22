const models = require("../../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const jwt_decode = require("jwt-decode");

const transporter = nodemailer.createTransport({
  service: "hotmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendConfirmationEmail = async (data) => {
  const emailToken = jwt.sign({ data }, process.env.JWT_EMAIL_SECRET, {
    expiresIn: "1d",
  });

  const url = `${process.env.REACT_APP_FRONTEND_URL}/confirmation/${emailToken}`;
  try {
    await transporter.sendMail({
      from: `"Groceries Galore" <${process.env.EMAIL}>`, // sender address
      to: data.email, // list of receivers
      subject: "Groceries Galore: Confirm your email", // Subject line
      html: `Please click this link to confirm your email: <a href="${url}">${url}</a>`,
    });
    return "success";
  } catch (err) {
    return err;
  }
};
const register = async (req, res) => {
  // validations
  const { formData, userType } = req.body;
  const { name, email, password, confirmPassword, address, phoneNumber } =
    formData;
  // TODO: validation
  const existingUser = await models[userType].findOne({
    where: { email },
  });

  if (existingUser) {
    return res.status(400).json({
      error:
        "There is an existing account with this email. Please log in instead.",
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
    return res
      .status(500)
      .json({ error: "User not added to DB. Error: " + err });
  }

  // send confirmation email
  const statusOfSentEmail = await sendConfirmationEmail({
    email,
    name,
    userType,
  });
  if (statusOfSentEmail === "success") {
    return res
      .status(201)
      .json({ success: "User added to DB and confirmation email sent." });
  } else {
    return res.status(502).json({
      error:
        "User added to DB but confirmation email failed to send. Error: " +
        statusOfSentEmail,
    });
  }
};

const confirm = async (req, res) => {
  const emailToken = req.body.emailToken;
  const { email, userType } = jwt_decode(emailToken).data;
  try {
    await models[userType].update(
      { isConfirmed: true },
      {
        where: {
          email,
        },
      }
    );
    return res.status(200).json({ success: "User successfully verified" });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "User confirmation failed. Error: " + err });
  }
};

module.exports = { sendConfirmationEmail, register, confirm };
