import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [status, setStatus] = useState("loading...");

  useEffect(() => {
    axios
      .get("http://localhost:3001/api/health")
      .then((res) => setStatus(res.data.ok ? "Server connected!" : "Server error"))
      .catch(() => setStatus("Could not reach server"));
  }, []);

  return <h1>{status}</h1>;
}

export default App;