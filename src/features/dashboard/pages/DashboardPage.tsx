import { statCardItems } from "../components/StatCard/index";
import { recentActivities, recentBooks } from "../lib/dummyData";
import StatCard from "../components/StatCard/StatCard";
import { RecentBooksTable } from "../components/RecentBookTable";
import { ActivityCard } from "../components/ActivityCard/ActiviyCard";

const DashboardPage = () => {
  return (
    <div className="space-y-6 overflow-y-auto p-4 lg:p-6">
      {/* 1. Saludo */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Un resumen rápido de la actividad del sistema.
        </p>
      </div>

      {/* 2. Tarjetas de Estadísticas (sin cambios) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 ">
        {statCardItems.map((item) => (
          <StatCard
            key={item.id}
            description={item.description}
            value={item.value}
            icon={item.icon}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <RecentBooksTable books={recentBooks} />
        <ActivityCard logs={recentActivities} />
      </div>
    </div>
  );
};

export default DashboardPage;
