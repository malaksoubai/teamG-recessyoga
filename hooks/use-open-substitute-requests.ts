"use client"

import { useEffect, useState } from "react"

import type { SubstituteRequestCardData } from "@/lib/substitute-requests"

export type OpenSubstituteRequestsStatus = "loading" | "ready" | "error"

export function useOpenSubstituteRequests() {
  const [status, setStatus] = useState<OpenSubstituteRequestsStatus>("loading")
  const [items, setItems] = useState<SubstituteRequestCardData[]>([])

  useEffect(() => {
    let isMounted = true

    async function loadRequests() {
      try {
        const response = await fetch("/api/substitute-requests", {
          cache: "no-store",
        })
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`)
        }

        const data: SubstituteRequestCardData[] = await response.json()
        if (!isMounted) return
        setItems(data)
        setStatus("ready")
      } catch (error) {
        console.error("Failed to load open substitute requests:", error)
        if (!isMounted) return
        setItems([])
        setStatus("error")
      }
    }

    loadRequests()
    return () => {
      isMounted = false
    }
  }, [])

  const urgentCount = items.filter((r) => r.urgency?.kind === "urgent").length
  const openCount = items.length
  const pendingApprovalCount = items.filter((r) => r.needsApproval).length

  return { items, status, urgentCount, openCount, pendingApprovalCount }
}
