const models = require("../../models");

const controller = {
  index: async (req, res) => {
    const query = req.query?.query?.toLowerCase();
    try {
      let products = await models.Product.findAll({
        include: [
          { model: models.Merchant, attributes: ["name", "email"] },
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
          { model: models.Merchant, attributes: ["name", "email"] },
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
          { model: models.Merchant, attributes: ["name", "email"] },
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
  create: async (req, res) => {
    const { name, description, price, quantity, category } = JSON.parse(req.body.formData);
    const imageUrl = req.productImageUrl;

    try {
      const productCategory = await models.ProductCategory.findOne({
        where: { name: category },
      });
      const merchant = await models.Merchant.findOne({
        where: { email: req.user.email },
      });
      const newProduct = await models.Product.create({
        name,
        description,
        price,
        quantity,
        imageUrl,
        MerchantId: merchant.id,
        ProductCategoryId: productCategory.id,
      });
      return res.status(200).json({ product: newProduct });
    } catch (err) {
      return res.status(500).json({ error: `Error creating product ${err}` });
    }
  },
  delete: async (req, res) => {
    const { productId } = req.params;
    try {
      await models.Product.destroy({
        where: { id: productId },
      });

      return res.status(200).json({});
    } catch (err) {
      return res.status(500).json({ error: `Failed to delete product with id ${productId}. ${err.message}` });
    }
  },
  update: async (req, res) => {
    const { productId } = req.params;
    const { field, value } = req.body;
    try {
      await models.Product.update(
        {
          [field]: req.body.value,
        },
        {
          where: { id: productId },
        }
      );
      return res.status(200).json({});
    } catch (err) {
      return res.status(500).json({ error: `Failed to update ${field}. ${err.message}` });
    }
  },
};

module.exports = controller;
