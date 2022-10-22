const models = require("../../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "hotmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendConfirmationEmail = async ({ email, name }) => {
  const emailToken = jwt.sign(
    { data: { email, name } },
    process.env.JWT_EMAIL_SECRET,
    {
      expiresIn: "1d",
    }
  );

  const url = `${process.env.REACT_APP_FRONTEND_URL}/confirmation/${emailToken}`;
  try {
    await transporter.sendMail({
      from: `"Groceries Galore" <${process.env.EMAIL}>`, // sender address
      to: email, // list of receivers
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
  console.log("FORM DATA", formData);
  // TODO: validation
  // 1) check for unique email and phone_number under customer and merchant
  // 2) check that password and confirm_password is the same

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
    if (userType === "Merchant") {
      await models.Merchant.create(userDetails);
    } else {
      await models.Customer.create(userDetails);
    }
  } catch (err) {
    return res
      .status(500)
      .json({ error: "User not added to DB. Error: " + err });
  }

  // send confirmation email
  const statusOfSentEmail = sendConfirmationEmail({ email, name });
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

module.exports = { sendConfirmationEmail, register };
