import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateAgentApiRequest } from "@/lib/api-auth";
import { logActivity } from "@/lib/actions";

export async function POST(request: Request, { params }: { params: { projectId: string } }) {
  const auth = await validateAgentApiRequest(request);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await request.json();
    const { name, color } = body;

    if (!name) {
      return NextResponse.json({ error: "Status name is required" }, { status: 400 });
    }

    const status = await prisma.statusConfig.create({
      data: { name, color, projectId: params.projectId },
    });

    if (auth.user) {
      await logActivity(auth.user.id, "ADDED_STATUS", `Added status '${name}' via API`, params.projectId);
    }

    return NextResponse.json(status, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create status or it already exists" }, { status: 500 });
  }
}
