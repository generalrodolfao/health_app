import { PrismaClient, FacilityType, CheckupItemStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Demo user
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
  console.log('  Demo user created');

  // Demo checkup for current year with items
  const year = new Date().getFullYear();
  const existingCheckup = await prisma.checkup.findUnique({
    where: { userId_year: { userId: 'demo-user', year } },
  });

  if (!existingCheckup) {
    await prisma.checkup.create({
      data: {
        userId: 'demo-user',
        year,
        targetDate: new Date(`${year}-12-31`),
        status: 'IN_PROGRESS',
        items: {
          create: [
            { examType: 'Hemograma Completo', professionalType: 'Laboratório', category: 'Rotina', status: CheckupItemStatus.COMPLETED, completedDate: new Date(`${year}-01-15`) },
            { examType: 'Exame de Urina', professionalType: 'Laboratório', category: 'Rotina', status: CheckupItemStatus.COMPLETED, completedDate: new Date(`${year}-02-10`) },
            { examType: 'Eletrocardiograma', professionalType: 'Cardiologista', category: 'Cardiovascular', status: CheckupItemStatus.PENDING },
            { examType: 'Limpeza e Avaliação', professionalType: 'Dentista', category: 'Dental', status: CheckupItemStatus.COMPLETED, completedDate: new Date(`${year}-03-05`) },
            { examType: 'Raio-X Panorâmico', professionalType: 'Dentista', category: 'Dental', status: CheckupItemStatus.PENDING },
            { examType: 'Fundo de Olho', professionalType: 'Oftalmologista', category: 'Visão', status: CheckupItemStatus.PENDING },
            { examType: 'Avaliação Psicológica', professionalType: 'Psicólogo', category: 'Mental', status: CheckupItemStatus.PENDING },
          ],
        },
      },
    });
    console.log('  Demo checkup created with 7 items (3 completed)');
  }

  // Facilities (fallback for when Overpass API is unavailable)
  const facilities = [
    { name: 'Hospital Sírio-Libanês', type: 'HOSPITAL' as FacilityType, address: 'Rua Dona Adma Jafet, 91 - Bela Vista, São Paulo', phone: '(11) 3394-0200', lat: -23.5585, lng: -46.6575, openHours: '24h', is24h: true },
    { name: 'Hospital Albert Einstein', type: 'HOSPITAL' as FacilityType, address: 'Av. Albert Einstein, 627 - Morumbi, São Paulo', phone: '(11) 2151-1233', lat: -23.5992, lng: -46.7092, openHours: '24h', is24h: true },
    { name: 'Hospital das Clínicas', type: 'HOSPITAL' as FacilityType, address: 'Av. Dr. Enéas de Carvalho Aguiar, 255 - São Paulo', phone: '(11) 2661-5000', lat: -23.5536, lng: -46.6693, openHours: '24h', is24h: true },
    { name: 'Farmácia São João - Paulista', type: 'PHARMACY' as FacilityType, address: 'Av. Paulista, 2000 - Bela Vista, São Paulo', phone: '(11) 3385-0001', lat: -23.5572, lng: -46.6605, openHours: '07:00-23:00', is24h: false },
    { name: 'Drogasil - Augusta', type: 'PHARMACY' as FacilityType, address: 'Rua Augusta, 1500 - Consolação, São Paulo', phone: '(11) 3123-0002', lat: -23.5538, lng: -46.6505, openHours: '24h', is24h: true },
  ];

  for (const f of facilities) {
    await prisma.facility.create({ data: f }).catch(() => {});
  }
  console.log(`  ${facilities.length} facilities created`);

  console.log('Seed complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());