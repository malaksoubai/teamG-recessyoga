"use client"

import { useState } from "react"
import ClaimSubstituteModal from "@/components/claim-sub-model"
import RequestSubstituteModal from "@/components/request-sub-model"
import { Button } from "@/components/ui/button"


export default function Home() {
  const [claimOpen, setClaimOpen] = useState(false)
  const [requestOpen, setRequestOpen] = useState(false)

  return (
    <div className="p-20 flex flex-col items-center justify-center gap-4 h-screen">
      <h3 className="pb-10">TEST THESE NEW FEATURE COMPONENTS</h3>
      <div>
        <Button onClick={() => setRequestOpen(true)}>Open Request Modal</Button>
      </div>
      <div>
        <Button onClick={() => setClaimOpen(true)}>Open Claim Modal</Button>

        <RequestSubstituteModal open={requestOpen} onOpenChange={setRequestOpen} />
        <ClaimSubstituteModal
          open={claimOpen}
          onOpenChange={setClaimOpen}
          onClaim={() => setClaimOpen(false)}
          subRequest={{
            id: "1",
            requestedBy: "Sarah",
            date: "March 25, 2026",
            time: "9:00 AM - 10:00 AM",
            location: "Carrboro Studio",
            classType: "Vinyasa",
            teacherNotes: "Please arrive 10 mins early",
            urgency: "within-72h",
          }}
        />
      </div> 
    </div>
  )
}