import { ref, computed, Ref } from "@actview/core";
import { RouteRecord, RouterOptions } from "./types";

let routerInstance: Router | null = null;

export class Router {
  private routes: RouteRecord[] = [];
  private currentPath: Ref<string> = ref(location.pathname);
  readonly route!: Ref<RouteRecord | null>;

  constructor(options: RouterOptions) {
    if (routerInstance) {
      return routerInstance;
    }
    this.routes = options.routes;
    this.currentPath = ref(location.pathname);
    this.route = computed(() => {
      return this.routes.find((r) => r.path === this.currentPath.value) ?? null;
    });
    window.addEventListener("popstate", () => this.update());
    routerInstance = this;
  }

  push(path: string) {
    history.pushState(null, "", path);
    this.update();
  }

  replace(path: string) {
    history.replaceState(null, "", path);
    this.update();
  }

  private update() {
    this.currentPath.value = location.pathname;
  }
}

/**
 * 获取 Router 单例
 */
export function useRouter(): Router {
  if (!routerInstance) {
    throw new Error("Router instance not created yet. Call `new Router(options)` first.");
  }
  return routerInstance;
}
