/**
* This is the main Node.js server script for your project
*/

const port = 3000
const address = "127.0.0.1"

const path = require("path");
const Handlebars = require("handlebars");

// Require the fastify framework and instantiate it
const fastify = require("fastify")({logger: false});

// Setup our static files
fastify.register(require("fastify-static"), {
  root: path.join(__dirname, "public"),
  prefix: "/static/" // optional: default '/'
});

// fastify-formbody lets us parse incoming forms
fastify.register(require("fastify-formbody"));

// point-of-view is a templating manager for fastify
fastify.register(require("point-of-view"), {
  engine: {
    handlebars: require("handlebars")
  },
  root: path.join(__dirname, '/src/pages/'),
  options: {
    partials: {
      htmlheader: 'partials/htmlheader.hbs',
      nav: 'partials/nav.hbs',
      footer: 'partials/footer.hbs'
    }
  }
});

// Load model associated functions
const model = require("./model.js");

// Load and parse page data
const pages = require("./src/text.json");
let pagesList = [{name: "quiz"}];
for (let key in pages) {
    let page = {name: key,}
    pagesList.push(page);
}

// add handlebars helpers
Handlebars.registerHelper('isEven', function (value) {
    return value % 2;
});
Handlebars.registerHelper('capitalizeFirst', function (value) {
    return value[0].toUpperCase() + value.substr(1);
});
Handlebars.registerHelper('isArray', function (value) {
    return Array.isArray(value);
});


/**
* View Handling using Fastify
*/

fastify.get("/", function(request, reply) {
    reply.header('Content-Type', 'text/html');
    reply.view("index.hbs", {pagesList: pagesList});
});

fastify.get("/quiz", function(request, reply) {
    reply.header('Content-Type', 'text/html');
    reply.view("quiz.hbs", {pagesList: pagesList});
});
fastify.post("/quiz", function(request, reply) {
    const criteria = request.body;
    let matches = model.findChocolate(criteria.typ, criteria.preis, criteria.geschmack, criteria.inhalt);
    reply.send({ matches: matches });
});

fastify.get("/impressum", function(request, reply) {
    reply.header('Content-Type', 'text/html');
    reply.view("impressum.hbs", {pagesList: pagesList});
});

// Serve top level pages dynamically
fastify.get("/*", function(request, reply) {
    /**
     * anonymous function dynamically serving top level pages
     * @param {fastify.Request} request - the fastify request object
     * @param {fastify.Reply} reply - the fastify reply object
     */
    const targetPage = request.url.replace("/", "");
    if (pages[targetPage]) {
        //page does exist, return it
        reply.header('Content-Type', 'text/html');
        reply.view("pagetemplate.hbs", {page: pages[targetPage], pagesList: pagesList});
    } else {
        //page does not exist, send 404
        reply.view("404.hbs", {target: targetPage, pagesList: pagesList});
    }
});


// Run the server and report out to the logs
fastify.listen(port, address, function(err, address) {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    console.log(`Your app is listening on ${address}`);
    fastify.log.info(`server listening on ${address}`);
});
