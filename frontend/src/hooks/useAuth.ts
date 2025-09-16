import { useMutation, useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"

import {
  AuthenticationService,
  type Body_authentication_login as LoginData,
  type ApiError,
  type UserPublic,
  UsersService,
} from "@/client"
import { handleError } from "@/utils"

const isLoggedIn = () => {
  return localStorage.getItem("access_token") !== null
}

const useAuth = () => {
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { data: user } = useQuery<UserPublic | null, Error>({
    queryKey: ["currentUser"],
    queryFn: UsersService.getMe,
    enabled: isLoggedIn(),
  })


  const login = async (data: LoginData) => {
    const response = await AuthenticationService.login({
      formData: data,
    })
    localStorage.setItem("access_token", response.access_token)
  }

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      navigate({ to: "/" })
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
  })

  const logout = () => {
    localStorage.removeItem("access_token")
    navigate({ to: "/login" })
  }

  return {
    loginMutation,
    logout,
    user,
    error,
    resetError: () => setError(null),
  }
}

export { isLoggedIn }
export default useAuth
