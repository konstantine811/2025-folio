import { DayNumber, Items } from "@/types/drag-and-drop.model";

export const filterTaskByDayOfWeedk = (
  tasks: Items | null | undefined,
  dayOfWeek: DayNumber
): Items => {
  if (!tasks || tasks.length === 0) {
    return [];
  }

  return tasks
    .map((category) => {
      const filteredTasks = category.tasks.filter((task) =>
        task.whenDo?.includes(dayOfWeek)
      );

      return {
        ...category,
        tasks: filteredTasks,
      };
    })
    .filter((category) => category.tasks.length > 0);
};
