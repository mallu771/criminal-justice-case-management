import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "justice-case-worker",
  brokers: (
    process.env.KAFKA_BROKERS || "localhost:9092"
  ).split(",").map((value) => value.trim()),
});

const consumer = kafka.consumer({
  groupId: "justice-case-notifications",
});

async function start() {
  await consumer.connect();

  await consumer.subscribe({
    topic: "justice-case-events",
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;

      const event = JSON.parse(message.value.toString());

      switch (event.type) {
        case "CASE_CREATED":
          console.log(
            "Process case-created notification:",
            event.caseId
          );
          break;

        case "CASE_STATUS_CHANGED":
          console.log(
            "Process status-change notification:",
            event.caseId
          );
          break;

        default:
          console.log("Unhandled event type:", event.type);
      }
    },
  });
}

start().catch((error) => {
  console.error("Kafka consumer failed:", error);
  process.exitCode = 1;
});