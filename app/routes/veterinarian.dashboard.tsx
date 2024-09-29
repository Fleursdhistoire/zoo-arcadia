/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { json, LoaderFunction, ActionFunction } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { requireUserId } from "~/utils/session.server.js";
import { db } from "~/utils/db.server.js";
import { format, startOfDay, endOfDay } from "date-fns";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Animal as AnimalComponent } from "~/components/Animal.js";
import { Control } from "~/components/Control.js";
import { Food } from "~/components/Food.js";
import { HealthRecords } from "~/components/HealthRecords.js";
import { HealthStatusReport, VaccinationReport, HealthReports } from "~/components/HealthReports.js";
import { Vaccinations } from "~/components/Vaccinations.js";
import { Animal, DailyHealthCheck, Habitat, HealthRecord, Vaccination } from "~/types.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type FoodCalculationParams = Pick<Animal, 'species' | 'weight' | 'age' | 'activityLevel' | 'dietaryNeeds'>;

function calculateRecommendedFoodQuantity(animal: FoodCalculationParams): number {
  let baseQuantity: number;

  switch (animal.species.toLowerCase()) {
    case "lion":
    case "tiger":
      baseQuantity = animal.weight * 0.03;
      break;
    case "elephant":
      baseQuantity = animal.weight * 0.015; 
      break;
    case "monkey":
      baseQuantity = animal.weight * 0.05; 
      break;
    default:
      baseQuantity = animal.weight * 0.02; 
  }

  if (animal.age < 1) {
    baseQuantity *= 1.5; 
  } else if (animal.age > 10) {
    baseQuantity *= 0.8; 
  }


  switch (animal.activityLevel.toLowerCase()) {
    case "high":
      baseQuantity *= 1.2;
      break;
    case "low":
      baseQuantity *= 0.8;
      break;

  }


  if (animal.dietaryNeeds) {
    if (animal.dietaryNeeds.toLowerCase().includes("high protein")) {
      baseQuantity *= 1.1;
    } else if (animal.dietaryNeeds.toLowerCase().includes("low calorie")) {
      baseQuantity *= 0.9;
    }
  }

  return Math.round(baseQuantity * 1000); // Convert to grams and round
}

function serializeBigInt(data: any): any {
  if (typeof data === 'bigint') {
    return data.toString();
  } else if (Array.isArray(data)) {
    return data.map(serializeBigInt);
  } else if (typeof data === 'object' && data !== null) {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, serializeBigInt(value)])
    );
  }
  return data;
}


type LoaderData = {
  animals: Animal[];
  healthRecords: HealthRecord[]; 
  habitats: Habitat[]; 
  dailyHealthChecks: DailyHealthCheck[]; 
  vaccinations: Vaccination[];
  healthStatusReport: HealthStatusReport[];
  vaccinationReport: VaccinationReport[];
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const user = await db.user.findUnique({ where: { id: parseInt(userId) } });

  if (user?.role !== "VETERINARIAN" && user?.role !== "ADMIN") {
    throw new Response("Unauthorized", { status: 403 });
  }

  const animals = await db.animal.findMany({
    include: {
      habitat: {
        select: { id: true, name: true },
      },
      healthRecords: true,
      feedingRecords: true,
      animalViews: true,
      // Include any other related data here
    },
  });

  const healthRecords = await db.healthRecord.findMany({
    where: { veterinarianId: parseInt(userId) },
    orderBy: { date: "desc" },
    take: 50, // Increase this to get more historical data
    include: {
      animal: {
        include: {
          habitat: {
            select: { id: true, name: true },
          },
        },
      },
    },
  });

  const habitats = await db.habitat.findMany();

  const today = new Date();
  const startOfToday = startOfDay(today);
  const endOfToday = endOfDay(today);

  const dailyHealthChecks = await db.dailyHealthCheck.findMany({
    where: {
      veterinarianId: parseInt(userId),
      date: {
        gte: startOfToday,
        lte: endOfToday,
      },
    },
    include: { animal: true },
  });

  const vaccinations = await db.vaccination.findMany({
    where: { veterinarianId: parseInt(userId) },
    orderBy: { dateAdministered: "desc" },
    include: { animal: true },
  });

  const healthStatusReport = await db.$queryRaw<HealthStatusReport[]>`
    SELECT status, COUNT(*) as count
    FROM Animal
    GROUP BY status
  `;

  const vaccinationReport = await db.$queryRaw<VaccinationReport[]>`
    SELECT 
      a.species,
      SUM(CASE WHEN v.id IS NOT NULL THEN 1 ELSE 0 END) as vaccinated,
      SUM(CASE WHEN v.id IS NULL THEN 1 ELSE 0 END) as notVaccinated
    FROM Animal a
    LEFT JOIN Vaccination v ON a.id = v.animalId
    GROUP BY a.species
  `;

  const loaderData = {
    animals,
    healthRecords,
    habitats,
    dailyHealthChecks,
    vaccinations,
    healthStatusReport,
    vaccinationReport,
  };

  // Serialize the data before returning it
  return json(serializeBigInt(loaderData));
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const user = await db.user.findUnique({ where: { id: parseInt(userId) } });

  if (user?.role !== "VETERINARIAN") {
    throw new Response("Unauthorized", { status: 403 });
  }

  const formData = await request.formData();
  const action = formData.get("_action");

  switch (action) {
    case "updateAnimal":
      return handleUpdateAnimal(formData);
    case "deleteAnimal":
      return handleDeleteAnimal(formData);
    case "createHealthRecord":
      return handleCreateHealthRecord(formData, parseInt(userId));
    case "updateHabitatComment":
      return handleUpdateHabitatComment(formData);
    case "createDailyHealthCheck":
      return handleCreateDailyHealthCheck(formData, parseInt(userId));
    case "updateRecommendedFoodQuantity":
      return handleUpdateRecommendedFoodQuantity(formData);

    case "createVaccination":
      return handleCreateVaccination(formData, parseInt(userId));
    default:
      return json({ error: "Invalid action" }, { status: 400 });
  }
};

