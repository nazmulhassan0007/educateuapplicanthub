import { HashRouter, Route, Routes } from "react-router-dom";
import { Shell } from "./components/Shell";
import { LinkButton, Empty } from "./components/ui";
import { Apply, Confirmation } from "./pages/Apply";
import { ApplicationDetail } from "./pages/ApplicationDetail";
import { ApplyCheck, CourseDetails } from "./pages/CourseFlow";
import { Dashboard } from "./pages/Dashboard";
import { Documents } from "./pages/Documents";
import { FindCourse } from "./pages/FindCourse";
import { Messages } from "./pages/Messages";
import { MyApplications } from "./pages/MyApplications";
import { Offers } from "./pages/Offers";
import { Profile } from "./pages/Profile";
import { Emails, Privacy } from "./pages/Extras";
import { HubProvider } from "./store";
import { SearchX } from "./components/icons";

export default function App() {
  return (
    <HubProvider>
      <HashRouter>
        <Shell>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/applications" element={<MyApplications />} />
            <Route path="/applications/:id" element={<ApplicationDetail />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/emails" element={<Emails />} />
            <Route path="/new" element={<FindCourse />} />
            <Route path="/discover" element={<FindCourse discover />} />
            <Route path="/new/:courseId" element={<CourseDetails />} />
            <Route path="/new/:courseId/check" element={<ApplyCheck />} />
            <Route path="/apply/:key/confirmation" element={<Confirmation />} />
            <Route path="/apply/:key/:step" element={<Apply />} />
            <Route path="*" element={<Empty icon={<SearchX className="size-7" />} title="We cannot find that page" action={<LinkButton to="/">Go to dashboard</LinkButton>}>The link may be old. Your dashboard has everything that needs your attention.</Empty>} />
          </Routes>
        </Shell>
      </HashRouter>
    </HubProvider>
  );
}
