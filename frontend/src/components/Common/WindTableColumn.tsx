import { Box, Editable, IconButton, Portal, Select, Skeleton, Stack, createListCollection, useSelectContext, useEditableContext } from "@chakra-ui/react"
import { ReactNode } from "react"
import { MdNorth, MdSouth, MdEast, MdWest } from "react-icons/md"
import { RiForbidLine } from "react-icons/ri"


interface WindTableColumnProps {
  hour: number
}

const directions = createListCollection({
  items: [
    { value: "N", icon: <MdNorth /> },
    { value: "E", icon: <MdEast /> },
    { value: "S", icon: <MdSouth /> },
    { value: "W", icon: <MdWest /> }
  ]
})

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
      bg="navy"
      {...select.getTriggerProps()}
    >
      {select.hasSelectedItems ? items[0].icon : <RiForbidLine />}
    </IconButton>
  )
}

function WindTableColumn({ hour }: WindTableColumnProps) {
  const loading=isNaN(hour)
  const hour_12 = (Math.round(hour) + 11) % 12 + 1

  return (
    <Skeleton asChild loading={loading}>
      <Stack direction="column" align="flex-start" w="10" gap="0">
        <Stack bg="ui.main" color="white" w="full" gap="0">
            <Box textAlign="center" >{loading ? "00" : hour_12.toString().padStart(2, "0")}</Box>
            <Box fontSize="xs" textAlign="center">{loading ? "XX" : (hour < 13 ? "AM" : "PM")} </Box>
        </Stack>
        <Editable.Root
          key="average"
          defaultValue=""
          placeholder="avg"
          w="full"
          bg="gray.100"
          textAlign="center"
          justifyContent="center"
        >
          <Editable.Preview />
          <Editable.Input rounded="0" />
        </Editable.Root>
        <Editable.Root
          key="gust"
          defaultValue=""
          placeholder="gust"
          w="full"
          bg="gray.100"
          textAlign="center"
          justifyContent="center"
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
              <Select.Content bg="navy" color="white" p="0" m="0" rounded="0">
                {directions.items.map((item) => (
                  <Select.Item key={item.value} item={item}>
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
