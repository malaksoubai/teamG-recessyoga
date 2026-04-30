"use client"
import { useEffect, useState } from "react"
import { TeacherHomeHeader } from "@/components/home/teacher-home-header";
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
import { ProfileSidebar } from "@/components/home/profile-sidebar";
import { trpc } from "@/lib/trpc/client"
// icons
import {Bell, Mail, Phone } from 'lucide-react';


export default function NotificationPage() {
  const { data: profile, isLoading } = trpc.profiles.getCurrentProfile.useQuery();
  const updateNotificationPreference = trpc.profiles.updateNotificationPreference.useMutation();
  const utils = trpc.useUtils();
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [phone, setPhone] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      const pref = profile.notificationPreference;
      setEmailEnabled(pref === "email");
      setSmsEnabled(pref === "sms");
      setPhone(profile.phone ?? "");
    }
  }, [profile]);

  const handleSave = async () => {
    setSaveError(null);
    setSaveSuccess(false);

    const preference = smsEnabled ? "sms" : "email";

    if (smsEnabled && !phone.trim()) {
      setSaveError("Please enter a phone number for SMS notifications.");
      return;
    }

    try {
      await updateNotificationPreference.mutateAsync({
        notificationPreference: preference,
        phone: smsEnabled ? phone.trim() : null,
      });

      await utils.profiles.getCurrentProfile.invalidate();
      setSaveSuccess(true);
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : "Failed to save changes.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F1F5F0]">

      <div className="p-8 pb-4 bg-[color:var(--background)]">
        <TeacherHomeHeader />
      </div>

      <div className="flex gap-6 p-8 pt-4">
        <ProfileSidebar />
        
        {/* Main Card */}
        <div className="flex-1">
          <Card className="w-full h-fit">
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
              {isLoading ? (
                <p className="text-sm text-muted-foreground py-4">Loading...</p>
              ) : (
              <FieldGroup className="space-y-2">

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
                        <FieldDescription> Receive notifications at {profile?.email}</FieldDescription>
                      </div>
                    </FieldContent>

                    <Checkbox
                      checked={emailEnabled}
                      onCheckedChange={(value) => {
                        const v = !!value;
                        setEmailEnabled(v);
                        if (v) setSmsEnabled(false);
                      }}
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
                        checked={smsEnabled}
                        onCheckedChange={(value) => {
                          const v = !!value;
                          setSmsEnabled(v);
                          if (v) setEmailEnabled(false);
                        }}
                      />
                    </Field>

                    {smsEnabled && (
                      <>
                        <Separator/>
                        <div className="pl-20 w-full">
                          <div className="flex gap-3 items-center w-full my-2">
                          <Input
                            type="tel"
                            placeholder="+1 (555) 123-4567"
                            className="flex-1"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            className="border-red-400"
                            onClick={() => setPhone("")}
                          >
                            Remove
                          </Button>
                          </div>
                        </div>
                      </>
                    )}
                </FieldLabel>

                {saveError && <p className="text-sm text-red-500">{saveError}</p>}
                {saveSuccess && <p className="text-sm text-green-600">Changes saved!</p>}

                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={updateNotificationPreference.isPending}
                  className="w-full py-5 hover:bg-(var:--accent-foreground) my-4"
                >
                  {updateNotificationPreference.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </FieldGroup>
              )}

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
