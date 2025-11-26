import { type Act } from "@/types";
import { type WorkspaceView } from "@/features/book/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Home, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { capitalize, numberToWords } from "@/lib/textUtils";

interface BookSidebarNavProps {
  acts: Act[];
  currentView: WorkspaceView;
  onViewChange: (view: WorkspaceView) => void;
}

export const BookSidebarNav = ({
  acts,
  currentView,
  onViewChange,
}: BookSidebarNavProps) => {
  const handleCoverClick = () => {
    onViewChange({
      main: { type: "cover" },
      detail: { type: "none" },
      activeActId: null,
      activeAgreementId: null,
    });
  };

  const handleActClick = (actId: string) => {
    onViewChange({
      main: { type: "act-edit", actId: actId },
      detail: { type: "agreement-list" },
      activeActId: actId,
      activeAgreementId: null,
    });
  };

  const handleAgreementClick = (actId: string, agreementId: string) => {
    onViewChange({
      main: { type: "act-edit", actId: actId },
      detail: { type: "agreement-editor", agreementId: agreementId },
      activeActId: actId,
      activeAgreementId: agreementId,
    });
  };

  const handleSettingsClick = () => {
    onViewChange({
      main: { type: "pdf-settings" },
      detail: { type: "none" },
      activeActId: null,
      activeAgreementId: null,
    });
  };

  return (
    <div className="flex flex-col h-full p-2 justify-between">
      <div>
        <div
          onClick={handleCoverClick}
          className={cn(
            "flex items-center gap-2 text-sm font-semibold p-2 rounded-md cursor-pointer ",
            currentView.main.type === "cover"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted/50"
          )}
        >
          <Home className="h-4 w-4" />
          <span>Inicio del Libro</span>
        </div>

        <hr className="my-2" />

        <h4 className="text-xs font-bold uppercase text-muted-foreground px-2 mb-2">
          Actas
        </h4>

        <Accordion type="multiple" className="w-full" defaultValue={[]}>
          {acts.length === 0 && (
            <p className="mt-5 text-gray-400 text-center text-sm">
              Aun no hay actas en este libro.
            </p>
          )}
          {acts.map((act) => {
            const isActActive = currentView.activeActId === act.id;
            return (
              <AccordionItem
                value={act.id}
                key={act.id}
                className="border-none"
              >
                <AccordionTrigger
                  onClick={() => handleActClick(act.id)}
                  className={cn(
                    "font-semibold text-left hover:no-underline p-2 rounded-md hover:bg-muted/50 text-sm",
                    isActActive && "bg-muted"
                  )}
                >
                  {act.name}
                </AccordionTrigger>
                <AccordionContent className="pb-0">
                  <ul className="pl-4 py-2">
                    {act.agreements.map((agreement, index) => {
                      const isAgreementActive =
                        isActActive &&
                        currentView.detail.type === "agreement-editor" &&
                        currentView.detail.agreementId === agreement.id;
                      return (
                        <li
                          key={agreement.id}
                          onClick={() =>
                            handleAgreementClick(act.id, agreement.id)
                          }
                        >
                          <div
                            className={cn(
                              "flex items-center text-sm text-muted-foreground hover:text-primary cursor-pointer p-2 rounded-md",
                              isAgreementActive && "bg-primary/10 text-primary"
                            )}
                          >
                            <span>
                              Acuerdo número{" "}
                              {capitalize(numberToWords(index + 1))}
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
      <div>
        <hr className="my-2" />
        <div
          onClick={handleSettingsClick}
          className={cn(
            "flex items-center gap-2 text-sm font-semibold p-2 rounded-md cursor-pointer",
            currentView.main.type === "pdf-settings"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted/50"
          )}
        >
          <Settings className="h-4 w-4" />
          <span>Configuración</span>
        </div>
      </div>
    </div>
  );
};
