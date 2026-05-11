import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateAgentApiRequest } from "@/lib/api-auth";
import { logActivity } from "@/lib/actions";

export async function PATCH(request: Request, { params }: { params: Promise<{ testCaseId: string }> }) {
  const auth = await validateAgentApiRequest(request);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const resolvedParams = await params;
    const testCaseId = resolvedParams.testCaseId;

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    const oldTc = await prisma.testCase.findUnique({
      where: { id: testCaseId },
      select: { status: true, testCaseId: true, projectId: true }
    });

    if (!oldTc) {
      return NextResponse.json({ error: "Test case not found" }, { status: 404 });
    }

    const updated = await prisma.testCase.update({
      where: { id: testCaseId },
      data: { status },
    });

    if (auth.user) {
      await logActivity(
        auth.user.id,
        "UPDATED_STATUS",
        `Changed status of ${oldTc.testCaseId} from ${oldTc.status} to ${status} via API`,
        oldTc.projectId
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
