import {
  Box,
  Editable,
  IconButton,
  type ListCollection,
  Portal,
  Select,
  Skeleton,
  Stack,
  createListCollection,
  useSelectContext,
} from "@chakra-ui/react"
import type { ReactElement } from "react"
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

export interface WindValue {
  averageSpeedKts?: number
  gustSpeedKts?: number
  directionDegrees?: number
}

interface WindTableColumnProps {
  hour: number
  value: WindValue | null
  onValueChange: (hour: number, value: WindValue) => void
}

export function WindTableColumn({
  hour,
  value,
  onValueChange,
}: WindTableColumnProps) {
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
            background: cellBackgroundColor(
              value?.averageSpeedKts ?? Number.NaN,
            ),
          }}
          textAlign="center"
          justifyContent="center"
          value={value?.averageSpeedKts?.toString() ?? ""}
          onValueChange={(e) =>
            onValueChange(hour, {
              ...(value ?? {}),
              averageSpeedKts: Number.parseFloat(e.value),
            })
          }
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
            background: cellBackgroundColor(value?.gustSpeedKts ?? Number.NaN),
          }}
          textAlign="center"
          justifyContent="center"
          value={value?.gustSpeedKts?.toString() ?? ""}
          onValueChange={(e) =>
            onValueChange(hour, {
              ...(value ?? {}),
              gustSpeedKts: Number.parseFloat(e.value),
            })
          }
        >
          <Editable.Preview />
          <Editable.Input rounded="0" />
        </Editable.Root>
        <Select.Root
          collection={directions}
          defaultValue={["N"]}
          value={[degreesToDirection(value?.directionDegrees ?? 0)]}
          onValueChange={(e) =>
            onValueChange(hour, {
              ...(value ?? {}),
              directionDegrees: directionToDegrees(
                e.value[0] as CardinalDirection,
              ),
            })
          }
        >
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

type CardinalDirection = "N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW"

interface Direction {
  value: CardinalDirection
  icon: ReactElement
}

const directions: ListCollection<Direction> = createListCollection({
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

function degreesToDirection(degrees: number): CardinalDirection {
  return directions.items[Math.round((degrees % 360) / 45) % 8].value
}

function directionToDegrees(direction: CardinalDirection): number {
  return directions.items.findIndex(({ value }) => value === direction) * 45
}

function cellBackgroundColor(value: number) {
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

  const i = stops.findIndex((s) => value < s.max)
  const [c1, c2] = stops.slice(i - 1, i + 1)

  return !c1 || !c2
    ? "var(--chakra-colors-gray-100)"
    : `color-mix(in hsl decreasing hue, ${c1.color}, ${c2.color} ${
        ((value - c1.max) / (c2.max - c1.max)) * 100
      }%)`
}

const WindTableDirectionTrigger = () => {
  const select = useSelectContext()
  const selectedItems = select.selectedItems as Direction[]
  return (
    <IconButton
      w="full"
      rounded="0"
      size="xs"
      maxH="6"
      bg="blue.800"
      {...select.getTriggerProps()}
    >
      {select.hasSelectedItems ? selectedItems[0].icon : <RiForbidLine />}
    </IconButton>
  )
}
