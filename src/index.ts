// 主入口文件
import { compile } from "./core/compile";
import  { Option } from './types'
import { ref } from "./core/ref";
import "./style.css";

// 1. 响应式数据
// 2. 订阅发布模式
// 3. 编译

const count = ref(0);

const options: Option[] = [
  {
    selector: "#count",
    text: () => `count: ${count.value}`,
  },
  {
    selector: '#counter',
    listeners: [
      {
        type: 'click',
        callback: () => count.value++
      }
    ],
    text: () => `点击计数: ${count.value}`
  }
];

options.forEach((option) => compile(option));
