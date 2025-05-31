import { Items, ItemTask, ItemTaskCategory } from "@/types/drag-and-drop.model";
import { UniqueIdentifier } from "@dnd-kit/core";

// Мердж задач по ID
export function mergeItemsDeep(base: Items, incoming: Items): Items {
  const flatTaskMap = new Map<
    string,
    { task: ItemTask; categoryId: string; categoryTitle: string }
  >();
  const categoryMap = new Map<
    UniqueIdentifier,
    { id: UniqueIdentifier; title: string }
  >();

  // Додаємо базові категорії й задачі
  for (const category of base) {
    categoryMap.set(category.id, { id: category.id, title: category.title });

    for (const task of category.tasks) {
      flatTaskMap.set(task.id.toString(), {
        task: { ...task },
        categoryId: category.id.toString(),
        categoryTitle: category.title,
      });
    }
  }

  // Додаємо або оновлюємо задачі з incoming
  for (const category of incoming) {
    if (!categoryMap.has(category.id)) {
      categoryMap.set(category.id, { id: category.id, title: category.title });
    }

    for (const task of category.tasks) {
      const taskId = task.id.toString();
      if (flatTaskMap.has(taskId)) {
        const existing = flatTaskMap.get(taskId)!;
        flatTaskMap.set(taskId, {
          ...existing,
          task: { ...existing.task, ...task }, // merge fields
        });
      } else {
        flatTaskMap.set(taskId, {
          task: { ...task },
          categoryId: category.id.toString(),
          categoryTitle: category.title,
        });
      }
    }
  }

  // Відновлюємо структуру Items
  const mergedMap: Map<string, ItemTask[]> = new Map();

  for (const { task, categoryId } of flatTaskMap.values()) {
    if (!mergedMap.has(categoryId)) {
      mergedMap.set(categoryId, []);
    }
    mergedMap.get(categoryId)!.push(task);
  }

  const mergedItems: Items = [];

  for (const [categoryId, tasks] of mergedMap.entries()) {
    const categoryInfo = categoryMap.get(categoryId)!;
    mergedItems.push({
      id: categoryInfo.id,
      title: categoryInfo.title,
      tasks,
    });
  }

  return mergedItems;
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
