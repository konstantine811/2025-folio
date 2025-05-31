import { Items, ItemTask, ItemTaskCategory } from "@/types/drag-and-drop.model";

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

export function mergeItemsWithPlannedTasks(
  items: Items | null,
  plannedTasks: ItemTaskCategory[]
): Items {
  // Глибока копія items
  const result: Items = items
    ? items.map((category) => ({
        ...category,
        tasks: [...category.tasks],
      }))
    : [];

  plannedTasks.forEach((task) => {
    const categoryName = task.categoryName;

    // Пошук існуючої категорії
    let existingCategory = result.find((c) => c.title === categoryName);

    if (!existingCategory) {
      // Створення нової категорії
      existingCategory = {
        id: `cat-${Date.now()}-${Math.random()}`, // Унікальний id
        title: categoryName,
        tasks: [],
      };
      result.push(existingCategory);
    }

    // Перевірка: не додавати дубль задачі (за id)
    const exists = existingCategory.tasks.some((t) => t.id === task.id);
    if (!exists) {
      existingCategory.tasks.push({
        id: task.id,
        title: task.title,
        isDone: task.isDone,
        time: task.time,
        timeDone: task.timeDone,
        priority: task.priority,
        isPlanned: true,
      });
    }
  });

  return result;
}
