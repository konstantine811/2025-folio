import {
  CategoryAnalyticsNameEntity,
  TaskAnalyticsIdEntity,
} from "@/types/analytics/task-analytics.model";
import { Items } from "@/types/drag-and-drop.model";

export const getDailyTaskAnalyticsData = (
  tasks: Items
): {
  dailyEntity: TaskAnalyticsIdEntity;
  categoryEntity: CategoryAnalyticsNameEntity;
} => {
  const dailyEntity: TaskAnalyticsIdEntity = {};
  const categoryEntity: CategoryAnalyticsNameEntity = {};

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
      const timeCategory =
        isDetermined || isPlanned
          ? timeDone
          : time > timeDone
          ? time
          : timeDone;

      // Реальна тривалість для підрахунку виконаного часу
      const realDoneTime = time > timeDone && isDone ? time : timeDone;

      // Оновлення статистики категорії
      categoryStats.time += timeCategory;
      categoryStats.countDoneTime += realDoneTime;

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

  return { dailyEntity, categoryEntity };
};
