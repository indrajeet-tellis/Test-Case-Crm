"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getProjects() {
  const session = await auth();
  if (!session) return [];
  return await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getProjectsWithCounts() {
  const session = await auth();
  if (!session) return [];
  return await prisma.project.findMany({
    include: {
      _count: {
        select: { testCases: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUsers() {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") return [];
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProjectConfigs(projectId: string) {
  const statuses = await prisma.statusConfig.findMany({
    where: { projectId },
    orderBy: { name: "asc" },
  });
  const categories = await prisma.category.findMany({
    where: { projectId },
    orderBy: { name: "asc" },
  });
  
  return { statuses, categories };
}

export async function addStatus(projectId: string, name: string, color?: string) {
  return await prisma.statusConfig.create({
    data: { projectId, name, color },
  });
}

export async function deleteStatus(id: string) {
  return await prisma.statusConfig.delete({ where: { id } });
}

export async function addCategory(projectId: string, name: string) {
  return await prisma.category.create({
    data: { projectId, name },
  });
}

export async function deleteCategory(id: string) {
  return await prisma.category.delete({ where: { id } });
}

export async function createUser(data: any) {
  const session = await auth();
  const { password, ...rest } = data;
  const bcrypt = await import("bcryptjs");
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { ...rest, password: hashedPassword },
  });

  if (session?.user?.id) {
    await logActivity(
      (session.user as any).id,
      "CREATED_USER",
      `Created user ${user.email}`
    );
  }

  return user;
}

export async function updateUser(id: string, data: any) {
  return await prisma.user.update({
    where: { id },
    data: {
      name: data.name,
      email: data.email,
      role: data.role,
    },
  });
}

export async function deleteUser(id: string) {
  const session = await auth();
  const user = await prisma.user.findUnique({ where: { id } });
  const result = await prisma.user.delete({ where: { id } });

  if (session?.user?.id && user) {
    await logActivity(
      (session.user as any).id,
      "DELETED_USER",
      `Deleted user ${user.email}`
    );
  }

  return result;
}

export async function getTestCases(projectId?: string) {
  const session = await auth();
  if (!session) return [];

  const where = projectId ? { projectId } : {};

  try {
    return await prisma.testCase.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        project: { select: { name: true } },
        category: { select: { name: true } },
        comments: {
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (e) {
    console.error("Error fetching test cases:", e);
    return [];
  }
}


export async function getStatusConfigs(projectId?: string) {
  if (!projectId) return [];
  return await prisma.statusConfig.findMany({
    where: { projectId },
    orderBy: { name: "asc" },
  });
}

export async function importTestCases(projectId: string, data: any[]) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Get or create categories first
  const categoryNames = [...new Set(data.map(item => item.Category || "General"))];
  const categories = await Promise.all(
    categoryNames.map(async (name) => {
      return await prisma.category.upsert({
        where: { name_projectId: { name, projectId } },
        update: {},
        create: { name, projectId },
      });
    })
  );

  // Get or create statuses
  const statusNames = [...new Set(data.map(item => item.Status?.toLowerCase() || "pending"))] as string[];
  await Promise.all(
    statusNames.map(async (name) => {
      if (!name) return;
      return await prisma.statusConfig.upsert({
        where: { name_projectId: { name, projectId } },
        update: {},
        create: { name, projectId, color: "#6b7280" }, // Default gray color
      });
    })
  );

  const categoryMap = new Map(categories.map(c => [c.name, c.id]));

  const testCases = data.map((item) => {
    return {
      projectId,
      userId: (session.user as any).id,
      categoryId: categoryMap.get(item.Category || "General")!,
      testCaseId: item["Test Case Id"] || `TC-${Math.random().toString(36).substr(2, 9)}`,
      module: item.Module || null,
      action: item.Action || "",
      conditions: item["Cases/Conditions"] || "",
      steps: item["Steps/Description"] || "",
      expectedOutput: item["Expected Output"] || "",
      actualOutput: item["Actual Output"] || "",
      status: item.Status?.toLowerCase() || "pending",
    };
  });

  const result = await prisma.testCase.createMany({
    data: testCases,
    skipDuplicates: true,
  });

  await logActivity(
    (session.user as any).id,
    "IMPORTED_TESTS",
    `Imported ${testCases.length} test cases`,
    projectId
  );

  revalidatePath("/dashboard");
  return result;
}

export async function addComment(testCaseId: string, content: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const tc = await prisma.testCase.findUnique({
    where: { id: testCaseId },
    select: { testCaseId: true, projectId: true }
  });

  await prisma.comment.create({
    data: {
      testCaseId,
      content,
      userId: (session.user as any).id,
    },
  });

  if (tc) {
    await logActivity(
      (session.user as any).id,
      "ADDED_COMMENT",
      `Added comment on ${tc.testCaseId}`,
      tc.projectId
    );
  }

  revalidatePath("/dashboard");
}

export async function updateTestCaseStatus(testCaseId: string, status: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const oldTc = await prisma.testCase.findUnique({
    where: { id: testCaseId },
    select: { status: true, testCaseId: true, projectId: true }
  });

  await prisma.testCase.update({
    where: { id: testCaseId },
    data: { status },
  });

  if (oldTc) {
    await logActivity(
      (session.user as any).id,
      "UPDATED_STATUS",
      `Changed status of ${oldTc.testCaseId} from ${oldTc.status} to ${status}`,
      oldTc.projectId
    );
  }

  revalidatePath("/dashboard");
}


export async function createProject(name: string, description?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  let role = (session.user as any).role;
  if (!role) {
    const dbUser = await prisma.user.findUnique({ where: { id: (session.user as any).id } });
    role = dbUser?.role;
  }

  if (role !== "ADMIN") {
    return { error: "Only admins can create projects" };
  }

  const project = await prisma.project.create({
    data: { name, description },
  });

  await logActivity(
    (session.user as any).id,
    "CREATED_PROJECT",
    `Created project '${name}'`,
    project.id
  );

  revalidatePath("/dashboard");
  return project;
}

export async function logActivity(
  userId: string,
  action: string,
  description: string,
  projectId?: string,
  metadata?: any
) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        projectId,
        action,
        description,
        metadata: metadata || {},
      },
    });
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
}

export async function getActivityLogs(projectId?: string) {
  const session = await auth();
  if (!session) return [];

  // Cleanup old logs (older than 90 days)
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  try {
    await prisma.activityLog.deleteMany({
      where: {
        createdAt: { lt: ninetyDaysAgo }
      }
    });
  } catch (err) {
    console.error("Failed to cleanup old logs:", err);
  }

  const where: any = {};
  if (projectId) where.projectId = projectId;
  
  // Everyone sees all logs as requested
  return await prisma.activityLog.findMany({
    where,
    include: {
      user: { select: { name: true, email: true } },
      project: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100, // Limit to recent 100 logs
  });
}


