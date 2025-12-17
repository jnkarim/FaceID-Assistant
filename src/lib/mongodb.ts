import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from 'dotenv';


dotenv.config();

if (!process.env.MONGO_URI) {
  throw new Error("Mongo_URI environment variable is not defined");
}

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export { client };

async function run() {
  try {
    await client.connect();
    await client.db("faceid_assistant").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (error) {
    console.error("Connection failed: ", error);
    throw error;
  }
}

run().catch(console.dir);
