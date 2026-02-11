import './index.css'
import { useRouter } from '@actview/router'

export function NotFound() {
  const router = useRouter()

  return (
    <div class="notfound-container">
      <div class="notfound-code">404</div>
      <div class="notfound-title">页面未找到</div>
      <p class="notfound-desc">抱歉，您访问的页面不存在或已被移除。</p>
      <button class="notfound-btn" onClick={() => router.push('/home')}>返回首页</button>
    </div>
  )
}
