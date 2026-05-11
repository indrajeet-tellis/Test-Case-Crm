import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateAgentApiRequest } from "@/lib/api-auth";
import { logActivity } from "@/lib/actions";

export async function GET(request: Request) {
  const auth = await validateAgentApiRequest(request);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  const where = projectId ? { projectId } : {};

  try {
    const testCases = await prisma.testCase.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        project: { select: { name: true } },
        category: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(testCases);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch test cases" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await validateAgentApiRequest(request);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await request.json();
    
    // Support single object or array of objects
    const items = Array.isArray(body) ? body : [body];
    
    if (items.length === 0) {
      return NextResponse.json({ error: "No test cases provided" }, { status: 400 });
    }

    const projectId = items[0].projectId; // Assume all belong to the same project for simplicity
    
    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    // Get or create categories
    const categoryNames = [...new Set(items.map(item => item.categoryName || "General"))] as string[];
    const categories = await Promise.all(
      categoryNames.map(async (name) => {
        return await prisma.category.upsert({
          where: { name_projectId: { name, projectId } },
          update: {},
          create: { name, projectId },
        });
      })
    );

    const categoryMap = new Map(categories.map(c => [c.name, c.id]));

    const testCasesToCreate = items.map((item) => {
      return {
        projectId,
        userId: auth.user!.id,
        categoryId: categoryMap.get(item.categoryName || "General")!,
        testCaseId: item.testCaseId || `TC-${Math.random().toString(36).substr(2, 9)}`,
        module: item.module || null,
        action: item.action || "",
        conditions: item.conditions || "",
        steps: item.steps || "",
        expectedOutput: item.expectedOutput || "",
        actualOutput: item.actualOutput || "",
        status: item.status?.toLowerCase() || "pending",
      };
    });

    const result = await prisma.testCase.createMany({
      data: testCasesToCreate,
      skipDuplicates: true,
    });

    await logActivity(
      auth.user!.id,
      "CREATED_TEST_CASE",
      `Created ${testCasesToCreate.length} test case(s) via API`,
      projectId
    );

    return NextResponse.json({ message: "Success", count: result.count }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create test cases" }, { status: 500 });
  }
}
