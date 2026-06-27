"use client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useTextareaResize } from "@/hooks/use-textarea-resize"
import { ArrowUpIcon, StopCircleIcon } from "lucide-react"
import type React from "react"
import { createContext, useContext } from "react"

interface ChatInputContextValue {
  value?: string
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>
  onSubmit?: () => void
  loading?: boolean
  onStop?: () => void
  variant?: "default" | "unstyled"
  rows?: number
}
const ChatInputContext = createContext<ChatInputContextValue>({})

interface ChatInputProps extends Omit<ChatInputContextValue, "variant"> {
  children: React.ReactNode
  className?: string
  variant?: "default" | "unstyled"
  rows?: number
}

function ChatInput({ children, className, variant = "default", value, onChange, onSubmit, loading, onStop, rows = 1 }: ChatInputProps) {
  return (
    <ChatInputContext.Provider value={{ value, onChange, onSubmit, loading, onStop, variant, rows }}>
      <div className={cn(
        variant === "default" && "flex flex-col items-end w-full p-2 rounded-2xl glass focus-within:border-blue/25 focus-within:ring-1 focus-within:ring-blue/10 transition-all duration-200",
        variant === "unstyled" && "flex items-start gap-2 w-full",
        className
      )}>
        {children}
      </div>
    </ChatInputContext.Provider>
  )
}
ChatInput.displayName = "ChatInput"

interface ChatInputTextAreaProps extends React.ComponentProps<typeof Textarea> {
  value?: string
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>
  onSubmit?: () => void
  variant?: "default" | "unstyled"
}

function ChatInputTextArea({ onSubmit: onSubmitProp, value: valueProp, onChange: onChangeProp, className, variant: variantProp, ...props }: ChatInputTextAreaProps) {
  const context = useContext(ChatInputContext)
  const value = valueProp ?? context.value ?? ""
  const onChange = onChangeProp ?? context.onChange
  const onSubmit = onSubmitProp ?? context.onSubmit
  const rows = context.rows ?? 1
  const variant = variantProp ?? (context.variant === "default" ? "unstyled" : "default")
  const textareaRef = useTextareaResize(value, rows)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!onSubmit) return
    if (e.key === "Enter" && !e.shiftKey) {
      if (typeof value !== "string" || value.trim().length === 0) return
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <Textarea
      ref={textareaRef}
      {...props}
      value={value}
      onChange={onChange}
      onKeyDown={handleKeyDown}
      className={cn(
        "max-h-[400px] min-h-0 resize-none overflow-x-hidden bg-transparent text-t1 text-[13px] leading-relaxed",
        variant === "unstyled" && "border-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none",
        className
      )}
      rows={rows}
    />
  )
}
ChatInputTextArea.displayName = "ChatInputTextArea"

interface ChatInputSubmitProps extends React.ComponentProps<typeof Button> {
  onSubmit?: () => void
  loading?: boolean
  onStop?: () => void
}

function ChatInputSubmit({ onSubmit: onSubmitProp, loading: loadingProp, onStop: onStopProp, className, ...props }: ChatInputSubmitProps) {
  const context = useContext(ChatInputContext)
  const loading = loadingProp ?? context.loading
  const onStop = onStopProp ?? context.onStop
  const onSubmit = onSubmitProp ?? context.onSubmit

  if (loading && onStop) {
    return (
      <Button
        onClick={onStop}
        size="icon"
        variant="outline"
        className={cn("shrink-0 rounded-full h-8 w-8 border-white/10 hover:border-red/40 hover:text-red transition-all", className)}
        {...props}
      >
        <StopCircleIcon className="h-4 w-4" />
      </Button>
    )
  }

  const isDisabled = typeof context.value !== "string" || context.value.trim().length === 0

  return (
    <Button
      size="icon"
      className={cn(
        "shrink-0 rounded-full h-8 w-8 transition-all duration-200",
        isDisabled ? "bg-white/05 text-t3 cursor-not-allowed" : "bg-blue text-white hover:bg-blue/90 shadow-glow-blue",
        className
      )}
      disabled={isDisabled}
      onClick={(e) => { e.preventDefault(); if (!isDisabled) onSubmit?.() }}
      {...props}
    >
      <ArrowUpIcon className="h-4 w-4" />
    </Button>
  )
}
ChatInputSubmit.displayName = "ChatInputSubmit"

export { ChatInput, ChatInputTextArea, ChatInputSubmit }
