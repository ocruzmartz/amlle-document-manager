import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const reorderArray = <T extends { id: string }>(
  list: T[],
  itemId: string,
  direction: "up" | "down"
): T[] => {
  const index = list.findIndex((item) => item.id === itemId);
  if (index === -1) return list;

  const newIndex = direction === "up" ? index - 1 : index + 1;
  if (newIndex < 0 || newIndex >= list.length) return list;

  const result = Array.from(list);
  const [removed] = result.splice(index, 1);
  result.splice(newIndex, 0, removed);

  return result;
};
