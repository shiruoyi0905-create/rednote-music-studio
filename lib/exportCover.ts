import type { MockContent } from "@/lib/mock";
import type { ThemeId } from "./themes";
import {
  downloadCoverCanvas,
  downloadViralCoverCanvas,
  type ViralCoverStyle,
} from "./drawCoverCanvas";

export async function exportCoverPng(
  content: MockContent,
  themeId: ThemeId,
  fileName: string
): Promise<void> {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });

  downloadCoverCanvas(content, themeId, fileName);
}

export async function exportViralCoverPng(
  content: MockContent,
  themeId: ThemeId,
  style: ViralCoverStyle,
  fileName: string,
  sourceImageUrl?: string
): Promise<void> {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });

  await downloadViralCoverCanvas(content, themeId, style, fileName, sourceImageUrl);
}
