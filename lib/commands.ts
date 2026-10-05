export type BroadcasterCommand =
  | { type: "stop" }
  | { type: "start" }
  | { type: "shadow" }
  | { type: "live" }
  | { type: "approve" }
  | { type: "reject" }
  | { type: "unban"; login: string }
  | { type: "unknown" };

const LOGIN_PATTERN = /^[a-zA-Z0-9_]{1,25}$/;

export function parseBroadcasterCommand(text: string): BroadcasterCommand | null {
  const match = text.trim().match(/^!aimod(?:\s+(.*))?$/i);
  if (!match) {
    return null;
  }

  const [head, ...tail] = (match[1] ?? "").trim().split(/\s+/).filter(Boolean);
  switch ((head ?? "").toLowerCase()) {
    case "stop":
      return { type: "stop" };
    case "start":
      return { type: "start" };
    case "shadow":
      return { type: "shadow" };
    case "live":
      return { type: "live" };
    case "approve":
      return { type: "approve" };
    case "reject":
      return { type: "reject" };
    case "unban": {
      const login = tail[0]?.replace(/^@/, "");
      if (!login || !LOGIN_PATTERN.test(login)) {
        return { type: "unknown" };
      }
      return { type: "unban", login: login.toLowerCase() };
    }
    default:
      return { type: "unknown" };
  }
}
