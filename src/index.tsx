import { App, computed, Option, ref } from "@actview/core";
import { HomeComponent } from "./pages/home/component";

// 核心就这么多
class Router {
  routes: { path: string; component: () => string | HTMLElement | Text | DocumentFragment | SVGElement }[] = [
    { path: '/home', component: () => <div>Home</div> },
    { path: '/not-found', component: () => <div>Not Found</div>},
  ];
  
  push(path: string) {
    history.pushState(null, '', path);
    this.update();
  }

  update() {
    const path = location.pathname;
    const route = this.routes.find(r => r.path === path);
    if (route) route.component(); // 渲染匹配的组件
  }

  init() {
    window.addEventListener('popstate', () => this.update());
    this.update();
  }
}

// const router = new Router();
// router.init();
const count = ref(0);

const useRouter = () => {
  const routes = [
    { path: "/home", component: () => HomeComponent() },
    { path: "/not-found", component: () => <div>Not Found</div> },
  ]

  const currentRoutePath = ref('/home');
  const route = computed(() => {
    return routes.find(r => r.path === currentRoutePath.value);
  })

  function push(path: string) {
    history.pushState(null, '', path);
    update();
  }

  function update() {
    const path = location.pathname;
    currentRoutePath.value = path;
  }

  function init() {
    window.addEventListener('popstate', () => update());
    update();
  }

  init();

  return {
    route,
    push,
  }
}


const app = new App();
const {route, push} = useRouter();
const options: Option[] = [
  {
    selector: "#app",
    render: () => (
      <div>
        <h1>欢迎来到ActView</h1>
        <p>这是一个简单的示例</p>
        <p>当前路由：{route.value?.path}</p>
        <button onClick={() => push('/home')}>Home</button>
        <button onClick={() => push('/not-found')}>Not Found</button>
        <button onClick={() => count.value++}>count ++</button>
        {route.value?.component()}
      </div>
    )
  },
]
app.resolveOptions(options)
