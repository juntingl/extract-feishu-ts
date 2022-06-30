import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { materialLight } from "react-syntax-highlighter/dist/cjs/styles/prism"

export default function TsHighlight({ ts }: { ts: string }) {
  return (
    <ReactMarkdown
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "")

          return !inline && match ? (
            <SyntaxHighlighter
              style={materialLight}
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
