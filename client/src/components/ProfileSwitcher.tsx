import { useState } from "react";

export type Profile = { _id: string; name: string };

export default function ProfileSwitcher({
  profiles,
  currentId,
  onSwitch,
  onAdd,
}: {
  profiles: Profile[];
  currentId: string;
  onSwitch: (id: string) => void;
  onAdd: (name: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");

  const cancel = () => {
    setAdding(false);
    setName("");
  };

  return (
    <div className="profile-switcher">
      <svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true">
        <circle cx="12" cy="12" r="12" fill="white" />
        <circle cx="12" cy="9" r="4" fill="#111" />
        <path d="M4.5 20c1-4 4-6 7.5-6s6.5 2 7.5 6a12 12 0 0 1-15 0z" fill="#111" />
      </svg>

      {adding ? (
        <form
          style={{ display: "flex", gap: "0.4rem" }}
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) onAdd(name.trim());
            cancel();
          }}
        >
          <input
            autoFocus
            placeholder="Profile name"
            maxLength={30}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button type="submit">Add</button>
          <button type="button" onClick={cancel}>Cancel</button>
        </form>
      ) : (
        <>
          <select
            value={currentId}
            onChange={(e) => onSwitch(e.target.value)}
            aria-label="Switch profile"
          >
            {profiles.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
          <button type="button" aria-label="Add profile" onClick={() => setAdding(true)}>
            +
          </button>
        </>
      )}
    </div>
  );
}