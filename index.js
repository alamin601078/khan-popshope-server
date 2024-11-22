const express = require("express")
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require('dotenv').config()
const app = express()
const port=process.env.PORT || 4000;
const { JsonWebTokenError } = require("jsonwebtoken");
const jwt = require('jsonwebtoken')
const { ObjectId } = require('mongodb');

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

const userCollection =client.db('khan_popshope').collection("users");
const productCollection =client.db('khan_popshope').collection("products");


const dbConnet= async () =>{
    try{
        client.connect();
        console.log("Database connected successfully");

        app.post("/user", async (req, res) =>{
            const user = req.body;
            const query ={ email : user.email};
            const existingUser = await userCollection.findOne(query)
            if(existingUser){
                return res.send({massage : "user already exists"})
            }
            const result = await userCollection.insertOne(user)
            res.send(result)
        })

        app.get("/product", async (req, res) =>{
            const result = await productCollection.find().toArray()
            res.send(result)
        })

        app.get("/allUsers", async (req, res) =>{
            const result = await userCollection.find().toArray()
            res.send(result)
        })

        app.get(`/getUserRole/:email` , async (req ,res ) => {
            // console.log(req.params)
            const qurary ={email:req.params.email}
            const result = await userCollection.findOne(qurary);
            res.send(result)
      
        })


        app.patch(`/users/admin/:id`, async (req ,res) => {
            const id = req.params.id ;
            const filter = { _id : new ObjectId(id) };
            const updatedDoc = {
              $set : {
                role: 'seller'
              }
            }
            const result = await userCollection.updateOne(filter,updatedDoc);
            res.send(result)
        })


        app.delete('/user/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id)
            const query = { _id: new ObjectId(id) }
            const result = await userCollection.deleteOne(query);
            res.send(result);
        })


        app.delete('/product/delete/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id)
            const query = { _id: new ObjectId(id) }
            const result = await productCollection.deleteOne(query);
            res.send(result);
        })

    }catch (error) {
        console.log(error.name , error.message)
    }
}

dbConnet();
//api
app.get("/",(req , res ) => {
    res.send("server is runnig")
})

app.post('/authentication', async(req , res) =>{
    const userEmail = req.body
    const token = jwt.sign(userEmail,process.env.ACCESS_KEY_TOKEN,{expiresIn: '7d',
    });
    res.send({token});
})

app.listen(port, () => {
    console.log(`Server is running on prot, ${port}`)
})