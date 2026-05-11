import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateAgentApiRequest } from "@/lib/api-auth";
import { logActivity } from "@/lib/actions";

export async function POST(request: Request, { params }: { params: Promise<{ testCaseId: string }> }) {
  const auth = await validateAgentApiRequest(request);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const resolvedParams = await params;
    const testCaseId = resolvedParams.testCaseId;

    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const tc = await prisma.testCase.findUnique({
      where: { id: testCaseId },
      select: { testCaseId: true, projectId: true }
    });

    if (!tc) {
      return NextResponse.json({ error: "Test case not found" }, { status: 404 });
    }

    const comment = await prisma.comment.create({
      data: {
        testCaseId: testCaseId,
        content,
        userId: auth.user!.id,
      },
    });

    if (auth.user) {
      await logActivity(
        auth.user.id,
        "ADDED_COMMENT",
        `Added comment on ${tc.testCaseId} via API`,
        tc.projectId
      );
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
  }
}
