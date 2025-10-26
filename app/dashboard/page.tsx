'use client'

import { Dashboard } from "@/components/Dashboard"

// Disable static generation for this page since it requires runtime data
export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-gradient-glow pointer-events-none" />
      <div className="relative">
        <header className="border-b border-border backdrop-blur-sm bg-background/80 sticky top-0 z-10">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/alpha-logo.png" alt="Alpha" className="h-10" />
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          <Dashboard />
        </main>
      </div>
    </div>
  )
}
