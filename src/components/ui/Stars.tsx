import { Star } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";

interface StarsProps {
  count?: number;
  size?: number;
  className?: string;
}

/** A row of filled accent stars used next to ratings. */
export function Stars({ count = 5, size = 14, className }: StarsProps) {
  return (
    <div
      role="img"
      aria-label={`${count} out of 5 stars`}
      className={cn("flex items-center gap-[3px] text-accent", className)}
    >
      {Array.from({ length: count }, (_, index) => (
        <Star key={index} size={size} weight="fill" aria-hidden />
      ))}
    </div>
  );
}
