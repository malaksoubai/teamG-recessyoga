"use client"
import { useEffect, useState } from "react"
import { TeacherHomeHeader } from "@/components/home/teacher-home-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { trpc } from "@/lib/trpc/client"
import { ProfileSidebar } from "@/components/home/profile-sidebar";
// icons
import {Award } from 'lucide-react';

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
  const { data: profile } = trpc.profiles.getCurrentProfile.useQuery()
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

      <div className="flex gap-6 p-8 pt-4">
          <ProfileSidebar />
        
        {/* Main Card */}
        <div className="flex-1">
          <Card className="w-full h-fit">
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
    </div>
  )
}
