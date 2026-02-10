import {
  ref,
  Option,
  App,
} from "@actview/core";
import "./index.css";
import { MySwitch } from "./index";

const app = new App();
app.use(MySwitch);


// 交互演示：切换开关状态
const isOn = ref(false);

function handleToggle() {
    console.log('handleToggle: ');
  isOn.value = !isOn.value;
}

const options: Option[] = [
  {
    selector: '[data-id="demo-switch"]',
    render:()=> MySwitch({checked:isOn.value? true:undefined,"data-id":"demo-switch",onToggle:handleToggle})
  },
  {
    selector: "#switch-status",
    text: () => `开关状态: ${isOn.value ? "开启" : "关闭"}`,
  },
];

app.resolveOptions(options);
