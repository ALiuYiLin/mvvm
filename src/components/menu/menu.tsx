import { Router } from "@actview/router";
import "./menu.css";

export type MenuItem = {
  path: string;
  label: string;
  icon?: string;
};

export type MenuGroup = {
  group: string;
  items: MenuItem[];
};

export type MenuProps = {
  menus: MenuGroup[];
  router: Router;
};

export const Menu = (props: MenuProps) => {
  const { menus, router } = props;
  return (
    <ul class="sidebar-menu">
      {menus.map((group) => (
        <li>
          {group.items.map((item) => (
            <a
              href={item.path}
              class={router.route.value?.path === item.path ? "active" : ""}
              onClick={(e: MouseEvent) => {
                e.preventDefault();
                router.push(item.path);
              }}
            >
              {item.icon && <span class="icon">{item.icon}</span>}
              {item.label}
            </a>
          ))}
        </li>
      ))}
    </ul>
  );
};
