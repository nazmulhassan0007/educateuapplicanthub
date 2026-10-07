import type { Application, FormData, LibDoc, Notification, Profile, Thread } from "./types";

export interface HubState {
  profile: Profile;
  apps: Application[];
  threads: Thread[];
  notifications: Notification[];
  library: LibDoc[];
  seen: boolean;
}

const quals = [
  { id: "q1", name: "Access to HE Diploma (Health Professions)", grade: "Distinction", year: "2024" },
  { id: "q2", name: "GCSE English Language", grade: "5", year: "2009" },
  { id: "q3", name: "GCSE Mathematics", grade: "4", year: "2009" },
];

export const PROFILE: Profile = {
  firstName: "Amira",
  lastName: "Hussain",
  email: "amira.hussain@example.com",
  phone: "07700 900341",
  dob: "1991-03-12",
  address: "14 Marlowe Terrace, Leeds",
  postcode: "LS6 2QR",
  quals,
  education: "",
  emailAlerts: true,
};

export function blankForm(p: Profile): FormData {
  return {
    firstName: p.firstName,
    lastName: p.lastName,
    dob: p.dob,
    email: p.email,
    phone: p.phone,
    address: p.address,
    postcode: p.postcode,
    quals: p.quals.map((q) => ({ ...q })),
    statement: "",
    referees: [],
    docs: {},
    accurate: false,
    consent: false,
  };
}

const statementBusiness =
  "I have spent eleven years in retail management and now run a team of fourteen. Along the way I have learned how a shop floor really works, and I want the theory to back that up. Last year I finished an Access to HE Diploma while working full time, which taught me to plan my week around study. I am applying for Business Management because I want to move from managing rotas to shaping how a business is run. I am particularly interested in the operations and people modules. I would bring practical examples from my own workplace into seminars, and I am ready for the workload of a full-time degree. My family have never been to university, so for me this is both a personal goal and a chance to show my children what is possible. I am organised, I ask for help early, and I finish what I start.";
const statementHealth =
  "Since 2019 I have volunteered at a community care hub, helping older neighbours with shopping, appointments and company. That work showed me how much a calm, well-trained person can change someone's week. My Access to HE Diploma in Health Professions gave me the study habits I needed, and I would like to build on it with a foundation degree that fits around my job. I am drawn to the part-time pattern of the course and the placement hours it counts. I want to move into a support worker role and then towards a registered profession. I am reliable, I listen well, and I am comfortable with early starts and shift work. Studying one day a week suits my family life, and my employer has agreed to flexible hours.";

function form(statement: string, extra: Partial<FormData> = {}): FormData {
  return {
    ...blankForm(PROFILE),
    statement,
    accurate: true,
    consent: true,
    docs: { "Photo ID (passport or driving licence)": "Passport.pdf", "Proof of qualifications": "Access to HE certificate.pdf" },
    ...extra,
  };
}

