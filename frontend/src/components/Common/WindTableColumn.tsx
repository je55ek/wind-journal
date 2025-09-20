import {
  Box,
  Editable,
  IconButton,
  Portal,
  Select,
  Skeleton,
  Stack,
  createListCollection,
  useSelectContext,
} from "@chakra-ui/react"
import { type ReactNode, useState } from "react"
import {
  MdEast,
  MdNorth,
  MdNorthEast,
  MdNorthWest,
  MdSouth,
  MdSouthEast,
  MdSouthWest,
  MdWest,
} from "react-icons/md"
import { RiForbidLine } from "react-icons/ri"

interface WindTableColumnProps {
  hour: number
}

const directions = createListCollection({
  items: [
    { value: "N", icon: <MdNorth /> },
    { value: "NE", icon: <MdNorthEast /> },
    { value: "E", icon: <MdEast /> },
    { value: "SE", icon: <MdSouthEast /> },
    { value: "S", icon: <MdSouth /> },
    { value: "SW", icon: <MdSouthWest /> },
    { value: "W", icon: <MdWest /> },
    { value: "NW", icon: <MdNorthWest /> },
  ],
})

function cellBackgroundColor(value: string) {
  const kts = Math.max(0, Number.parseFloat(value))
  const stops = [
    { max: 0.0, color: "var(--chakra-colors-blue-700)" },
    { max: 5.8, color: "var(--chakra-colors-blue-600)" },
    { max: 9.7, color: "var(--chakra-colors-blue-400)" },
    { max: 12.0, color: "var(--chakra-colors-green-400)" },
    { max: 19.0, color: "var(--chakra-colors-yellow-400)" },
    { max: 29.0, color: "var(--chakra-colors-red-500)" },
    { max: 78.0, color: "var(--chakra-colors-purple-700)" },
    { max: Number.POSITIVE_INFINITY, color: "var(--chakra-colors-purple-700)" },
  ]
  if (Number.isNaN(kts)) {
    return "var(--chakra-colors-gray-100)"
  }

  const i = stops.findIndex((s) => kts < s.max)
  const [c1, c2] = stops.slice(i - 1, i + 1)

  return `color-mix(in hsl decreasing hue, ${c1.color}, ${c2.color} ${
    ((kts - c1.max) / (c2.max - c1.max)) * 100
  }%)`
}

interface WindTableDirection {
  value: string
  icon: ReactNode
}

const WindTableDirectionTrigger = () => {
  const select = useSelectContext()
  const items = select.selectedItems as WindTableDirection[]
  return (
    <IconButton
      w="full"
      rounded="0"
      size="xs"
      maxH="6"
      bg="blue.800"
      {...select.getTriggerProps()}
    >
      {select.hasSelectedItems ? items[0].icon : <RiForbidLine />}
    </IconButton>
  )
}

function WindTableColumn({ hour }: WindTableColumnProps) {
  const [avg, setAvg] = useState("")
  const [gust, setGust] = useState("")
  const loading = Number.isNaN(hour)
  const hour_12 = ((Math.round(hour) + 11) % 12) + 1

  return (
    <Skeleton asChild loading={loading}>
      <Stack direction="column" align="flex-start" w="10" gap="0">
        <Stack bg="ui.main" color="white" w="full" gap="0">
          <Box textAlign="center">
            {loading ? "00" : hour_12.toString().padStart(2, "0")}
          </Box>
          <Box fontSize="xs" textAlign="center">
            {loading ? "XX" : hour < 13 ? "AM" : "PM"}{" "}
          </Box>
        </Stack>
        <Editable.Root
          key="average"
          defaultValue=""
          placeholder="avg"
          w="full"
          css={{
            background: cellBackgroundColor(avg),
          }}
          textAlign="center"
          justifyContent="center"
          value={avg}
          onValueChange={(e) => setAvg(e.value)}
        >
          <Editable.Preview />
          <Editable.Input rounded="0" />
        </Editable.Root>
        <Editable.Root
          key="gust"
          defaultValue=""
          placeholder="gust"
          w="full"
          css={{
            background: cellBackgroundColor(gust),
          }}
          textAlign="center"
          justifyContent="center"
          value={gust}
          onValueChange={(e) => setGust(e.value)}
        >
          <Editable.Preview />
          <Editable.Input rounded="0" />
        </Editable.Root>
        <Select.Root collection={directions} defaultValue={["N"]}>
          <Select.HiddenSelect />
          <Select.Control>
            <WindTableDirectionTrigger />
          </Select.Control>
          <Portal>
            <Select.Positioner>
              <Select.Content bg="blue.800" color="white" p="0" rounded="0">
                {directions.items.map((item) => (
                  <Select.Item
                    key={item.value}
                    item={item}
                    rounded="0"
                    justifyContent="center"
                    maxH="6"
                  >
                    {item.icon}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Portal>
        </Select.Root>
      </Stack>
    </Skeleton>
  )
}

export default WindTableColumn
