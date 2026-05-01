"use client"

import { createContext, useContext, type ReactNode } from "react"

type GateValue = { isAdmin: boolean }

const UserProfileGateContext = createContext<GateValue | null>(null)

export function UserProfileGateProvider({
  isAdmin,
  children,
}: {
  isAdmin: boolean
  children: ReactNode
}) {
  return (
    <UserProfileGateContext.Provider value={{ isAdmin }}>
      {children}
    </UserProfileGateContext.Provider>
  )
}

export function useUserProfileGate(): GateValue {
  const ctx = useContext(UserProfileGateContext)
  if (!ctx) {
    throw new Error("useUserProfileGate must be used under UserProfileGateProvider")
  }
  return ctx
}
