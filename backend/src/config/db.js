
import mongoose from "mongoose";

export async function connectDatabase() {
  const {
    MONGO_HOST = "127.0.0.1",
    MONGO_PORT = "27017",
    MONGO_DATABASE = "justice_cases",
    MONGO_USERNAME,
    MONGO_PASSWORD,
    MONGO_AUTH_SOURCE = "admin",
  } = process.env;

  if (!MONGO_USERNAME || !MONGO_PASSWORD) {
    throw new Error("MongoDB username or password is missing");
  }

  const uri =
    `mongodb://${encodeURIComponent(MONGO_USERNAME)}:` +
    `${encodeURIComponent(MONGO_PASSWORD)}@` +
    `${MONGO_HOST}:${MONGO_PORT}/${MONGO_DATABASE}` +
    `?authSource=${encodeURIComponent(MONGO_AUTH_SOURCE)}`;
console.log(uri);
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
}
