import {
  Items,
  ItemTaskCategory,
  NormalizedTask,
} from "@/types/drag-and-drop.model";
import { UniqueIdentifier } from "@dnd-kit/core";
import { denormalizeItems, normalizeItems } from "./normalize";

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

export function addNewTask(base: Items, incoming: NormalizedTask): Items {
  const baseN = normalizeItems(base);
  const finded = baseN.find((task) => task.id === incoming.id);
  if (!finded) {
    baseN.push(incoming);
  }
  return denormalizeItems(baseN);
}

export function findPlannedOrDeterminedTask(task: Items): NormalizedTask[] {
  const taskN = normalizeItems(task);
  return taskN.filter((t) => t.isPlanned || t.isDetermined);
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
        isDetermined: task.isDetermined || false, // Додати isDetermined, якщо він є
      });
    }
  });

  return result;
}
