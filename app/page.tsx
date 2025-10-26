'use client'

import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Nav */}
      <header className="sticky top-0 z-30 backdrop-blur bg-white/70 border-b border-orange-100">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/favicon.png" alt="Alpha" className="h-8" />
            <span className="font-semibold tracking-tight">AlphaFoundry</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#how" className="hover:text-orange-600">How it works</a>
            <a href="#product" className="hover:text-orange-600">Product</a>
            <a href="#faq" className="hover:text-orange-600">FAQ</a>
          </nav>
          <Link href="/dashboard" className="inline-flex items-center rounded-xl bg-orange-600 px-4 py-2 text-white text-sm font-medium shadow-sm hover:bg-orange-700 transition">
            Get started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-amber-50" />
        <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-3 py-1 text-xs font-medium text-orange-700 shadow-sm">
              YC-style velocity • AI-native investing ops
            </div>
            <h1 className="mt-6 text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.05]">
              Build your <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">VC engine</span> with AI.
            </h1>
            <p className="mt-5 text-lg md:text-xl text-slate-600">
              We're building a YC/VC from the ground up using AI—autonomous sourcing, qualification, filtering, and vetting—so you capture <span className="font-semibold text-slate-800">alpha leads</span> before the market blinks.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link href="/dashboard" className="inline-flex items-center justify-center rounded-xl bg-orange-600 px-6 py-3 text-white font-semibold shadow-sm hover:bg-orange-700 transition">
                Get started
              </Link>
              <a href="#how" className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-6 py-3 font-semibold hover:border-slate-400">
                See how it works
              </a>
            </div>
            <div className="mt-6 text-sm text-slate-500">
              Dealflow copilot • Fit scoring • Auto-diligence briefs • CRM-ready exports
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="py-8 border-t border-b border-orange-100 bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-xs uppercase tracking-widest text-slate-500 mb-4">Signal sources</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 opacity-70">
            {['GitHub','Product Hunt','LinkedIn','X / Twitter','App Stores','Preprint / ArXiv'].map((name) => (
              <div key={name} className="rounded-lg border border-slate-200 py-3 text-center text-sm">{name}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Product highlights */}
      <section id="product" className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">From signal → shortlist → signed.</h2>
            <p className="mt-4 text-slate-600">An AI-native pipeline that sources, scores, and assembles investment memos—so your team focuses on conviction, not spreadsheets.</p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Autonomous Sourcing',
                copy: 'Continuously crawls public signals and warm networks to surface teams before they hit the hype cycle.',
              },
              {
                title: 'Fit Scoring & Triage',
                copy: 'Models your thesis, stage, sector, and region. Ranks startups by ICP and momentum fit in real time.',
              },
              {
                title: 'Auto‑Diligence Briefs',
                copy: 'Generates crisp one-pagers: team, traction, CAC/LTV, comps, technical moat, risks, and intros to validate.',
              },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-orange-100 bg-gradient-to-br from-white to-orange-50 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-orange-700">{f.title}</h3>
                <p className="mt-2 text-slate-700">{f.copy}</p>
              </div>
            ))}
          </div>

          {/* Metrics */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {k: '10×', v: 'More qualified intros'},
              {k: '70%', v: 'Ops time saved'},
              {k: 'Top 5%', v: 'Hit‑rate pipeline'},
            ].map((m) => (
              <div key={m.v} className="rounded-2xl border border-slate-200 p-6 text-center">
                <div className="text-4xl font-extrabold text-orange-600">{m.k}</div>
                <div className="mt-1 text-sm text-slate-600">{m.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20 bg-gradient-to-b from-amber-50 to-white border-y border-orange-100">
        <div className="mx-auto max-w-7xl px-4">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">How it works</h2>
            <p className="mt-4 text-slate-600">Four steps. Fully instrumented. Your thesis at the core.</p>
          </div>
          <ol className="mt-10 grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {n: '01', t: 'Define Thesis', c: 'Input stage, sector, region, check size, and your "no-gos".'},
              {n: '02', t: 'Ingest Signals', c: 'Live feeds from code, product launches, social proofs, hiring, and growth.'},
              {n: '03', t: 'Score & Vet', c: 'Model‑based fit scoring, CAC/LTV checks, founder quality heuristics, and risk flags.'},
              {n: '04', t: 'Brief & Intro', c: 'Auto-generate memos and intro emails; sync to your CRM with one click.'},
            ].map((s) => (
              <li key={s.n} className="rounded-2xl border border-orange-100 bg-white p-6">
                <div className="text-sm font-mono text-orange-700">{s.n}</div>
                <div className="mt-2 text-lg font-semibold">{s.t}</div>
                <p className="mt-2 text-slate-700">{s.c}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ICP sections */}
      <section className="py-20" id="icp">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-2xl border border-slate-200 p-8">
              <h3 className="text-2xl font-bold">For Top‑Performing VCs</h3>
              <ul className="mt-4 space-y-3 text-slate-700 list-disc pl-5">
                <li>Proprietary pipeline tuned to your thesis.</li>
                <li>Stage/sector/region filters that actually learn.</li>
                <li>Warm intros mapped through your network graph.</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200 p-8">
              <h3 className="text-2xl font-bold">For Accelerators & Scouts</h3>
              <ul className="mt-4 space-y-3 text-slate-700 list-disc pl-5">
                <li>High‑volume, high‑precision sourcing for cohorts.</li>
                <li>Automated screening and shortlisting.</li>
                <li>Weekly alpha‑lead drops to partners.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="py-24 bg-gradient-to-br from-orange-600 to-amber-600 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">Turn noise into alpha leads.</h2>
          <p className="mt-4 text-lg text-orange-50">Pilot seats are limited. If you run a thesis‑driven fund and want unfair speed, let's talk.</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard" className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 font-semibold text-orange-700 hover:bg-orange-50 transition">
              Get started now
            </Link>
          </div>
          <p className="mt-3 text-sm text-orange-100">Start exploring your dealflow pipeline</p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">FAQ</h2>
          <div className="mt-8 grid grid-cols-1 gap-6">
            {[
              {
                q: 'How do you qualify companies?',
                a: 'We fit‑score across stage, sector, region, traction, CAC/LTV sanity, founder signals, and technical moat—then generate a one‑page brief to review.'
              },
              {
                q: 'Where does data come from?',
                a: 'We ingest public signals (code, launches, hiring) and optional private data rooms with permission. All access is auditable.'
              },
              {
                q: 'Can this match our investment thesis?',
                a: 'Yes. We capture hard constraints and soft preferences, then adapt as partners accept/decline leads.'
              },
              {
                q: 'What does onboarding look like?',
                a: 'One week. Define thesis → connect sources → calibrate scoring on historical deals → go live.'
              },
            ].map((item, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 p-6">
                <div className="font-semibold">{item.q}</div>
                <p className="mt-2 text-slate-700">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/favicon.png" alt="Alpha" className="h-6" />
            <span className="text-sm">© {new Date().getFullYear()} AlphaFoundry</span>
          </div>
          <div className="text-sm text-slate-500">Built for thesis‑driven funds</div>
        </div>
      </footer>
    </div>
  );
}
