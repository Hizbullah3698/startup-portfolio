export interface TextSegment {
  /** Use "
" for a line break. */
  text: string;
  className?: string;
}

/** Build segments for the common "plain words + accent words" heading. */
export function accentSegments(plain: string, accent: string): TextSegment[] {
  return [{ text: plain }, { text: accent, className: "text-accent" }];
}
