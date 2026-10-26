import { Kafka } from "kafkajs";

const brokers = (
  process.env.KAFKA_BROKERS || "localhost:9092"
)
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const kafka = new Kafka({
  clientId: "justice-case-management",
  brokers,
});

export const producer = kafka.producer();

export async function connectKafkaProducer() {
  await producer.connect();
  console.log("Kafka producer connected");
}

export async function publishCaseEvent(event) {
  await producer.send({
    topic: "justice-case-events",
    messages: [
      {
        key: event.caseId,
        value: JSON.stringify(event),
      },
    ],
  });
}