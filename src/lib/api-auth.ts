import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function validateAgentApiRequest(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "Missing or invalid Authorization header", status: 401 };
  }

  const token = authHeader.split(" ")[1];
  const validKey = process.env.AGENT_API_KEY;

  if (!validKey) {
    console.error("AGENT_API_KEY is not configured in the environment variables.");
    return { error: "Server configuration error", status: 500 };
  }

  if (token !== validKey) {
    return { error: "Invalid API Key", status: 403 };
  }

  // Find or create the AI Agent user
  let agentUser = await prisma.user.findUnique({
    where: { email: "ai-agent@salonnz.com" }
  });

  if (!agentUser) {
    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.hash(require("crypto").randomBytes(32).toString("hex"), 10);
    agentUser = await prisma.user.create({
      data: {
        name: "Salonnz AI Agent",
        email: "ai-agent@salonnz.com",
        password: hashedPassword,
        role: "ADMIN"
      }
    });
  }

  return { user: agentUser };
}
