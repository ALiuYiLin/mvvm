
export type RouteComponent = () => string | HTMLElement | Text | DocumentFragment | SVGElement;;

export interface RouteRecord {
  path: string;
  component: RouteComponent;
}

export interface RouterOptions {
  routes: RouteRecord[];
}
