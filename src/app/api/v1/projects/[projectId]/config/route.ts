import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateAgentApiRequest } from "@/lib/api-auth";

export async function GET(request: Request, { params }: { params: { projectId: string } }) {
  const auth = await validateAgentApiRequest(request);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const statuses = await prisma.statusConfig.findMany({
      where: { projectId: params.projectId },
      orderBy: { name: "asc" },
    });
    
    const categories = await prisma.category.findMany({
      where: { projectId: params.projectId },
      orderBy: { name: "asc" },
    });
    
    return NextResponse.json({ statuses, categories });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch project configuration" }, { status: 500 });
  }
}
