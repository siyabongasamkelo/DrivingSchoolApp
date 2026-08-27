import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./server.ts";
import dns from "node:dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "";

if (!MONGO_URI) {
  console.error(" [Critical]: MONGO_URI is missing from your .env file!");
  process.exit(1);
}

//  Connect to MongoDB and fire up the engine
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(" [Database]: Connected to MongoDB cleanly!");
    app.listen(PORT, () => {
      console.log(` [Server]: Engine flying high on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error(" [Database]: Global connection handshake failed:", err);
  });
