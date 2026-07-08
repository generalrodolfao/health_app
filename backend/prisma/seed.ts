import { PrismaClient, FacilityType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const facilities = [
    {
      name: 'Hospital Sírio-Libanês',
      type: 'HOSPITAL' as FacilityType,
      address: 'Rua Dona Adma Jafet, 91 - Bela Vista, São Paulo',
      phone: '(11) 3394-0200',
      lat: -23.5585,
      lng: -46.6575,
      openHours: '24h',
      is24h: true,
    },
    {
      name: 'Hospital Albert Einstein',
      type: 'HOSPITAL' as FacilityType,
      address: 'Av. Albert Einstein, 627 - Morumbi, São Paulo',
      phone: '(11) 2151-1233',
      lat: -23.5992,
      lng: -46.7092,
      openHours: '24h',
      is24h: true,
    },
    {
      name: 'Farmácia São João - Paulista',
      type: 'PHARMACY' as FacilityType,
      address: 'Av. Paulista, 2000 - Bela Vista, São Paulo',
      phone: '(11) 99999-0001',
      lat: -23.5572,
      lng: -46.6605,
      openHours: '07:00 - 23:00',
      is24h: false,
    },
    {
      name: 'Drogasil - Augusta',
      type: 'PHARMACY' as FacilityType,
      address: 'Rua Augusta, 1500 - Consolação, São Paulo',
      phone: '(11) 99999-0002',
      lat: -23.5538,
      lng: -46.6505,
      openHours: '24h',
      is24h: true,
    },
    {
      name: 'Farmácia Pague Menos',
      type: 'PHARMACY' as FacilityType,
      address: 'Rua da Consolação, 2000 - Consolação, São Paulo',
      phone: '(11) 99999-0003',
      lat: -23.5550,
      lng: -46.6580,
      openHours: '07:00 - 22:00',
      is24h: false,
    },
    {
      name: 'Clínica Prevent Senior',
      type: 'CLINIC' as FacilityType,
      address: 'Rua São Carlos do Pinhal, 500 - Bela Vista, São Paulo',
      phone: '(11) 3333-0000',
      lat: -23.5580,
      lng: -46.6550,
      openHours: '08:00 - 18:00',
      is24h: false,
    },
  ];

  for (const facility of facilities) {
    await prisma.facility.create({ data: facility });
  }

  console.log(`Seed completed! ${facilities.length} facilities created.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
