import jwt from "jsonwebtoken";

export function signToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is required");
  }

  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
      issuer: "justice-case-api",
      audience: "justice-case-app",
    }
  );
}

export function getUserFromHeader(authorization) {
  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  try {
    const payload = jwt.verify(
      authorization.slice(7),
      process.env.JWT_SECRET,
      {
        issuer: "justice-case-api",
        audience: "justice-case-app",
      }
    );

    return {
      id: payload.sub,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export function requireRole(user, allowedRoles) {
  if (!user) {
    throw new Error("Unauthenticated");
  }

  if (!allowedRoles.includes(user.role)) {
    throw new Error("Forbidden");
  }
}