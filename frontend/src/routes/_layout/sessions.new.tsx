import {
  Box,
  Button,
  Container,
  Field,
  HStack,
  Heading,
  Input,
  Portal,
  SegmentGroup,
  Select,
  Stack,
  Text,
  VStack,
  createListCollection,
} from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"
import { type Control, Controller, useForm, useWatch } from "react-hook-form"
import { GiHandOk, GiMineExplosion, GiTurtle } from "react-icons/gi"

import WindTable from "@/components/Common/WindTable"

export const Route = createFileRoute("/_layout/sessions/new")({
  component: NewSession,
})

interface NewSessionForm {
  date: string
  startTime: string
  endTime: string
  location: string
  sport: "windsurfing" | "wingfoiling"
  equipment: string
  powerLevel: "underpowered" | "wellpowered" | "overpowered"
}

function item(
  currentValue: string,
  value: string,
  label: string,
  icon: JSX.Element,
) {
  return {
    value,
    label: (
      <Box color={currentValue === value ? "white" : "black"}>
        <HStack>
          {icon}
          {label}
        </HStack>
      </Box>
    ),
  }
}

const sports = createListCollection({
  items: [
    { label: "Windsurfing", value: "windsurfing" },
    { label: "Wing Foiling", value: "wingfoiling" },
  ],
})

function WindTableWrapper({ control }: { control: Control<NewSessionForm> }) {
  const startTimeString = useWatch({ control, name: "startTime" })
  const endTimeString = useWatch({ control, name: "endTime" })

  const firstHour = Number.parseInt(startTimeString?.substring(0, 2))
  const lastHour = Number.parseInt(endTimeString?.substring(0, 2))

  return <WindTable firstHour={firstHour} lastHour={lastHour} />
}

function NewSession() {
  const now = new Date()

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<NewSessionForm>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      date: now.toLocaleDateString("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
      endTime: now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    },
  })

  return (
    <Container
      as="form"
      onSubmit={handleSubmit((data) => console.log(data))}
      maxW="full"
      pt={12}
      m={4}
    >
      <Heading size="2xl">Log a session</Heading>
      <Stack gap="4" pt={4} align="flex-start" maxW="lg">
        <Field.Root orientation="horizontal" required invalid={!!errors.date}>
          <Field.Label>Date</Field.Label>
          <Input type="date" {...register("date")} />
          <Field.ErrorText>{errors.date?.message}</Field.ErrorText>
        </Field.Root>
        <Field.Root
          orientation="horizontal"
          required
          invalid={!!errors.startTime}
        >
          <Field.Label>Start time</Field.Label>
          <Input type="time" {...register("startTime")} />
          <Field.ErrorText>{errors.startTime?.message}</Field.ErrorText>
        </Field.Root>
        <Field.Root
          orientation="horizontal"
          required
          invalid={!!errors.endTime}
        >
          <Field.Label>End time</Field.Label>
          <Input type="time" {...register("endTime")} />
          <Field.ErrorText>{errors.endTime?.message}</Field.ErrorText>
        </Field.Root>
        <Field.Root
          orientation="horizontal"
          required
          invalid={!!errors.location}
        >
          <Field.Label>Location</Field.Label>
          <Input {...register("location")} />
          <Field.ErrorText>{errors.location?.message}</Field.ErrorText>
        </Field.Root>
        <Field.Root orientation="horizontal" required invalid={!!errors.sport}>
          <Field.Label>Sport</Field.Label>
          <Controller
            control={control}
            name="sport"
            render={({ field }) => (
              <Select.Root
                name={field.name}
                value={field.value}
                onValueChange={({ value }) => field.onChange(value)}
                onInteractOutside={() => field.onBlur()}
                collection={sports}
              >
                <Select.HiddenSelect />
                <Select.Control>
                  <Select.Trigger>
                    <Select.ValueText placeholder="Select sport" />
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.Indicator />
                  </Select.IndicatorGroup>
                </Select.Control>
                <Portal>
                  <Select.Positioner>
                    <Select.Content>
                      {sports.items.map((sport) => (
                        <Select.Item item={sport} key={sport.value}>
                          {sport.label}
                          <Select.ItemIndicator />
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Portal>
              </Select.Root>
            )}
          />
          <Field.ErrorText>{errors.sport?.message}</Field.ErrorText>
        </Field.Root>
        <Field.Root
          orientation="horizontal"
          required
          invalid={!!errors.equipment}
        >
          <Field.Label>Equipment</Field.Label>
          <Input {...register("equipment")} />
          <Field.ErrorText>{errors.equipment?.message}</Field.ErrorText>
        </Field.Root>
        <Controller
          control={control}
          name="powerLevel"
          render={({ field }) => (
            <Field.Root
              justifyContent="flex-start"
              orientation="horizontal"
              required
              invalid={!!errors.powerLevel}
            >
              <Field.Label>Power</Field.Label>
              <SegmentGroup.Root
                name={field.name}
                onBlur={field.onBlur}
                onValueChange={({ value }) => field.onChange(value)}
                value={field.value}
              >
                <SegmentGroup.Indicator bg="ui.main" />
                <SegmentGroup.Items
                  items={[
                    item(
                      field.value,
                      "underpowered",
                      "Underpowered",
                      <GiTurtle />,
                    ),
                    item(
                      field.value,
                      "wellpowered",
                      "Well Powered",
                      <GiHandOk />,
                    ),
                    item(
                      field.value,
                      "overpowered",
                      "Overpowered",
                      <GiMineExplosion />,
                    ),
                  ]}
                />
              </SegmentGroup.Root>
              <Field.ErrorText>{errors.powerLevel?.message}</Field.ErrorText>
            </Field.Root>
          )}
        />
        <HStack gap="6">
          <VStack align="flex-start">
            <Text>Forecast (kts)</Text>
            <WindTableWrapper control={control} lastHour={15} />
          </VStack>
          <VStack align="flex-start">
            <Text>Actual (kts)</Text>
            <WindTableWrapper control={control} lastHour={15} />
          </VStack>
        </HStack>
        <Button type="submit">Done</Button>
      </Stack>
    </Container>
  )
}
