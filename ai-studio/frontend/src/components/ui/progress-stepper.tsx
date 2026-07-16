import { cn } from "@/lib/utils"
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'

type StepStatus = "pending" | "active" | "completed" | "error"

interface Step {
  key: string
  label: string
  description?: string
  status: StepStatus
}

interface ProgressStepperProps {
  steps: Step[]
  className?: string
}

const statusConfig: Record<StepStatus, {
  icon: React.ReactNode
  containerClass: string
  textClass: string
  lineClass: string
}> = {
  completed: {
    icon: <CheckCircle2 className="w-4 h-4" />,
    containerClass: "bg-success/10 text-success border-success/20 shadow-md shadow-success/10",
    textClass: "text-success font-semibold",
    lineClass: "bg-success/60",
  },
  active: {
    icon: <Loader2 className="w-4 h-4 animate-spin" />,
    containerClass: "bg-primary/10 text-primary border-primary/30 shadow-md shadow-primary/15",
    textClass: "text-primary font-semibold",
    lineClass: "bg-gradient-to-r from-primary to-blue-600",
  },
  error: {
    icon: <XCircle className="w-4 h-4" />,
    containerClass: "bg-destructive/10 text-destructive border-destructive/20 shadow-md shadow-destructive/10",
    textClass: "text-destructive font-semibold",
    lineClass: "bg-destructive/60",
  },
  pending: {
    icon: null,
    containerClass: "bg-muted/50 text-muted-foreground border-border/50",
    textClass: "text-muted-foreground",
    lineClass: "bg-border/40",
  },
}

export function ProgressStepper({ steps, className }: ProgressStepperProps) {
  const completedCount = steps.filter(s => s.status === "completed").length
  const progressPercent = steps.length > 1
    ? Math.round((completedCount / (steps.length - 1)) * 100)
    : 0

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1
          const config = statusConfig[step.status]

          return (
            <div key={step.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <div
                  className={cn(
                    "w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
                    config.containerClass
                  )}
                >
                  {config.icon || (
                    <span className="w-2.5 h-2.5 rounded-full bg-current opacity-60" />
                  )}
                </div>
                <span className={cn("text-xs text-center leading-tight max-w-[80px]", config.textClass)}>
                  {step.label}
                </span>
                {step.description && step.status === "active" && (
                  <span className="text-xs text-muted-foreground text-center leading-tight max-w-[100px] mt-0.5">
                    {step.description}
                  </span>
                )}
              </div>

              {!isLast && (
                <div className="flex-1 mx-2 mb-7">
                  <div
                    className={cn(
                      "h-1 rounded-full transition-all duration-500 relative overflow-hidden",
                      statusConfig[step.status === "completed" ? "completed" : step.status === "active" ? "active" : "pending"].lineClass
                    )}
                  >
                    {step.status === "pending" && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="w-full bg-muted/50 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-primary to-blue-600 shadow-inner"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  )
}