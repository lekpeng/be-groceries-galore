const models = require("../../models");

const controller = {
  index: async (req, res) => {
    const query = req.query?.query?.toLowerCase();
    try {
      let products = await models.Product.findAll({
        include: [
          { model: models.Merchant, attributes: ["name"] },
          { model: models.ProductCategory, attributes: ["name"] },
        ],
      });
      if (query) {
        products = products.filter((product) => {
          return product.name.toLowerCase().includes(query);
        });
      }
      return res.status(200).json({ products });
    } catch (err) {
      return res.status(500).json({ error: `Failed to get orders ${err.message}` });
    }
  },
  indexByMerchant: async (req, res) => {
    const merchantId = req.params.merchantId;
    try {
      const products = await models.Product.findAll({
        where: {
          MerchantId: merchantId,
        },
        include: [
          { model: models.ProductCategory, attributes: ["name"] },
          { model: models.Merchant, attributes: ["name"] },
        ],
      });
      const merchant = await models.Merchant.findOne({
        where: {
          id: merchantId,
        },
      });
      return res.status(200).json({ products, merchant });
    } catch (err) {
      return res.status(500).json({ error: `Failed to get products ${err.message}` });
    }
  },
  show: async (req, res) => {
    const { productId } = req.params;
    try {
      const product = await models.Product.findOne({
        where: { id: productId },
        include: [
          { model: models.Merchant, attributes: ["name"] },
          { model: models.ProductCategory, attributes: ["name"] },
        ],
      });
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      return res.status(200).json({ product });
    } catch (err) {
      return res.status(500).json({ error: `Failed to get product. ${err.message}` });
    }
  },
  create: async (req, res, next) => {
    console.log("IN CREATE");
    console.log("REQ BODY", req.body);
    // const { product } = req.body;
    // try {
    //   models.Product.create(product);
    //   return res.status(201).json({});
    // } catch (err) {
    //   return res.status(500).json({});
    // }
    next();
  },
};

module.exports = controller;
