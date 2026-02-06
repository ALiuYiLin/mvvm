# Design

## vue 
- v-if
- v-show
- v-model
- v-for

## react
view = f(state)

## mvvm
1、响应式数据
2、订阅发布者
3、渲染器

```html
<div id="app">
    <button id="btn">click</button>
    <p id="count">0</p>
</div>
```

```typescript

const count = ref(0)
const options = [
    {
        selector: '#btn',
        listener: [
            {
                type: 'click',
                handler: () => console.log('click')
            }
        ],
        show: true
    },
    {
        selector: '#count',
        text: ()=> count.value
    }
]

```

相当于

```html

<div id="app">
    <button id="btn" @click="()=>console.log('click')" v-show="true">click</button>
    <p id="count">{{count}}</p>
</div>

```