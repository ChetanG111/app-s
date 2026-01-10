
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const screenshots = await prisma.screenshot.findMany({
    take: 5,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      user: {
        select: {
          email: true,
          id: true
        }
      }
    }
  });

  console.log(JSON.stringify(screenshots, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
