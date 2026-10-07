import { ArrowRight, Bell, CalendarDays, CheckCircle2, ClipboardCheck, FileText, Gift, Mail } from "../components/icons";
import { Link } from "react-router-dom";
import { Card, PageHeader } from "../components/ui";
import { Logo } from "../components/Logo";

export function Privacy() {
  const blocks = [
    ["What we collect", "The details you give us in your profile and applications: your name, contact details, date of birth, address, qualifications, personal statements, references and the documents you upload."],
    ["Why we use it", "To process your applications and pass them to the institution you apply to, to contact you about them, and to meet our legal duties."],
    ["Who sees it", "The educateU admissions team, and only the institution and awarding body for a course you have applied to. We never sell your details."],
    ["How long we keep it", "For as long as your applications are open, then for the period set out in our retention policy. You can ask us to delete your account at any time."],
    ["Your rights", "You can download your data, correct it, or ask us to delete it from Profile & account. You can also complain to the Information Commissioner's Office."],
  ];
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Privacy notice" lead="How educateU uses your details when you apply. This is placeholder wording for the prototype and needs review by your data protection lead." />
      <Card className="rise grid gap-7">
        {blocks.map(([h, t]) => (
          <section key={h}><h2 className="text-xl">{h}</h2><p className="mt-2 text-[17px] leading-relaxed text-slate">{t}</p></section>
        ))}
        <Link to="/profile" className="inline-flex min-h-11 items-center gap-2 font-bold underline decoration-ink/30 underline-offset-4">Go to Profile & account<ArrowRight className="size-4" aria-hidden /></Link>
      </Card>
    </div>
  );
}

function Email({ icon: Icon, subject, body, cta, note }: { icon: typeof Mail; subject: string; body: string; cta: string; note: string }) {
  return (
    <figure className="m-0">
      <figcaption className="mb-3 flex items-start gap-2 text-sm text-slate"><Icon className="mt-0.5 size-4 shrink-0" aria-hidden /><span><strong className="text-ink">{subject}</strong><br />{note}</span></figcaption>
      <div className="overflow-hidden rounded-[24px] bg-white shadow-[0_0_0_1px_rgb(1_62_91/0.1)]">
        <div className="bg-deep px-7 py-5" data-dark><Logo reversed height={30} /></div>
        <div className="px-7 pb-8 pt-7">
          <p className="text-[15px] text-slate">Hi Amira,</p>
          <p className="mt-3 text-[19px] font-extrabold leading-snug">{body.split("|")[0]}</p>
          <p className="mt-2 text-[16px] leading-relaxed text-ink/85">{body.split("|")[1]}</p>
          <span className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-ink px-6 font-bold text-white">{cta}<ArrowRight className="size-4" aria-hidden /></span>
          <p className="mt-7 border-t border-ink/10 pt-4 text-[13px] leading-relaxed text-slate">You are getting this because you applied through the educateU Applicant Hub. Every update is also in your hub notifications. We never put personal details like your address in an email.</p>
        </div>
      </div>
    </figure>
  );
}

export function Emails() {
  return (
    <div>
      <PageHeader title="Notification emails" lead="One event sends one email. Each says what changed, names the course and institution, and links to the exact page. Nothing personal beyond first name." />
      <div className="grid gap-8 lg:grid-cols-2">
        <Email icon={Gift} subject="Offer made" note="Sent when the admissions team makes an offer" body="You have an offer from Northbridge University.|BSc (Hons) Business Management. This is a conditional offer with two conditions. Please respond by 30 Oct 2026." cta="Respond to offers" />
        <Email icon={ClipboardCheck} subject="New task" note="Sent when something is needed from you" body="Action needed on FdA Health & Social Care.|Westmoor University needs proof of address. Please upload it by 14 Oct 2026." cta="Go to your task" />
        <Email icon={CalendarDays} subject="Interview booked or changed" note="Sent for every new or changed booking" body="Your interview is booked for 21 Oct, 10:00.|FdA Health & Social Care at Westmoor University. It is online and takes about 30 minutes. The joining link is on your application." cta="See booking details" />
        <Email icon={Bell} subject="Deadline reminder, 7 days and 1 day before" note="Sent for offer response dates and task due dates" body="One day left to respond to your offer.|BSc (Hons) Business Management at Northbridge University. Your offer expires on 30 Oct 2026 if you do not answer." cta="Respond to offers" />
        <Email icon={CheckCircle2} subject="Stage change: Submitted" note="Sent at each stage change" body="Your application has been submitted.|Foundation Year in Social Sciences at Eastfield College. We expect a decision by 17 Oct 2026." cta="View application" />
        <Email icon={FileText} subject="Update on your application" note="Same standard wording for every unsuccessful outcome" body="Update on your application to Harcombe University.|Unfortunately, your application has not been successful on this occasion. You can message the admissions team if you have a question." cta="View application" />
      </div>
    </div>
  );
}
