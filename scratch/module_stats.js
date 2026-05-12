const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const projects = await prisma.project.findMany({
      select: { id: true, name: true }
    });

    console.log('\n--- Test Case Statistics by Module ---\n');

    for (const project of projects) {
      console.log(`Project: ${project.name} (${project.id})`);
      
      const stats = await prisma.testCase.groupBy({
        by: ['module'],
        where: { projectId: project.id },
        _count: { _all: true }
      });

      if (stats.length === 0) {
        console.log('  (No test cases found)');
      } else {
        let total = 0;
        stats.forEach(s => {
          console.log(`  - ${s.module || 'Unassigned'}: ${s._count._all}`);
          total += s._count._all;
        });
        console.log(`  Total: ${total}`);
      }
      console.log('-------------------------------------\n');
    }

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
