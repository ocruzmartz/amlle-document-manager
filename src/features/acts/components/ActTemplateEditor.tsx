import { useState, useEffect } from "react"; // ✅ Agregar useState y useEffect
import { Input } from "@/components/ui/input";
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
import { type Act } from "@/types";
import { numeroALetras, capitalize } from "@/lib/textUtils"; // ✅ Usar la función existente

interface ActTemplateEditorProps {
  act: Act;
  onActChange: <K extends keyof Act>(field: K, value: Act[K]) => void;
}

// ✅ Generar opciones de hora usando la función de utilidad
const generateTimeOptions = () => {
  const times = [];

  // Horas desde las 8 AM hasta las 4 PM
  for (let hour = 8; hour <= 16; hour++) {
    // Hora exacta
    const hourText = capitalize(numeroALetras(hour));
    times.push({
      value: `${numeroALetras(hour)} horas`,
      label: `${hour}:00 ${hour >= 12 ? "PM" : "AM"} - ${hourText} horas`,
    });

    // Media hora
    times.push({
      value: `${numeroALetras(hour)} horas y treinta minutos`,
      label: `${hour}:30 ${
        hour >= 12 ? "PM" : "AM"
      } - ${hourText} horas y treinta minutos`,
    });
  }

  return times;
};

const timeOptions = generateTimeOptions();

export const ActTemplateEditor = ({
  act,
  onActChange,
}: ActTemplateEditorProps) => {
  // ✅ Estado local para el input del número
  const [actNumberInput, setActNumberInput] = useState(
    act.actNumber?.toString() || "1"
  );

  // ✅ Sincronizar con el prop cuando cambie
  useEffect(() => {
    setActNumberInput(act.actNumber?.toString() || "1");
  }, [act.actNumber]);

  // ✅ Función para actualizar el número de acta
  const handleActNumberChange = (value: string) => {
    setActNumberInput(value); // ✅ Actualizar estado local inmediatamente

    const newNumber = parseInt(value, 10);

    // ✅ Solo validar si hay un número válido
    if (!isNaN(newNumber) && newNumber >= 1) {
      const actNumberInWords = capitalize(numeroALetras(newNumber)); // ✅ Usar la función existente
      const newName = `Acta número ${actNumberInWords}`;

      // ✅ Actualizar todos los campos relacionados
      onActChange("actNumber", newNumber);
      onActChange("name", newName);
      onActChange("bodyContent", `<p><strong>${newName}</strong></p>`);
    }
  };

  // ✅ Función para manejar el cambio de fecha
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      onActChange("sessionDate", date.toISOString());
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Datos de la Sesión</h3>

        {/* Número del Acta y Tipo de Sesión */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Número del Acta
            </label>
            <Input
              type="number"
              value={actNumberInput} // ✅ Usar estado local
              onChange={(e) => handleActNumberChange(e.target.value)} // ✅ Actualizar estado local
              min={1}
              placeholder="Ingresa el número del acta"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Tipo de Sesión
            </label>
            <Select
              value={act.sessionType || "ordinaria"}
              onValueChange={(
                value: "ordinaria" | "extraordinaria" | "especial"
              ) => onActChange("sessionType", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona el tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ordinaria">Ordinaria</SelectItem>
                <SelectItem value="extraordinaria">Extraordinaria</SelectItem>
                <SelectItem value="especial">Especial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Hora y Fecha */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Hora de la Sesión
            </label>
            <Select
              value={act.sessionTime || "diez horas"}
              onValueChange={(value: string) =>
                onActChange("sessionTime", value)
              }
            >
              <SelectTrigger className="w-full">
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
                  className="data-[empty=true]:text-muted-foreground w-full justify-between text-left font-normal"
                >
                  {act.sessionDate ? (
                    format(new Date(act.sessionDate), "PPP", { locale: es })
                  ) : (
                    <span>Selecciona una fecha</span>
                  )}
                  <CalendarIcon className="mr-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={
                    act.sessionDate ? new Date(act.sessionDate) : undefined
                  }
                  onSelect={handleDateChange}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  );
};
