// 主入口文件
import './style.css'
import $ from 'jquery'

// 使用 jQuery 改造计数器功能
function setupCounter($element: JQuery<HTMLButtonElement>) {
  let counter = 0
  const setCounter = (count: number) => {
    counter = count
    $element.html(`点击计数: ${counter}`)
  }
  $element.on('click', () => setCounter(counter + 1))
  setCounter(0)
}

// 使用 jQuery 选择器
const $counterBtn = $('#counter') as JQuery<HTMLButtonElement>
if ($counterBtn.length) {
  setupCounter($counterBtn)
}

console.log('Vite + TypeScript + jQuery Web 服务已启动!')

