import { Container, Heading, Text } from "@chakra-ui/react"
import { useMutation } from "@tanstack/react-query"
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import { type SubmitHandler, useForm } from "react-hook-form"
import { FiLock } from "react-icons/fi"

import {
  type ApiError,
  AuthenticationService,
  type ResetPassword as ResetPasswordType,
} from "@/client"
import { Button } from "@/components/ui/button"
import { PasswordInput } from "@/components/ui/password-input"
import { isLoggedIn } from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import { confirmPasswordRules, handleError, passwordRules } from "@/utils"

interface ResetPasswordForm extends ResetPasswordType {
  confirm_password: string
}

export const Route = createFileRoute("/reset-password")({
  component: ResetPassword,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({
        to: "/",
      })
    }
  },
})

function ResetPassword() {
  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      password: "",
    },
  })
  const { showSuccessToast } = useCustomToast()
  const navigate = useNavigate()

  const resetPassword = async (data: ResetPasswordType) => {
    const token = new URLSearchParams(window.location.search).get("token")
    if (!token) return
    await AuthenticationService.resetPassword({
      requestBody: { password: data.password, token: token },
    })
  }

  const mutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      showSuccessToast("Password updated successfully.")
      reset()
      navigate({ to: "/login" })
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
  })

  const onSubmit: SubmitHandler<ResetPasswordForm> = async (data) => {
    mutation.mutate(data)
  }

  return (
    <Container
      as="form"
      onSubmit={handleSubmit(onSubmit)}
      h="100vh"
      maxW="sm"
      alignItems="stretch"
      justifyContent="center"
      gap={4}
      centerContent
    >
      <Heading size="xl" color="ui.main" textAlign="center" mb={2}>
        Reset Password
      </Heading>
      <Text textAlign="center">
        Please enter your new password and confirm it to reset your password.
      </Text>
      <PasswordInput
        startElement={<FiLock />}
        type="password"
        errors={errors}
        {...register("password", passwordRules())}
        placeholder="New Password"
      />
      <PasswordInput
        startElement={<FiLock />}
        type="confirm_password"
        errors={errors}
        {...register("confirm_password", confirmPasswordRules(getValues))}
        placeholder="Confirm Password"
      />
      <Button variant="solid" type="submit">
        Reset Password
      </Button>
    </Container>
  )
}
