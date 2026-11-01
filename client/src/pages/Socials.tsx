import "./Socials.css";

const SOCIALS = [
  {
    id: "LinkedIn",
    cellClass: "LinkIMG",
    href: "https://www.linkedin.com/in/spencer-oldoerp-804a34433/?isSelfProfile=true",
    img: "/socials/LI-In-Bug.png",
    alt: "LinkedIn Logo",
  },
  {
    id: "GitHub",
    cellClass: "GitIMG",
    href: "https://github.com/Spider7307",
    img: "/socials/GitHub_Invertocat_White_Clearspace.png",
    alt: "GitHub Logo",
  },
  {
    id: "Instagram",
    cellClass: "InstaIMG",
    href: "https://www.instagram.com/spencer.oldoerp/",
    img: "/socials/Instagram_Glyph_Gradient.svg",
    alt: "Instagram Logo",
  },
  {
    id: "Steam",
    cellClass: "SteamIMG",
    href: "https://steamcommunity.com/profiles/76561198951044111/",
    img: "/socials/images-removebg-preview.png",
    alt: "Steam Logo",
  },
];

export default function Socials() {
  return (
    <div className="socials-page">
      <table className="socials-table">
        <caption>
          Contact Me:
          <br />
          <a href="mailto:spencer_oldoerp@berkeley.edu">spencer_oldoerp@berkeley.edu</a>
        </caption>
        <thead>
          <tr>
            {SOCIALS.map((s) => (
              <th key={s.id} className="socials-header" id={s.id}>
                {s.id}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {SOCIALS.map((s) => (
              <td key={s.id} className={s.cellClass}>
                <a href={s.href} target="_blank" rel="noopener noreferrer">
                  <img src={s.img} alt={s.alt} />
                </a>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}