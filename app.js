//import express
const express = require("express");
//set express to app
const app = express();
//use express
app.use(express.json());
//show the location to get index file
app.use(express.static('public'));
//set the headers
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers",'Origin,X-Requested-With,Content-Type,Accept');
    res.setHeader('Access-Control-Allow-Methods','PUT');
    next();
});

// //connect to mongo client
// const MongoClient = require("mongodb").MongoClient;
// //create database
// let database;
// //connect to the cluster
// MongoClient.connect("mongodb+srv://muhammad:mancity2012@cluster0.a4bvy.mongodb.net",(err, cl) => {
//     //connect to the db
//     database = cl.db("cw2database");
// });
const mongodb = require("mongodb");


const connectionURL = "mongodb+srv://muhammad:mancity2012@cluster0.a4bvy.mongodb.net"
const dbName = "cw2database"

//get MongoClient
const MongoClient = mongodb.MongoClient;

let db;

MongoClient.connect(connectionURL,{
    useNewUrlParser: true,
    useUnifiedTopology: true
},(err,connectedClient) => {
    if(err){
        throw err;
    }
    //connectedClient will be the connected instance of MongoClient
    db = connectedClient.db(dbName);
})

//make the collection a parameter so we can connect to the collection
app.param("collName", (request, response, next, collName) => {
    request.collection = db.collection(collName);
    console.log("collection name:", request.collection);
    return next();
});
//serve index page
app.get("/", (request, response, next) => {
    response.render("index.html");
    next();
});

// route to get all the lessons in a collection
app.get("/:collName", (request, response, next) => {
    request.collection.find({}).toArray((err, result) => {
        if (err) return next(err);
        response.send(result);
    })
});

//route to post lessons to collection
app.post("/:collName", (request, response, next) => {
    request.collection.insert(request.body, (err, result) => {
        if (err) return next(err);
        response.send(result.ops);
    });
})
//route to retrieve items by object ID
app.get("/:collName/:name/:phone", (request, response, next) => {
    request.collection.find({
        name: (request.params.name),phone: (request.params.phone)}).toArray((err,result)=>{
         if(err) return next(err);
         response.send(result);
    })
});
//middleware to update items in collection
app.put("/:collName/:id", (request, response, next) => {
    request.collection.update({
            _id: new ObjectID(request.params.id)
        }, {
            $set: request.body
        }, {
            safe: true,
            multi: false
        },
        (err, result) => {
            if (err) return next(err);
            response.send((result.result.n === 1 ? {
                msg: "success"
            } : {
                msg: "error"
            }))
        }
    )
})

//define a server port
const p = process.env.PORT || 5000;
//run the server
app.listen(p, () => {
    console.log(`App running on ${p}`);
})