async function handleCreateVaccination(
  formData: FormData,
  veterinarianId: number
) {
  const animalId = formData.get("animalId");
  const vaccineName = formData.get("vaccineName");
  const dateAdministered = formData.get("dateAdministered");
  const expirationDate = formData.get("expirationDate");

  if (
    typeof animalId !== "string" ||
    typeof vaccineName !== "string" ||
    typeof dateAdministered !== "string"
  ) {
    return json({ error: "Invalid form data" }, { status: 400 });
  }

  try {
    const newVaccination = await db.vaccination.create({
      data: {
        animalId: parseInt(animalId),
        vaccineName,
        dateAdministered: new Date(dateAdministered as string),
        expirationDate: expirationDate ? new Date(expirationDate as string) : null,
        veterinarianId,
      },
    });
    return json({ success: true, vaccination: newVaccination });
  } catch (error) {
    return json(
      { error: "Failed to create vaccination record" },
      { status: 500 }
    );
  }
}

async function handleUpdateAnimal(formData: FormData) {
  const id = formData.get("id");
  const name = formData.get("name");
  const species = formData.get("species");
  const status = formData.get("status");
  const habitatId = formData.get("habitatId");

  if (
    typeof id !== "string" ||
    typeof name !== "string" ||
    typeof species !== "string" ||
    typeof status !== "string" ||
    (habitatId !== null && typeof habitatId !== "string")
  ) {
    return json({ error: "Invalid form data" }, { status: 400 });
  }

  try {
    await db.animal.update({
      where: { id: parseInt(id) },
      data: {
        name,
        species,
        status,
        habitatId: habitatId ? parseInt(habitatId) : null,
      },
    });
    return json({ success: true });
  } catch (error) {
    return json({ error: "Failed to update animal" }, { status: 500 });
  }
}

async function handleDeleteAnimal(formData: FormData) {
  const id = formData.get("id");

  if (typeof id !== "string") {
    return json({ error: "Invalid animal ID" }, { status: 400 });
  }

  try {
    await db.animal.delete({
      where: { id: parseInt(id) },
    });
    return json({ success: true });
  } catch (error) {
    return json({ error: "Failed to delete animal" }, { status: 500 });
  }
}

async function handleCreateHealthRecord(
  formData: FormData,
  veterinarianId: number
) {
  const animalId = formData.get("animalId");
  const date = formData.get("date");
  const status = formData.get("status");
  const food = formData.get("food");
  const quantity = formData.get("quantity");
  const details = formData.get("details");
  const weight = formData.get("weight");
  const temperature = formData.get("temperature");
  const symptoms = formData.get("symptoms");
  const diagnosis = formData.get("diagnosis");
  const treatment = formData.get("treatment");
  const medications = formData.get("medications");
  const followUpDate = formData.get("followUpDate");

  if (
    typeof animalId !== "string" ||
    typeof date !== "string" ||
    typeof status !== "string" ||
    typeof food !== "string" ||
    typeof quantity !== "string" ||
    (weight !== null && typeof weight !== "string") ||
    (temperature !== null && typeof temperature !== "string") ||
    (symptoms !== null && typeof symptoms !== "string") ||
    (diagnosis !== null && typeof diagnosis !== "string") ||
    (treatment !== null && typeof treatment !== "string") ||
    (medications !== null && typeof medications !== "string") ||
    (followUpDate !== null && typeof followUpDate !== "string")
  ) {
    return json({ error: "Invalid form data" }, { status: 400 });
  }

  try {
    const newRecord = await db.healthRecord.create({
      data: {
        animalId: parseInt(animalId),
        date: new Date(date),
        status,
        food,
        quantity: parseFloat(quantity),
        details: typeof details === "string" ? details : undefined,
        weight: weight !== null ? parseFloat(weight) : undefined,
        temperature: temperature !== null ? parseFloat(temperature) : undefined,
        symptoms: typeof symptoms === "string" ? symptoms : undefined,
        diagnosis: typeof diagnosis === "string" ? diagnosis : undefined,
        treatment: typeof treatment === "string" ? treatment : undefined,
        medications: typeof medications === "string" ? medications : undefined,
        followUpDate:
          followUpDate !== null ? new Date(followUpDate) : undefined,
        veterinarianId,
      },
    });
    return json({ success: true, record: newRecord });
  } catch (error) {
    return json({ error: "Failed to create health record" }, { status: 500 });
  }
}

