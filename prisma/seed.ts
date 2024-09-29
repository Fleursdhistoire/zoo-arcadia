import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Seed Habitats
  const savanna = await prisma.habitat.create({
    data: {
      name: 'Savanna',
      description: 'A grassy plain with few trees',
      image: 'savanna.jpg',
    },
  });

  const rainforest = await prisma.habitat.create({
    data: {
      name: 'Rainforest',
      description: 'A dense forest with high rainfall',
      image: 'rainforest.jpg',
    },
  });

  const desert = await prisma.habitat.create({
    data: {
      name: 'Desert',
      description: 'A dry area with little vegetation',
      image: 'desert.jpg',
    },
  });

  // Seed Animals
  const animalData = [
    {
      name: 'Leo',
      species: 'Lion',
      image: 'lion.jpg',
      status: 'Healthy',
      habitatId: savanna.id,
      age: 5,
      weight: 190.5,
      activityLevel: 'High'
    },
    {
      name: 'Ella',
      species: 'Elephant',
      image: 'elephant.jpg',
      status: 'Healthy',
      habitatId: savanna.id,
      age: 15,
      weight: 4500.0,
      activityLevel: 'Medium'
    },
    {
      name: 'Zara',
      species: 'Zebra',
      image: 'zebra.jpg',
      status: 'Healthy',
      habitatId: savanna.id,
      age: 7,
      weight: 350.0,
      activityLevel: 'High'
    },
    {
      name: 'Tina',
      species: 'Toucan',
      image: 'toucan.jpg',
      status: 'Healthy',
      habitatId: rainforest.id,
      age: 3,
      weight: 0.5,
      activityLevel: 'Medium'
    },
    {
      name: 'Cleo',
      species: 'Cheetah',
      image: 'cheetah.jpg',
      status: 'Injured',
      habitatId: savanna.id,
      age: 4,
      weight: 50.0,
      activityLevel: 'Low'
    },
    {
      name: 'Daisy',
      species: 'Dolphin',
      image: 'dolphin.jpg',
      status: 'Healthy',
      habitatId: 1, // Assuming habitatId for ocean habitat
      age: 8,
      weight: 300.0,
      activityLevel: 'High'
    },
    {
      name: 'Rex',
      species: 'Crocodile',
      image: 'crocodile.jpg',
      status: 'Healthy',
      habitatId: rainforest.id,
      age: 12,
      weight: 450.0,
      activityLevel: 'Low'
    },
    {
      name: 'Sandy',
      species: 'Camel',
      image: 'camel.jpg',
      status: 'Healthy',
      habitatId: desert.id,
      age: 6,
      weight: 500.0,
      activityLevel: 'Medium'
    },
  ];

  const animals = await prisma.animal.createMany({
    data: animalData,
  });

  // Seed Users
  console.log('Seeding users...');
  let vet, employee;
  try {
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    vet = await prisma.user.upsert({
      where: { email: 'vet@example.com' },
      update: {},
      create: {
        email: 'vet@example.com',
        password: hashedPassword,
        role: 'VETERINARIAN',
      },
    });
    console.log('Vet created or updated:', vet);

    employee = await prisma.user.upsert({
      where: { email: 'employee@example.com' },
      update: {},
      create: {
        email: 'employee@example.com',
        password: hashedPassword,
        role: 'EMPLOYEE',
      },
    });
    console.log('Employee created or updated:', employee);
  } catch (error) {
    console.error('Error creating/updating users:', error);
    process.exit(1);
  }

  // Seed HealthRecords
  if (vet) {
    await prisma.healthRecord.createMany({
      data: [
        {
          animalId: 1,
          date: new Date(),
          status: 'Healthy',
          food: 'Meat',
          quantity: 5,
          veterinarianId: vet.id,
        },
        // ... (other health records)
      ],
    });
  }

  // Seed FeedingRecords
  if (employee) {
    await prisma.feedingRecord.createMany({
      data: [
        {
          animalId: 1,
          date: new Date(),
          time: '08:00',
          food: 'Meat',
          quantity: 5,
          employeeId: employee.id,
        },
        // ... (other feeding records)
      ],
    });
  }

  // Seed AnimalViews
  const createdAnimals = await prisma.animal.findMany();
  for (const animal of createdAnimals) {
    await prisma.animalView.create({
      data: {
        animalId: animal.id,
        viewCount: Math.floor(Math.random() * 1000), // Random view count
        updatedAt: new Date(),
      },
    });
  }

  // Seed Reviews
  await prisma.review.createMany({
    data: [
      {
        name: 'John Doe',
        comment: 'Great zoo experience!',
        isVisible: true,
      },
      {
        name: 'Jane Smith',
        comment: 'Loved the elephant exhibit.',
        isVisible: true,
      },
      {
        name: 'Bob Johnson',
        comment: 'Could use more food options.',
        isVisible: false,
      },
      // Add more reviews as needed
    ],
  });

  // Seed Services
  await prisma.service.createMany({
    data: [
      {
        name: 'Guided Tour',
        description: 'A 2-hour guided tour of the zoo',
      },
      {
        name: 'Animal Feeding Experience',
        description: 'Participate in feeding select animals',
      },
      {
        name: 'Photography Workshop',
        description: 'Learn wildlife photography in the zoo',
      },
      // Add more services as needed
    ],
  });

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });