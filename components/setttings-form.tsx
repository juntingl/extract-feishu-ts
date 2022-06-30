import { XIcon } from "@heroicons/react/solid"
import { ErrorMessage } from "@hookform/error-message"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAtom } from "jotai"
import { useForm } from "react-hook-form"

import {
  Settings,
  SettingsSchema,
  initialSettings,
  settingsAtom
} from "~store/settings"

export default function SettingsForm({
  onOk
}: {
  onOk: (values: Settings) => void
}) {
  const [setttings, setSettings] = useAtom(settingsAtom)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset
  } = useForm({
    defaultValues: setttings,
    resolver: zodResolver(SettingsSchema)
  })

  return (
    <>
      <div className="py-4">
        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">字段名列数</span>
            <ErrorMessage
              errors={errors}
              name="colIndex.fieldName"
              as={<span className="label-text-alt text-error" />}
            />
          </label>
          <input
            {...register("colIndex.fieldName")}
            type="number"
            placeholder="请输入字段名列数"
            className="input input-bordered"
          />
        </div>

        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">类型列数</span>
            <ErrorMessage
              errors={errors}
              name="colIndex.type"
              as={<span className="label-text-alt text-error" />}
            />
          </label>
          <input
            {...register("colIndex.type")}
            type="number"
            placeholder="请输入类型列数"
            className="input input-bordered"
          />
        </div>

        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">必填列数</span>
            <ErrorMessage
              errors={errors}
              name="colIndex.required"
              as={<span className="label-text-alt text-error" />}
            />
          </label>

          <label className="input-group">
            <input
              {...register("colIndex.required")}
              type="number"
              placeholder="请输入必填列数"
              className="input input-bordered w-full"
            />
            <button className="btn btn-primary">
              <XIcon
                className="w-6 h-6"
                onClick={() => {
                  setValue("colIndex.required", undefined)
                }}
              />
            </button>
          </label>
        </div>

        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">描述列数</span>
            <ErrorMessage
              errors={errors}
              name="colIndex.description"
              as={<span className="label-text-alt text-error" />}
            />
          </label>

          <label className="input-group">
            <input
              {...register("colIndex.description")}
              type="number"
              placeholder="请输入描述列数"
              className="input input-bordered w-full"
            />
            <button className="btn btn-primary">
              <XIcon
                className="w-6 h-6"
                onClick={() => {
                  setValue("colIndex.description", undefined)
                }}
              />
            </button>
          </label>
        </div>

        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text">必填列判断依据</span>
            <ErrorMessage
              errors={errors}
              name="isRequired"
              as={<span className="label-text-alt text-error" />}
            />
          </label>
          <input
            {...register("requiredStr")}
            type="text"
            placeholder="请输入必填列判断依据"
            className="input input-bordered"
          />
          <label className="label">
            <span className="label-text-alt">
              如：<span className="text-primary">是,y</span>
              ，而必填列如有<span className="text-primary">是</span>或
              <span className="text-primary">y</span>，则在ts中为required
            </span>
          </label>
        </div>
      </div>

      <div className="modal-action">
        <button
          onClick={async () => {
            reset(initialSettings)
          }}
          className="btn btn-primary btn-outline">
          重置
        </button>

        <button
          onClick={() => {
            handleSubmit((values) => {
              setSettings(values)
              onOk(values)
            }, console.error)()
          }}
          className="btn btn-primary">
          提交
        </button>
      </div>
    </>
  )
}
