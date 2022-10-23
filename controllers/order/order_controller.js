const models = require("../../models");
const jwt = require("jsonwebtoken");

const controller = {
  index: (req, res) => {
    console.log("LOGGED IN USER IS ME, ", req.user);
    return res.status(200).json({ user: req.user });
  },
};

module.exports = controller;
