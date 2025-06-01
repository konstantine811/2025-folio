import {
  Items,
  ItemTask,
  ItemTaskCategory,
  NormalizedTask,
} from "@/types/drag-and-drop.model";
import { UniqueIdentifier } from "@dnd-kit/core";

// Мердж задач по ID
export function mergeItemsDeep(base: Items, incoming: Items): Items {
  const baseN = normalizeItems(base);
  const baseNIds = new Set(baseN.map((task) => task.id));
  const incomingN = normalizeItems(incoming);

  incomingN.forEach((incomingTask) => {
    if (!baseNIds.has(incomingTask.id)) {
      // Якщо задача з incoming не існує в base, додаємо її
      baseN.push(incomingTask);
    }
  });

  return denormalizeItems(baseN);
}

export function normalizeItems(items: Items): NormalizedTask[] {
  const result: NormalizedTask[] = [];

  for (const category of items) {
    for (const task of category.tasks) {
      result.push({
        ...task,
        categoryId: category.id.toString(),
        categoryTitle: category.title,
      });
    }
  }

  return result;
}

export function denormalizeItems(normalizedTasks: NormalizedTask[]): Items {
  const map = new Map<
    string,
    { id: string; title: string; tasks: ItemTask[] }
  >();

  for (const task of normalizedTasks) {
    if (!map.has(task.categoryId)) {
      map.set(task.categoryId, {
        id: task.categoryId,
        title: task.categoryTitle,
        tasks: [],
      });
    }

    const { tasks } = map.get(task.categoryId)!;

    tasks.push({
      id: task.id,
      title: task.title,
      isDone: task.isDone,
      time: task.time,
      timeDone: task.timeDone,
      priority: task.priority,
      isPlanned: task.isPlanned,
      whenDo: task.whenDo,
      isDetermined: task.isDetermined,
    });
  }

  return Array.from(map.values());
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
        id: task.id as UniqueIdentifier,
        title: task.title,
        isDone: task.isDone,
        time: task.time,
        timeDone: task.timeDone,
        priority: task.priority,
        isPlanned: true,
        whenDo: task.whenDo || [], // Додати whenDo, якщо він є
      });
    }
  });

  return result;
}
