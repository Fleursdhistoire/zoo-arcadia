import { useState } from "react";
import { Animal, Habitat, HealthRecord } from "~/types";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "~/components/ui/select.js";
import { Button } from "~/components/ui/button";

interface HealthRecordsProps {
  animals: Animal[];
  habitats: Habitat[];
  healthRecords: HealthRecord[];
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onAnimalSelect: (animalId: number) => void;
}

export function HealthRecords({ animals, habitats, healthRecords, onSubmit, onAnimalSelect }: HealthRecordsProps) {
  const [selectedAnimal, setSelectedAnimal] = useState<string | null>(null);

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Dossiers de santé</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="animalId">Animal</Label>
              <Select
                name="animalId"
                onValueChange={(value) => {
                  setSelectedAnimal(value);
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
              <Label htmlFor="date">Date</Label>
              <Input type="date" name="date" required className="w-full" />
            </div>
            <div>
              <Label htmlFor="status">Statut</Label>
              <Input type="text" name="status" required className="w-full" />
            </div>
            <div>
              <Label htmlFor="weight">Poids (kg)</Label>
              <Input type="number" name="weight" step="0.1" className="w-full" />
            </div>
            <div>
              <Label htmlFor="temperature">Température (°C)</Label>
              <Input type="number" name="temperature" step="0.1" className="w-full" />
            </div>
            <div>
              <Label htmlFor="symptoms">Symptômes</Label>
              <Input type="text" name="symptoms" className="w-full" />
            </div>
            <div>
              <Label htmlFor="diagnosis">Diagnostic</Label>
              <Input type="text" name="diagnosis" className="w-full" />
            </div>
            <div>
              <Label htmlFor="treatment">Traitement</Label>
              <Input type="text" name="treatment" className="w-full" />
            </div>
            <div>
              <Label htmlFor="medications">Médicaments</Label>
              <Input type="text" name="medications" className="w-full" />
            </div>
            <div>
              <Label htmlFor="followUpDate">Date de suivi</Label>
              <Input type="date" name="followUpDate" className="w-full" />
            </div>
          </div>
          <Button type="submit" className="w-full">Ajouter un dossier de santé</Button>
        </form>

        {/* Display health records */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Dossiers de santé récents</h3>
          <div className="space-y-4">
            {healthRecords.map((record) => (
              <Card key={record.id}>
                <CardContent className="p-4">
                  <p><strong>Animal:</strong> {record.animal.name} ({record.animal.species})</p>
                  <p><strong>Date:</strong> {new Date(record.date).toLocaleDateString()}</p>
                  <p><strong>Statut:</strong> {record.status}</p>
                  {record.weight && <p><strong>Poids:</strong> {record.weight} kg</p>}
                  {record.temperature && <p><strong>Température:</strong> {record.temperature}°C</p>}
                  {record.symptoms && <p><strong>Symptômes:</strong> {record.symptoms}</p>}
                  {record.diagnosis && <p><strong>Diagnostic:</strong> {record.diagnosis}</p>}
                  {record.treatment && <p><strong>Traitement:</strong> {record.treatment}</p>}
                  {record.medications && <p><strong>Médicaments:</strong> {record.medications}</p>}
                  {record.followUpDate && <p><strong>Date de suivi:</strong> {new Date(record.followUpDate).toLocaleDateString()}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}