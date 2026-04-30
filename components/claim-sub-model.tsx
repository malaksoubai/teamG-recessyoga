"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, MapPin, AlertCircle, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc/client";

type UrgencyLevel = "less-than-24h" | "within-72h" | "within-week" | "over-week";

interface SubRequest {
  id: string;
  requestedBy: string;
  date: string;
  time: string;
  location: string;
  classType: string;
  teacherNotes?: string;
  urgency: UrgencyLevel;
}

interface ClaimSubstituteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClaim: (classTypeOption: "maintain" | "change") => void;
  subRequest: SubRequest;
  onClaimed?: () => void;
}

const URGENCY_CONFIG: Record<UrgencyLevel, { label: string; color: string; icon: boolean }> = {
  "less-than-24h": { label: "URGENT - Less than 24 hours", color: "text-red-500", icon: true },
  "within-72h": { label: "Within 72 hours", color: "text-orange-500", icon: true },
  "within-week": { label: "Within 1 week", color: "text-yellow-600", icon: false },
  "over-week": { label: "Over 1 week", color: "text-gray-500", icon: false },
};

export default function ClaimSubstituteModal({
  open,
  onOpenChange,
  onClaim,
  subRequest,
  onClaimed,
}: ClaimSubstituteModalProps) {
  const { data: classTypes = [] } = trpc.coverageRequests.getClassTypes.useQuery();
  const claimRequest = trpc.coverageRequests.claimRequest.useMutation();

  const [classTypeOption, setClassTypeOption] = useState<"maintain" | "change">("maintain");
  const [newClassTypeId, setNewClassTypeId] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const urgency = URGENCY_CONFIG[subRequest.urgency];
  const isClassChange = classTypeOption === "change";

  const handleConfirm = async () => {
    setError(null);
    try {
      await claimRequest.mutateAsync({
        requestId: parseInt(subRequest.id),
        classTypeOption,
        newClassTypeId: isClassChange && newClassTypeId ? parseInt(newClassTypeId) : undefined,
        notes: notes || undefined,
      });
      onClaim(classTypeOption);
      onClaimed?.();
      handleCancel();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to claim request. Please try again.");
    }
  };

  const handleCancel = () => {
    setClassTypeOption("maintain");
    setNewClassTypeId("");
    setNotes("");
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Claim Substitute
          </DialogTitle>
        </DialogHeader>

        {/* Request Info */}
        <div className="space-y-1.5 pb-4 border-b border-gray-100">
          <p className="text-xs text-gray-400">Requested by {subRequest.requestedBy}</p>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>{subRequest.date} at {subRequest.time}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>{subRequest.location}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <AlertCircle className={`w-4 h-4 ${urgency.color}`} />
            <span className={`font-medium ${urgency.color}`}>{urgency.label}</span>
          </div>
        </div>

        {/* Teacher Notes */}
        {subRequest.teacherNotes && (
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs font-medium text-gray-500 mb-1">Notes from teacher:</p>
            <p className="text-sm text-gray-700 italic">&ldquo;{subRequest.teacherNotes}&rdquo;</p>
          </div>
        )}

        {/* Class Type Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Class Type</Label>

          {/* Option 1: Maintain */}
          <div
            onClick={() => setClassTypeOption("maintain")}
            className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
              classTypeOption === "maintain"
                ? "border-[#4a5e4a] bg-[#f4f7f4]"
                : "border-gray-100 bg-gray-50 hover:border-gray-200"
            }`}
          >
            <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
              classTypeOption === "maintain" ? "border-[#4a5e4a]" : "border-gray-300"
            }`}>
              {classTypeOption === "maintain" && (
                <div className="w-2 h-2 rounded-full bg-[#4a5e4a]" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">
                Maintain as {subRequest.classType}
              </p>
              <p className="text-xs text-gray-500">Keep the original class type</p>
            </div>
          </div>

          {/* Option 2: Change */}
          <div
            onClick={() => setClassTypeOption("change")}
            className={`flex flex-col gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
              classTypeOption === "change"
                ? "border-[#4a5e4a] bg-[#f4f7f4]"
                : "border-gray-100 bg-gray-50 hover:border-gray-200"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                classTypeOption === "change" ? "border-[#4a5e4a]" : "border-gray-300"
              }`}>
                {classTypeOption === "change" && (
                  <div className="w-2 h-2 rounded-full bg-[#4a5e4a]" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Request class type change</p>
                <p className="text-xs text-gray-500">Requires administrator approval</p>
              </div>
            </div>

            {isClassChange && (
              <div className="ml-7 space-y-2">
                <Select value={newClassTypeId} onValueChange={setNewClassTypeId}>
                  <SelectTrigger className="w-full bg-white border-gray-200 text-gray-500 text-sm">
                    <SelectValue placeholder="Select new class type" />
                  </SelectTrigger>
                  <SelectContent>
                    {classTypes.map((type) => (
                      <SelectItem key={type.id} value={String(type.id)}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg p-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    Your claim will be pending until an administrator approves the class type change.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <Label className="text-sm text-gray-700">Notes (Optional)</Label>
          <Textarea
            placeholder="Any additional information for the administrator or requesting teacher..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="bg-white border-gray-200 text-gray-700 resize-none min-h-[70px] text-sm"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-1">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={(isClassChange && !newClassTypeId) || claimRequest.isPending}
            className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg disabled:opacity-40"
          >
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            {claimRequest.isPending
              ? "Saving..."
              : isClassChange
              ? "Submit for Approval"
              : "Confirm Claim"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
