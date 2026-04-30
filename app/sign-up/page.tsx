"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createClient } from "@/lib/supabase/client";

const classTypes = [
    "Hatha",
    "Ashtanga",
    "Meditation",
    "Vinyasa",
    "Yin",
    "Restorative",
    "Beginner Yoga",
    "Somatic Flow",
    "Yoga Sculpt",
    "Core & Restore",
    "Core Barre",
    "Mat Pilates",
    "Strength & Conditioning"
];

// type NotificationPreference = "email" | "sms";
type NotificationPreference = "email";

export default function SignUpPage() {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2>(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [notificationPreference, setNotificationPreference] =
    useState<NotificationPreference>("email");
    // const [phoneNumber, setPhoneNumber] = useState("");
    const [selectedClassTypes, setSelectedClassTypes] = useState<string[]>([]);


    const canContinueToStep2 = useMemo(() => {
        if (!email || !password || !firstName || !lastName) return false;
        // if (notificationPreference === "sms" && !phoneNumber) return false;
        return true;
    },[email, password, firstName, lastName]);

    const toggleClassType = (type: string) => {
        setSelectedClassTypes((prev) =>
        prev.includes(type)
            ? prev.filter((item) => item !== type)
            : [...prev, type]
        );
    };

    // Called when "Continue" is clicked. It creates the Supabase auth account and attaches profile data as user metadata so the auth callback route can insert the profile after the user clicks the confirmation link in their email.
    const handleContinue = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const supabase = createClient();
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        firstName,
                        lastName,
                        // phone: notificationPreference === "sms" ? phoneNumber : null,
                        notificationPreference: "email",
                        selectedClassTypeNames: selectedClassTypes,
                    },
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
            setStep(2);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#eef1ec] px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center">
            <div className="w-full rounded-[28px] bg-[#eef1ec] px-3 py-4 sm:px-6 sm:py-6">
            <div className="mb-6 text-center sm:mb-8">
                <h1 className="text-3xl font-light text-[#78806f] sm:text-4xl">
                Recess Yoga Sign Up
                </h1>
                <p className="mt-2 text-xs text-[#7d837a] sm:text-sm">
                Request and claim substitution requests all in one place!
                </p>
            </div>

            <StepIndicator step={step} />

            <Card className="mx-auto mt-6 w-full max-w-2xl rounded-[24px] border-0 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.10)] sm:mt-8">
                <CardContent className="p-4 sm:p-6 md:p-8">
                {step === 1 ? (
                    <div className="space-y-4 sm:space-y-5">
                    <InputField
                        id="email"
                        label="Email Address"
                        placeholder="j@example.com"
                        value={email}
                        onChange={setEmail}
                        type="email"
                    />

                    <InputField
                        id="password"
                        label="Password"
                        placeholder="Minimum 8 characters"
                        value={password}
                        onChange={setPassword}
                        type="password"
                    />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <InputField
                        id="first-name"
                        label="First Name"
                        placeholder="Jane"
                        value={firstName}
                        onChange={setFirstName}
                        />
                        <InputField
                        id="last-name"
                        label="Last Name"
                        placeholder="Doe"
                        value={lastName}
                        onChange={setLastName}
                        />
                    </div>

                    {/* <div>
                        <Label className="mb-3 block text-sm font-medium text-[#4b5049]">
                        Preferred Notification Method
                        </Label>

                        <RadioGroup
                        value={notificationPreference}
                        onValueChange={(value) =>
                            setNotificationPreference(value as NotificationPreference)
                        }
                        className="flex flex-wrap gap-4 sm:gap-6"
                        >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="email" id="notification-email" />
                            <Label htmlFor="notification-email">Email</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="sms" id="notification-sms" />
                            <Label htmlFor="notification-sms">Text Message</Label>
                        </div>
                        </RadioGroup>
                    </div> */}

                    {/* {notificationPreference === "sms" && (
                        <InputField
                        id="phone-number"
                        label="Phone Number"
                        placeholder="123-456-7890"
                        value={phoneNumber}
                        onChange={setPhoneNumber}
                        type="tel"
                        />
                    )} */}

                    <div>
                        <Label className="mb-1 block text-sm font-medium text-[#4b5049]">
                        Class Types You Can Teach
                        </Label>
                        <p className="mb-3 text-sm text-[#7d837a]">
                        Select all that apply
                        </p>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {classTypes.map((type) => {
                            const selected = selectedClassTypes.includes(type);

                            return (
                            <Button
                                key={type}
                                type="button"
                                variant="outline"
                                onClick={() => toggleClassType(type)}
                                className={`flex min-h-[52px] w-full items-center justify-start gap-3 rounded-xl px-4 py-3 text-left whitespace-normal transition ${
                                selected
                                    ? "border-[#7e8774] bg-[#eef1ea] text-[#424840] hover:bg-[#eef1ea]"
                                    : "border-[#d8dcd5] bg-white text-[#555b53] hover:border-[#b9beb5] hover:bg-white"
                                }`}
                            >
                                <span
                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs ${
                                    selected
                                    ? "border-[#7e8774] bg-[#7e8774] text-white"
                                    : "border-[#cdd2ca] bg-white text-transparent"
                                }`}
                                >
                                <Check className="h-3.5 w-3.5" />
                                </span>
                                <span className="text-sm font-medium leading-snug">
                                {type}
                                </span>
                            </Button>
                            );
                        })}
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-red-500">{error}</p>
                    )}

                    <Button
                        type="button"
                        onClick={handleContinue}
                        disabled={!canContinueToStep2 || isLoading}
                        className="mt-2 h-12 w-full rounded-xl bg-black text-sm font-medium text-white hover:opacity-90"
                    >
                        {isLoading ? "Sending code..." : "Continue"}
                    </Button>

                    <p className="text-center text-sm text-[#7d837a]">
                        Already have an account?{" "}
                        <Link href="/login">
                             <Button
                        type="button"
                        variant="link"
                        className="h-auto p-0 font-medium text-[#4d5c49] underline underline-offset-2"
                        >
                        Sign in
                        </Button>
                        </Link>
                       
                    </p>
                    </div>
                ) : (
                    <div className="space-y-6 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eef1ea] text-3xl">
                            ✉️
                        </div>
                        <div>
                            <h2 className="text-lg font-medium text-[#4a5149]">
                                Check your email
                            </h2>
                            <p className="mt-2 text-sm text-[#7d837a]">
                                We sent a confirmation link to{" "}
                                <span className="font-medium text-[#4a5149]">{email}</span>.
                                Click the link to confirm your account — you will be
                                redirected automatically.
                            </p>
                        </div>
                        <p className="text-xs text-[#9b9f98]">
                            Didn&apos;t get it? Check your spam folder or{" "}
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="underline underline-offset-2 text-[#4d5c49]"
                            >
                                go back
                            </button>{" "}
                            to try again.
                        </p>
                    </div>
                )}
                </CardContent>
            </Card>
            </div>
        </div>
        </main>
    );
    }

    function StepIndicator({ step }: { step: 1 | 2 }) {
    return (
        <div className="flex items-center justify-center gap-3 sm:gap-5">
        <div className="flex flex-col items-center gap-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#7f8777] text-white sm:h-16 sm:w-16">
            <User className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <span className="text-sm text-[#76806f] sm:text-lg">
            Account Details
            </span>
        </div>

        <div className="h-[2px] w-10 bg-[#b8beb5] sm:w-14" />

        <div className="flex flex-col items-center gap-2">
            <div
            className={`flex h-14 w-14 items-center justify-center rounded-full sm:h-16 sm:w-16 ${
                step === 2
                ? "bg-[#7f8777] text-white"
                : "border border-[#d8ddd6] bg-white text-[#7f8777]"
            }`}
            >
            <Check className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <span className="text-sm text-[#76806f] sm:text-lg">Verification</span>
        </div>
        </div>
    );
    }

    function InputField({
        id,
        label,
        placeholder,
        value,
        onChange,
        type = "text"
    }: {
        id: string;
        label: string;
        placeholder: string;
        value: string;
        onChange: (value: string) => void;
        type?: string;
    }) {
    return (
        <div>
        <Label
            htmlFor={id}
            className="mb-2 block text-sm font-medium text-[#4b5049]"
        >
            {label}
        </Label>
        <Input
            id={id}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="h-12 border-[#d9ddd7] text-sm placeholder:text-[#a6aca3] focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        </div>
    );
    }

    function VerificationCard({
        title,
        subtitle,
        verified,
        children
    }: {
        title: string;
        subtitle: string;
        verified: boolean;
        children: React.ReactNode;
    }) {
    return (
        <Card className="rounded-2xl border border-[#d8ddd6] shadow-none">
            <CardContent className="p-4">
                <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                        <h3 className="text-sm font-semibold text-[#4a5149] sm:text-base">
                            {title}
                        </h3>
                        <p className="mt-1 text-xs text-[#7f857d] sm:text-sm">{subtitle}</p>
                    </div>

                        <div
                            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                            verified
                                ? "bg-[#e8efe5] text-[#50614a]"
                                : "bg-[#f3f4f2] text-[#7c817a]"
                            }`}
                        >
                            {verified ? "Verified" : "Pending"}
                    </div>
                </div>
                {children}
            </CardContent>
        </Card>
    );
}