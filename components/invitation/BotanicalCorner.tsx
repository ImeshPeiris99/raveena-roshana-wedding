type Props = {
  className?: string;
  flip?: boolean;
};

export default function BotanicalCorner({ className = "", flip = false }: Props) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 320 320"
      className={className}
      style={{ transform: flip ? "scale(-1, -1)" : undefined }}
    >
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M18 282C80 205 111 128 244 36"
          stroke="#8f987a"
          strokeWidth="1.4"
          opacity=".62"
        />
        <path d="M66 223c-38-9-52-31-49-62 34 4 54 25 49 62Z" fill="#dfe8d8" stroke="#8f987a" opacity=".78" />
        <path d="M105 169c-13-38 1-66 34-83 15 36 4 64-34 83Z" fill="#edf2e8" stroke="#8f987a" opacity=".9" />
        <path d="M154 124c0-37 19-61 55-68 4 38-15 60-55 68Z" fill="#d4dfcb" stroke="#8f987a" opacity=".82" />
        <path d="M202 79c14-29 38-42 69-34-12 31-35 43-69 34Z" fill="#edf3e9" stroke="#8f987a" opacity=".9" />
        <path d="M37 247c15-4 30 3 37 17" stroke="#c9aa68" strokeWidth="1.2" opacity=".65" />
      </g>

      <g opacity=".88">
        <g transform="translate(25 256)">
          <circle r="11" fill="#fffdf8" />
          <circle cx="0" cy="-12" r="8" fill="#fffdf8" />
          <circle cx="11" cy="-4" r="8" fill="#fffdf8" />
          <circle cx="7" cy="9" r="8" fill="#fffdf8" />
          <circle cx="-8" cy="8" r="8" fill="#fffdf8" />
          <circle cx="-11" cy="-5" r="8" fill="#fffdf8" />
          <circle r="5" fill="#d6b96f" />
        </g>
        <g transform="translate(277 33) scale(.72)">
          <circle r="11" fill="#fffdf8" />
          <circle cx="0" cy="-12" r="8" fill="#fffdf8" />
          <circle cx="11" cy="-4" r="8" fill="#fffdf8" />
          <circle cx="7" cy="9" r="8" fill="#fffdf8" />
          <circle cx="-8" cy="8" r="8" fill="#fffdf8" />
          <circle cx="-11" cy="-5" r="8" fill="#fffdf8" />
          <circle r="5" fill="#d6b96f" />
        </g>
      </g>

      <g fill="#c9aa68" opacity=".66">
        <circle cx="49" cy="281" r="3.2" />
        <circle cx="62" cy="291" r="2" />
        <circle cx="75" cy="277" r="1.5" />
        <circle cx="286" cy="61" r="3" />
        <circle cx="298" cy="72" r="1.7" />
      </g>
    </svg>
  );
}
