import { useState } from "react";

export default function CreateProfile({ onCreate }: { onCreate: (name: string) => void }) {
  const [name, setName] = useState("");

  return (
    <main className="page">
      <h1>Welcome!</h1>
      <p style={{ textAlign: "center" }}>Create a profile to get started.</p>
      <form
        style={{ display: "flex", justifyContent: "center", gap: "0.5rem" }}
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) onCreate(name.trim());
        }}
      >
        <input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
        <button type="submit">Create</button>
      </form>
    </main>
  );
}