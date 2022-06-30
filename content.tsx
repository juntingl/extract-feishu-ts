import cssText from "data-text:~/style.css"
import type { PlasmoContentScript } from "plasmo"

import Extract from "~components/extract"

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

export const getRootContainer = () => {
  const shadowHost = document.createElement("div")
  const shadowRoot = shadowHost.attachShadow({ mode: "open" })
  const container = document.createElement("div")
  const style = document.createElement("style")
  style.textContent = cssText
  shadowRoot.appendChild(style)
  shadowRoot.appendChild(container)
  document.body.appendChild(shadowHost)
  return container
}

export const config: PlasmoContentScript = {
  matches: ["https://*.feishu.cn/*"]
}

export default function App() {
  return (
    <div data-theme="light">
      <Extract />
    </div>
  )
}
