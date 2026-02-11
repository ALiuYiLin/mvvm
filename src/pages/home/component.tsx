import {
  ref,
  reactive,
  computed,
  Option,
  useResolveOptions,
} from "@actview/core";
import './index.css'

export function HomeComponent() {
  const count = ref(0);
  const student = reactive({ name: "张三", age: 20 });
  const studentList = reactive([
    { name: "张三", age: 20 },
    { name: "张四", age: 21 },
    { name: "张五", age: 22 },
  ]);
  const nameAndAge = computed(
    () => "姓名：" + student.name + " 年龄：" + student.age
  );

  function handlerClick() {
    count.value++;
    student.age++;
    studentList.push({ name: "aaaaa", age: Math.random() });
  }

  const options: Option[] = [
    {
      selector: "#count",
      text: () => `count: ${count.value}`,
    },
    {
      selector: "#counter",
      listeners: [{ type: "click", callback: handlerClick }],
      text: () => `点击计数: ${count.value}`,
    },
    {
      selector: "#student",
      text: () => "姓名：" + student.name + " 年龄：" + student.age,
    },
    {
      selector: "#student--list",
      render: () => (
        <ul>
          {studentList.map((item) => (
            <li>{"姓名：" + item.name + " 年龄：" + item.age}</li>
          ))}
        </ul>
      ),
    },
    {
      selector: "#lisi-info",
      text: () => nameAndAge.value,
    },
    {
      selector: "#input-name",
      listeners: [
        {
          type: "input",
          callback: (e) => {
            student.name = (e.target as HTMLInputElement).value;
          },
        },
      ],
    },
    {
      selector: "#user-form",
      render: () => (
        <form>
          <label>姓名：</label>
          <input
            id="input-name"
            type="text"
            placeholder="请输入姓名"
            onInput={(e: Event) => {
              student.name = (e.target as HTMLInputElement).value;
            }}
          />
          <label>年龄：</label>
          <input
            id="input-age"
            type="number"
            placeholder="请输入年龄"
            value={String(student.age)}
            onInput={(e: Event) => {
              student.age = Number((e.target as HTMLInputElement).value);
            }}
          />
          <span>{student.age}</span>
        </form>
      ),
    },
  ];


  useResolveOptions(options)

  return (
    <div class="container">
      <h1>🚀 Vite + TypeScript</h1>
      <p>欢迎使用 Vite + TypeScript 构建的 Web 服务</p>
      <p id="count"></p>
      <div class="card">
        <button id="counter" type="button">
          点击计数: 0
        </button>
      </div>
      <div id="student"></div>
      <div id="student--list"></div>
      <div id="lisi-info"></div>
      <input id="input-name" type="text" placeholder="请输入姓名" />
      <div id="user-form"></div>
    </div>
  );
}
