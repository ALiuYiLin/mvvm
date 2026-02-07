// 主入口文件
import { compile } from "./core/compile";
import  { Option } from './types'
import { ref } from "./core/ref";
import "./style.css";
import { reactive } from "./core/reactive";
import { computed } from "./core/computed";

// 1. 响应式数据
// 2. 订阅发布模式
// 3. 编译

const count = ref(0);

const student = reactive({
  name: '张三',
  age: 20
})

const studentList = reactive([
  {
    name: '张三',
    age: 20
  },
  {
    name: '张四',
    age: 21
  },
  {
    name: '张五',
    age: 22
  },
])

const objaaa = reactive({
  name: '李四',
  age: 20
})


const nameAndAge = computed(()=>{
  return '姓名：' + student.name + ' 年龄：' + student.age
})

function handlerClick(){
  count.value++
  student.age++
  studentList.push({
    name: 'aaaaa',
    age: Math.random()
  })
  objaaa.name = '李四1'
}

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
        callback: handlerClick
      }
    ],
    text: () => `点击计数: ${count.value}`
  },
  {
    selector: '#student',
    text: ()=> '姓名：' + student.name + ' 年龄：' + student.age
  },
  {
    selector: '#student--list',
    text: ()=> studentList.map(item=>'姓名：' + item.name + ' 年龄：' + item.age).join('\n')
  },
  {
    selector: '#lisi-info',
    text: ()=> nameAndAge.value
  },
];

options.forEach((option) => compile(option));
