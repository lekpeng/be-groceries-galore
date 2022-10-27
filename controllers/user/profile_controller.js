const models = require("../../models");

const controller = {
  index: async (req, res) => {
    const userType = req.params.userType;
    try {
      const users = await models[userType].findAll({
        attributs: {
          exclude: ["passwordHash", "address", "phoneNumber"],
        },
      });
      return res.status(200).json({ [userType]: users });
    } catch (err) {
      return res.status(500).json({ error: err });
    }
  },
  show: async (req, res) => {
    const { email, userType } = req.params;
    try {
      const userProfile = await models[userType].findOne({
        where: { email },
        attributes: {
          exclude: ["passwordHash"],
        },
      });
      if (!userProfile) {
        return res.status(404).json({ error: "User not found" });
      }
      return res.status(200).json({ userProfile });
    } catch (err) {
      return res.status(500).json({ error: err });
    }
  },
};

module.exports = controller;