const apps: Application[] = [
  {
    id: "a1",
    ref: "EU-27-0041",
    courseId: "bsc-business",
    intake: "Sep 2027",
    createdAt: "2026-09-02",
    updatedAt: "2026-10-06",
    stage: 4,
    stageDates: { 1: "2026-09-02", 2: "2026-09-09", 3: "2026-09-12", 4: "2026-10-06" },
    assigned: "Hannah Whitlock",
    offer: {
      type: "conditional",
      madeAt: "2026-10-06",
      deadline: "2026-10-30",
      conditions: [
        { id: "c1", text: "Complete your Access to HE Diploma with at least 45 credits at Distinction", status: "pending" },
        { id: "c2", text: "Send proof of GCSE English at grade 4 (C) or above", status: "met" },
      ],
    },
    tasks: [],
    references: [],
    docs: [
      { id: "ad1", name: "Passport.pdf", slot: "Photo ID (passport or driving licence)", addedAt: "2026-09-02" },
      { id: "ad2", name: "Access to HE certificate.pdf", slot: "Proof of qualifications", addedAt: "2026-09-02" },
      { id: "ad3", name: "Utility bill September.pdf", slot: "Proof of address", addedAt: "2026-09-03" },
    ],
    history: [
      { at: "2026-10-06T14:20", title: "Conditional offer made", note: "Respond by 30 Oct. Two conditions to meet." },
      { at: "2026-09-12T10:05", title: "Admission review started", note: "Your application is with the admissions team." },
      { at: "2026-09-09T16:41", title: "Application submitted", note: "Decision expected by 23 Sep." },
      { at: "2026-09-02T18:30", title: "Draft started", note: "You began your application." },
    ],
    form: form(statementBusiness),
    sectionsDone: ["about", "quals", "statement", "documents", "review"],
    submittedAt: "2026-09-09",
  },
  {
    id: "a2",
    ref: "EU-27-0042",
    courseId: "fda-health",
    intake: "Jan 2027",
    createdAt: "2026-09-28",
    updatedAt: "2026-10-06",
    stage: 3,
    stageDates: { 1: "2026-09-28", 2: "2026-10-06", 3: "2026-10-06" },
    decisionBy: "2026-10-14",
    assigned: "Sam Okafor",
    booking: {
      type: "Interview",
      at: "2026-10-21T10:00",
      format: "Online",
      where: "Link sent by email, opens 10 minutes early",
      bring: "Photo ID and your personal statement to hand",
      contact: "Sam Okafor, admissions team",
    },
    tasks: [
      {
        id: "t1",
        kind: "upload",
        title: "Upload proof of address",
        detail: "A utility bill or bank statement from the last three months, showing your name and address.",
        due: "2026-10-14",
        slot: "Proof of address",
      },
      {
        id: "t2",
        kind: "reference",
        title: "Your reference from Tom Ellery has not arrived",
        detail: "Send the request again, or upload a signed letter from him instead.",
        due: "2026-10-17",
      },
    ],
    references: [
      { id: "r1", name: "Diane Marsh", email: "diane.marsh@example.org", status: "Received", via: "email", lastSent: "2026-10-01" },
      { id: "r2", name: "Tom Ellery", email: "tom.ellery@example.org", status: "Not received", via: "email", lastSent: "2026-10-01" },
    ],
    docs: [
      { id: "ad4", name: "Passport.pdf", slot: "Photo ID (passport or driving licence)", addedAt: "2026-09-28" },
      { id: "ad5", name: "Access to HE certificate.pdf", slot: "Proof of qualifications", addedAt: "2026-09-28" },
      { id: "ad6", name: "CV Amira Hussain.pdf", slot: "CV", addedAt: "2026-09-28" },
    ],
    history: [
      { at: "2026-10-06T15:02", title: "Interview booked", note: "21 Oct, 10:00, online." },
      { at: "2026-10-06T11:15", title: "Admission review started", note: "Your application is with the admissions team." },
      { at: "2026-10-06T09:48", title: "Application submitted", note: "Decision expected by 14 Oct." },
      { at: "2026-09-28T19:12", title: "Draft started", note: "You began your application." },
    ],
    form: form(statementHealth, {
      referees: [
        { id: "rf1", name: "Diane Marsh", email: "diane.marsh@example.org", mode: "email" },
        { id: "rf2", name: "Tom Ellery", email: "tom.ellery@example.org", mode: "email" },
      ],
      docs: { "Photo ID (passport or driving licence)": "Passport.pdf", "Proof of qualifications": "Access to HE certificate.pdf", CV: "CV Amira Hussain.pdf" },
    }),
    sectionsDone: ["about", "quals", "statement", "references", "documents", "review"],
    submittedAt: "2026-10-06",
  },
  {
    id: "a3",
    ref: "EU-27-0043",
    courseId: "ba-early-years",
    intake: "Sep 2027",
    createdAt: "2026-10-04",
    updatedAt: "2026-10-05",
    stage: 1,
    stageDates: { 1: "2026-10-04" },
    tasks: [],
    references: [],
    docs: [],
    history: [{ at: "2026-10-04T20:14", title: "Draft started", note: "You began your application." }],
    form: { ...blankForm(PROFILE), statement: "I have always been the person friends ask to mind their children." },
    sectionsDone: ["about", "quals", "statement"],
  },
  {
    id: "a4",
    ref: "EU-27-0031",
    courseId: "ba-social-work",
    intake: "Sep 2027",
    createdAt: "2026-08-10",
    updatedAt: "2026-09-29",
    stage: 3,
    outcome: "unsuccessful",
    closedAt: "2026-09-29",
    stageDates: { 1: "2026-08-10", 2: "2026-08-18", 3: "2026-08-22" },
    assigned: "Imogen Barratt",
    tasks: [],
    references: [],
    docs: [],
    history: [
      { at: "2026-09-29T09:30", title: "Application closed", note: "Unfortunately, your application has not been successful on this occasion." },
      { at: "2026-08-22T10:00", title: "Admission review started", note: "Your application is with the admissions team." },
      { at: "2026-08-18T13:10", title: "Application submitted", note: "Decision expected by 15 Sep." },
    ],
    form: form(statementHealth),
    sectionsDone: ["about", "quals", "statement", "references", "documents", "review"],
    submittedAt: "2026-08-18",
  },
  {
    id: "a5",
    ref: "EU-27-0029",
    courseId: "found-social",
    intake: "Sep 2027",
    createdAt: "2026-08-02",
    updatedAt: "2026-09-04",
    stage: 2,
    outcome: "withdrawn",
    closedAt: "2026-09-04",
    stageDates: { 1: "2026-08-02", 2: "2026-08-05" },
    tasks: [],
    references: [],
    docs: [],
    history: [
      { at: "2026-09-04T17:22", title: "Withdrawn by you", note: "Reason given: chose a different course." },
      { at: "2026-08-05T12:40", title: "Application submitted", note: "Decision expected by 15 Aug." },
    ],
    form: form(statementBusiness),
    sectionsDone: ["about", "quals", "statement", "documents", "review"],
    submittedAt: "2026-08-05",
  },
];

