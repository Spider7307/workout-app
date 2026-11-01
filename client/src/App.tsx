import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Home from "./pages/Home";
import Builder from "./pages/Builder";
import Library from "./pages/Library";
import EditWorkout from "./pages/EditWorkout";
import Calendar from "./pages/Calendar";
import Record from "./pages/Record";
import Socials from "./pages/Socials";

function App() {
  return (
    <BrowserRouter>
      <nav className="nav">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/builder">Builder</NavLink>
        <NavLink to="/library">Library</NavLink>
        <NavLink to="/calendar">Calendar</NavLink>
        <NavLink to="/record">Record</NavLink>
        <NavLink to="/socials">Socials</NavLink>
      </nav>
      <main className="page">
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