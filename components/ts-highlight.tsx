import { useContext } from "react"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import {
  dark,
  materialLight
} from "react-syntax-highlighter/dist/cjs/styles/prism"

import { DarkModeContext } from "./dark-mode/dark-mode-context"

export default function TsHighlight({ ts }: { ts: string }) {
  const { isDarkMode } = useContext(DarkModeContext)

  return (
    <ReactMarkdown
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "")

          return !inline && match ? (
            <SyntaxHighlighter
              style={isDarkMode ? dark : materialLight}
              PreTag="div"
              language={match[1]}
              children={String(children).replace(/\n$/, "")}
              {...props}
            />
          ) : (
            <code className={className ? className : ""} {...props}>
              {children}
            </code>
          )
        }
      }}>
      {`\`\`\`ts\n${ts}\n\`\`\``}
    </ReactMarkdown>
  )
}
