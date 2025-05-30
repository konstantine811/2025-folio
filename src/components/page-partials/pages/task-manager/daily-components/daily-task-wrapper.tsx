import { useCallback, useEffect, useRef, useState } from "react";
import DailyAddTask from "./daily-add-task";
import {
  loadTemplateTasks,
  saveDailyTasks,
  loadDailyTasksByDate,
} from "@/services/firebase/taskManagerData";
import { Items } from "@/types/drag-and-drop.model";
import { MultipleContainers } from "@/components/dnd/multiple-container";
import { rectSortingStrategy } from "@dnd-kit/sortable";
import DailyAddTemplateButton from "./daily-add-template-button";
import { mergeItems } from "@/utils/task-manager-utils/merge-tasks";
import Preloader from "@/components/page-partials/preloader/preloader";
import { TaskManagerProvider } from "@/components/dnd/context/task-manager-context";
import { useParams } from "react-router";
import { parseDate } from "@/utils/date.util";

const DailyTaskWrapper = () => {
  const [dailyTasks, setDailyTasks] = useState<Items>([]);
  const [changedTasks, setChangedTasks] = useState<Items>([]);
  const { id: date } = useParams(); // ← id це твоя дата у форматі "dd.MM.yyyy"
  const currentDateRef = useRef(date);
  const [templatedTasks, setTemplatedTasks] = useState<Items>([]);
  const [isFuture, setIsFuture] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSelectedOption, setIsSelectedOption] = useState(false);
  useEffect(() => {
    // 💡 Очищення попередніх даних при зміні дати
    setIsLoaded(false);
    setDailyTasks([]);
    setChangedTasks([]);
    currentDateRef.current = date;
    if (!date) return;
    setIsSelectedOption(false);
    const parsedDate = parseDate(date);
    setIsFuture(parsedDate > new Date()); // 🔄 Перевірка на майбутню дату
    loadDailyTasksByDate(date).then((tasks) => {
      if (tasks && tasks.length) {
        setIsSelectedOption(true);
        setDailyTasks(tasks);
      } else {
        setIsSelectedOption(false);
        setDailyTasks([]); // 🔄 Явно вказати порожній масив
      }
      setIsLoaded(true);
    });
  }, [date]);
  useEffect(() => {
    setIsLoaded(false);
    loadTemplateTasks()
      .then((tasks) => {
        if (tasks) {
          setTemplatedTasks(tasks);
        } else {
          setTemplatedTasks([]); // 🔄 Явно вказати порожній масив
        }
        setIsLoaded(true);
      })
      .catch((error) => {
        console.error("Error loading tasks:", error);
        setIsLoaded(true);
      });
  }, []);

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
      {!isFuture && (
        <>
          {!isLoaded && <Preloader />}
          {isLoaded && isSelectedOption && (
            <TaskManagerProvider>
              <MultipleContainers
                strategy={rectSortingStrategy}
                vertical
                trashable
                templated={false}
                items={dailyTasks}
                onChangeTasks={(tasks) => {
                  if (!isLoaded) return; // 💡 Не викликати збереження під час завантаження
                  saveDailyTasks(tasks, currentDateRef.current || "");
                  setChangedTasks(tasks);
                }}
              />
            </TaskManagerProvider>
          )}
          {!isSelectedOption && isLoaded && !dailyTasks.length && (
            <DailyAddTask
              onCreateTask={(isTemplate) => {
                setDailyTasks(isTemplate ? templatedTasks : []);
                setIsSelectedOption(true);
              }}
            />
          )}
          {isSelectedOption && isLoaded && (
            <DailyAddTemplateButton onClick={handleMerageTasks} />
          )}
        </>
      )}
    </>
  );
};

export default DailyTaskWrapper;
