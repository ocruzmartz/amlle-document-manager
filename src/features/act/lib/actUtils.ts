import { type Act } from "@/types";
import { numberToWords, capitalize } from "@/lib/textUtils";

export const generateTimeOptions = () => {
  const times = [];
  for (let hour = 8; hour <= 16; hour++) {
    const hourText = capitalize(numberToWords(hour));
    times.push({
      value: `${numberToWords(hour)} horas`,
      label: `${hour}:00 ${hour >= 12 ? "PM" : "AM"} - ${hourText} horas`,
    });
    times.push({
      value: `${numberToWords(hour)} horas y treinta minutos`,
      label: `${hour}:30 ${
        hour >= 12 ? "PM" : "AM"
      } - ${hourText} horas y treinta minutos`,
    });
  }
  return times;
};

export const getTotalAttendees = (attendees: Act["attendees"]) => {
  if (!attendees) return 0;
  const ownerCount = attendees.owners?.length || 0;
  const syndicCount = attendees.syndic ? 1 : 0;
  const secretaryCount = attendees.secretary ? 1 : 0;
  return ownerCount + syndicCount + secretaryCount;
};
