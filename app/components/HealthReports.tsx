import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export interface HealthStatusReport {
  status: string;
  count: number;
}

export interface VaccinationReport {
  species: string;
  vaccinated: number;
  notVaccinated: number;
}

interface HealthReportsProps {
  healthStatusReport: HealthStatusReport[];
  vaccinationReport: VaccinationReport[];
}

export function HealthReports({ healthStatusReport, vaccinationReport }: HealthReportsProps) {
  const healthStatusChartData = {
    labels: healthStatusReport.map(item => item.status),
    datasets: [
      {
        label: 'Nombre d\'animaux',
        data: healthStatusReport.map(item => item.count),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const vaccinationChartData = {
    labels: vaccinationReport.map(item => item.species),
    datasets: [
      {
        label: 'Vaccinés',
        data: vaccinationReport.map(item => item.vaccinated),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Non vaccinés',
        data: vaccinationReport.map(item => item.notVaccinated),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Rapport de statut de santé</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Bar data={healthStatusChartData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rapport de vaccination</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Bar data={vaccinationChartData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
