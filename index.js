require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection string
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dvo7g.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient instance
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    console.log("Successfully connected to MongoDB!");

    // Specify the database and collection
    const database = client.db("sportsEquipmentDB");
    const equipmentCollection = database.collection("equipments");

    // Add Equipment POST API
    app.post("/equipments", async (req, res) => {
      try {
        const newEquipment = req.body;
        const result = await equipmentCollection.insertOne(newEquipment);
        res.status(201).json({ insertedId: result.insertedId });
      } catch (error) {
        res.status(500).json({ message: "Failed to add equipment", error: error.message });
      }
    });
    app.get("/equipments", async (req, res) => {
      try {
        const equipments = await client.db("sportsEquipmentDB").collection("equipments").find().toArray();
        res.json(equipments);
      } catch (error) {
        res.status(500).send("Error fetching data");
      }
    });

    app.get("/equipments/:id", async (req, res) => {
      const { id } = req.params;
    
      try {
        const equipment = await equipmentCollection.findOne({ _id: new ObjectId(id) });
        if (!equipment) {
          return res.status(404).json({ message: "Equipment not found" });
        }
        res.status(200).json(equipment);
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch equipment", error: error.message });
      }
    });
    
    app.put("/equipments/:id", async (req, res) => {
      const { id } = req.params;
      const updatedEquipment = req.body;
    
      try {
        const result = await equipmentCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedEquipment }
        );
    
        if (result.matchedCount === 0) {
          return res.status(404).json({ message: "Equipment not found" });
        }
    
        res.status(200).json({ modifiedCount: result.modifiedCount });
      } catch (error) {
        res.status(500).json({ message: "Failed to update equipment", error: error.message });
      }
    });
    
    
    app.get("/equipments", async (req, res) => {
      try {
        const database = client.db("sportsEquipmentDB");
        const equipmentCollection = database.collection("equipments");
    
        // Query to fetch all documents
        const equipments = await equipmentCollection.find().toArray();
        
        // Send the fetched data as a response
        res.status(200).json(equipments);
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch equipment data", error: error.message });
      }
    });
    app.get("/equipments/:id", async (req, res) => {
      const categoryId = req.params.id;
      const result = await client
        .db("sportsDB")
        .collection("equipments")
        .find({ _id }) 
        .toArray();
      res.send(result);
    });
    

  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

run().catch(console.dir);

// Default route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
