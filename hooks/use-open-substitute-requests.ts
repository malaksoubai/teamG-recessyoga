"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import type { SubstituteRequestCardData } from "@/lib/substitute-requests"

export type OpenSubstituteRequestsStatus = "loading" | "ready" | "error"

type LoadMode = "initial" | "silent"

export function useOpenSubstituteRequests() {
  const [status, setStatus] = useState<OpenSubstituteRequestsStatus>("loading")
  const [items, setItems] = useState<SubstituteRequestCardData[]>([])
  const isMountedRef = useRef(true)

  const loadRequests = useCallback(async (mode: LoadMode = "initial") => {
    if (mode === "initial") setStatus("loading")
    try {
      const response = await fetch("/api/substitute-requests", {
        cache: "no-store",
      })
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`)
      }

      const data: SubstituteRequestCardData[] = await response.json()
      if (!isMountedRef.current) return
      setItems(data)
      setStatus("ready")
    } catch (error) {
      console.error("Failed to load open substitute requests:", error)
      if (!isMountedRef.current) return
      if (mode === "initial") {
        setItems([])
        setStatus("error")
      }
    }
  }, [])

  useEffect(() => {
    isMountedRef.current = true
    void loadRequests("initial")
    return () => {
      isMountedRef.current = false
    }
  }, [loadRequests])

  const urgentCount = items.filter((r) => r.urgency?.kind === "urgent").length
  const openCount = items.length
  const pendingApprovalCount = items.filter((r) => r.needsApproval).length

  const refetch = useCallback(() => loadRequests("silent"), [loadRequests])

  return {
    items,
    status,
    urgentCount,
    openCount,
    pendingApprovalCount,
    refetch,
  }
}
