const express = require("express")
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require('dotenv').config()
const app = express()
const port=process.env.PORT || 4000;


//middleware
app.use(cors())
app.use(express.json())

//mongodb
const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.j44byal.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

const client = new MongoClient(url ,{
    serverApi:{
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors:true
    }
})

const dbConnet= async () =>{
    try{
        client.connect();
        console.log("Database connected successfully");
    }catch (error) {
        console.log(error.name , error.message)
    }
}

dbConnet();
//api
app.get("/",(req , res ) => {
    res.send("server is runnig")
})

app.listen(port, () => {
    console.log(`Server is running on prot, ${port}`)
})