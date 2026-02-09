import {
  ref,
  compile,
  type Option,
  registerComponents,
  resolveComponents
} from "@actview/core";
import './index.css'
// 导入并注册组件
import { MyButton } from './index';
import { MyAddIcon } from "../svg-icon";

registerComponents([MyButton, MyAddIcon]);
// 解析页面中的自定义组件（在 DOM 解析完成后执行）
resolveComponents();


// 响应式状态（用于演示页面）
const count = ref(0);

// 点击处理函数
function handleIncrement() {
  count.value++;
}

function handleReset() {
  count.value = 0;
}

// 编译配置（用于演示页面）
const options: Option[] = [
  {
    selector: '[data-id="counter-btn"]',
    listeners: [
      {
        type: "click",
        callback: handleIncrement,
      },
    ],
  },
  {
    selector: '[data-id="reset-btn"]',
    listeners: [
      {
        type: "click",
        callback: handleReset,
      },
    ],
  },
  {
    selector: "#click-count",
    text: () => `点击次数: ${count.value}`,
  },
];

options.forEach((option) => {
  compile(option);
});