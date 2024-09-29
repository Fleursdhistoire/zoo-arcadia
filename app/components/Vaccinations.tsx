import { useState } from "react";
import { Animal, Vaccination } from "~/types";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "~/components/ui/select";
import { Button } from "~/components/ui/button";

interface VaccinationsProps {
  animals: Animal[];
  vaccinations: Vaccination[];
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onAnimalSelect: (animalId: number) => void;
}

export function Vaccinations({ animals, vaccinations, onSubmit, onAnimalSelect }: VaccinationsProps) {
  const [selectedAnimal, setSelectedAnimal] = useState<number | null>(null);

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Vaccinations</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="animalId">Animal</Label>
              <Select
                name="animalId"
                onValueChange={(value) => {
                  setSelectedAnimal(Number(value));
                  onAnimalSelect(Number(value));
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner un animal" />
                </SelectTrigger>
                <SelectContent>
                  {animals.map((animal) => (
                    <SelectItem key={animal.id} value={animal.id.toString()}>
                      {animal.name} ({animal.species})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="vaccineName">Nom du vaccin</Label>
              <Input type="text" name="vaccineName" required className="w-full" />
            </div>
            <div>
              <Label htmlFor="dateAdministered">Date d'administration</Label>
              <Input type="date" name="dateAdministered" required className="w-full" />
            </div>
            <div>
              <Label htmlFor="expirationDate">Date d'expiration</Label>
              <Input type="date" name="expirationDate" className="w-full" />
            </div>
          </div>
          <Button type="submit" className="w-full">Ajouter une vaccination</Button>
        </form>

        {/* Display vaccinations */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Vaccinations récentes</h3>
          <div className="space-y-4">
            {vaccinations.map((vaccination) => (
              <Card key={vaccination.id}>
                <CardContent className="p-4">
                  <p><strong>Animal:</strong> {vaccination.animal.name} ({vaccination.animal.species})</p>
                  <p><strong>Vaccin:</strong> {vaccination.vaccineName}</p>
                  <p><strong>Date d'administration:</strong> {new Date(vaccination.dateAdministered).toLocaleDateString()}</p>
                  {vaccination.expirationDate && (
                    <p><strong>Date d'expiration:</strong> {new Date(vaccination.expirationDate).toLocaleDateString()}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}