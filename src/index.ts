// 主入口文件
import './style.css'

const app = document.querySelector<HTMLDivElement>('#app')!

app.innerHTML = `
  <div class="container">
    <h1>🚀 Vite + TypeScript</h1>
    <p>欢迎使用 Vite + TypeScript 构建的 Web 服务</p>
    <div class="card">
      <button id="counter" type="button">点击计数: 0</button>
    </div>
  </div>
`

// 计数器功能
function setupCounter(element: HTMLButtonElement) {
  let counter = 0
  const setCounter = (count: number) => {
    counter = count
    element.innerHTML = `点击计数: ${counter}`
  }
  element.addEventListener('click', () => setCounter(counter + 1))
  setCounter(0)
}

const counterBtn = document.querySelector<HTMLButtonElement>('#counter')
if (counterBtn) {
  setupCounter(counterBtn)
}

console.log('Vite + TypeScript Web 服务已启动!')
