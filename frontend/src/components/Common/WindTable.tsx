import { For, Stack } from "@chakra-ui/react"

import {WindTableColumn, WindValue} from "@/components/Common/WindTableColumn"

export type { WindValue } from "@/components/Common/WindTableColumn"

interface WindTableProps {
  firstHour: number
  lastHour: number
  values: WindValue[],
  onValueChange: (hour: number, value: WindValue) => void,
}

const EmptyWindTable = () =>
  <For each={[undefined, undefined, undefined]}>
    {(_, index) => <WindTableColumn key={index} hour={Number.NaN} value={null} onValueChange={(_) => {}}/>}
  </For>

export function WindTable({firstHour, lastHour, values, onValueChange}: WindTableProps) {
  return (
    <Stack direction="row" gap="1px">
      <For
        each={values.slice(0, lastHour - firstHour + 1)}
        fallback={<EmptyWindTable/>}
      >
        {(value, index) =>
          <WindTableColumn
            key={index}
            hour={firstHour + index}
            value={value}
            onValueChange={onValueChange}
          />}
      </For>
    </Stack>
  )
}