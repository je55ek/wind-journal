import { Box, Button, Container, Heading, Text } from "@chakra-ui/react"
import { Link, createFileRoute } from "@tanstack/react-router"

import useAuth from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout/")({
  component: Dashboard,
})

function Dashboard() {
  const { user: currentUser } = useAuth()

  return (
    <>
      <Container maxW="full">
        <Box pt={12} m={4}>
          <Heading size="2xl">Hi, {currentUser?.name} 👋🏼</Heading>
          <Text>Welcome back, nice to see you again!</Text>
          <Link to="/sessions/new">
            <Button mt={4} colorScheme="blue">
              New Session
            </Button>
          </Link>
        </Box>
      </Container>
    </>
  )
}
