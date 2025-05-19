import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Task {
  id: number;
  title: string;
  categoryId?: number;
}

interface Category {
  id: number;
  title: string;
}

const initialCategories: Category[] = [
  { id: 1, title: "🌄 Ранок" },
  { id: 2, title: "🧘‍♂️ Саморозвиток" },
];

const initialTasks: Task[] = [
  { id: 1, title: "🧠 Почати день з медитації", categoryId: 1 },
  { id: 2, title: "🏃‍♂️ Пробіжка до річки", categoryId: 1 },
  { id: 3, title: "📖 Прочитати 10 сторінок", categoryId: 2 },
  { id: 4, title: "💻 Написати код" },
  { id: 5, title: "🍲 Приготувати обід" },
];

export const TasksWithCategories: React.FC = () => {
  const [categories, setCategories] = useState(initialCategories);
  const [tasks, setTasks] = useState(initialTasks);
  const [draggedCategoryId, setDraggedCategoryId] = useState<number | null>(
    null
  );

  const handleDragStart = (e: React.DragEvent, taskId: number) => {
    e.dataTransfer.setData("taskId", taskId.toString());
  };

  const handleDrop = (e: React.DragEvent, newCategoryId?: number) => {
    e.stopPropagation();
    const taskId = Number(e.dataTransfer.getData("taskId"));
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, categoryId: newCategoryId } : task
      )
    );
  };

  const allowDrop = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleCategoryDragStart = (categoryId: number) => {
    setDraggedCategoryId(categoryId);
  };

  const handleCategoryDrop = (targetCategoryId: number) => {
    if (draggedCategoryId === null || draggedCategoryId === targetCategoryId)
      return;

    const oldIndex = categories.findIndex((c) => c.id === draggedCategoryId);
    const newIndex = categories.findIndex((c) => c.id === targetCategoryId);

    const reordered = [...categories];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    setCategories(reordered);
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 space-y-6">
      <h2 className="text-3xl font-bold text-center mb-6">🗂️ Мої задачі</h2>

      <AnimatePresence>
        {categories.map((category) => {
          const categoryTasks = tasks.filter(
            (t) => t.categoryId === category.id
          );
          return (
            <motion.div
              layout
              key={category.id}
              onDragOver={allowDrop}
              onDrop={() => handleCategoryDrop(category.id)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 border rounded-lg shadow bg-background"
            >
              <h3
                draggable
                onDragStart={() => handleCategoryDragStart(category.id)}
                className="text-xl font-semibold mb-3 text-primary cursor-move"
              >
                {category.title}
              </h3>
              <motion.div
                layout
                onDragOver={allowDrop}
                onDrop={(e) => handleDrop(e, category.id)}
                className="space-y-2 min-h-[40px]"
              >
                <AnimatePresence>
                  {categoryTasks.length > 0 ? (
                    categoryTasks.map((task) => (
                      <motion.div
                        layout
                        key={task.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                      >
                        <div
                          className="bg-card px-4 py-2 rounded shadow cursor-grab active:cursor-grabbing text-foreground hover:bg-accent transition-colors"
                          draggable
                          onDragStart={(e) =>
                            handleDragStart(
                              e as React.DragEvent<HTMLDivElement>,
                              task.id
                            )
                          }
                        >
                          {task.title}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground italic">
                      Перетягніть сюди задачу
                    </div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      <motion.div
        layout
        onDragOver={allowDrop}
        onDrop={(e) => handleDrop(e, undefined)}
        className="border-t pt-6"
      >
        <h3 className="text-lg font-semibold mb-2">Задачі без категорії</h3>
        <motion.div layout className="space-y-2 min-h-[40px]">
          <AnimatePresence>
            {tasks
              .filter((t) => !t.categoryId)
              .map((task) => (
                <motion.div
                  layout
                  key={task.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <div
                    className="bg-card px-4 py-2 rounded shadow cursor-grab active:cursor-grabbing text-foreground hover:bg-accent transition-colors"
                    draggable
                    onDragStart={(e) =>
                      handleDragStart(
                        e as React.DragEvent<HTMLDivElement>,
                        task.id
                      )
                    }
                  >
                    {task.title}
                  </div>
                </motion.div>
              ))}
            {tasks.filter((t) => !t.categoryId).length === 0 && (
              <div className="text-sm text-muted-foreground italic">
                Сюди можна перетягувати задачі
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
};
