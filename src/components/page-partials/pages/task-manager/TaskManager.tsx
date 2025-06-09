import { Link, Outlet } from "react-router";
import { Dock, DockIcon, DockItem, DockLabel } from "@/components/ui/dock";
import { RoutPath, TASK_MANAGER_ROUTERS } from "@/config/router-config";
import { useTranslation } from "react-i18next";
import useRoutingPath from "@/hooks/useRoutingPath";
import { format } from "date-fns";
import { DateTemplate } from "@/config/data-config";

export interface TaskManagerOutletContext {
  className: string;
}

const TaskManager = () => {
  const [t] = useTranslation();
  const nestedPath = useRoutingPath("nested");
  const outletConext: TaskManagerOutletContext = {
    className: "pb-24",
  };
  return (
    <>
      <Outlet context={outletConext} />
      <div className="fixed bottom-2 left-1/2 max-w-full -translate-x-1/2 z-10">
        <Dock className="items-end pb-3 bg-card/30 backdrop-blur-sm border border-foreground/10">
          {TASK_MANAGER_ROUTERS.map((item) => {
            let path: string = item.path;
            let title: string = item.path;
            let activePath: string = item.path;
            if (item.path === RoutPath.TASK_MANAGER_DAILY) {
              const today = format(new Date(), DateTemplate.dayMonthYear);
              activePath = item.path.replace("/:id", "");
              title = item.path.replace("/:id", ""); // → daily/23.05.2025
              path = item.path.replace(":id", today); // → daily/23.05.2025
            } else if (item.path === RoutPath.TASK_ANALYTICS) {
              activePath = item.path.replace("/:id", "");
              title = item.path.replace("/:id", ""); // → daily/23.05.2025
            }
            return (
              <Link to={path} key={item.id}>
                <DockItem
                  className={`${
                    nestedPath?.includes(activePath)
                      ? "bg-accent text-background"
                      : "bg-card/50 text-accent"
                  } transition duration-200 aspect-square rounded-full border border-foreground/10 cursor-pointer`}
                >
                  <DockLabel>{t(`pages.task.${title}`)}</DockLabel>
                  <DockIcon className="text-3xl ">{item.icon}</DockIcon>
                </DockItem>
              </Link>
            );
          })}
        </Dock>
      </div>
    </>
  );
};

export default TaskManager;
