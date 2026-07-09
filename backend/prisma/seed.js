const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const DEMO_USER = 'demo-user';
const YEAR = new Date().getFullYear();

async function main() {
  console.log('Seeding...');

  await prisma.user.upsert({
    where: { id: DEMO_USER },
    update: {},
    create: { id: DEMO_USER, name: 'Maria Silva', email: 'maria@healthapp.com', phone: '(11) 99999-8888' },
  });

  const existing = await prisma.checkup.findUnique({ where: { userId_year: { userId: DEMO_USER, year: YEAR } } });
  if (!existing) {
    await prisma.checkup.create({
      data: {
        userId: DEMO_USER, year: YEAR, targetDate: new Date(`${YEAR}-12-31`), status: 'IN_PROGRESS',
        items: {
          create: [
            { examType: 'Hemograma Completo', professionalType: 'Laboratório', category: 'Rotina', status: 'COMPLETED', completedDate: new Date(`${YEAR}-01-15`) },
            { examType: 'Glicemia em Jejum', professionalType: 'Laboratório', category: 'Rotina', status: 'COMPLETED', completedDate: new Date(`${YEAR}-02-10`) },
            { examType: 'Colesterol Total', professionalType: 'Laboratório', category: 'Rotina', status: 'PENDING' },
            { examType: 'Eletrocardiograma', professionalType: 'Cardiologista', category: 'Cardiovascular', status: 'COMPLETED', completedDate: new Date(`${YEAR}-03-05`) },
            { examType: 'Ecocardiograma', professionalType: 'Cardiologista', category: 'Cardiovascular', status: 'PENDING' },
            { examType: 'Limpeza Dental', professionalType: 'Dentista', category: 'Dental', status: 'PENDING' },
            { examType: 'Avaliação Psicológica', professionalType: 'Psicólogo', category: 'Saúde Mental', status: 'PENDING' },
          ],
        },
      },
    });
  }

  for (const y of [YEAR - 1, YEAR - 2]) {
    const ex = await prisma.checkup.findUnique({ where: { userId_year: { userId: DEMO_USER, year: y } } });
    if (!ex) {
      await prisma.checkup.create({
        data: {
          userId: DEMO_USER, year: y, targetDate: new Date(`${y}-12-31`), status: 'COMPLETED',
          items: {
            create: [
              { examType: 'Hemograma Completo', professionalType: 'Laboratório', category: 'Rotina', status: 'COMPLETED', completedDate: new Date(`${y}-03-15`) },
              { examType: 'Eletrocardiograma', professionalType: 'Cardiologista', category: 'Cardiovascular', status: 'COMPLETED', completedDate: new Date(`${y}-05-20`) },
              { examType: 'Limpeza Dental', professionalType: 'Dentista', category: 'Dental', status: 'COMPLETED', completedDate: new Date(`${y}-06-10`) },
            ],
          },
        },
      });
    }
  }

  const existingAssessments = await prisma.mentalHealthAssessment.count({ where: { userId: DEMO_USER } });
  if (existingAssessments === 0) {
    const samples = [
      { responses: JSON.stringify({ "0": 0, "1": 1, "2": 0, "3": 1, "4": 0, "5": 0, "6": 1, "7": 0, "8": 0 }), level: 'LOW', date: new Date(`${YEAR}-01-10`) },
      { responses: JSON.stringify({ "0": 1, "1": 1, "2": 2, "3": 2, "4": 1, "5": 1, "6": 1, "7": 0, "8": 0 }), level: 'MEDIUM', date: new Date(`${YEAR}-04-15`) },
      { responses: JSON.stringify({ "0": 2, "1": 2, "2": 3, "3": 3, "4": 2, "5": 2, "6": 2, "7": 1, "8": 0 }), level: 'HIGH', date: new Date(`${YEAR}-07-01`) },
    ];
    for (const s of samples) {
      await prisma.mentalHealthAssessment.create({
        data: { userId: DEMO_USER, responses: s.responses, overallRiskLevel: s.level, assessedAt: s.date },
      });
    }
  }

  const facilities = [
    { name: 'Hospital Sírio-Libanês', type: 'HOSPITAL', address: 'R. Dona Adma Jafet, 91 - Bela Vista, SP', phone: '(11) 3394-0200', lat: -23.5585, lng: -46.6575, is24h: true, rating: 4.8, ratingCount: 230 },
    { name: 'Hospital Albert Einstein', type: 'HOSPITAL', address: 'Av. Albert Einstein, 627 - Morumbi, SP', phone: '(11) 2151-1233', lat: -23.5992, lng: -46.7092, is24h: true, rating: 4.7, ratingCount: 180 },
    { name: 'Hospital das Clínicas', type: 'HOSPITAL', address: 'Av. Dr. Enéas de Carvalho Aguiar, 255 - SP', phone: '(11) 2661-5000', lat: -23.5536, lng: -46.6693, is24h: true, rating: 4.2, ratingCount: 95 },
    { name: 'Farmácia São João - Paulista', type: 'PHARMACY', address: 'Av. Paulista, 2000 - Bela Vista, SP', phone: '(11) 3385-0001', lat: -23.5572, lng: -46.6605, is24h: false, rating: 4.3, ratingCount: 45 },
    { name: 'Drogasil - Augusta', type: 'PHARMACY', address: 'R. Augusta, 1500 - Consolação, SP', phone: '(11) 3123-0002', lat: -23.5538, lng: -46.6505, is24h: true, rating: 4.5, ratingCount: 62 },
    { name: 'Clínica Vida', type: 'CLINIC', address: 'R. São Carlos do Pinhal, 500 - Bela Vista, SP', phone: '(11) 3333-0000', lat: -23.5580, lng: -46.6550, is24h: false, rating: 4.1, ratingCount: 28 },
    { name: 'Laboratório Fleury', type: 'LABORATORY', address: 'Av. das Nações Unidas, 11443 - Vila Olímpia, SP', phone: '(11) 3394-0200', lat: -23.5995, lng: -46.6840, is24h: false, rating: 4.6, ratingCount: 150 },
  ];
  for (const f of facilities) {
    const exists = await prisma.facility.findFirst({ where: { name: f.name } });
    if (!exists) await prisma.facility.create({ data: f });
  }

  console.log('Seed complete!');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());