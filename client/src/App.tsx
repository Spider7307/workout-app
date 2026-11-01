import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
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
      <nav style={{ display: "flex", gap: "1rem" }}>
        <Link to="/">Home</Link>
        <Link to="/builder">Builder</Link>
        <Link to="/library">Library</Link>
        <Link to="/calendar">Calendar</Link>
        <Link to="/record">Record</Link>
        <Link to="/socials">Socials</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/builder" element={<Builder />} />
        <Route path="/library" element={<Library />} />
        <Route path="/library/:id/edit" element={<EditWorkout />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/record" element={<Record />} />
        <Route path="/socials" element={<Socials />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;