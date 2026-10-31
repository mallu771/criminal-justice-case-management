
import mongoose from "mongoose";
import fs from "node:fs/promises";
import path from "node:path";
import "dotenv/config";

const backup = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not configured");
    }

    const connection = await mongoose.connect(
      process.env.MONGODB_URI,
      {
        dbName: "justice_cases",
        serverSelectionTimeoutMS: 15000,
      }
    );

    console.log("Connected to:", connection.connection.name);

    const database = connection.connection.db;

    const backupFolder = path.join(
      "D:\\MongoDB-Backups",
      new Date().toISOString().replace(/[:.]/g, "-")
    );

    await fs.mkdir(backupFolder, { recursive: true });

    const collections = await database
      .listCollections({}, { nameOnly: true })
      .toArray();

    for (const collection of collections) {
      const documents = await database
        .collection(collection.name)
        .find({})
        .toArray();

      const filePath = path.join(
        backupFolder,
        `${collection.name}.json`
      );

      await fs.writeFile(
        filePath,
        JSON.stringify(documents, null, 2),
        "utf8"
      );

      console.log(
        `Exported ${collection.name}: ${documents.length} documents`
      );
    }

    console.log("Backup completed:", backupFolder);
  } catch (error) {
    console.error("Backup failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

backup();
