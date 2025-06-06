import CustomDrawer from "@/components/ui-abc/drawer/custom-drawer";
import { Items } from "@/types/drag-and-drop.model";
import { useEffect, useState } from "react";
import TemplateRightPanel from "../task-manager/template-components/template-right-panel";
import { loadTemplateTasks } from "@/services/firebase/taskManagerData";

const TestDrawerOpen = () => {
  const [templatedTask, setTemplatedTask] = useState<Items>([]); // 🔄 Додано для зберігання шаблонних завдань
  useEffect(() => {
    loadTemplateTasks()
      .then((tasks) => {
        if (tasks) {
          setTemplatedTask(tasks); // 🔄 Зберігаємо шаблонні завдання
        } else {
          setTemplatedTask([]); // 🔄 Явно вказати порожній масив для шаблонних завдань
        }
      })
      .catch((error) => {
        console.error("Error loading tasks:", error);
      });
  }, []);
  return (
    <CustomDrawer
      title="task_manager.analytics.header.title"
      description="task_manager.analytics.header.description"
    >
      <TemplateRightPanel templateTasks={templatedTask} />
    </CustomDrawer>
  );
};

export default TestDrawerOpen;
