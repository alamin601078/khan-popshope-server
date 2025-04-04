const express = require("express")
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require('dotenv').config();
const app = express()
const port=process.env.PORT || 4000;
const jwt = require('jsonwebtoken')
const { ObjectId } = require('mongodb');



//middleware
// app.use(cors({
//     origin: ['https://khan-popshope-client.vercel.app',
//         'http://localhost:5173'
//     ]
//     // origin: 'http://localhost:5173'
// }))
const corsOptions = {
    origin: ['https://khan-popshope-client.vercel.app','http://localhost:5173' ], // Allow only this origin
    optionsSuccessStatus: 200
  };
  app.use(cors(corsOptions));
app.use(express.json())

// const verifyjwt = (req,res,next) => {
//     const authentication = req.headers.authorization;

//     if(!authentication){
//         return res.send({message: "Invalid Token"})  
//     }
//     const token = authentication.split(" ")[1];
//     console.log(token)
//     jwt.verify(token,process.env.ACCESS_KEY_TOKEN,(err, decoded) => {
//         if(err){
//             return res.send({message: "Invalid Token"})
//         }
//         req.decoded = decoded ;
//         next();
//     });
// };

//mongodb
const url = `mongodb://localhost:27017`
// const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.j44byal.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

const client = new MongoClient(url ,{
    serverApi:{
        version: ServerApiVersion.v1,
        // strict: true,
        // deprecationErrors:true
    }
})

const userCollection =client.db('khan_popshope').collection("users");
const productCollection =client.db('khan_popshope').collection("products");


const dbConnect= async () =>{
    try{
        // await client.connect();
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


        app.post("/seller/addproduct",  async (req, res) =>{
            const product = req.body;

            const result = await productCollection.insertOne(product)
            res.send(result)
        })


        app.get("/product", async (req, res) =>{
            const {title,sort,category,brand} = req.query;
            const quary= {};
            if(title){
                quary.title = { $regex: title,$options: "i"};
            }
            if(category){
                quary.category = {$regex: title, $options: "i"};
            }
            if(brand){
                quary.brand = brand;
            }
            const sortOption = sort ==="asc" ? 1 : -1;

            const result = await productCollection.find(quary).sort({price:sortOption}).toArray();

            const totalProducts = await productCollection.countDocuments(quary);

            const productInfo = await productCollection.find({},{projection:{category:1,brand:1}}).toArray();
            
            const categories = [...new Set(productInfo.map((p) => p.category))]

            const brands = [...new Set(productInfo.map((p) => p.brand))]

            res.send({result,totalProducts,brands,categories})
        })

        app.get("/allUsers", async (req, res) =>{
            const result = await userCollection.find().toArray()
            res.send(result)
        })

        app.get(`/getUserRole/:email` ,  async (req ,res ) => {
            // console.log(req.params)
            const qurary ={email:req.params.email}
            const result = await userCollection.findOne(qurary);
            res.send(result)
      
        })


        app.patch(`/users/admin/:id`, async (req ,res ) => {
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

        

        app.patch(`/wishlist/add`,async (req ,res) => {
            const {userEmail,productId}= req.body;
            const result = await userCollection.updateOne({email:userEmail},{$addToSet: {wishlist: new ObjectId(String(productId))}});
            res.send(result)
        })


        app.get(`/wishlist/:userId`, async (req, res) => {
            try {
            const query = { email: req.params.userId };
            const user = await userCollection.findOne(query);

            if (!user) {
                return res.status(404).send({ message: "User not found" });
            }

            const wishlist = await productCollection.find({ _id: { $in: user.wishlist || [] } }).toArray();
            res.send(wishlist);
            } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Internal Server Error" });
            }
        });


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

dbConnect();
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