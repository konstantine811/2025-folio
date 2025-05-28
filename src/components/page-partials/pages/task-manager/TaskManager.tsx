import { Link, Outlet } from "react-router";
import { Dock, DockIcon, DockItem, DockLabel } from "@/components/ui/dock";
import { TASK_MANAGER_ROUTERS } from "@/config/router-config";
import { useTranslation } from "react-i18next";

const TaskManager = () => {
  const [t] = useTranslation();
  return (
    <>
      <div className="pb-24">
        <Outlet />
      </div>
      <div className="fixed bottom-2 left-1/2 max-w-full -translate-x-1/2">
        <Dock className="items-end pb-3 bg-card/30 backdrop-blur-sm border border-foreground/10">
          {TASK_MANAGER_ROUTERS.map((item) => (
            <Link to={item.path} key={item.id}>
              <DockItem className="aspect-square rounded-full bg-card/50 border border-foreground/10 cursor-pointer">
                <DockLabel>{t(`pages.task.${item.path}`)}</DockLabel>
                <DockIcon className="text-3xl ">{item.icon}</DockIcon>
              </DockItem>
            </Link>
          ))}
        </Dock>
      </div>
    </>
  );
};

export default TaskManager;
