import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01FreeIcons,
  Alert02FreeIcons,
  AlertCircleFreeIcons,
  Archive01FreeIcons,
  ArrowDown01FreeIcons,
  ArrowLeft02FreeIcons,
  ArrowRight02FreeIcons,
  ArrowUpRight01FreeIcons,
  Calendar01FreeIcons,
  Calendar02FreeIcons,
  Calendar03FreeIcons,
  Camera01FreeIcons,
  Cancel01FreeIcons,
  CancelCircleFreeIcons,
  Chat01FreeIcons,
  CheckListFreeIcons,
  CheckmarkCircle02FreeIcons,
  ClipboardCheckFreeIcons,
  Clock01FreeIcons,
  Globe02FreeIcons,
  CustomerSupportFreeIcons,
  DashboardSquare01FreeIcons,
  Delete02FreeIcons,
  Download01FreeIcons,
  File01FreeIcons,
  FileEditFreeIcons,
  FloppyDiskFreeIcons,
  Folder02FreeIcons,
  GiftFreeIcons,
  GraduationCapFreeIcons,
  Image01FreeIcons,
  InformationCircleFreeIcons,
  Loading03FreeIcons,
  Location01FreeIcons,
  LockFreeIcons,
  Login01FreeIcons,
  Logout01FreeIcons,
  Mail01FreeIcons,
  Mail02FreeIcons,
  Message01FreeIcons,
  Message02FreeIcons,
  MessageAdd01FreeIcons,
  Notification01FreeIcons,
  Notification02FreeIcons,
  PencilEdit01FreeIcons,
  PoundCircleFreeIcons,
  Search01FreeIcons,
  SearchAlertFreeIcons,
  SentFreeIcons,
  ShieldCheckFreeIcons,
  SlidersHorizontalFreeIcons,
  Task02FreeIcons,
  Tick02FreeIcons,
  Upload01FreeIcons,
  UserCircleFreeIcons,
  UsersFreeIcons,
  Video01FreeIcons,
  WifiDisconnected01FreeIcons,
} from "@hugeicons/core-free-icons";
import type { SVGProps } from "react";

type IconData = Parameters<typeof HugeiconsIcon>[0]["icon"];
type P = Omit<SVGProps<SVGSVGElement>, "ref" | "stroke"> & { strokeWidth?: number | string };

/** Hugeicons (stroke, rounded) behind the same names the app already uses. Stroke is 1.75 so icons sit well next to Manrope. */
function make(icon: IconData, base = 1.75) {
  return function Icon({ strokeWidth, className, ...p }: P) {
    const sw = strokeWidth === undefined ? base : Number(strokeWidth) >= 3 ? 2.6 : Number(strokeWidth);
    return <HugeiconsIcon icon={icon} strokeWidth={sw} className={className} {...(p as object)} />;
  };
}

export const AlertCircle = make(AlertCircleFreeIcons);
export const Archive = make(Archive01FreeIcons);
export const ArrowLeft = make(ArrowLeft02FreeIcons);
export const ArrowRight = make(ArrowRight02FreeIcons);
export const ArrowUpRight = make(ArrowUpRight01FreeIcons);
export const BadgePoundSterling = make(PoundCircleFreeIcons);
export const Bell = make(Notification01FreeIcons);
export const BellRing = make(Notification02FreeIcons);
export const Calendar = make(Calendar03FreeIcons);
export const CalendarClock = make(Calendar02FreeIcons);
export const CalendarDays = make(Calendar01FreeIcons);
export const Camera = make(Camera01FreeIcons);
export const Check = make(Tick02FreeIcons);
export const CheckCircle2 = make(CheckmarkCircle02FreeIcons);
export const ChevronDown = make(ArrowDown01FreeIcons);
export const ClipboardCheck = make(ClipboardCheckFreeIcons);
export const ClipboardList = make(Task02FreeIcons);
export const Clock = make(Clock01FreeIcons);
export const Compass = make(Globe02FreeIcons);
export const Download = make(Download01FreeIcons);
export const FileImage = make(Image01FreeIcons);
export const FilePen = make(FileEditFreeIcons);
export const FileText = make(File01FreeIcons);
export const FileUp = make(Upload01FreeIcons);
export const FolderOpen = make(Folder02FreeIcons);
export const Gift = make(GiftFreeIcons);
export const GraduationCap = make(GraduationCapFreeIcons);
export const Info = make(InformationCircleFreeIcons);
export const LayoutDashboard = make(DashboardSquare01FreeIcons);
export const LifeBuoy = make(CustomerSupportFreeIcons);
export const ListChecks = make(CheckListFreeIcons);
export const Loader2 = make(Loading03FreeIcons);
export const Lock = make(LockFreeIcons);
export const LogIn = make(Login01FreeIcons);
export const LogOut = make(Logout01FreeIcons);
export const Mail = make(Mail01FreeIcons);
export const MailCheck = make(Mail02FreeIcons);
export const MapPin = make(Location01FreeIcons);
export const MessageCircle = make(Chat01FreeIcons);
export const MessageSquare = make(Message01FreeIcons);
export const MessageSquarePlus = make(MessageAdd01FreeIcons);
export const MessagesSquare = make(Message02FreeIcons);
export const Pencil = make(PencilEdit01FreeIcons);
export const Plus = make(Add01FreeIcons);
export const Save = make(FloppyDiskFreeIcons);
export const Search = make(Search01FreeIcons);
export const SearchX = make(SearchAlertFreeIcons);
export const Send = make(SentFreeIcons);
export const ShieldCheck = make(ShieldCheckFreeIcons);
export const SlidersHorizontal = make(SlidersHorizontalFreeIcons);
export const Trash2 = make(Delete02FreeIcons);
export const TriangleAlert = make(Alert02FreeIcons);
export const Upload = make(Upload01FreeIcons);
export const UserRound = make(UserCircleFreeIcons);
export const Users = make(UsersFreeIcons);
export const Video = make(Video01FreeIcons);
export const WifiOff = make(WifiDisconnected01FreeIcons);
export const X = make(Cancel01FreeIcons);
export const XCircle = make(CancelCircleFreeIcons);
