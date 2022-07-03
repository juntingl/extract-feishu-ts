import { flip, useFloating } from "@floating-ui/react-dom"
import { AdjustmentsIcon } from "@heroicons/react/solid"
import clsx from "clsx"
import { useAtom } from "jotai"
import { useEffect, useState } from "react"
import { CopyToClipboard } from "react-copy-to-clipboard"

import { Settings, settingsAtom } from "~store/settings"

import SwitchDarkMode from "./dark-mode/switch-dark-mode"
import SettingsForm from "./setttings-form"
import TsHighlight from "./ts-highlight"

export default function Extract() {
  const [isOpenButton, setIsOpenButton] = useState(false)

  const { x, y, reference, floating, strategy, refs } = useFloating({
    middleware: [flip()]
  })

  useEffect(() => {
    const docContainer = document.querySelector("#doc-container")
    const scrollContainer = document.querySelector(
      ".etherpad-container-wrapper"
    )

    if (!docContainer) return

    const handleTableClick = (event: Event) => {
      let node = (event || window.event).target as Element

      while (
        node &&
        (node as HTMLDivElement).contentEditable !== "true" &&
        node.parentNode &&
        (node.parentNode as HTMLDivElement).contentEditable !== "true" &&
        node.parentNode !== docContainer
      ) {
        // 是否是表格
        if (node.classList.contains("ace-table-wrapper-outer")) {
          reference(node)
          setIsOpenButton(true)
          break
        }
        node = node.parentNode as Element
      }
    }

    const handleTableWrapperScroll = () => {
      setIsOpenButton(false)
    }

    docContainer.addEventListener("click", handleTableClick)
    scrollContainer?.addEventListener("scroll", handleTableWrapperScroll)

    return () => {
      docContainer.removeEventListener("click", handleTableClick)
      scrollContainer?.removeEventListener("scroll", handleTableWrapperScroll)
    }
  }, [])

  const [setttings] = useAtom(settingsAtom)

  const [ts, setTs] = useState("")

  const extractTs = (values: Settings) => {
    const { colIndex, requiredStr } = values

    const table = refs.reference.current as Element
    if (!table) return

    const fields = []
    const template = `$4\t$1$3: $2`

    table.querySelectorAll("tbody tr").forEach((tr, i) => {
      if (i === 0) return

      let field = template

      tr.querySelectorAll("td").forEach((td, j) => {
        let content = ""
        td.querySelectorAll('span[data-string="true"]').forEach((str) => {
          if (typeof str.textContent === "string") {
            content += str.textContent
          }
        })

        switch (j + 1) {
          case colIndex.fieldName: {
            field = field.replace("$1", content)
            break
          }
          case colIndex.type: {
            const lowerCaseContent = content.toLowerCase()
            let type:
              | "string"
              | "number"
              | "any[]"
              | "Record<string, any>"
              | "boolean" = "string"

            if (
              ["double", "float", "decimal", "long", "int"].some((t) =>
                lowerCaseContent.includes(t.toLowerCase())
              )
            ) {
              type = "number"
            } else if (
              ["bool"].some((t) => lowerCaseContent.includes(t.toLowerCase()))
            ) {
              type = "boolean"
            } else if (
              ["array", "list"].some((t) =>
                lowerCaseContent.includes(t.toLowerCase())
              )
            ) {
              type = "any[]"
            } else if (
              ["object"].some((t) => lowerCaseContent.includes(t.toLowerCase()))
            ) {
              type = "Record<string, any>"
            }

            field = field.replace("$2", type)
            break
          }
          case colIndex.required: {
            const lowerCaseContent = content.toLowerCase()
            field = field.replace(
              "$3",
              String(requiredStr)
                .replace(/[，\s]/g, ",")
                .split(",")
                .some((c) => lowerCaseContent.includes(c.toLowerCase()))
                ? ""
                : "?"
            )
            break
          }
          case colIndex.description: {
            field = field.replace("$4", `\t/**\n\t* ${content}\n\t*/\n`)
            break
          }
        }
      })

      fields.push(field.replace(/[(\$3)(\$4)(\u200B)]/g, ""))
    })

    setTs(`{\n${fields.join("\n")}\n}`)
  }

  const [isOpenSettingsForm, setIsOpenSettingsForm] = useState(false)

  return (
    <>
      <button
        className={clsx(!isOpenButton && "hidden", "btn btn-sm btn-primary")}
        ref={floating}
        style={{
          zIndex: 99999,
          position: strategy,
          top: y ?? 0,
          left: x ?? 0
        }}
        onClick={() => {
          extractTs(setttings)
        }}>
        生成TS
      </button>

      <div
        style={{
          zIndex: 100000
        }}
        className={clsx("modal", !!ts && "modal-open")}
        onClick={() => {
          setIsOpenSettingsForm(false)
          setTs("")
        }}>
        <div className="modal-box" onClick={(ev) => ev.stopPropagation()}>
          <h3 className="font-bold text-lg flex items-center">
            {isOpenSettingsForm ? "设置" : "TypeScript"}

            <span className="ml-auto flex gap-2 justify-end items-center text-lg text-slate-400 dark:text-slate-500">
              <SwitchDarkMode />

              <AdjustmentsIcon
                className={clsx(
                  "hover:opacity-80 align-middle w-6 h-6 cursor-pointer",
                  isOpenSettingsForm && "!text-sky-500"
                )}
                onClick={() => {
                  setIsOpenSettingsForm(!isOpenSettingsForm)
                  if (!isOpenSettingsForm) extractTs(setttings)
                }}
              />
            </span>
          </h3>

          {isOpenSettingsForm ? (
            <SettingsForm
              onOk={(values) => {
                setIsOpenSettingsForm(false)
                extractTs(values)
              }}
            />
          ) : (
            <>
              <div className="py-4">{!!ts && <TsHighlight ts={ts} />}</div>
              <div className="modal-action sticky bottom-0">
                <label
                  className="btn btn-primary btn-outline"
                  onClick={() => {
                    setTs("")
                  }}>
                  取消
                </label>
                <CopyToClipboard text={ts}>
                  <label
                    className="btn btn-primary"
                    onClick={() => {
                      setTs("")
                    }}>
                    复制
                  </label>
                </CopyToClipboard>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
