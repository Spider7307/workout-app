import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import axios from "axios";
import { API } from "./api";
import { getProfileId, setProfileId } from "./profile";
import ProfileSwitcher, { type Profile } from "./components/ProfileSwitcher";
import CreateProfile from "./components/CreateProfile";
import Home from "./pages/Home";
import Builder from "./pages/Builder";
import Library from "./pages/Library";
import EditWorkout from "./pages/EditWorkout";
import Calendar from "./pages/Calendar";
import Record from "./pages/Record";
import Socials from "./pages/Socials";

function App() {
  const [profiles, setProfiles] = useState<Profile[] | null>(null);
  const [profileId, setId] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get<Profile[]>(`${API}/profiles`)
      .then((res) => {
        const stored = getProfileId();
        const id = res.data.find((p) => p._id === stored)?._id ?? res.data[0]?._id ?? null;
        setProfileId(id);
        setProfiles(res.data);
        setId(id);
      })
      .catch(() => setProfiles([]));
  }, []);

  const switchTo = (id: string) => {
    setProfileId(id); // saved first so the next request already carries it
    setId(id);
  };

  const addProfile = async (name: string) => {
    try {
      const res = await axios.post<Profile>(`${API}/profiles`, { name });
      setProfiles((prev) => [...(prev ?? []), res.data]);
      switchTo(res.data._id);
    } catch {
      window.alert("Could not create profile.");
    }
  };

  if (profiles === null) return <p>Loading...</p>;
  if (profiles.length === 0 || !profileId) return <CreateProfile onCreate={addProfile} />;

  return (
    <BrowserRouter>
      <nav className="nav">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/builder">Builder</NavLink>
        <NavLink to="/library">Library</NavLink>
        <NavLink to="/calendar">Calendar</NavLink>
        <NavLink to="/record">Record</NavLink>
        <NavLink to="/socials">Socials</NavLink>
        <ProfileSwitcher
          profiles={profiles}
          currentId={profileId}
          onSwitch={switchTo}
          onAdd={addProfile}
        />
      </nav>
      {/* key remounts every page on a switch, so each one re-fetches for the new profile */}
      <main className="page" key={profileId}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/builder" element={<Builder />} />
          <Route path="/library" element={<Library />} />
          <Route path="/library/:id/edit" element={<EditWorkout />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/record" element={<Record />} />
          <Route path="/socials" element={<Socials />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;