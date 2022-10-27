const models = require("../../models");

const controller = {
  show: async (req, res) => {
    const { email, userType } = req.params;
    try {
      const userProfile = await models[userType].findOne({
        where: { email },
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
