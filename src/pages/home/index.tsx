// 主入口文件
import "./style.css";
import { ref, reactive, computed, compile, Option } from '@actview/core';



// 1. 响应式数据
// 2. 订阅发布模式
// 3. 编译

const count = ref(0);
console.log('count: ', count);

const student = reactive({
  name: '张三',
  age: 20
})
console.log('student: ', student);

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

const type = ref('primary');



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
  if(count.value % 2 === 0) {
    type.value = 'primary'
  } else {
    type.value = 'secondary'
  }
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
    // text: ()=> studentList.map(item=>'姓名：' + item.name + ' 年龄：' + item.age).join('\n'),
    render: ()=> (
      <ul>
        {studentList.map(item=><li>{'姓名：' + item.name + ' 年龄：' + item.age}</li>)}
      </ul>
    )
  },
  {
    selector: '#lisi-info',
    text: ()=> nameAndAge.value
  },
  {
    selector: '#input-name',
    listeners:[
      {
        type: 'input',
        callback: (e) => {
          student.name = (e.target as HTMLInputElement).value
        }
      }
    ]
  },
  {
    selector: '#user-form',
    render: () => (
      <form>
        <label>姓名：</label>
        <input id="input-name" type="text" placeholder="请输入姓名"  onInput={(e: Event) => {
          student.name = (e.target as HTMLInputElement).value
        }}/>
        <label>年龄：</label>
        <input id="input-age" type="number" placeholder="请输入年龄" 
          value={String(student.age)}
          onInput={(e: Event) => {
          student.age = Number((e.target as HTMLInputElement).value)
        }}/>
        <span>{student.age}</span>
      </form>
    )
  }
];
options.forEach((option) => compile(option));
