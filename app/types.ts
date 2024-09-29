import { Prisma } from '@prisma/client';

export type Review = {
  id: number;
  name: string;
  comment: string;
  isVisible: boolean;
  createdAt: Date;
};

export type Service = {
  id: number;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Habitat = {
  id: number;
  name: string;
  description: string;
  image: string;
  comment?: string | null;
  animals: Animal[];
  createdAt: Date;
  updatedAt: Date;
};

export type Animal = {
  id: number;
  name: string;
  species: string;
  image: string;
  status: string;
  age: number;
  weight: number;
  activityLevel: string;
  dietaryNeeds?: string | null;
  habitatId?: number | null;
  habitat?: Habitat | null;
  healthRecords: HealthRecord[];
  feedingRecords: FeedingRecord[];
  animalViews: AnimalView[];
  dailyHealthChecks: DailyHealthCheck[];
  recommendedFoodQuantity?: number | null;
  vaccinations: Vaccination[];
  createdAt: Date;
  updatedAt: Date;
};

export type HealthRecord = {
  id: number;
  animalId: number;
  animal: Animal;
  date: Date;
  status: string;
  food: string;
  quantity: number;
  details?: string | null;
  weight?: number | null;
  temperature?: number | null;
  symptoms?: string | null;
  diagnosis?: string | null;
  treatment?: string | null;
  medications?: string | null;
  followUpDate?: Date | null;
  veterinarianId: number;
  veterinarian: User;
  createdAt: Date;
  updatedAt: Date;
};

export type Vaccination = {
  id: number;
  animalId: number;
  animal: Animal;
  vaccineName: string;
  dateAdministered: Date;
  expirationDate?: Date | null;
  veterinarianId: number;
  veterinarian: User;
  createdAt: Date;
  updatedAt: Date;
};

export type User = {
  id: number;
  email: string;
  password: string;
  role: string;
  healthRecords: HealthRecord[];
  feedingRecords: FeedingRecord[];
  dailyHealthChecks: DailyHealthCheck[];
  administeredVaccinations: Vaccination[];
  createdAt: Date;
  updatedAt: Date;
};

export type FeedingRecord = {
  id: number;
  animalId: number;
  animal: Animal;
  date: Date;
  time: string;
  food: string;
  quantity: number;
  employeeId: number;
  employee: User;
  createdAt: Date;
  updatedAt: Date;
};

export type AnimalView = {
  id: number;
  animalId: number;
  animal: Animal;
  viewCount: number;
  updatedAt: Date;
};

export type DailyHealthCheck = {
  id: number;
  animal: Animal;
  animalId: number;
  date: Date;
  status: string;
  notes: string;
  veterinarian: User;
  veterinarianId: number;
  createdAt: Date;
  updatedAt: Date;
};

// Prisma utility types
export type ReviewCreateInput = Prisma.ReviewCreateInput;
export type ServiceCreateInput = Prisma.ServiceCreateInput;
export type HabitatCreateInput = Prisma.HabitatCreateInput;
export type AnimalCreateInput = Prisma.AnimalCreateInput;
export type HealthRecordCreateInput = Prisma.HealthRecordCreateInput;
export type VaccinationCreateInput = Prisma.VaccinationCreateInput;
export type UserCreateInput = Prisma.UserCreateInput;
export type FeedingRecordCreateInput = Prisma.FeedingRecordCreateInput;
export type AnimalViewCreateInput = Prisma.AnimalViewCreateInput;
export type DailyHealthCheckCreateInput = Prisma.DailyHealthCheckCreateInput;

export type ReviewUpdateInput = Prisma.ReviewUpdateInput;
export type ServiceUpdateInput = Prisma.ServiceUpdateInput;
export type HabitatUpdateInput = Prisma.HabitatUpdateInput;
export type AnimalUpdateInput = Prisma.AnimalUpdateInput;
export type HealthRecordUpdateInput = Prisma.HealthRecordUpdateInput;
export type VaccinationUpdateInput = Prisma.VaccinationUpdateInput;
export type UserUpdateInput = Prisma.UserUpdateInput;
export type FeedingRecordUpdateInput = Prisma.FeedingRecordUpdateInput;
export type AnimalViewUpdateInput = Prisma.AnimalViewUpdateInput;
export type DailyHealthCheckUpdateInput = Prisma.DailyHealthCheckUpdateInput;

export type FoodCalculationParams = Pick<Animal, 'species' | 'weight' | 'age' | 'activityLevel'> & {
  dietaryNeeds: string | null;
};
