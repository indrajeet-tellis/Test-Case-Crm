import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateAgentApiRequest } from "@/lib/api-auth";
import { logActivity } from "@/lib/actions";

export async function GET(request: Request) {
  const auth = await validateAgentApiRequest(request);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const projects = await prisma.project.findMany({
      include: {
        _count: { select: { testCases: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await validateAgentApiRequest(request);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: { name, description },
    });

    if (auth.user) {
      await logActivity(auth.user.id, "CREATED_PROJECT", `Created project '${name}' via API`, project.id);
    }

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
