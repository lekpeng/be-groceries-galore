const models = require("../../models");
const jwt = require("jsonwebtoken");

const controller = {
  index: (req, res) => {
    return res.status(200).json({ user: req.user });
  },

  create: (req, res) => {
    return res.status(200).json();
  },
};

module.exports = controller;
