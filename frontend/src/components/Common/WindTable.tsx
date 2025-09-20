import { For, Stack } from "@chakra-ui/react"

import WindTableColumn from "@/components/Common/WindTableColumn"

interface WindTableProps {
    firstHour: number,
    lastHour: number
}

function WindTable({ firstHour, lastHour }: WindTableProps) {
    return !(isNaN(firstHour) || isNaN(lastHour)) && (lastHour >= firstHour) ? (
        <Stack direction="row" gap="1px">
            <For each={Array.from({ length: lastHour - firstHour + 1 }, (_, i) => i + firstHour)}>
                {(hour) => <WindTableColumn hour={hour} />}
            </For>
        </Stack>
    ) : (
        <Stack direction="row" gap="1px">
            <WindTableColumn hour={undefined} />
            <WindTableColumn hour={undefined} />
            <WindTableColumn hour={undefined} />
        </Stack>
    )
}

export default WindTable