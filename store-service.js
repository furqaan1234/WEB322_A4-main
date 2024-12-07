const Sequelize = require('sequelize');

// Configure Sequelize with Neon.tech credentials
const sequelize = new Sequelize('web322-db', 'web322-db_owner', '0CLhktFUY5fO', {
  host: 'ep-green-dream-a5nizvoq.us-east-2.aws.neon.tech',
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false },
  },
  query: { raw: true },
});

// Replace 'database', 'user', 'password', and 'host' with your Neon.tech credentials

// Define the Item model
const Item = sequelize.define('Item', {
  body: Sequelize.TEXT,
  title: Sequelize.STRING,
  postDate: Sequelize.DATE,
  featureImage: Sequelize.STRING,
  published: Sequelize.BOOLEAN,
  price: Sequelize.DOUBLE,
});

// Define the Category model
const Category = sequelize.define('Category', {
  category: Sequelize.STRING,
});

// Establish a relationship between Item and Category
Item.belongsTo(Category, { foreignKey: 'category' });

function initialize() {
  return sequelize.sync()
    .then(() => Promise.resolve())
    .catch(() => Promise.reject("Unable to sync the database"));
}

function getAllItems() {
  return Item.findAll()
    .then((data) => Promise.resolve(data))
    .catch(() => Promise.reject("No results returned"));
}

function getPublishedItems() {
  return Item.findAll({ where: { published: true } })
    .then((data) => Promise.resolve(data))
    .catch(() => Promise.reject("No published items found"));
}

function getCategories() {
  return Category.findAll()
    .then((data) => Promise.resolve(data))
    .catch(() => Promise.reject("No categories found"));
}

function addItem(itemData) {
  itemData.published = itemData.published ? true : false;
  itemData.postDate = new Date();

  for (const key in itemData) {
    if (itemData[key] === '') itemData[key] = null;
  }

  return Item.create(itemData)
    .then((data) => Promise.resolve(data))
    .catch(() => Promise.reject("Unable to create item"));
}

function getItemsByCategory(category) {
  return Item.findAll({ where: { category } })
    .then((data) => Promise.resolve(data))
    .catch(() => Promise.reject("No results returned"));
}

function getItemsByMinDate(minDateStr) {
  const { gte } = Sequelize.Op;
  return Item.findAll({
    where: {
      postDate: {
        [gte]: new Date(minDateStr),
      },
    },
  })
    .then((data) => Promise.resolve(data))
    .catch(() => Promise.reject("No results returned"));
}

function getItemById(id) {
  return Item.findAll({ where: { id } })
    .then((data) => (data.length > 0 ? Promise.resolve(data[0]) : Promise.reject("No result returned")))
    .catch(() => Promise.reject("No result returned"));
}

function getPublishedItemsByCategory(category) {
  return Item.findAll({
    where: { published: true, category },
  })
    .then((data) => Promise.resolve(data))
    .catch(() => Promise.reject("No items found for this category"));
}

function addCategory(categoryData) {
  for (const key in categoryData) {
    if (categoryData[key] === '') categoryData[key] = null;
  }

  return Category.create(categoryData)
    .then((data) => Promise.resolve(data))
    .catch(() => Promise.reject("Unable to create category"));
}

function deleteCategoryById(id) {
  return Category.destroy({ where: { id } })
    .then((deleted) => (deleted ? Promise.resolve() : Promise.reject("Category not found")))
    .catch(() => Promise.reject("Unable to delete category"));
}

function deletePostById(id) {
  return Item.destroy({ where: { id } })
    .then((deleted) => (deleted ? Promise.resolve() : Promise.reject("Item not found")))
    .catch(() => Promise.reject("Unable to delete item"));
}

// Export the functions for use in server.js
module.exports = {
  initialize,
  getAllItems,
  getPublishedItems,
  getCategories,
  addItem,
  getItemsByCategory,
  getItemsByMinDate,
  getItemById,
  getPublishedItemsByCategory,
  addCategory,
  deleteCategoryById,
  deletePostById,
};