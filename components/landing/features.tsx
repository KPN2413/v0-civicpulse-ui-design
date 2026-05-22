import { MapPin, Users, Clock, Copy, BarChart3, Shield } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const features = [
  {
    title: "Map-Based Reporting",
    description: "Pin issues on an interactive map with precise GPS coordinates for accurate location tracking.",
    icon: MapPin,
  },
  {
    title: "Department Assignment",
    description: "Automatic routing to the appropriate municipal department based on issue category and location.",
    icon: Users,
  },
  {
    title: "SLA Tracking",
    description: "Monitor service level agreements with real-time countdown timers and escalation alerts.",
    icon: Clock,
  },
  {
    title: "Duplicate Detection",
    description: "AI-powered detection of duplicate issues to consolidate reports and prevent redundancy.",
    icon: Copy,
  },
  {
    title: "Analytics Dashboard",
    description: "Comprehensive analytics with heatmaps, trends, and performance metrics for data-driven decisions.",
    icon: BarChart3,
  },
  {
    title: "Audit Logs",
    description: "Complete transparency with detailed audit trails tracking every action and status change.",
    icon: Shield,
  },
]

export function Features() {
  return (
    <section id="features" className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Powerful Features for Smarter Cities
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything municipal corporations need to manage civic issues effectively
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="border-border bg-card transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg text-foreground">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
