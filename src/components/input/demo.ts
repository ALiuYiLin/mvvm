import {
  ref,
  compile,
  type Option,
  registerComponents,
  resolveComponents,
} from "@actview/core";
import "./index.css";
import { MyInput } from "./index";

registerComponents([MyInput]);
resolveComponents();

// 交互演示：实时显示输入内容
const inputValue = ref("");

function handleInput(e: Event) {
  const target = e.target as HTMLInputElement;
  inputValue.value = target.value;
}

// 可清除输入框：清除按钮逻辑
function setupClearable() {
  const clearableWrapper = document.querySelector('[data-id="clearable-input"]');
  if (!clearableWrapper) return;

  const clearBtn = clearableWrapper.querySelector(".input-clear");
  const input = clearableWrapper.querySelector("input");
  if (clearBtn && input) {
    clearBtn.addEventListener("click", () => {
      input.value = "";
      input.focus();
    });
  }
}

setupClearable();

const options: Option[] = [
  {
    selector: '[data-id="demo-input"] input',
    listeners: [
      {
        type: "input",
        callback: handleInput,
      },
    ],
  },
  {
    selector: "#input-output",
    text: () => `输入内容: ${inputValue.value}`,
  },
];

options.forEach((option) => {
  compile(option);
});
