import { App, Option } from "@actview/core";
import { Home } from "./pages/home";
import { NotFound } from "./pages/notfound";
import { Router } from "@actview/router";
import { Menu, MenuGroup } from "./components/menu";
import { Button } from "./pages/components/button";
import { Switch } from "./pages/components/switch";
import { Input } from "./pages/components/input";
import { MyButton } from "./components/button";
import { MyAddIcon } from "./components/svg-icon";
import { MySwitch } from "./components/switch";
import { MyInput } from "./components/input";

const routes = [
  { path: "/home", component: () => Home() },
  { path: "/", component: () => Home() },
  { path: "/not-found", component: () => NotFound() },
  { path: "/component/button", component: () => Button() },
  { path: "/component/switch", component: () => Switch() },
  { path: "/component/input", component: () => Input() },
];
const router = new Router({ routes });

const menus: MenuGroup[] = [
  { group: "导航", items: [{ path: "/home", label: "首页", icon: "🏠" }] },
  {
    group: "示例",
    items: [{ path: "/not-found", label: "404 页面", icon: "🚫" }],
  },
  {
    group: "组件",
    items: [
      { path: "/component/button", label: "按钮", icon: "🔘" },
      { path: "/component/switch", label: "开关", icon: "🔛" },
      { path: "/component/input", label: "输入框", icon: "📝" },
    ],
  },
];

const app = new App();
app.use(MyButton)
app.use(MyAddIcon)
app.use(MySwitch)
app.use(MyInput)
const options: Option[] = [
  {
    selector: "#navbar .nav-links",
    render: () => (
      <div style="display:flex;gap:24px;">
        <a
          class={router.route.value?.path === "/home" ? "active" : ""}
          onClick={(e: MouseEvent) => {
            e.preventDefault();
            router.push("/home");
          }}
          href="/home"
        >
          Home
        </a>
        <a
          class={router.route.value?.path === "/not-found" ? "active" : ""}
          onClick={(e: MouseEvent) => {
            e.preventDefault();
            router.push("/not-found");
          }}
          href="/not-found"
        >
          Not Found
        </a>
      </div>
    ),
  },
  {
    selector: "#sidebar",
    render: () => (
      <div id="sidebar">
        <Menu menus={menus} router={router} />
      </div>
    ),
  },
  {
    selector: "#app",
    render: () => (
      <div>
        <p style="margin-bottom:12px;color:#999;font-size:13px;">
          当前路由：{router.route.value?.path}
        </p>
        {router.route.value?.component()}
      </div>
    ),
  },
];
app.resolveOptions(options);
