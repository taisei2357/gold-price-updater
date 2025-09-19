import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const settings = await prisma.shopSetting.findMany({
    select: {
      shopDomain: true,
      autoUpdateEnabled: true,
      minPricePct: true,
      notificationEmail: true
    }
  });
  
  console.log('Shop Settings:', JSON.stringify(settings, null, 2));
}

main().catch(console.error).finally(() => process.exit());
