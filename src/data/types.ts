export type Stage = 1 | 2 | 3 | 4 | 5;
export type Outcome = "withdrawn" | "unsuccessful" | "declined" | "expired";
export type Level = "Diploma" | "Foundation" | "Undergraduate" | "Postgraduate";

export interface EligibilityQ {
  q: string;
  answer: "yes" | "no";
  why: string;
}

export interface Course {
  id: string;
  title: string;
  level: Level;
  subject: string;
  institution: string;
  mode: "Full-time" | "Part-time" | "Online";
  location: string;
  intakes: string[];
  fees: string;
  instalment?: string;
  entry: string[];
  overview: string;
  interview?: "interview" | "assessment" | "both";
  references: number;
  turnaroundDays: number;
  startDates: Record<string, string>;
  docs: string[];
  eligibility: EligibilityQ[];
  extra?: CourseExtra;
  image?: string;
}

export interface CourseExtra {
  credits: number;
  durations: string;
  who: string;
  units: string[];
  optionalUnits?: string[];
  careers: string[];
  plans: string[];
  url: string;
}

export interface Condition {
  id: string;
  text: string;
  status: "pending" | "met";
}
export interface Offer {
  type: "conditional" | "unconditional";
  conditions: Condition[];
  deadline: string;
  response?: "main" | "insurance" | "firm";
  madeAt: string;
}
export interface Task {
  id: string;
  kind: "upload" | "reference" | "insurance";
  title: string;
  detail: string;
  due: string;
  done?: boolean;
  doneAt?: string;
  slot?: string;
}
export interface Referee {
  id: string;
  name: string;
  email: string;
  status: "Requested" | "Received" | "Not received";
  via: "email" | "letter";
  lastSent?: string;
}
export interface AppDoc {
  id: string;
  name: string;
  slot: string;
  addedAt: string;
}
export interface HistoryItem {
  at: string;
  title: string;
  note: string;
}
export interface Booking {
  type: "Interview" | "Assessment";
  at: string;
  format: "In person" | "Online" | "Phone";
  where: string;
  bring: string;
  contact: string;
}
export interface FormData {
  firstName: string;
  lastName: string;
  dob: string;
  email: string;
  phone: string;
  address: string;
  postcode: string;
  quals: { id: string; name: string; grade: string; year: string }[];
  statement: string;
  referees: { id: string; name: string; email: string; mode: "email" | "letter" }[];
  docs: Record<string, string | null>;
  accurate: boolean;
  consent: boolean;
}
export type SectionKey = "about" | "quals" | "statement" | "references" | "documents" | "review";

export interface Application {
  id: string;
  ref: string;
  courseId: string;
  intake: string;
  createdAt: string;
  updatedAt: string;
  stage: Stage;
  outcome?: Outcome;
  closedAt?: string;
  stageDates: Partial<Record<Stage, string>>;
  decisionBy?: string;
  assigned?: string;
  booking?: Booking;
  offer?: Offer;
  tasks: Task[];
  references: Referee[];
  docs: AppDoc[];
  history: HistoryItem[];
  form: FormData;
  sectionsDone: SectionKey[];
  submittedAt?: string;
}

export interface Message {
  id: string;
  from: "you" | "team";
  who: string;
  at: string;
  text: string;
}
export interface Thread {
  id: string;
  appId?: string;
  subject: string;
  unread: boolean;
  messages: Message[];
}
export interface Notification {
  id: string;
  at: string;
  text: string;
  href: string;
  read: boolean;
}
export interface LibDoc {
  id: string;
  name: string;
  kind: string;
  size: string;
  addedAt: string;
}
export interface Profile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  address: string;
  postcode: string;
  quals: { id: string; name: string; grade: string; year: string }[];
  education: string;
  emailAlerts: boolean;
}
