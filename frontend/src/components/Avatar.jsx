import { avatarColor, initials } from "../utils/ownership";

export default function Avatar({ label, size = 36 }) {
  return (
    <span
      className="avatar"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: avatarColor(label),
      }}
      aria-hidden="true"
    >
      {initials(label)}
    </span>
  );
}
