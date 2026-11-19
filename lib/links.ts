import { Platform } from "react-native";

export function getJoinUrl(roomCode: string): string {
  const code = roomCode.trim().toUpperCase();
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return `${window.location.origin}/join/${encodeURIComponent(code)}`;
  }
  return `https://your-deployed-domain/join/${code}`;
}

export async function shareOrCopyJoinLink(roomCode: string): Promise<"shared" | "copied"> {
  const url = getJoinUrl(roomCode);
  const text = `Join the Yam Sushi Contest! ${url}`;

  if (Platform.OS === "web" && typeof navigator !== "undefined") {
    const nav = navigator as Navigator & {
      share?: (data: ShareData) => Promise<void>;
      clipboard?: Clipboard;
    };
    if (nav.share) {
      try {
        await nav.share({ title: "Yam Sushi Contest", text, url });
        return "shared";
      } catch {
        /* fall through to copy */
      }
    }
    if (nav.clipboard?.writeText) {
      await nav.clipboard.writeText(url);
      return "copied";
    }
  }
  return "copied";
}