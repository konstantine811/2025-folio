import {
  CategoryAnalyticsNameEntity,
  DailyAnalyticsData,
  TaskAnalyticsIdEntity,
} from "@/types/analytics/task-analytics.model";
import { Items } from "@/types/drag-and-drop.model";

export const getDailyTaskAnalyticsData = (
  tasks: Items
): {
  dailyEntity: TaskAnalyticsIdEntity;
  categoryEntity: CategoryAnalyticsNameEntity;
  dailyAnaltyics: DailyAnalyticsData;
} => {
  const dailyEntity: TaskAnalyticsIdEntity = {};
  const categoryEntity: CategoryAnalyticsNameEntity = {};
  const dailyAnaltyics: DailyAnalyticsData = {
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
      const countTimeDo = isDetermined || isPlanned ? timeDone : time;
      dailyAnaltyics.countTime += countTimeDo;
      dailyAnaltyics.countAllTask += 1;
      dailyAnaltyics.countDoneTime += task.timeDone;
      dailyAnaltyics.countDoneTask += isDone ? 1 : 0;

      // Оновлення статистики категорії
      categoryStats.time += timeDo;
      categoryStats.countDoneTime += timeDone;

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

  return { dailyEntity, categoryEntity, dailyAnaltyics };
};
