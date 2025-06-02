import { WeekTaskEntity } from "@/types/analytics/task-analytics.model";
import { Items } from "@/types/drag-and-drop.model";

export const countTimeOfWeed = (tasks: Items): WeekTaskEntity => {
  const weekTaskEntity: WeekTaskEntity = {};

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
        if (task.isDetermined) {
          weekTaskEntity[day].totalTime = +task.timeDone;
        } else {
          weekTaskEntity[day].totalTime += task.time;
        }
        if (!weekTaskEntity[day].categories.includes(category.title)) {
          weekTaskEntity[day].categories.push(category.title);
        }
        weekTaskEntity[day].tasks.push(task);
      });
    });
  });

  return weekTaskEntity;
};
