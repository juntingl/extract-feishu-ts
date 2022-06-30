import { z } from "zod"

import { atomWithAsyncStorage } from "./utils"

export const SettingsSchema = z.object({
  /**
   * 表格列数
   */
  colIndex: z.object({
    fieldName: z.preprocess(Number, z.number().positive().int()),
    type: z.preprocess(Number, z.number().positive().int()),
    required: z.preprocess(
      (v) => (v !== "" && Number.isFinite(+v) ? +v : undefined),
      z.number().positive().int().optional()
    ),
    description: z.preprocess(
      (v) => (v !== "" && Number.isFinite(+v) ? +v : undefined),
      z.number().positive().int().optional()
    )
  }),
  requiredStr: z.string()
})

export type Settings = z.infer<typeof SettingsSchema>

export const initialSettings = {
  colIndex: {
    fieldName: 1,
    type: 2,
    required: 3,
    description: 4
  },
  requiredStr: "是,y"
}

export const settingsAtom = atomWithAsyncStorage<Settings>(
  "settings",
  initialSettings
)
