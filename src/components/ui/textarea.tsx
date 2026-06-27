import * as React from "react"
import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-xl border border-white/07 bg-white/03 px-3 py-2 text-sm text-t1 shadow-sm transition-all placeholder:text-t3 focus-visible:border-blue/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue/15 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
)
Textarea.displayName = "Textarea"
export { Textarea }
