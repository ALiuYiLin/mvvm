import { App, Option, ref } from "@actview/core";
import { HomeComponent } from "./pages/home/component";
import { Router } from "@actview/router";



// const router = new Router();
// router.init();
const count = ref(0);

const routes = [
  { path: "/home", component: () => HomeComponent() },
  { path: "/not-found", component: () => <div>Not Found</div> },
]
const router = new Router({routes});

const app = new App();
const options: Option[] = [
  {
    selector: "#app",
    render: () => (
      <div>
        <h1>欢迎来到ActView</h1>
        <p>这是一个简单的示例</p>
        <p>当前路由：{router.route.value?.path}</p>
        <button onClick={() => router.push('/home')}>Home</button>
        <button onClick={() => router.push('/not-found')}>Not Found</button>
        <button onClick={() => count.value++}>count ++</button>
        {router.route.value?.component()}
      </div>
    )
  },
]
app.resolveOptions(options)
