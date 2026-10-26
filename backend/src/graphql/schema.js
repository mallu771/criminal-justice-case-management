
import { gql } from "graphql-tag";
import bcrypt from "bcryptjs";

import User from "../models/User.js";
import Case from "../models/Case.js";
import { signToken } from "../auth.js";
import { getCached, setCached } from "../services/cache.js";
import { publishCaseEvent } from "../services/kafka.js";
export const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Case {
    id: ID!
    caseNumber: String!
    title: String!
    description: String!
    policeStation: String!
    incidentDate: String
    status: String!
    createdAt: String!
  }

  type Query {
    health: String!
    users: [User!]!
    cases(page: Int, limit: Int): [Case!]!
  }

  type Mutation {
    register(
      name: String!
      email: String!
      password: String!
    ): AuthPayload!

    login(
      email: String!
      password: String!
    ): AuthPayload!

    createCase(
      title: String!
      description: String!
      policeStation: String!
      incidentDate: String
    ): Case!
  }
`;

export const resolvers = {
  Query: {
    health: () => "JusticeTrack API is running",

    users: async (_, __, context) => {
      if (!context.user) {
        throw new Error("Unauthenticated");
      }

      return User.find().select("-password");
    },

    cases: async (_, { page = 1, limit = 50 }, context) => {
      if (!context.user) {
        throw new Error("Unauthenticated");
      }

      const safePage = Math.max(1, page);
      const safeLimit = Math.min(100, Math.max(1, limit));

      // Cache results separately for each authenticated user and page.
      const cacheKey =
        `cases:${context.user.id}:${safePage}:${safeLimit}`;

      try {
        const cached = await getCached(cacheKey);

        if (cached) {
          return cached;
        }
      } catch (error) {
        console.error("Redis cache read failed:", error.message);
      }

      const items = await Case.find()
        .sort({ createdAt: -1 })
        .skip((safePage - 1) * safeLimit)
        .limit(safeLimit)
        .lean();

      const result = items.map((item) => ({
        id: item._id.toString(),
        caseNumber: item.caseNumber,
        title: item.title,
        description: item.description,
        policeStation: item.policeStation,
        incidentDate: item.incidentDate
          ? new Date(item.incidentDate).toISOString()
          : null,
        status: item.status,
        createdAt: new Date(item.createdAt).toISOString(),
      }));

      try {
        await setCached(cacheKey, result, 30);
      } catch (error) {
        console.error("Redis cache write failed:", error.message);
      }

      return result;
    },
  },

  Mutation: {
    register: async (_, { name, email, password }) => {
      const normalizedEmail = email.trim().toLowerCase();

      if (password.length < 8) {
        throw new Error("Password must contain at least 8 characters");
      }

      const existingUser = await User.findOne({
        email: normalizedEmail,
      });

      if (existingUser) {
        throw new Error("Email is already registered");
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: "USER",
      });

      return {
        token: signToken(user),
        user,
      };
    },

    login: async (_, { email, password }) => {
      const user = await User.findOne({
        email: email.trim().toLowerCase(),
      });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new Error("Invalid email or password");
      }

      return {
        token: signToken(user),
        user,
      };
    },

    createCase: async (_, args, context) => {
      if (!context.user) {
        throw new Error("Unauthenticated");
      }

      const title = args.title.trim();
      const description = args.description.trim();
      const policeStation = args.policeStation.trim();

      if (!title || !description || !policeStation) {
        throw new Error(
          "Title, description, and police station are required"
        );
      }

      const caseNumber = `CASE-${Date.now()}`;

      const newCase = await Case.create({
        caseNumber,
        title,
        description,
        policeStation,
        incidentDate: args.incidentDate || null,
        status: "REGISTERED",
      });
  // 2. Publish an event to Kafka.
  try {
    await publishCaseEvent({
      eventId: newCase._id.toString(),
      type: "CASE_CREATED",
      caseId: newCase._id.toString(),
      occurredAt: new Date().toISOString(),
    });
  } catch (error) {
    // Do not report the case creation as failed if Kafka fails
    // after MongoDB has already saved the case.
    console.error("Kafka publish failed:", error.message);
  }

      // Remove cached case lists so the new case appears immediately.
      // This assumes cache.js exports a compatible delete-by-pattern helper.
      // If it doesn't, the cache will expire according to its TTL.

      return newCase;
    },
  },
};
