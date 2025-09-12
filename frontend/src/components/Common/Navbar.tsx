import { Flex, Image, useBreakpointValue } from "@chakra-ui/react"
import { Link } from "@tanstack/react-router"

// Logo font is Egyptian Slate Light
import Logo from "/assets/images/windjournal-logo.png"
import UserMenu from "./UserMenu"

function Navbar() {
  const display = useBreakpointValue({ base: "none", md: "flex" })

  return (
    <Flex
      display={display}
      justify="space-between"
      position="sticky"
      color="white"
      align="center"
      bg="bg.muted"
      w="100%"
      top={0}
      p={4}
    >
      <Link to="/">
        <Image src={Logo} alt="WindJournal" w="250px" maxW="2xs" px={2} mb={-2} />
      </Link>
      <Flex gap={2} alignItems="center">
        <UserMenu />
      </Flex>
    </Flex>
  )
}

export default Navbar
