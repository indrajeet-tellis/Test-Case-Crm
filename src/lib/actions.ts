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
  const { password, ...rest } = data;
  const bcrypt = await import("bcryptjs");
  const hashedPassword = await bcrypt.hash(password, 10);
  return await prisma.user.create({
    data: { ...rest, password: hashedPassword },
  });
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
  return await prisma.user.delete({ where: { id } });
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

  await prisma.testCase.createMany({
    data: testCases,
    skipDuplicates: true,
  });

  revalidatePath("/dashboard");
}
export async function addComment(testCaseId: string, content: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.comment.create({
    data: {
      testCaseId,
      content,
      userId: (session.user as any).id,
    },
  });

  revalidatePath("/dashboard");
}

export async function updateTestCaseStatus(testCaseId: string, status: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  await prisma.testCase.update({
    where: { id: testCaseId },
    data: { status },
  });

  revalidatePath("/dashboard");
}


export async function createProject(name: string, description?: string) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") {
    throw new Error("Only admins can create projects");
  }

  const project = await prisma.project.create({
    data: { name, description },
  });

  revalidatePath("/dashboard");
  return project;
}
