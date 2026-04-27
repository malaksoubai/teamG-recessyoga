"use client"
import { supabase } from '@/lib/supabaseClient'
import { useEffect } from "react"
import { TeacherHomeHeader } from "@/components/home/teacher-home-header";
import { useForm } from "react-hook-form"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
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
  const { register, handleSubmit, reset } = useForm<FormData>()

  async function onSubmit(data: FormData) {
    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user

    if (!user) return
    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
      })
      .eq('id', user.id)
  
    if (error) {
      console.error("Update failed:", error)
    } else {
      alert("Profile updated successfully!")
    }
  }

  useEffect(() => { loadProfile()}, [])

  async function loadProfile() {
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData?.user) {
      console.error("No user found")
      return
    }

    const user = userData.user
    const { data, error } = await supabase
      .from('profiles')
      .select('first_name, last_name, email')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error("Error loading profile:", error)
      return
    }

    reset({
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
    })
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
          <Button variant="secondary" className="w-full justify-center md:justify-start gap-3 py-4 md:py-8 border-l-[var(--secondary-foreground)] border-l-2">
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
          <Button variant="ghost" className="w-full justify-center md:justify-start gap-3 py-4 md:py-8">
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
              <User color="var(--secondary-foreground)" size={30}/>
            </div>
            <div className="flex-col items-start leading-tight">
              <CardTitle className="text-xl">Personal Information</CardTitle>
              <CardDescription>Update your account details and password</CardDescription>
            </div>
        </CardHeader>

        <Separator className="mx-4 my-2" />
        
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
            <div className="space-y-6">
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

            <Button type="submit" className="w-full py-5 hover:bg-(var:--accent-foreground) my-4">
              Save Changes
            </Button>

          </form>
        </CardContent>
      </Card>
</div>
    </div>
  )
}