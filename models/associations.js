function applyAssociations(db) {
  // on delete: set null and on update: cascade
  // when an order is deleted, order details also get deleted

  const { Customer, Merchant, Order, OrderDetail, Product, ProductCategory } = db;
  Customer.hasMany(Order);
  Order.belongsTo(Customer);

  Merchant.hasMany(Product);
  Product.belongsTo(Merchant);

  Merchant.hasMany(Order);
  Order.belongsTo(Merchant);

  Order.hasMany(OrderDetail, { onDelete: "CASCADE" });
  OrderDetail.belongsTo(Order);

  Product.hasMany(OrderDetail);
  OrderDetail.belongsTo(Product);

  ProductCategory.hasMany(Product);
  Product.belongsTo(ProductCategory);
}

module.exports = { applyAssociations };
