"use client"
import { TeacherHomeHeader } from "@/components/home/teacher-home-header";
import { useForm } from "react-hook-form"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldContent,
  FieldTitle,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import React from "react"
// icons
import { User } from 'lucide-react';
import { Bell } from 'lucide-react';
import { Award } from 'lucide-react';
import { Mail } from 'lucide-react';
import { Phone } from 'lucide-react';


type FormData = {
  email: string
}
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
  const { register, handleSubmit } = useForm<FormData>({
    defaultValues: {
      email: "j@example.com",
    },
  })

  const [emailEnabled, setEmailEnabled] = React.useState(false)
  const [smsEnabled, setSmsEnabled] = React.useState(false)
  const [phone, setPhone] = React.useState("");
  function onSubmit(data: FormData) {
    console.log(data)
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F1F5F0]">
    
    <div className="p-8 pb-4 bg-[color:var(--background)]">
      <TeacherHomeHeader />
    </div>

    {/* Sidebar*/}
    <div className="flex gap-6 p-8 pt-4">
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
          <Button variant="secondary" className="w-full justify-center md:justify-start gap-3 py-4 md:py-8 border-l-[var(--secondary-foreground)] border-l-2">
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
          <Button variant="ghost" className="w-full justify-center md:justify-start gap-3 py-4 md:py-8" >
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
            <Bell color="var(--secondary-foreground)" size={30}/>
          </div>
          <div className="flex-col items-start leading-tight">
            <CardTitle className="text-xl">Notification Preferences</CardTitle>
            <CardDescription>Choose how you recieve substitution requests</CardDescription>
          </div>
        </CardHeader>

        <Separator className="mx-4 my-2" />
        
        <CardContent>

          <FieldGroup onSubmit={handleSubmit(onSubmit)} className="space-y-2">

          <FieldLabel
            className={`p-2 rounded-xl border transition-all ${
              emailEnabled
                ? "!border-[color:var(--secondary-foreground)] !bg-[color:var(--secondary)]"
                : "!border-gray-200 !bg-white"
            }`}
          >
              <Field orientation="horizontal">
                <div className="bg-[color:var(--secondary-foreground)] rounded-lg p-3">
                  <Mail color="white" />
                </div>

                <FieldContent className="px-4 flex-1">
                  <div className="hidden md:flex flex-col items-start leading-tight">
                    <FieldTitle>Email notifications</FieldTitle>
                    <FieldDescription>
                      Receive notifications at j@example.com
                    </FieldDescription>
                  </div>
                </FieldContent>

                <Checkbox
                  id="email-checkbox"
                  checked={emailEnabled}
                  onCheckedChange={(value) => setEmailEnabled(!!value)}
                />
              </Field>
            </FieldLabel>

            <FieldLabel
              className={`p-2 rounded-xl border transition-all ${
                smsEnabled
                  ? "!border-[color:var(--secondary-foreground)] !bg-[color:var(--secondary)]"
                  : "!border-gray-200 !bg-white"
              }`}
            >
                <Field orientation="horizontal">
                  <div className="bg-[color:var(--secondary-foreground)] rounded-lg p-3">
                    <Phone color="white" />
                  </div>

                  <FieldContent className="px-4 flex-1">
                    <div className="hidden md:flex flex-col items-start leading-tight">
                      <FieldTitle>Text Message (SMS)</FieldTitle>
                      <FieldDescription>
                        Get instant alerts via text message
                      </FieldDescription>
                    </div>
                  </FieldContent>

                  <Checkbox
                    id="sms-checkbox"
                    checked={smsEnabled}
                    onCheckedChange={(value) => setSmsEnabled(!!value)}
                  />
                </Field>

                {smsEnabled && (
                  <>
                    <Separator/>
                    <div className="pl-20 w-full">
                      <div className="flex gap-3 items-center w-full my-2">
                      <Input
                        id="form-phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        className="flex-1"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />                        
                      <Button
                    variant="destructive"
                    className="border-red-400"
                    onClick={() => setPhone("")}
                  >
                    Remove
                  </Button>
                      </div>

                      <div className="bg-green-100 text-green-700 w-full text-sm p-3 rounded-lg">
                        Phone number verified
                      </div>
                    </div>
                    
                  </>
                )}
            </FieldLabel>
          </FieldGroup>

          <Button type="submit" className="w-full py-5 hover:bg-(var:--accent-foreground) my-4">
            Save Changes
          </Button>

        </CardContent>
      </Card>
      </div>
    </div>
  )
}