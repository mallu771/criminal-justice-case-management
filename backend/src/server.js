
import "dotenv/config";

import connectDB from "./config/db.js";
import { createApp } from "./app.js";
import { connectKafkaProducer } from "./services/kafka.js";

const PORT = Number(process.env.PORT || 4000);

async function startServer() {
  try {
    console.log("Connecting to MongoDB...");
    await connectDB();

    try {
      console.log("Connecting to Kafka...");
      await connectKafkaProducer();
    } catch (error) {
      console.error("Kafka connection failed:", error.message);
      console.warn("Backend will start without Kafka.");
    }

    console.log("Creating Express application...");
    const app = await createApp();

    app.get("/", (req, res) => {
      res.json({
        message: "Criminal Justice Case Management API is running",
        status: "success",
      });
    });

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
