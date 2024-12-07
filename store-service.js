const Sequelize = require('sequelize');
var sequelize = new Sequelize('Web322', 'Web322_owner', 'MWR1SNhxj5ks', {
    host: 'ep-withered-mountain-a4u9gunz.us-east-1.aws.neon.tech',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});
var Store = sequelize.define('Store', {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN,
    price: Sequelize.DOUBLE,
});
var Category = sequelize.define('Category', {
    category: Sequelize.STRING
});
Store.belongsTo(Category, {foreignKey: 'category'});
const { gte } = Sequelize.Op;


module.exports = { // Export the store service object with methods for data access and manipulation
     initialize: async function() {
        return new Promise((resolve, reject) => {
            sequelize.sync().then(function () {
                resolve();
            }).catch(function (error) {
                reject("unable to sync the database");
            });
        });
    },

    addItem: async function (itemData) { // Add a new item to the items array and save it to the items.json file 
        return new Promise((resolve, reject) => {
            for (var prop in itemData) {
                if (itemData[prop] === "") itemData[prop] = null;
            }
            Store.create(itemData).then(function () {
                resolve();
            }).catch(function (error) {
                reject("unable to create item");
            });
        });
    },

    getAllItems: async function() { // Get all items from the items array 
        return new Promise((resolve, reject) => {
            Store.findAll().then(function (data) {
                resolve(data);
            }).catch(function (error) {
                reject("no results returned");
            });
        });
    },

    getPublishedItems: async function() { // Get all published items from the items array 
        return new Promise((resolve, reject) => {
            Store.findAll({
                where: {
                    published: true
                }
            }).then(function (data) {
                resolve(data);
            }).catch(function (error) {
                reject("no results returned");
            });
        });
    },
    
    getPublishedItemsByCategory: async function(category) {
    return new Promise((resolve, reject) => {
        Store.findAll({
            where: {
                published: true,
                category: category
            }
        }).then(function (data) {
            resolve(data);
        }).catch(function (error) {
            reject("no results returned");
        });
    });
    },
    getCategories: async function() {
        return new Promise((resolve, reject) => {
            Category.findAll().then(function (data) {
                resolve(data);
            }).catch(function (error) {
                reject("no results returned");
            });
        });
    },
    getItemsByCategory: async function(category) {
        return new Promise((resolve, reject) => {
            Store.findAll({
                where: {
                    category: category
                }
            }).then(function (data) {
                resolve(data);
            }).catch(function (error) {
                reject("no results returned");
            });
        });
    },

    getItemsByMinDate: async function(minDateStr) {
    return new Promise((resolve, reject) => {
        Store.findAll({
            where: {
                postDate: {
                    [gte]: new Date(minDateStr)
                }
            }
        }).then(function (data) {
            resolve(data);
        }).catch(function (error) {
            reject("no results returned");
        });
    });
    },

    getItemById: async function(id) {
    return new Promise((resolve, reject) => {
        Store.findAll({
            where: {
                id: id
            }
        }).then(function (data) {
            resolve(data[0]);
        }).catch(function (error) {
            reject("no results returned");
        });
    });
    },
    addCategory: async function (categoryData) {
        for (const prop in categoryData) {
            if (categoryData[prop] === "") {
                categoryData[prop] = null;
            }
        }
        return new Promise((resolve, reject) => {
            Category.create(categoryData).then(function () {
                resolve();
            }).catch(function (error) {
                reject("unable to create category");
            });
        });
    },
    deleteCategoryById: async function (id) {
        return new Promise((resolve, reject) => {
            Category.destroy({
                where: {
                    id: id,
                }
            }).then(function (rowsDeleted) {
                if (rowsDeleted > 0) {
                    resolve();
                } else {
                    reject("Category not found");
                }
            }).catch(function (error) {
                reject("unable to delete category");
            });
        });
    },
    deletePostById: async function (id) {
        return new Promise((resolve, reject) => {
            Post.destroy({
                where: {
                    id: id,
                }
            }).then(function () {
                resolve();
            }).catch(function (error) {
                reject();
            });
        });
    }
}
