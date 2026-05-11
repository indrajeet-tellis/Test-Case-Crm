import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateAgentApiRequest } from "@/lib/api-auth";
import { logActivity } from "@/lib/actions";

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const auth = await validateAgentApiRequest(request);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const resolvedParams = await params;
    const projectId = resolvedParams.projectId;
    
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: { name, projectId },
    });

    if (auth.user) {
      await logActivity(auth.user.id, "ADDED_CATEGORY", `Added category '${name}' via API`, projectId);
    }

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create category or it already exists" }, { status: 500 });
  }
}
