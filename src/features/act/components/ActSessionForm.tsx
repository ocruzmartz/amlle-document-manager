import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { type Act, type ActSessionType } from "@/types";
import { formatDateToISO, parseDateSafely } from "@/lib/textUtils";
import { generateTimeOptions } from "../lib/actUtils";

interface ActSessionFormProps {
  act: Act;
  onActChange: <K extends keyof Act>(field: K, value: Act[K]) => void;
}

const timeOptions = generateTimeOptions();

export const ActSessionForm = ({ act, onActChange }: ActSessionFormProps) => {
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      onActChange("meetingDate", formatDateToISO(date));
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Tipo de Sesión
            </label>
            <Select
              value={act.sessionType || "Ordinaria"}
              onValueChange={(value: ActSessionType) =>
                onActChange("sessionType", value)
              }
            >
              <SelectTrigger className="w-full shadow-none">
                <SelectValue placeholder="Selecciona el tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ordinaria">Ordinaria</SelectItem>
                <SelectItem value="Extraordinaria">Extraordinaria</SelectItem>
                <SelectItem value="Especial">Especial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Hora de la Sesión
            </label>
            <Select
              value={act.meetingTime || "diez horas"}
              onValueChange={(value: string) =>
                onActChange("meetingTime", value)
              }
            >
              <SelectTrigger className="w-full shadow-none">
                <SelectValue placeholder="Selecciona la hora" />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((time) => (
                  <SelectItem key={time.value} value={time.value}>
                    {time.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Fecha de la Sesión
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between text-left font-normal shadow-none"
                >
                  {act.meetingDate && parseDateSafely(act.meetingDate) ? (
                    format(parseDateSafely(act.meetingDate)!, "PPP", {
                      locale: es,
                    })
                  ) : (
                    <span>Selecciona una fecha</span>
                  )}
                  <CalendarIcon className="mr-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={parseDateSafely(act.meetingDate)}
                  onSelect={handleDateChange}
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  );
};
