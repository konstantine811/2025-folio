import {
  CategoryCountTime,
  FlattenedTask,
  TaskAnalytics,
  TypeAnalyticsPeriod,
  WeekTaskEntity,
} from "@/types/analytics/task-analytics.model";
import { Items, ItemTask } from "@/types/drag-and-drop.model";

export const getTaskAnalyticsData = (tasks: Items): TaskAnalytics => {
  const weekTaskEntity: WeekTaskEntity = {};
  const flattenTasks: FlattenedTask[] = [];

  tasks.forEach((category) => {
    category.tasks.forEach((task) => {
      task.whenDo.forEach((day) => {
        if (!weekTaskEntity[day]) {
          weekTaskEntity[day] = {
            totalTime: 0,
            categories: [],
            tasks: [],
          };
        }
        const timeToAdd = task.isDetermined ? task.timeDone : task.time;
        weekTaskEntity[day].totalTime += timeToAdd;
        if (!weekTaskEntity[day].categories.includes(category.title)) {
          weekTaskEntity[day].categories.push(category.title);
        }
        weekTaskEntity[day].tasks.push(task);

        flattenTasks.push({
          day,
          title: task.title,
          duration: timeToAdd,
        });
      });
    });
  });
  return { weekTaskEntity, flattenTasks };
};

export const getCategoryTimeCountByPeriod = (
  tasks: Items,
  analyticsPerid: TypeAnalyticsPeriod = "by_all_week"
): CategoryCountTime => {
  const categoryCountTime: CategoryCountTime = {};

  tasks.forEach((category) => {
    category.tasks.forEach((task) => {
      const timeToAdd = task.isDetermined ? task.timeDone : task.time;
      switchCategoryTimeCountByPeriod(
        categoryCountTime,
        category.title,
        analyticsPerid,
        task,
        timeToAdd
      );
    });
  });
  return categoryCountTime;
};

function switchCategoryTimeCountByPeriod(
  categoryCountTime: CategoryCountTime,
  categoryName: string,
  period: TypeAnalyticsPeriod,
  task: ItemTask,
  timeToAdd: number
) {
  if (!categoryCountTime[categoryName]) {
    categoryCountTime[categoryName] = 0;
  }
  if (period === "all") {
    categoryCountTime[categoryName] += timeToAdd;
  } else if (period === "by_all_week") {
    if (task.whenDo.length > 0) {
      categoryCountTime[categoryName] += timeToAdd;
    }
  } else if (task.whenDo.includes(period)) {
    categoryCountTime[categoryName] += timeToAdd;
  }
}
