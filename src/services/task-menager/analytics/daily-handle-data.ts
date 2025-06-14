import {
  CategoryAnalyticsNameEntity,
  DailyAnalyticsData,
  DailyTaskAnalytics,
  TaskAnalyticsIdEntity,
} from "@/types/analytics/task-analytics.model";
import { Items } from "@/types/drag-and-drop.model";

export const getDailyTaskAnalyticsData = (tasks: Items): DailyTaskAnalytics => {
  const dailyEntity: TaskAnalyticsIdEntity = {};
  const categoryEntity: CategoryAnalyticsNameEntity = {};
  const dailyAnalytics: DailyAnalyticsData = {
    countDoneTime: 0,
    countTime: 0,
    countDoneTask: 0,
    countAllTask: 0,
  };

  tasks.forEach(({ title: categoryTitle, tasks: taskList }) => {
    const categoryStats = categoryEntity[categoryTitle] ?? {
      time: 0,
      countDone: 0,
      countDoneTime: 0,
      taskDone: [],
      taskNoDone: [],
    };

    taskList.forEach((task) => {
      const {
        id,
        title,
        isDone,
        isDetermined,
        isPlanned,
        time,
        timeDone,
        priority,
      } = task;

      const timeDo = isDetermined || isPlanned || isDone ? timeDone : time;
      const timeDoneCategory =
        (isDetermined || isPlanned) && !isDone ? 0 : timeDone;
      dailyAnalytics.countTime += timeDo;
      dailyAnalytics.countAllTask += 1;
      dailyAnalytics.countDoneTime += timeDoneCategory;
      dailyAnalytics.countDoneTask += isDone ? 1 : 0;

      // Оновлення статистики категорії
      categoryStats.time += timeDo;
      categoryStats.countDoneTime += timeDoneCategory;

      if (isDone) {
        categoryStats.countDone += 1;
        categoryStats.taskDone.push(title);
      } else {
        categoryStats.taskNoDone.push(title);
      }

      // Оновлення статистики по задачі
      dailyEntity[id] = {
        title,
        time: timeDo,
        timeDone,
        category: categoryTitle,
        isDone,
        priority,
      };
    });

    categoryEntity[categoryTitle] = categoryStats;
  });

  return { dailyEntity, categoryEntity, dailyAnalytics };
};
