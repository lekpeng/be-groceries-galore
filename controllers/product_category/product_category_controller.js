const models = require("../../models");

const controller = {
  index: async (req, res) => {
    try {
      const productCategories = await models.ProductCategory.findAll();
      return res.status(200).json({ productCategories });
    } catch (err) {
      return res.status(500).json({ error: err });
    }
  },
};

module.exports = controller;
