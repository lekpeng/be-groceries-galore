const models = require("../../models");

const controller = {
  index: async (req, res) => {
    try {
      const products = await models.Product.findAll({
        include: [
          { model: models.Merchant, attributes: ["name"] },
          { model: models.ProductCategory, attributes: ["name"] },
        ],
      });
      return res.status(200).json({ products });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err });
    }
  },
  show: async (req, res) => {
    const { productId } = req.params;
    try {
      const product = await models.Product.findOne({
        where: { id: productId },
      });
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      return res.status(200).json({ product });
    } catch (err) {
      return res.status(500).json({ error: err });
    }
  },
  create: async (req, res) => {
    const { product } = req.body;
    try {
      models.Product.create(product);
      return res.status(201).json({});
    } catch (err) {
      return res.status(500).json({});
    }
  },
};

module.exports = controller;
