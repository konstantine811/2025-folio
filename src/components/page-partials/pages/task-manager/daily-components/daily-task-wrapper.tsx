import { useCallback, useEffect, useRef, useState } from "react";
import {
  loadTemplateTasks,
  saveDailyTasks,
  loadDailyTasksByDate,
} from "@/services/firebase/taskManagerData";
import {
  DayNumber,
  Items,
  ItemTask,
  ItemTaskCategory,
} from "@/types/drag-and-drop.model";
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
  const { id: date } = useParams(); // ← id це твоя дата у форматі "dd.MM.yyyy"
  const currentDateRef = useRef(date);
  const [isFuture, setIsFuture] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const { plannedTasks, updatePlannedTask, deletePlannedTask, addPlannedTask } =
    useDailyTaskContext();
  useEffect(() => {
    // 💡 Очищення попередніх даних при зміні дати
    setIsLoaded(false);
    setDailyTasks([]);
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

  const onUpdatePlannedTask = useCallback(
    (task: ItemTask) => {
      updatePlannedTask(task);
    },
    [updatePlannedTask]
  );

  const mergeNewPlannedTasks = useCallback(
    (newTasks: ItemTaskCategory[]) => {
      if (!addPlannedTask) return;

      newTasks.forEach((incomingTask) => {
        addPlannedTask(incomingTask);
      });
    },
    [addPlannedTask]
  );

  const handleMerageTasks = useCallback(() => {
    if (!plannedTasks) return;
    setIsLoaded(false);
    loadTemplateTasks().then((tasks) => {
      const currentDayOfWeek = getISODay(parseDate(date ?? "")) as DayNumber;
      const { filteredTasks, plannedTasks } = filterTaskByDayOfWeedk(
        tasks,
        currentDayOfWeek
      );
      // save to timeline preset
      mergeNewPlannedTasks(plannedTasks);
      //  merge determined tasks with planned tasks
      const merged = mergeItemsWithPlannedTasks(filteredTasks, plannedTasks);
      if (merged && merged.length) {
        // merge with changed tasks
        const meregedTasks = mergeItemsDeep(dailyTasks, merged);
        setDailyTasks(meregedTasks);
        saveDailyTasks<Items>(
          meregedTasks,
          currentDateRef.current || "",
          FirebaseCollection.dailyTasks
        );
      }
      setIsLoaded(true);
    });
  }, [dailyTasks, plannedTasks, date, mergeNewPlannedTasks]);

  const handleChangeTasks = useCallback(
    (tasks: Items) => {
      if (!isLoaded) return;
      setTimeout(() => {
        setDailyTasks(tasks);
      }, 0);
      saveDailyTasks<Items>(
        tasks,
        currentDateRef.current || "",
        FirebaseCollection.dailyTasks
      );
    },
    [isLoaded]
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
