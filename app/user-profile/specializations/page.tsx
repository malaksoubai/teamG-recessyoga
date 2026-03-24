"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import React from "react"
// icons
import { User } from 'lucide-react';
import { Bell } from 'lucide-react';
import { Award } from 'lucide-react';

export function Example() {
  const [checked, setChecked] = React.useState(false)
 
  return (
    <Checkbox
      checked={checked}
      onCheckedChange={(value) => setChecked(value === true)}
    />
  )
}
export default function NotificationPage() {
  const yogaStyles = [
    "Ashtanga",
    "Beginner Yoga",
    "Core Barre",
    "Core & Restore",
    "Hatha",
    "Mat Pilates",
    "Meditation",
    "Restorative",
    "Somatic Flow",
    "Strength & Conditioning",
    "Vinyasa",
    "Yin ",
    "Yoga Sculpt"
  ];
  const [selectedStyles, setSelectedStyles] = React.useState<string[]>([]);  const toggleStyle = (style: string) => {
    setSelectedStyles((prev) =>
      prev.includes(style)
        ? prev.filter((s) => s !== style)
        : [...prev, style]
    );
  };

  function onSubmit(data: FormData) {
    console.log(data)
  }

  return (
    <div className="flex gap-6 p-8 min-h-screen bg-[#F1F5F0]">

     {/* Sidebar */}
      <Card className="w-20 md:w-1/4 h-fit transition-all">
        <CardContent className="p-3 space-y-3 text-lg text-[color:var(--secondary-foreground)]">
         
          {/* personal info */}
          <Button variant="ghost" className="w-full justify-center md:justify-start gap-3 py-4 md:py-8">
            <Link href="/user-profile/profile-details" className="flex w-full items-center gap-3">
                <div className="flex items-center justify-center bg-[color:var(--secondary-foreground)] rounded-lg p-2">
                <User color="white" />
                </div>
                <div className="hidden md:flex flex-col items-start leading-tight min-w-0 flex-1">
                <span className="font-medium">Personal Info</span>
                <span className="text-xs text-muted-foreground text-wrap text-start">
                    Update your account details
                </span>
                </div>
            </Link>
          </Button>

          {/* notifications */}
          <Button variant="ghost" className="w-full justify-center md:justify-start gap-3 py-4 md:py-8" >
            <Link href="/user-profile/notifications" className="flex w-full items-center gap-3">
                <div className="flex items-center justify-center bg-[color:var(--secondary-foreground)] rounded-lg p-2">
                <Bell color="white" />
                </div>
                <div className="hidden md:flex flex-col items-start leading-tight">
                <span className="font-medium">Notifications</span>
                <span className="text-xs text-muted-foreground text-wrap text-start">
                    Manage your preferences
                </span>
                </div>
            </Link>
          </Button>

          {/* specializations */}
          <Button variant="secondary" className="w-full justify-center md:justify-start gap-3 py-4 md:py-8 border-l-[var(--secondary-foreground)] border-l-2">
            <Link href="/user-profile/specializations" className="flex w-full items-center gap-3">
              <div className="flex items-center justify-center bg-[color:var(--secondary-foreground)] rounded-lg p-2">
                <Award color="white" />
              </div>
              <div className="hidden md:flex flex-col items-start leading-tight">
                <span className="font-medium">Specializations</span>
                <span className="text-xs text-muted-foreground text-wrap text-start">
                  Update your qualifications
                </span>
              </div>
            </Link>
          </Button>

        </CardContent>
      </Card>

      {/* Main Card */}
      <Card className="flex-1 w-4xl h-fit">
        <CardHeader className="text-[color:var(--secondary-foreground)] flex gap-4 w-full justify-center md:justify-start">
        <div className="flex items-center justify-center bg-[color:var(--secondary)] aspect-square rounded-lg p-3">
            <Award color="var(--secondary-foreground)" size={30}/>
          </div>
          <div className="flex-col items-start leading-tight">
            <CardTitle className="text-xl">Yoga Specializations</CardTitle>
            <CardDescription>Select the styles you're qualified to teach</CardDescription>
          </div>
        </CardHeader>

        <Separator className="mx-4 my-2" />
        
        <CardContent>
            <div className="grid grid-cols-2 gap-4">
                {yogaStyles.map((style) => {
                    const checked = selectedStyles.includes(style);

                    return (
                    <Label key={style}
                        className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all
                        ${checked
                            ? "!border-[color:var(--secondary-foreground)] !bg-[color:var(--secondary)]"
                            : "!border-gray-200 !bg-white"}
                        `}>
                        <span className="font-medium">{style}</span>

                        <Checkbox checked={checked}
                            onCheckedChange={() => toggleStyle(style)}
                        />
                    </Label>
                    );
                })}
            </div>
            <div className="mt-6 rounded-xl border p-4 text-sm text-muted-foreground text-center">
                {selectedStyles.length} styles selected
            </div>
          <Button type="submit" className="w-full py-5 hover:bg-(var:--accent-foreground) my-4">
            Save Changes
          </Button>

        </CardContent>
      </Card>

    </div>
  )
}