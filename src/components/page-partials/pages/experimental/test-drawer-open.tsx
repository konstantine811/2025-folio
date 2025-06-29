import CustomDrawer from "@/components/ui-abc/drawer/custom-drawer";
import { Dock, DockIcon, DockItem, DockLabel } from "@/components/ui/dock";
import { EXPERIMENTAL_ROUTERS } from "@/config/router-config";
import useRoutingPath from "@/hooks/useRoutingPath";
import { Link } from "react-router";

const TestDrawerOpen = () => {
  const nestedPath = useRoutingPath("nested");
  return (
    <CustomDrawer
      title={"Тестові проєкти"}
      description={"Тут будуть тестові проєкти"}
    >
      <Dock className="items-end pb-3 bg-card/30 backdrop-blur-sm border border-foreground/10">
        {EXPERIMENTAL_ROUTERS.map((item) => {
          return (
            <Link to={item.path} key={item.id}>
              <DockItem
                className={`${
                  nestedPath === item.path
                    ? "bg-accent text-background"
                    : "bg-card/50 text-accent"
                } transition duration-200 aspect-square rounded-full border border-foreground/10 cursor-pointer`}
              >
                <DockLabel>{item.id}</DockLabel>
                <DockIcon className="text-xl ">{item.icon}</DockIcon>
              </DockItem>
            </Link>
          );
        })}
      </Dock>
    </CustomDrawer>
  );
};

export default TestDrawerOpen;