async function handleUpdateHabitatComment(formData: FormData) {
  const id = formData.get("id");
  const comment = formData.get("comment");

  if (typeof id !== "string" || typeof comment !== "string") {
    return json({ error: "Invalid form data" }, { status: 400 });
  }

  try {
    const updatedHabitat = await db.habitat.update({
      where: { id: parseInt(id) },
      data: { comment },
    });
    return json({ success: true, habitat: updatedHabitat });
  } catch (error) {
    return json({ error: "Failed to update habitat comment" }, { status: 500 });
  }
}

async function handleCreateDailyHealthCheck(
  formData: FormData,
  veterinarianId: number
) {
  const animalId = formData.get("animalId");
  const status = formData.get("status");
  const notes = formData.get("notes");
  const date = format(new Date(), "yyyy-MM-dd");

  if (
    typeof animalId !== "string" ||
    typeof status !== "string" ||
    typeof notes !== "string"
  ) {
    return json({ error: "Invalid form data" }, { status: 400 });
  }

  try {
    const newCheck = await db.dailyHealthCheck.create({
      data: {
        animalId: parseInt(animalId),
        date,
        status,
        notes,
        veterinarianId,
      },
    });
    return json({ success: true, check: newCheck });
  } catch (error) {
    return json(
      { error: "Failed to create daily health check" },
      { status: 500 }
    );
  }
}

async function handleUpdateRecommendedFoodQuantity(formData: FormData) {
  const animalId = formData.get("animalId");
  const recommendedFoodQuantity = formData.get("recommendedFoodQuantity");

  if (
    typeof animalId !== "string" ||
    typeof recommendedFoodQuantity !== "string"
  ) {
    return json({ error: "Invalid form data" }, { status: 400 });
  }

  try {
    const updatedAnimal = await db.animal.update({
      where: { id: parseInt(animalId) },
      data: { recommendedFoodQuantity: parseFloat(recommendedFoodQuantity) },
    });
    return json({ success: true, animal: updatedAnimal });
  } catch (error) {
    return json(
      { error: "Failed to update recommended food quantity" },
      { status: 500 }
    );
  }
}


export default function VeterinarianDashboard() {
  const {
    animals,
    healthRecords,
    habitats,
    vaccinations,
    healthStatusReport,
    vaccinationReport,
  } = useLoaderData<LoaderData>();
  const submit = useSubmit();
  const [selectedAnimal, setSelectedAnimal] = useState<number | null>(null);
  const [recommendedFoodQuantities, setRecommendedFoodQuantities] = useState<{
    [key: number]: number;
  }>({});

  const [activeTab, setActiveTab] = useState<string>("control");

  useEffect(() => {
    const newRecommendedFoodQuantities: { [key: number]: number } = {};
    animals.forEach((animal) => {
      newRecommendedFoodQuantities[animal.id] = calculateRecommendedFoodQuantity(animal);
    });
    setRecommendedFoodQuantities(newRecommendedFoodQuantities);
  }, [animals]);



  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit(event.currentTarget);
  };


  console.log("Rendering VeterinarianDashboard with activeTab:", activeTab);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Tableau de bord vétérinaire</h1>

          <Control animals={animals} onAnimalSelect={setSelectedAnimal} onSubmit={handleSubmit} />

          <AnimalComponent animals={animals} habitats={habitats} onSubmit={handleSubmit} />

          <Food 
            animals={animals} 
            calculateRecommendedFoodQuantity={(animal: FoodCalculationParams): number => calculateRecommendedFoodQuantity(animal)}
            onSubmit={handleSubmit} 
          />

          <HealthRecords 
            animals={animals} 
            habitats={habitats}
            healthRecords={healthRecords} 
            onSubmit={handleSubmit} 
            onAnimalSelect={setSelectedAnimal} 
          />

          <Vaccinations 
            animals={animals} 
            vaccinations={vaccinations} 
            onSubmit={handleSubmit} 
            onAnimalSelect={setSelectedAnimal} 
          />

          <HealthReports 
            healthStatusReport={healthStatusReport} 
            vaccinationReport={vaccinationReport} 
          />

    </div>
  );
}
