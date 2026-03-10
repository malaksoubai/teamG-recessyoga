"use client"

import { useForm } from "react-hook-form"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
// icons
import { User } from 'lucide-react';
import { Bell } from 'lucide-react';
import { Award } from 'lucide-react';


type FormData = {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

export default function ProfilePage() {
  const { register, handleSubmit } = useForm<FormData>({
    defaultValues: {
      firstName: "John",
      lastName: "Doe",
      email: "j@example.com",
    },
  })

  function onSubmit(data: FormData) {
    console.log(data)
  }

  return (
    <div className="flex gap-6 p-8 min-h-screen bg-[#F1F5F0]">

     {/* Sidebar */}
      <Card className="w-20 md:w-1/4 h-fit transition-all">
        <CardContent className="p-3 space-y-3 text-lg text-[color:var(--secondary-foreground)]">
         
          {/* personal info */}
          <Button variant="secondary" className="w-full justify-center md:justify-start gap-3 py-4 md:py-8 border-l-[var(--secondary-foreground)] border-l-2">
            <div className="flex items-center justify-center bg-[color:var(--secondary-foreground)] rounded-lg p-2">
              <User color="white" />
            </div>
            <div className="hidden md:flex flex-col items-start leading-tight min-w-0 flex-1">
              <span className="font-medium">Personal Info</span>
              <span className="text-xs text-muted-foreground text-wrap text-start">
                Update your account details
              </span>
            </div>
          </Button>

          {/* notifications */}
          <Button variant="ghost" className="w-full justify-center md:justify-start gap-3 py-4 md:py-8">
            <div className="flex items-center justify-center bg-[color:var(--secondary-foreground)] rounded-lg p-2">
              <Bell color="white" />
            </div>
            <div className="hidden md:flex flex-col items-start leading-tight">
              <span className="font-medium">Notifications</span>
              <span className="text-xs text-muted-foreground text-wrap text-start">
                Manage your preferences
              </span>
            </div>
          </Button>

          {/* specializations */}
          <Button variant="ghost" className="w-full justify-center md:justify-start gap-3 py-4 md:py-8" >
            <div className="flex items-center justify-center bg-[color:var(--secondary-foreground)] rounded-lg p-2">
              <Award color="white" />
            </div>
            <div className="hidden md:flex flex-col items-start leading-tight">
              <span className="font-medium">Specializations</span>
              <span className="text-xs text-muted-foreground text-wrap text-start">
                Update your qualifications
              </span>
            </div>
          </Button>

        </CardContent>
      </Card>

      {/* Main Card */}
      <Card className="flex-1 w-4xl">
        <CardHeader className="text-[color:var(--secondary-foreground)]">
          <CardTitle className="text-xl">Personal Information</CardTitle>
          <CardDescription>
            Update your account details and password
          </CardDescription>
          <Separator className="my-4" />
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Names */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="my-2">First Name</Label>
                <Input {...register("firstName")} />
              </div>

              <div>
                <Label className="my-2">Last Name</Label>
                <Input {...register("lastName")} />
              </div>
            </div>

            {/* Email */}
            <div>
              <Label className="my-2">Email Address</Label>
              <Input type="email" {...register("email")} />
            </div>

            <Separator className="my-4" />

            {/* Password Section */}
            <div className="space-y-4">
              <div className="text-[color:var(--secondary-foreground)]">
                <p className="text-base font-semibold">Change Password </p>
                <p>Leave blank to keep your current password</p>
              </div>
              

              <div>
                <Label className="my-2">New Password</Label>
                <Input
                  type="password"
                  placeholder="Minimum 6 characters"
                  {...register("password")}
                />
              </div>

              <div>
                <Label className="my-2">Confirm New Password</Label>
                <Input
                  type="password"
                  placeholder="Re-enter your password"
                  {...register("confirmPassword")}
                />
              </div>
            </div>

            <Button type="submit" className="w-full py-5">
              Save Changes
            </Button>

          </form>
        </CardContent>
      </Card>

    </div>
  )
}