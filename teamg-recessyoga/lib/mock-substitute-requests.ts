export type UrgencyKind = "urgent" | "within72";

export type SubstituteRequestMock = {
  id: string;
  title: string;
  requestedBy: string;
  dateTime: string;
  location: string;
  borderTop: "urgent" | "standard";
  urgency?: {
    kind: UrgencyKind;
    label: string;
  };
  note?: string;
  needsApproval?: boolean;
  /** Short description after the fixed label "Class Type Change Requested" */
  classChangeSummary?: string;
};

export const MOCK_SUBSTITUTE_REQUESTS: SubstituteRequestMock[] = [
  {
    id: "1",
    title: "Vinyasa",
    requestedBy: "Sarah Johnson",
    dateTime: "Thu, Feb 12 at 6:00 PM",
    location: "Carrboro",
    borderTop: "urgent",
    urgency: {
      kind: "urgent",
      label: "URGENT - Less than 24 hours",
    },
    note: "Family emergency - need someone ASAP!",
  },
  {
    id: "2",
    title: "Yin",
    requestedBy: "Michael Chen",
    dateTime: "Fri, Feb 13 at 9:00 AM",
    location: "Durham",
    borderTop: "standard",
    urgency: {
      kind: "within72",
      label: "Within 72 hours",
    },
  },
  {
    id: "3",
    title: "Ashtanga",
    requestedBy: "Emily Rodriguez",
    dateTime: "Mon, Feb 9 at 5:30 PM",
    location: "Carrboro",
    borderTop: "urgent",
    urgency: {
      kind: "urgent",
      label: "URGENT - Less than 24 hours",
    },
    needsApproval: true,
    classChangeSummary: "Ashtanga → Vinyasa",
  },
];
