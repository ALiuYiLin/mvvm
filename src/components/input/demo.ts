import {
  ref,
  type Option,
  App,
} from "@actview/core";
import "./index.css";
import { MyInput } from "./index";

const app = new App();
app.use(MyInput);


// 交互演示：实时显示输入内容
const inputValue = ref("123");
const refInput = ref<HTMLInputElement | null>(null);
function handleInput(e: Event) {
  const target = e.target as HTMLInputElement;
  inputValue.value = target.value;
}

// 可清除输入框：点击清除按钮清空内容
function handleClear() {
  inputValue.value = "";
  refInput.value?.focus();
}

const options: Option[] = [
  {
    selector: '[data-id="clearable-input"] .input-clear',
    listeners: [
      {
        type: "click",
        callback: handleClear,
      },
    ],
  },
  {
    selector: '[data-id="clearable-input"] input',
    listeners: [
      {
        type: "input",
        callback: handleInput,
      },
    ],
    ref: refInput,
    value: () => inputValue.value,
  },
  {
    selector: '[data-id="demo-input"] input',
    listeners: [
      {
        type: "input",
        callback: handleInput,
      },
    ],
    value: () => inputValue.value,
  },
  {
    selector: "#input-output",
    text: () => `输入内容: ${inputValue.value}`,
  },
];

app.resolveOptions(options);
