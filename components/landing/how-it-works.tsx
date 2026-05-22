import { ClipboardList, UserCheck, Search } from "lucide-react"

const steps = [
  {
    step: 1,
    title: "Report an Issue",
    description: "Citizens submit civic issues with photos, location, and detailed descriptions through an intuitive interface.",
    icon: ClipboardList,
  },
  {
    step: 2,
    title: "Admin Verification",
    description: "Municipal admins verify reports, check for duplicates, assign priority, and route to the appropriate department.",
    icon: UserCheck,
  },
  {
    step: 3,
    title: "Track Resolution",
    description: "Monitor real-time status updates, receive notifications, and track SLA compliance until complete resolution.",
    icon: Search,
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-secondary/30 py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground">
            A simple three-step process to report and resolve civic issues efficiently
          </p>
        </div>

        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.step} className="relative">
                {index < steps.length - 1 && (
                  <div className="absolute left-1/2 top-12 hidden h-0.5 w-full bg-border md:block" />
                )}
                <div className="relative flex flex-col items-center text-center">
                  <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full border-4 border-border bg-card shadow-sm">
                    <step.icon className="h-10 w-10 text-primary" />
                  </div>
                  <div className="absolute -top-2 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {step.step}
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
