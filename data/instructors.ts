import { Instructor } from "@/services/notifications";

//hard coded until db gets connected
//then delete this

export const instructors: Instructor[] = [
  {
    name: "Ava",
    email: "ava@test.com",
    phone: "+15551234567",
    prefers: "sms",
    qualifiedClasses: ["vinyasa", "hatha"],
  },
  {
    name: "Mia",
    email: "mia@test.com",
    prefers: "email",
    qualifiedClasses: ["yin"],
  },
];