
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.screenshot.count();
  console.log(`Found ${count} screenshot records in the database.`);

  if (count > 0) {
    console.log("Deleting all screenshot records...");
    const { count: deleted } = await prisma.screenshot.deleteMany({});
    console.log(`Successfully deleted ${deleted} records.`);
  } else {
    console.log("No records to delete.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
