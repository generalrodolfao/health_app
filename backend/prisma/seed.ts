import { PrismaClient, FacilityType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Demo user (matches the 'demo-user' ID used in controllers)
  await prisma.user.upsert({
    where: { id: 'demo-user' },
    update: {},
    create: {
      id: 'demo-user',
      name: 'Maria Silva',
      email: 'maria@healthapp.com',
      phone: '(11) 99999-8888',
    },
  });
  console.log('  ✓ Demo user created');

  // Facilities
  const facilities = [
    { name: 'Hospital Sírio-Libanês', type: 'HOSPITAL' as FacilityType, address: 'Rua Dona Adma Jafet, 91 - Bela Vista, São Paulo', phone: '(11) 3394-0200', lat: -23.5585, lng: -46.6575, openHours: '24h', is24h: true },
    { name: 'Hospital Albert Einstein', type: 'HOSPITAL' as FacilityType, address: 'Av. Albert Einstein, 627 - Morumbi, São Paulo', phone: '(11) 2151-1233', lat: -23.5992, lng: -46.7092, openHours: '24h', is24h: true },
    { name: 'Hospital das Clínicas', type: 'HOSPITAL' as FacilityType, address: 'Av. Dr. Enéas de Carvalho Aguiar, 255 - Cerqueira César, São Paulo', phone: '(11) 2661-5000', lat: -23.5536, lng: -46.6693, openHours: '24h', is24h: true },
    { name: 'Farmácia São João - Paulista', type: 'PHARMACY' as FacilityType, address: 'Av. Paulista, 2000 - Bela Vista, São Paulo', phone: '(11) 3385-0001', lat: -23.5572, lng: -46.6605, openHours: '07:00-23:00', is24h: false },
    { name: 'Drogasil - Augusta', type: 'PHARMACY' as FacilityType, address: 'Rua Augusta, 1500 - Consolação, São Paulo', phone: '(11) 3123-0002', lat: -23.5538, lng: -46.6505, openHours: '24h', is24h: true },
    { name: 'Farmácia Pague Menos', type: 'PHARMACY' as FacilityType, address: 'Rua da Consolação, 2000 - Consolação, São Paulo', phone: '(11) 3214-0003', lat: -23.5550, lng: -46.6580, openHours: '07:00-22:00', is24h: false },
    { name: 'Clínica Prevent Senior', type: 'CLINIC' as FacilityType, address: 'Rua São Carlos do Pinhal, 500 - Bela Vista, São Paulo', phone: '(11) 3333-0000', lat: -23.5580, lng: -46.6550, openHours: '08:00-18:00', is24h: false },
    { name: 'Laboratório Fleury', type: 'LABORATORY' as FacilityType, address: 'Av. das Nações Unidas, 11443 - Vila Olímpia, São Paulo', phone: '(11) 3394-0200', lat: -23.5995, lng: -46.6840, openHours: '06:00-17:00', is24h: false },
  ];

  for (const f of facilities) {
    await prisma.facility.create({ data: f }).catch(() => {});
  }
  console.log(`  ✓ ${facilities.length} facilities created`);

  console.log('🌱 Seed complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());