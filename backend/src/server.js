
import "dotenv/config";

import { connectDatabase } from "./config/db.js";
import { createApp } from "./app.js";
import { connectKafkaProducer } from "./services/kafka.js";

const PORT = Number(process.env.PORT || 4000);

console.log("Starting backend...");

async function startServer() {
  try {
    console.log("Connecting to MongoDB...");
    await connectDatabase();

    // Connect to Kafka without preventing startup if Kafka is down.
    try {
      console.log("Connecting to Kafka...");
      await connectKafkaProducer();
    } catch (error) {
      console.error("Kafka connection failed:", error.message);
      console.warn("Backend will start, but Kafka events may not publish.");
    }

    console.log("Creating Express application...");
    const app = await createApp();

    app.get("/", (req, res) => {
      res.json({
        message: "Criminal Justice Case Management API is running",
        status: "success",
      });
    });

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exitCode = 1;
  }
}

startServer();
