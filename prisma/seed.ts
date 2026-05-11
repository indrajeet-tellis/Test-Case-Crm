import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. Create Admin User
  const hashedPassword = await bcrypt.hash("Tellis@$#2026", 10);
  
  const admin = await prisma.user.upsert({
    where: { email: "indrajeet@tellistechnologies.com" },
    update: {
      password: hashedPassword,
    },
    create: {
      email: "indrajeet@tellistechnologies.com",
      name: "Indrajeet Admin",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  const testUser = await prisma.user.upsert({
    where: { email: "tester@example.com" },
    update: {},
    create: {
      email: "tester@example.com",
      name: "QA Tester",
      password: hashedPassword,
      role: "USER",
    },
  });

  console.log("Created users.");

  // 2. Create Projects
  const project1 = await prisma.project.create({
    data: {
      name: "E-Commerce Web App",
      description: "Frontend and backend testing for the new e-commerce platform.",
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: "Mobile Banking App",
      description: "iOS and Android application testing.",
    },
  });

  console.log("Created projects.");

  // 3. Create Categories and Statuses for Project 1
  const p1Categories = ["Authentication", "Checkout", "Product Catalog", "User Profile"];
  const categoryIdsP1: Record<string, string> = {};
  
  for (const cat of p1Categories) {
    const created = await prisma.category.create({
      data: { name: cat, projectId: project1.id },
    });
    categoryIdsP1[cat] = created.id;
  }

  const p1Statuses = ["pending", "passed", "failed", "blocked", "retest"];
  for (const status of p1Statuses) {
    await prisma.statusConfig.create({
      data: { name: status, projectId: project1.id },
    });
  }

  // 4. Create Categories and Statuses for Project 2
  const p2Categories = ["Login", "Transactions", "Biometrics"];
  const categoryIdsP2: Record<string, string> = {};
  
  for (const cat of p2Categories) {
    const created = await prisma.category.create({
      data: { name: cat, projectId: project2.id },
    });
    categoryIdsP2[cat] = created.id;
  }

  const p2Statuses = ["todo", "in progress", "done", "bug"];
  for (const status of p2Statuses) {
    await prisma.statusConfig.create({
      data: { name: status, projectId: project2.id },
    });
  }

  console.log("Created categories and statuses.");

  // 5. Create Test Cases for Project 1
  const p1TestCases = [
    {
      testCaseId: "TC-EC-001",
      categoryId: categoryIdsP1["Authentication"],
      action: "Login with valid credentials",
      conditions: "User exists and account is active",
      steps: "1. Navigate to login page\n2. Enter email and password\n3. Click Login",
      expectedOutput: "User should be redirected to dashboard",
      status: "passed",
      actualOutput: "Redirected successfully",
    },
    {
      testCaseId: "TC-EC-002",
      categoryId: categoryIdsP1["Authentication"],
      action: "Login with incorrect password",
      conditions: "User exists",
      steps: "1. Navigate to login page\n2. Enter email and wrong password\n3. Click Login",
      expectedOutput: "Error message should be displayed",
      status: "pending",
    },
    {
      testCaseId: "TC-EC-003",
      categoryId: categoryIdsP1["Checkout"],
      action: "Checkout with empty cart",
      conditions: "Cart has 0 items",
      steps: "1. Navigate to cart\n2. Click checkout",
      expectedOutput: "Checkout button should be disabled",
      status: "failed",
      actualOutput: "Checkout button was active and crashed the app.",
    },
    {
      testCaseId: "TC-EC-004",
      categoryId: categoryIdsP1["Product Catalog"],
      action: "Search for non-existent product",
      conditions: "Search service is up",
      steps: "1. Type 'xyzxyz' in search bar\n2. Hit enter",
      expectedOutput: "No results found message",
      status: "blocked",
    },
  ];

  for (const tc of p1TestCases) {
    await prisma.testCase.create({
      data: {
        ...tc,
        projectId: project1.id,
        userId: testUser.id,
      },
    });
  }

  // 6. Create Test Cases for Project 2
  const p2TestCases = [
    {
      testCaseId: "TC-MB-001",
      categoryId: categoryIdsP2["Transactions"],
      action: "Transfer funds to another account",
      conditions: "Sufficient balance",
      steps: "1. Go to transfer\n2. Enter amount\n3. Confirm",
      expectedOutput: "Funds transferred successfully",
      status: "done",
    },
    {
      testCaseId: "TC-MB-002",
      categoryId: categoryIdsP2["Biometrics"],
      action: "Enable Face ID",
      conditions: "Device supports Face ID",
      steps: "1. Go to settings\n2. Toggle Face ID",
      expectedOutput: "Prompt for Face ID setup",
      status: "in progress",
    },
  ];

  for (const tc of p2TestCases) {
    await prisma.testCase.create({
      data: {
        ...tc,
        projectId: project2.id,
        userId: admin.id,
      },
    });
  }

  console.log("Seeding completed successfully.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
