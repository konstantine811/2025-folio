import { useCallback, useEffect, useRef, useState } from "react";
import {
  loadTemplateTasks,
  saveDailyTasks,
  loadDailyTasksByDate,
} from "@/services/firebase/taskManagerData";
import { Items } from "@/types/drag-and-drop.model";
import { MultipleContainers } from "@/components/dnd/multiple-container";
import { rectSortingStrategy } from "@dnd-kit/sortable";
import DailyAddTemplateButton from "./daily-add-button";
import { mergeItems } from "@/utils/task-manager-utils/merge-tasks";
import Preloader from "@/components/page-partials/preloader/preloader";
import { TaskManagerProvider } from "@/components/dnd/context/task-manager-context";
import { useParams } from "react-router";
import { parseDate } from "@/utils/date.util";
import AddFutureTask from "../future-task-components/add-future-task";
import { FirebaseCollection } from "@/config/firebase.config";

const DailyTaskWrapper = () => {
  const [dailyTasks, setDailyTasks] = useState<Items>([]);
  const [changedTasks, setChangedTasks] = useState<Items>([]);
  const { id: date } = useParams(); // ← id це твоя дата у форматі "dd.MM.yyyy"
  const currentDateRef = useRef(date);
  const [isFuture, setIsFuture] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    // 💡 Очищення попередніх даних при зміні дати
    setIsLoaded(false);
    setDailyTasks([]);
    setChangedTasks([]);
    currentDateRef.current = date;
    if (!date) return;
    const parsedDate = parseDate(date);
    setIsFuture(parsedDate > new Date()); // 🔄 Перевірка на майбутню дату
    loadDailyTasksByDate<Items>(date, FirebaseCollection.dailyTasks).then(
      (tasks) => {
        if (tasks && tasks.length) {
          setDailyTasks(tasks);
        } else {
          setDailyTasks([]); // 🔄 Явно вказати порожній масив
        }
        setIsLoaded(true);
      }
    );
  }, [date]);

  const handleMerageTasks = useCallback(() => {
    setIsLoaded(false);
    loadTemplateTasks().then((tasks) => {
      if (tasks && tasks.length) {
        setDailyTasks(mergeItems(changedTasks, tasks));
      }
      setIsLoaded(true);
    });
  }, [changedTasks]);
  return (
    <>
      {!isFuture ? (
        <>
          {!isLoaded && <Preloader />}
          {isLoaded && (
            <TaskManagerProvider>
              <MultipleContainers
                strategy={rectSortingStrategy}
                vertical
                trashable
                templated={false}
                items={dailyTasks}
                onChangeTasks={(tasks) => {
                  if (!isLoaded) return; // 💡 Не викликати збереження під час завантаження
                  saveDailyTasks<Items>(
                    tasks,
                    currentDateRef.current || "",
                    FirebaseCollection.dailyTasks
                  );
                  setChangedTasks(tasks);
                }}
              />
            </TaskManagerProvider>
          )}
          {isLoaded && (
            <DailyAddTemplateButton
              title={"task_manager.add_template_task"}
              onClick={handleMerageTasks}
            />
          )}
        </>
      ) : (
        <AddFutureTask date={date} />
      )}
    </>
  );
};

export default DailyTaskWrapper;
