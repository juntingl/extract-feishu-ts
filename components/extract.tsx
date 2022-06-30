import { flip, useFloating } from "@floating-ui/react-dom"
import { AdjustmentsIcon } from "@heroicons/react/solid"
import clsx from "clsx"
import { useAtom } from "jotai"
import { useEffect, useState } from "react"
import { CopyToClipboard } from "react-copy-to-clipboard"

import { Settings, settingsAtom } from "~store/settings"

import SettingsForm from "./setttings-form"
import TsHighlight from "./ts-highlight"

export default function Extract() {
  const [isOpenButton, setIsOpenButton] = useState(false)

  const { x, y, reference, floating, strategy, refs } = useFloating({
    middleware: [flip()]
  })

  useEffect(() => {
    document.querySelectorAll(".ace-table-wrapper-outer").forEach((table) => {
      table.addEventListener("mouseover", () => {
        reference(table)
        setIsOpenButton(true)
      })
    })

    document
      .querySelector(".etherpad-container-wrapper")
      .addEventListener("scroll", () => {
        setIsOpenButton(false)
      })
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
            let type: "string" | "number" = "string"

            if (
              ["integer", "double", "bigint", "float", "decimal", "long"].some(
                (t) => t.includes(lowerCaseContent)
              )
            ) {
              type = "number"
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
          <h3 className="font-bold text-lg flex justify-between items-center">
            {isOpenSettingsForm ? "设置" : "TypeScript"}
            <AdjustmentsIcon
              className={clsx(
                "hover:text-primary-focus text-primary !align-middle w-6 h-6 cursor-pointer",
                isOpenSettingsForm && "text-primary-focus"
              )}
              onClick={() => {
                setIsOpenSettingsForm(!isOpenSettingsForm)
                if (!isOpenSettingsForm) extractTs(setttings)
              }}
            />
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
