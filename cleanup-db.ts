
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log("Starting cleanup...");
  
  const screenshots = await prisma.screenshot.findMany();
  console.log(`Found ${screenshots.length} records.`);

  const idsToDelete: string[] = [];

  for (const s of screenshots) {
    // Extract filename from URL (e.g., "/api/images/mockup-123.png" -> "mockup-123.png")
    const filename = s.url.split('/').pop();
    if (!filename) continue;

    const privatePath = path.join(process.cwd(), "private", "outputs", filename);
    
    // Check if file exists
    if (!fs.existsSync(privatePath)) {
      console.log(`Missing file for ID ${s.id}: ${filename}`);
      idsToDelete.push(s.id);
    }
  }

  if (idsToDelete.length > 0) {
    console.log(`Deleting ${idsToDelete.length} phantom records...`);
    await prisma.screenshot.deleteMany({
      where: {
        id: {
          in: idsToDelete
        }
      }
    });
    console.log("Cleanup complete.");
  } else {
    console.log("No phantom records found. Database is clean.");
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
