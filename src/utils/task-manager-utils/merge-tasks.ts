import { Items, ItemTask } from "@/types/drag-and-drop.model";

export function mergeItems(base: Items, incoming: Items): Items {
  const baseMap = new Map(
    base.map((cat) => [cat.id, { ...cat, tasks: [...cat.tasks] }])
  );

  for (const incCat of incoming) {
    if (baseMap.has(incCat.id)) {
      const baseCat = baseMap.get(incCat.id)!;

      const existingTaskIds = new Set(baseCat.tasks.map((task) => task.id));

      const mergedTasks: ItemTask[] = [
        ...baseCat.tasks,
        ...incCat.tasks.filter((task) => !existingTaskIds.has(task.id)), // додаємо нові
      ];

      baseMap.set(incCat.id, {
        ...baseCat,
        tasks: mergedTasks,
      });
    } else {
      // нова категорія повністю
      baseMap.set(incCat.id, {
        ...incCat,
        tasks: [...incCat.tasks],
      });
    }
  }

  return Array.from(baseMap.values());
}
