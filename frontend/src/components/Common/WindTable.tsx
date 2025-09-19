import { For, Stack } from "@chakra-ui/react"

import WindTableColumn from "@/components/Common/WindTableColumn"

interface WindTableProps {
    firstHour: number,
    lastHour: number
}

function WindTable({ firstHour, lastHour }: WindTableProps) {
    return (
        <Stack direction="row" gap="1px">
            <For each={Array.from({ length: lastHour - firstHour + 1 }, (_, i) => i + firstHour)}>
                {(hour) => <WindTableColumn hour={hour} />}
            </For>
        </Stack>
    )
}

export default WindTable