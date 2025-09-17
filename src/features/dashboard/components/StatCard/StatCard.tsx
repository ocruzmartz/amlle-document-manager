import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExternalLink, type LucideIcon } from "lucide-react";
import { NavLink } from "react-router";

interface StatCardProps {
  description: string;
  icon: LucideIcon;
  value: string | number;
  quickLink?: string;
  route?: string;
  footerLink?: boolean;
}

const StatCard = ({
  description,
  icon: Icon,
  value,
  quickLink,
  route,
  footerLink,
}: StatCardProps) => {
  return (
    <NavLink to={route || "#"} className="block">
      <Card className="@container/card shadow-none hover:border-rose-300 bg-gradient-to-t from-white to-white hover:from-rose-50/50 hover:to-white gap-2 transition-all duration-300 ease-in-out">
        <CardHeader>
          <CardDescription className="flex items-center justify-between">
            {description}
            <Icon size={16} />
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {value}
          </CardTitle>
        </CardHeader>
        {footerLink && quickLink && (
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <span className="flex items-center gap-2 line-clamp-1 font-medium text-muted-foreground group-hover:text-rose-600 transition-colors duration-300 cursor-pointer">
              {quickLink}{" "}
              <ExternalLink
                size={14}
                className="group-hover:scale-110 transition-transform duration-300"
              />
            </span>
          </CardFooter>
        )}
      </Card>
    </NavLink>
  );
};

export default StatCard;
