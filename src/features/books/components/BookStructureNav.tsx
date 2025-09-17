import { type Act } from "@/types";
import { type WorkspaceView } from "@/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Dot, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookStructureNavProps {
  acts: Act[]; // <-- Usa el tipo 'Act' y la prop 'acts'
  currentView: WorkspaceView;
  onViewChange: (view: WorkspaceView) => void;
}

export const BookStructureNav = ({
  acts,
  currentView,
  onViewChange,
}: BookStructureNavProps) => {
  return (
    <div className="flex flex-col h-full">
      <div
        onClick={() => onViewChange({ type: "cover" })}
        className={cn(
          "flex items-center gap-2 text-sm font-semibold p-2 rounded-md cursor-pointer mb-2",
          currentView.type === "cover"
            ? "bg-muted text-primary"
            : "text-muted-foreground hover:text-primary"
        )}
      >
        <Home className="h-4 w-4" />
        <span>Portada del Libro</span>
      </div>

      <hr className="my-2" />

      <Accordion
        type="multiple"
        className="w-full"
        defaultValue={acts.map((act) => act.id)}
      >
        {acts.map((act) => (
          <AccordionItem value={act.id} key={act.id} className="border-none">
            <AccordionTrigger
              onClick={() => onViewChange({ type: "acta", data: act })}
              className={cn(
                "font-semibold text-left hover:no-underline p-2 rounded-md hover:bg-muted/50 text-sm"
              )}
            >
              {act.name}
            </AccordionTrigger>
            <AccordionContent>
              <ul className="pl-6 space-y-1 py-2">
                {act.agreements.map((agreement) => (
                  <li
                    key={agreement.id}
                    onClick={() =>
                      onViewChange({
                        type: "agreement-editor",
                        data: agreement,
                      })
                    }
                  >
                    <div
                      className={cn(
                        "flex items-center gap-2 text-sm text-muted-foreground hover:text-primary cursor-pointer p-2 rounded-md"
                      )}
                    >
                      <Dot className="h-4 w-4 flex-shrink-0" />
                      <span>{agreement.title}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
