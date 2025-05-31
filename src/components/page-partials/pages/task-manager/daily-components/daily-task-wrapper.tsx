import { useCallback, useEffect, useRef, useState } from "react";
import {
  loadTemplateTasks,
  saveDailyTasks,
  loadDailyTasksByDate,
} from "@/services/firebase/taskManagerData";
import { DayNumber, Items, ItemTask } from "@/types/drag-and-drop.model";
import { MultipleContainers } from "@/components/dnd/multiple-container";
import { rectSortingStrategy } from "@dnd-kit/sortable";
import DailyAddTemplateButton from "./daily-add-button";
import {
  mergeItemsDeep,
  mergeItemsWithPlannedTasks,
} from "@/utils/task-manager-utils/merge-tasks";
import Preloader from "@/components/page-partials/preloader/preloader";
import { TaskManagerProvider } from "@/components/dnd/context/task-manager-context";
import { useParams } from "react-router";
import { parseDate } from "@/utils/date.util";
import AddFutureTask from "../future-task-components/add-future-task";
import { FirebaseCollection } from "@/config/firebase.config";
import { useDailyTaskContext } from "../hooks/useDailyTask";
import { getISODay } from "date-fns";
import { filterTaskByDayOfWeedk } from "@/utils/task-manager-utils/filter-tasks";

const DailyTaskWrapper = () => {
  const [dailyTasks, setDailyTasks] = useState<Items>([]);
  const [changedTasks, setChangedTasks] = useState<Items>([]);
  const { id: date } = useParams(); // ← id це твоя дата у форматі "dd.MM.yyyy"
  const currentDateRef = useRef(date);
  const [isFuture, setIsFuture] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const { plannedTasks, updatePlannedTask, deletePlannedTask } =
    useDailyTaskContext();
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
    if (!plannedTasks) return;
    setIsLoaded(false);
    loadTemplateTasks().then((tasks) => {
      const currentDayOfWeek = getISODay(parseDate(date ?? "")) as DayNumber;
      const filteredDayOfWeekTasks = filterTaskByDayOfWeedk(
        tasks,
        currentDayOfWeek
      );
      const merged = mergeItemsWithPlannedTasks(
        filteredDayOfWeekTasks,
        plannedTasks
      );
      if (merged && merged.length) {
        const meregedTasks = mergeItemsDeep(changedTasks, merged);
        setDailyTasks(meregedTasks);
        saveDailyTasks<Items>(
          meregedTasks,
          currentDateRef.current || "",
          FirebaseCollection.dailyTasks
        );
      }
      setIsLoaded(true);
    });
  }, [changedTasks, plannedTasks, date]);

  const handleChangeTasks = useCallback(
    (tasks: Items) => {
      if (!isLoaded) return;
      saveDailyTasks<Items>(
        tasks,
        currentDateRef.current || "",
        FirebaseCollection.dailyTasks
      );
      setTimeout(() => {
        setChangedTasks(tasks);
      }, 0); // ⏱️ Відкласти в наступну подію
    },
    [isLoaded]
  );

  const onUpdatePlannedTask = useCallback(
    (task: ItemTask) => {
      updatePlannedTask(task);
    },
    [updatePlannedTask]
  );
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
                onChangeTasks={handleChangeTasks}
                onEditPlannedTask={onUpdatePlannedTask}
                onDeletePlannedTask={deletePlannedTask}
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
