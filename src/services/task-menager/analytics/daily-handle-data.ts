import { TaskAnalyticsIdEntity } from "@/types/analytics/task-analytics.model";
import { Items } from "@/types/drag-and-drop.model";

export const getDailyTaskAnalyticsData = (tasks: Items) => {
  const dailyEntity: TaskAnalyticsIdEntity = {};

  tasks.forEach((category) => {
    category.tasks.forEach((task) => {
      const timeDo =
        task.isDetermined || task.isPlanned || task.isDone
          ? task.timeDone
          : task.time;
      dailyEntity[task.id] = {
        title: task.title,
        time: timeDo,
        category: category.title,
        isDone: task.isDone,
        priority: task.priority,
      };
    });
  });
  return { dailyEntity };
};
