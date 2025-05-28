import { Link, Outlet } from "react-router";
import { Dock, DockIcon, DockItem, DockLabel } from "@/components/ui/dock";
import { TASK_MANAGER_ROUTERS } from "@/config/router-config";

const TaskManager = () => {
  return (
    <>
      <Outlet />
      <div className="absolute bottom-2 left-1/2 max-w-full -translate-x-1/2">
        <Dock className="items-end pb-3 bg-card/50 border border-foreground/10">
          {TASK_MANAGER_ROUTERS.map((item) => (
            <Link to={item.path} key={item.id}>
              <DockItem className="aspect-square rounded-full bg-card border border-foreground/10 cursor-pointer">
                <DockLabel>{item.path}</DockLabel>
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
