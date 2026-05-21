import Link from "next/link"
import { Building2 } from "lucide-react"

export function Footer() {
  return (
    <footer id="contact" className="border-t border-border bg-secondary/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">CivicPulse</span>
            </Link>
            <p className="mb-4 max-w-sm text-sm text-muted-foreground">
              Building smarter cities through citizen engagement and efficient municipal management.
            </p>
            <p className="text-xs text-muted-foreground">
              Empowering local governments across India to serve citizens better.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Platform</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/citizen/dashboard" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Citizen Portal
                </Link>
              </li>
              <li>
                <Link href="/admin/dashboard" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Admin Dashboard
                </Link>
              </li>
              <li>
                <Link href="/officer/dashboard" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Officer Portal
                </Link>
              </li>
              <li>
                <Link href="/super-admin/dashboard" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Super Admin
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Support</h4>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} CivicPulse. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Made with care for Indian municipalities
          </p>
        </div>
      </div>
    </footer>
  )
}
