import {
  DayNumber,
  Items,
  ItemTaskCategory,
} from "@/types/drag-and-drop.model";

export const filterTaskByDayOfWeedk = (
  tasks: Items | null | undefined,
  dayOfWeek: DayNumber
): { filteredTasks: Items; plannedTasks: ItemTaskCategory[] } => {
  if (!tasks || tasks.length === 0) {
    return { filteredTasks: [], plannedTasks: [] };
  }
  const taskItemsCategories: ItemTaskCategory[] = [];
  const filteredTasks = tasks
    .map((category) => {
      const filteredTasks = category.tasks.filter((task) => {
        if (task.whenDo?.includes(dayOfWeek)) {
          if (task.isDetermined) {
            taskItemsCategories.push({
              ...task,
              categoryName: category.title,
            });
          }
          return true;
        }
      });

      return {
        ...category,
        tasks: filteredTasks,
      };
    })
    .filter((category) => category.tasks.length > 0);
  return { filteredTasks, plannedTasks: taskItemsCategories };
};
