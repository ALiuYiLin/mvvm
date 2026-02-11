import { App, Option } from "@actview/core";
import { Home } from "./pages/home";
import { NotFound } from "./pages/notfound";
import { Router } from "@actview/router";
import { Menu, MenuGroup } from "./components/menu";


const routes = [
  { path: "/home", component: () => Home() },
  { path: "/", component: () => Home() },
  { path: "/not-found", component: () => NotFound() },
]
const router = new Router({routes});

const menus: MenuGroup[] = [
  { group: '导航', items: [
    { path: '/home', label: '首页', icon: '🏠' },
  ]},
  { group: '示例', items: [
    { path: '/not-found', label: '404 页面', icon: '🚫' },
  ]},
];

const app = new App();
const options: Option[] = [
  {
    selector: "#navbar .nav-links",
    render: () => (
      <div style="display:flex;gap:24px;">
        <a class={router.route.value?.path === '/home' ? 'active' : ''}
           onClick={(e: MouseEvent) => { e.preventDefault(); router.push('/home'); }}
           href="/home">Home</a>
        <a class={router.route.value?.path === '/not-found' ? 'active' : ''}
           onClick={(e: MouseEvent) => { e.preventDefault(); router.push('/not-found'); }}
           href="/not-found">Not Found</a>
      </div>
    )
  },
  {
    selector: "#sidebar",
    render: () => <div id="sidebar"><Menu menus={menus} router={router} /></div>
  },
  {
    selector: "#app",
    render: () => (
      <div>
        <p style="margin-bottom:12px;color:#999;font-size:13px;">当前路由：{router.route.value?.path}</p>
        {router.route.value?.component()}
      </div>
    )
  },
]
app.resolveOptions(options)
