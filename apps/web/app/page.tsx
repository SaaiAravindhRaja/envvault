import { Shield, Lock, Users, Terminal, Zap, Eye } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="border-b border-zinc-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary-500" />
            <span className="text-xl font-bold">EnvVault</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/login" className="text-zinc-400 hover:text-white transition">
              Login
            </a>
            <a
              href="/signup"
              className="bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-lg font-medium transition"
            >
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-24 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary-500/10 text-primary-400 px-4 py-2 rounded-full text-sm mb-6">
            <Lock className="h-4 w-4" />
            Zero-Knowledge Encryption
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Share ENV files safely.
            <br />
            <span className="text-primary-500">Never WhatsApp secrets again.</span>
          </h1>
          <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
            End-to-end encrypted secrets management for teams. The server never
            sees your plaintext. Free forever for small teams.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/signup"
              className="bg-primary-600 hover:bg-primary-700 px-8 py-4 rounded-lg font-semibold text-lg transition"
            >
              Start Free
            </a>
            <a
              href="#features"
              className="border border-zinc-700 hover:border-zinc-600 px-8 py-4 rounded-lg font-semibold text-lg transition"
            >
              See Features
            </a>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="px-6 py-16 bg-zinc-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-zinc-800 rounded-xl p-6 font-mono text-sm">
            <div className="text-zinc-500 mb-2"># The problem every dev team faces</div>
            <div className="text-zinc-300">
              <span className="text-blue-400">Dev 1:</span> "Bro send me the .env"
            </div>
            <div className="text-zinc-300 mt-1">
              <span className="text-green-400">Dev 2:</span> *sends via WhatsApp*
            </div>
            <div className="text-zinc-300 mt-1">
              <span className="text-blue-400">Dev 1:</span> *copies into project, forgets which version*
            </div>
            <div className="text-zinc-500 mt-3"># 6 months later...</div>
            <div className="text-red-400 mt-1">
              "Why got 3 different DATABASE_URLs ah?"
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            Everything you need. Nothing you don&apos;t.
          </h2>
          <p className="text-zinc-400 text-center mb-16 max-w-2xl mx-auto">
            Built for developers who care about security but don&apos;t want to manage
            HashiCorp Vault.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Lock className="h-6 w-6" />}
              title="Zero-Knowledge"
              description="Your secrets are encrypted before they leave your device. We literally cannot read them."
            />
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="Team Workspaces"
              description="Organize secrets by project. Control who sees dev, staging, or production."
            />
            <FeatureCard
              icon={<Terminal className="h-6 w-6" />}
              title="CLI Tool"
              description="Pull secrets directly into your .env file. No more copy-pasting from Slack."
            />
            <FeatureCard
              icon={<Eye className="h-6 w-6" />}
              title="Audit Logs"
              description="Know who accessed what, when. 'Ahmad accessed PROD at 3am' - now you know."
            />
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="Instant Sharing"
              description="One-time links, QR codes, encrypted clipboard. Share safely in seconds."
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="Free SSO"
              description="GitHub and Google login included free. Unlike competitors who charge $18/user."
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-24 bg-zinc-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            Simple, honest pricing
          </h2>
          <p className="text-zinc-400 text-center mb-16">
            No per-seat pricing that punishes growth. Pay per workspace, not per person.
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-zinc-800 rounded-xl p-8 border border-zinc-700">
              <h3 className="text-xl font-bold mb-2">Free</h3>
              <p className="text-zinc-400 mb-4">For small teams getting started</p>
              <div className="text-4xl font-bold mb-6">
                $0<span className="text-lg text-zinc-500">/forever</span>
              </div>
              <ul className="space-y-3 mb-8">
                <PricingItem>5 team members</PricingItem>
                <PricingItem>10 workspaces</PricingItem>
                <PricingItem>Unlimited secrets</PricingItem>
                <PricingItem>GitHub & Google SSO</PricingItem>
                <PricingItem>CLI access</PricingItem>
                <PricingItem>30-day audit logs</PricingItem>
              </ul>
              <a
                href="/signup"
                className="block text-center border border-zinc-600 hover:border-zinc-500 px-6 py-3 rounded-lg font-medium transition"
              >
                Get Started Free
              </a>
            </div>

            <div className="bg-zinc-800 rounded-xl p-8 border-2 border-primary-600 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 px-3 py-1 rounded-full text-sm font-medium">
                Most Popular
              </div>
              <h3 className="text-xl font-bold mb-2">Pro</h3>
              <p className="text-zinc-400 mb-4">For growing teams</p>
              <div className="text-4xl font-bold mb-6">
                $10<span className="text-lg text-zinc-500">/workspace/mo</span>
              </div>
              <ul className="space-y-3 mb-8">
                <PricingItem>Unlimited members</PricingItem>
                <PricingItem>SAML SSO</PricingItem>
                <PricingItem>90-day audit logs</PricingItem>
                <PricingItem>Secret rotation alerts</PricingItem>
                <PricingItem>Priority support</PricingItem>
                <PricingItem>Dynamic secrets</PricingItem>
              </ul>
              <a
                href="/signup"
                className="block text-center bg-primary-600 hover:bg-primary-700 px-6 py-3 rounded-lg font-medium transition"
              >
                Start Pro Trial
              </a>
            </div>
          </div>

          <p className="text-center text-zinc-500 mt-8">
            Compare: Infisical charges $18/identity. A 10-person team = $180/mo.
            <br />
            With EnvVault Pro, same team = $10/mo per workspace.
          </p>
        </div>
      </section>

      {/* CLI Preview */}
      <section className="px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            Works where you work
          </h2>
          <p className="text-zinc-400 text-center mb-12">
            CLI that fits into your existing workflow
          </p>
          <div className="bg-zinc-900 rounded-xl p-6 font-mono text-sm border border-zinc-800">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-zinc-500">$</span>{" "}
                <span className="text-green-400">envvault</span> login
              </div>
              <div className="text-zinc-500">Authenticated as ahmad@company.com</div>
              <div className="mt-4">
                <span className="text-zinc-500">$</span>{" "}
                <span className="text-green-400">envvault</span> pull production
              </div>
              <div className="text-zinc-500">Pulled 23 secrets to .env</div>
              <div className="mt-4">
                <span className="text-zinc-500">$</span>{" "}
                <span className="text-green-400">envvault</span> run -- npm start
              </div>
              <div className="text-zinc-500">Injecting 23 environment variables...</div>
              <div className="text-primary-400">Server running on http://localhost:3000</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-6 py-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary-500" />
            <span className="font-bold">EnvVault</span>
          </div>
          <p className="text-zinc-500 text-sm">
            Built with security in mind. Open source soon.
          </p>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-800 hover:border-zinc-700 transition">
      <div className="text-primary-500 mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-zinc-400">{description}</p>
    </div>
  );
}

function PricingItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2">
      <svg
        className="h-5 w-5 text-primary-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      <span>{children}</span>
    </li>
  );
}
