import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, FileText, MapPin, Clock } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center rounded-full border border-border bg-secondary/50 px-4 py-1.5">
            <span className="text-xs font-medium text-muted-foreground">Trusted by 50+ Municipal Corporations</span>
          </div>
          
          <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Report Civic Issues.{" "}
            <span className="text-primary">Track Resolutions.</span>{" "}
            Build Better Cities.
          </h1>
          
          <p className="mx-auto mb-10 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
            Empowering citizens to report public issues like road damage, garbage overflow, 
            and water leakage while enabling authorities to resolve them efficiently.
          </p>
          
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="gap-2" asChild>
              <Link href="/citizen/report">
                <FileText className="h-4 w-4" />
                Report an Issue
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="gap-2" asChild>
              <Link href="/admin/dashboard">
                View Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="mx-auto mt-16 grid max-w-3xl gap-6 md:grid-cols-3">
          <div className="flex flex-col items-center rounded-xl border border-border bg-card p-6 text-center shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">25,000+</p>
            <p className="text-sm text-muted-foreground">Issues Reported</p>
          </div>
          <div className="flex flex-col items-center rounded-xl border border-border bg-card p-6 text-center shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
              <FileText className="h-6 w-6 text-accent" />
            </div>
            <p className="text-2xl font-bold text-foreground">92%</p>
            <p className="text-sm text-muted-foreground">Resolution Rate</p>
          </div>
          <div className="flex flex-col items-center rounded-xl border border-border bg-card p-6 text-center shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <p className="text-2xl font-bold text-foreground">48 hrs</p>
            <p className="text-sm text-muted-foreground">Avg. Response Time</p>
          </div>
        </div>
      </div>
    </section>
  )
}
