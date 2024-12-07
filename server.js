/*********************************************************************************

WEB322 – Assignment 05
I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Steven Ly
Student ID: 101444214
Date: november 19,2024
Glitch Web App URL: https://stevenlyweb322-assignment4.glitch.me/
GitHub Repository URL: https://github.com/lysteven/web322-app

********************************************************************************/ 


const express = require('express'); // Imports the express module
const storeService = require('./store-service'); // Imports the store-service module
const path = require('path');
const multer = require("multer"); // Imports the multer module
const cloudinary = require('cloudinary').v2;// Imports the cloudinary module
const streamifier = require('streamifier'); // Imports the streamifier module
const exphbs = require('express-handlebars'); // Imports the express-handlebars module
const Handlebars = require('handlebars');  // Imports Handlebars directly from the Handlebars module 
const PORT = process.env.PORT || 8080; // Sets the port to 8080
const upload = multer(); // Sets the upload variable to the multer module
const app = express();// Sets the app variable to the express module
cloudinary.config({ // Configures the cloudinary module with the cloud_name, api_key, api_secret, and secure properties
    cloud_name: 'djjdy3gyf',
    api_key: '915157472213428',
    api_secret: 'A0kol7FdiyFNSz9btX_m4gp9VIQ',
    secure: true
});


app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));

app.use(function(req, res, next) { // Middleware function to set local variables for the view template engine (Handlebars) 
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});

// Registering helpers for Handlebars view engine (exphbs)
app.engine('.hbs', exphbs.engine({
    extname: '.hbs',
    helpers: {
        navLink: function(url, options) {
            return '<li class="nav-item"><a ' + 
                   (url == app.locals.activeRoute ? ' class="nav-link active" ' : ' class="nav-link" ') + 
                   'href="' + url + '">' + options.fn(this) + "</a></li>";
        },
        equal: function(lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            return (lvalue != rvalue) ? options.inverse(this) : options.fn(this);
        },
        safeHTML: function (context) {
            return new Handlebars.SafeString(context);  // Use SafeString from imported Handlebars
        },
        formatDate: function(dateObj){
            let year = dateObj.getFullYear();
            let month = (dateObj.getMonth() + 1).toString();
            let day = dateObj.getDate().toString();
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
        }
    }
}));

app.set('view engine', '.hbs');
app.set("views", __dirname + "/views");

// Define routes for the app 
app.get("/", (req, res) => {
    res.redirect("/Shop");
});

app.get('/About', (req, res) => { // Define a route for the "/About" endpoint
    res.render('about');
});

app.get('/items/add', (req, res) => { // Define a route for the "/items/add" endpoint
    storeService.getCategories().then((data) => {
        res.render('addPost', {categories: data});
    }).catch((err) => {
        res.render('addPost', {categories: []});
    });
});
app.post("/categories/add", (req, res) => {
    storeService.addCategory(req.body).then(() => {
        res.redirect('/Categories');
    }).catch(err => {
        res.status(500).send("Failed to add category");
    });
});
app.get("/Shop", async (req, res) => { // Define a route for the "/Shop" endpoint
    let viewData = {}; // Declare an object to store properties for the view
    try { // Try to obtain items and categories from the store service
        let items = req.query.category ? 
            await storeService.getPublishedItemsByCategory(req.query.category) : 
            await storeService.getPublishedItems();
// Sort items by itemDate in descending order
        items.sort((a, b) => new Date(b.itemDate) - new Date(a.itemDate));
        viewData.items = items;
        viewData.item = items[0];
    } catch (err) {
        viewData.message = "no results";
    }
// Obtain the full list of categories
    try {
        viewData.categories = await storeService.getCategories();
    } catch (err) {
        viewData.categoriesMessage = "no results";
    }

    res.render("shop", { data: viewData });
});

app.get('/Shop/:id', async (req, res) => { 
    storeService.getPostById(req.params.id).then((post) => {
        res.json(post);
    }).catch((err) => {
        res.json({message: err});
    });
});


app.get('/Categories', (req, res) => { // Define a route for the "/Categories" endpoint
    storeService.getCategories()
        .then(data => {
            res.render("categories", { categories: data });
        })
        .catch(() => {
            res.render("categories", { message: "No categories available" });
        });
});


app.get('/item/:value', (req, res) => { // Define a route for the "/item/:value" endpoint
    storeService.getItemById(req.params.value)
        .then(item => res.json(item))
        .catch(err => res.status(404).json({ message: err }));
});
app.get("/categories", (req, res) => {
    storeService.getCategories().then((data) => {
        if (data.length)
            res.render("categories", {categories: data});
        else
            res.render("categories", {message: "no results"});
    }).catch((err) => {
        res.render("categories", {message: "no results"});
    });
});

app.get("/categories/add", (req, res) => {
    res.render('addCategory');
});

app.get("/categories/delete/:id", (req, res) => {
    storeservice.deleteCategoryById(req.params.id).then(() => {
        res.redirect('/categories');
    }).catch((err) => {
        res.send("Unable to Remove Category / Category not found)", 500);
    });
});

app.get("/Items/delete/:id", (req, res) => {
    storeService.deletePostById(req.params.id).then(() => {
        res.redirect('/Items');
    }).catch((err) => {
        res.send("Unable to Remove Post / Post not found)", 500);
    });
});

app.get('/Items', (req, res) => { // Define a route for the "/Items" endpoint
    storeService.getAllItems()
        .then(data => {
            if (data.length > 0) {
                res.render('items', { items: data });
            } else {
                res.render('items', { message: "no results" });
            }
        })
        .catch(err => {
            res.render('items', { message: "no results" });
        });
});
app.post('/items/add', upload.single('featureImage'), (req, res) => { // Define a route for the "/items/add" endpoint
    if (req.file) {
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream((error, result) => {
                    if (result) resolve(result);
                    else reject(error);
                });
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        async function upload(req) {
            let result = await streamUpload(req);
            return result;
        }

        upload(req).then(uploaded => processItem(uploaded.url))
            .catch(err => {
                console.error("Cloudinary upload failed:", err);
                res.status(500).send("Image upload failed");
            });
    } else {
        processItem("");
    }

    function processItem(imageUrl) {
        req.body.featureImage = imageUrl;
        storeService.addItem(req.body)
            .then(() => res.redirect('/Items'))
            .catch(err => res.status(500).send("Failed to add item"));
    }
});

storeService.initialize()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Express http server listening on port ${PORT}`);
        });
    })
    .catch(err => {
        console.log('Failed to initialize the store service, Please check the server console.', err);
    });
app.get("/items/delete/:id", (req, res) => {
        storeService.deletePostById(req.params.id).then(() => {
            res.redirect('/posts');
        }).catch((err) => {
            res.send("Unable to Remove Post / Post not found)", 500);
        });
    });

app.use((req, res) => {
    res.status(404).render("404 - Page Not Found");
});
