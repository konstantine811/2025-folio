import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Об'єднує tailwind класи з урахуванням умов і пріоритетів.
 * Приклад:
 *   cn("p-2", condition && "bg-red-500", "text-white")
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}
