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

  tasks.forEach((category) => {
    if (!categoryEntity[category.title]) {
      categoryEntity[category.title] = {
        time: 0,
        countDone: 0,
        countDoneTime: 0,
        taskDone: [],
        taskNoDone: [],
      };
    }
    category.tasks.forEach((task) => {
      const timeDo =
        task.isDetermined || task.isPlanned || task.isDone
          ? task.timeDone
          : task.time;
      const timeCategory =
        task.isDetermined || task.isPlanned
          ? task.timeDone
          : task.time > task.timeDone
          ? task.time
          : task.timeDone;
      if (task.isDone) {
        categoryEntity[category.title].countDone += 1;
        categoryEntity[category.title].countDoneTime += task.timeDone;
        categoryEntity[category.title].taskDone.push(task.title);
      } else {
        categoryEntity[category.title].taskNoDone.push(task.title);
        categoryEntity[category.title].countDoneTime += task.timeDone;
      }
      categoryEntity[category.title].time += timeCategory;
      dailyEntity[task.id] = {
        title: task.title,
        time: timeDo,
        timeDone: task.timeDone,
        category: category.title,
        isDone: task.timeDone > 0 || task.isDone,
        priority: task.priority,
      };
    });
  });
  return { dailyEntity, categoryEntity };
};
