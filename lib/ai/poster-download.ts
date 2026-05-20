/** Safe filename for poster PNG downloads. */
export function posterFileName(title: string, propertyId?: string): string {
  const slug =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "listing";
  const idPart = propertyId ? `-${propertyId.slice(0, 8)}` : "";
  return `${slug}${idPart}-rentsetgo.png`;
}

export async function fetchPosterBlob(posterUrl: string): Promise<Blob> {
  const res = await fetch(posterUrl, { mode: "cors", cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Could not fetch poster (${res.status})`);
  }
  return res.blob();
}

export async function fetchPosterFile(
  posterUrl: string,
  filename: string,
): Promise<File> {
  const blob = await fetchPosterBlob(posterUrl);
  return new File([blob], filename, { type: blob.type || "image/png" });
}
