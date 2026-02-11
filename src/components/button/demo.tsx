import {
  ref,
  type Option,
  App,
} from "@actview/core";
import './index.css'
// 导入并注册组件
import { MyButton } from './index';
import { MyAddIcon } from "../svg-icon";

const app = new App();
app.use(MyButton);
app.use(MyAddIcon);


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
    render: () => (
      <MyButton
        type="primary"
        size="lg"
        data-id="counter-btn"
        onClick={handleIncrement}
      >
        点击增加
        <p>111</p>
      </MyButton>
    ),
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

app.resolveOptions(options);