const threads: Thread[] = [
  {
    id: "m1",
    appId: "a2",
    subject: "FdA Health & Social Care: your interview",
    unread: true,
    messages: [
      {
        id: "m1a",
        from: "team",
        who: "Sam Okafor, Admissions",
        at: "2026-10-06T15:04",
        text: "Hi Amira, your interview is booked for 21 Oct at 10:00 online. It lasts about 30 minutes. The joining link is in your email and on the Progress tab. Let me know if that time does not work.",
      },
    ],
  },
  {
    id: "m2",
    appId: "a2",
    subject: "Westmoor University: document request",
    unread: true,
    messages: [
      {
        id: "m2a",
        from: "team",
        who: "Sam Okafor, Admissions",
        at: "2026-10-06T15:10",
        text: "We need a recent proof of address before the interview. A utility bill or bank statement from the last three months is fine. You can add it from your Tasks tab.",
      },
    ],
  },
  {
    id: "m3",
    appId: "a1",
    subject: "BSc Business Management: your offer",
    unread: false,
    messages: [
      {
        id: "m3a",
        from: "team",
        who: "Hannah Whitlock, Admissions",
        at: "2026-10-06T14:22",
        text: "Congratulations Amira. We are pleased to offer you a place, subject to two conditions. You have until 30 Oct to respond. Ask me anything about the conditions.",
      },
      {
        id: "m3b",
        from: "you",
        who: "You",
        at: "2026-10-06T18:40",
        text: "Thank you! When will I know whether the second condition counts if my results arrive late in the summer?",
      },
    ],
  },
];

