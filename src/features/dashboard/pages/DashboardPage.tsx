import { ActivityCard } from "../components/ActivityCard/ActiviyCard";
import { statCardItems } from "../components/StatCard/index";
import { recentActivities, recentBooks } from "../lib/dummyData";
import StatCard from "../components/StatCard/StatCard";
import { RecentBooksTable } from "../components/RecentBookTable";

const DashboardPage = () => {
  return (
    <div className="space-y-4 overflow-y-auto p-4">
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
       <div className="space-y-4">
        <RecentBooksTable books={recentBooks} />
        <ActivityCard logs={recentActivities} />
      </div>
    </div>
  );
};

export default DashboardPage;
