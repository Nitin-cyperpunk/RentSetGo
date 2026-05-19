import { toast } from "sonner";

/** Append a toast id to a redirect path (server actions). */
export function pathWithToast(path: string, toastId: string): string {
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}toast=${encodeURIComponent(toastId)}`;
}

export const TOAST_BY_ID: Record<string, { title: string; description?: string }> = {
  welcome: {
    title: "Welcome to RentSetGo!",
    description: "Your account is ready. Browse listings or publish your first property.",
  },
  "welcome-back": {
    title: "Welcome back!",
    description: "You are signed in.",
  },
  "password-updated": {
    title: "Password updated",
    description: "You can use your new password next time you sign in.",
  },
};

export const notify = {
  propertyPublished() {
    toast.success("Property listed!", {
      description: "Your listing is live. Add photos and try the AI poster generator.",
    });
  },
  propertyUpdated() {
    toast.success("Listing updated", {
      description: "Your changes have been saved.",
    });
  },
  propertyDeleted() {
    toast.success("Listing removed", {
      description: "The property has been deleted from your account.",
    });
  },
  descriptionGenerated(usedAi: boolean) {
    toast.success("Description generated", {
      description: usedAi
        ? "Review and edit the AI text before publishing."
        : "Template draft added — add GEMINI_API_KEY for full AI.",
    });
  },
  posterGenerated(styleLabel?: string | null, layoutLabel?: string | null) {
    const style = [styleLabel, layoutLabel].filter(Boolean).join(" · ");
    toast.success("Poster ready!", {
      description: style
        ? `${style} — download or share from the preview.`
        : "Download or share your marketing poster.",
    });
  },
  posterRegenerated() {
    toast.success("Poster regenerated", {
      description: "Your new creative is ready.",
    });
  },
  favoriteAdded() {
    toast.success("Saved to favorites");
  },
  favoriteRemoved() {
    toast.message("Removed from favorites");
  },
  resetEmailSent() {
    toast.success("Reset link sent", {
      description: "Check your inbox if an account exists for that email.",
    });
  },
  error(message: string) {
    toast.error(message);
  },
};