const notifications: Notification[] = [
  { id: "n1", at: "2026-10-06T15:10", text: "New message from Sam Okafor about FdA Health & Social Care", href: "/messages?thread=m2", read: false },
  { id: "n2", at: "2026-10-06T15:02", text: "Interview booked for 21 Oct, 10:00, online", href: "/applications/a2", read: false },
  { id: "n3", at: "2026-10-06T14:20", text: "You have an offer from Northbridge University. Respond by 30 Oct.", href: "/offers", read: false },
  { id: "n4", at: "2026-09-29T09:30", text: "Update on your application to Harcombe University", href: "/applications/a4", read: true },
];

const library: LibDoc[] = [
  { id: "l1", name: "Passport.pdf", kind: "Photo ID", size: "1.2 MB", addedAt: "2026-09-02" },
  { id: "l2", name: "Access to HE certificate.pdf", kind: "Qualification", size: "640 KB", addedAt: "2026-09-02" },
  { id: "l3", name: "Utility bill September.pdf", kind: "Proof of address", size: "310 KB", addedAt: "2026-09-03" },
  { id: "l4", name: "CV Amira Hussain.pdf", kind: "CV", size: "220 KB", addedAt: "2026-09-28" },
];

export function seedDefault(): HubState {
  return structuredClone({ profile: PROFILE, apps, threads, notifications, library, seen: true });
}

export function seedFirstVisit(): HubState {
  return {
    profile: { ...PROFILE, quals: [], education: "" },
    apps: [],
    threads: [],
    notifications: [],
    library: [],
    seen: false,
  };
}

/** Three offers at once: use this to test unconditional and main plus insurance choices. */
export function seedOffers(): HubState {
  const s = seedDefault();
  const a2 = s.apps.find((a) => a.id === "a2")!;
  a2.stage = 4;
  a2.stageDates[4] = "2026-10-07";
  a2.booking = undefined;
  a2.tasks = [];
  a2.decisionBy = undefined;
  a2.references = a2.references.map((r) => ({ ...r, status: "Received" as const }));
  a2.offer = {
    type: "conditional",
    madeAt: "2026-10-07",
    deadline: "2026-11-02",
    conditions: [
      { id: "c3", text: "Complete a 100 hour care placement before September", status: "pending" },
      { id: "c4", text: "Clear an enhanced DBS check", status: "pending" },
    ],
  };
  a2.updatedAt = "2026-10-07";
  a2.history.unshift({ at: "2026-10-07T08:30", title: "Conditional offer made", note: "Respond by 2 Nov. Two conditions to meet." });

  const a6: Application = {
    id: "a6",
    ref: "EU-27-0044",
    courseId: "bsc-computing",
    intake: "Sep 2027",
    createdAt: "2026-09-10",
    updatedAt: "2026-10-07",
    stage: 4,
    stageDates: { 1: "2026-09-10", 2: "2026-09-14", 3: "2026-09-18", 4: "2026-10-07" },
    assigned: "Priya Nandakumar",
    offer: { type: "unconditional", madeAt: "2026-10-07", deadline: "2026-11-03", conditions: [] },
    tasks: [],
    references: [],
    docs: [],
    history: [
      { at: "2026-10-07T08:50", title: "Unconditional offer made", note: "Respond by 3 Nov." },
      { at: "2026-09-14T11:00", title: "Application submitted", note: "Decision expected by 28 Sep." },
    ],
    form: form(statementBusiness),
    sectionsDone: ["about", "quals", "statement", "documents", "review"],
    submittedAt: "2026-09-14",
  };
  s.apps.unshift(a6);
  s.notifications.unshift(
    { id: "n9", at: "2026-10-07T08:50", text: "You have an offer from Harcombe University. Respond by 3 Nov.", href: "/offers", read: false },
    { id: "n8", at: "2026-10-07T08:30", text: "You have an offer from Westmoor University. Respond by 2 Nov.", href: "/offers", read: false },
  );
  return s;
}
