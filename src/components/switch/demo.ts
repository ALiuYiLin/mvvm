import {
  ref,
  compile,
  Option,
  registerComponents,
  resolveComponents,
} from "@actview/core";
import "./index.css";
import { MySwitch, switchRender } from "./index";

registerComponents([MySwitch]);
resolveComponents();

// 交互演示：切换开关状态
const isOn = ref(false);

function handleToggle() {
    console.log('handleToggle: ');
  isOn.value = !isOn.value;
}

const options: Option[] = [
  {
    selector: '[data-id="demo-switch"]',
    listeners: [
      {
        type: "click",
        callback: handleToggle,
      },
    ],
    render:()=> switchRender({checked:isOn.value? true:undefined})
  },
  {
    selector: "#switch-status",
    text: () => `开关状态: ${isOn.value ? "开启" : "关闭"}`,
  },
];

options.forEach((option) => {
  compile(option);
});
