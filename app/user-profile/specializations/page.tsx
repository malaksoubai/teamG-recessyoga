"use client"
import { useEffect, useState } from "react"
import { TeacherHomeHeader } from "@/components/home/teacher-home-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { trpc } from "@/lib/trpc/client"
// icons
import { User } from 'lucide-react';
import { Bell } from 'lucide-react';
import { Award } from 'lucide-react';

const ALL_YOGA_STYLES = [
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
  "Yin",
  "Yoga Sculpt",
];

export default function SpecializationsPage() {
  const { data: qualifications, isLoading } = trpc.profiles.getMyQualifications.useQuery();
  const updateQualifications = trpc.profiles.updateQualifications.useMutation();

  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (qualifications) {
      setSelectedStyles(qualifications);
    }
  }, [qualifications]);

  const toggleStyle = (style: string) => {
    setSelectedStyles((prev) =>
      prev.includes(style)
        ? prev.filter((s) => s !== style)
        : [...prev, style]
    );
  };

  const utils = trpc.useUtils();

const handleSave = async () => {
  setSaveError(null);
  setSaveSuccess(false);

  try {
    await updateQualifications.mutateAsync({
      classTypeNames: selectedStyles,
    });

    await utils.profiles.getMyQualifications.invalidate();

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
            <CardDescription>Select the styles you&apos;re qualified to teach</CardDescription>
          </div>
        </CardHeader>

        <Separator className="mx-4 my-2" />

        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground py-4">Loading...</p>
          ) : (
            <>
            <div className="grid grid-cols-2 gap-4">
                {ALL_YOGA_STYLES.map((style) => {
                    const checked = selectedStyles.some(
                      (s) => s.trim().toLowerCase() === style.trim().toLowerCase()
                    );

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

            {saveError && <p className="text-sm text-red-500 mt-2">{saveError}</p>}
            {saveSuccess && <p className="text-sm text-green-600 mt-2">Changes saved!</p>}

            <Button
              type="button"
              onClick={handleSave}
              disabled={updateQualifications.isPending}
              className="w-full py-5 hover:bg-(var:--accent-foreground) my-4"
            >
              {updateQualifications.isPending ? "Saving..." : "Save Changes"}
            </Button>
            </>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
