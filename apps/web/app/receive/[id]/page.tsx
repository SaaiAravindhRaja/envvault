"use client";

import { useState, useEffect } from "react";
import { Shield, Eye, EyeOff, Copy, Check, AlertTriangle } from "lucide-react";

export default function ReceiveSecretPage({ params }: { params: { id: string } }) {
  const [secret, setSecret] = useState<{ key: string; value: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showValue, setShowValue] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const fetchAndDecrypt = async () => {
      try {
        // Get the key fragment from URL hash (never sent to server)
        const keyFragment = window.location.hash.slice(1);

        if (!keyFragment) {
          setError("Invalid share link - missing decryption key");
          setIsLoading(false);
          return;
        }

        // Simulate fetching encrypted data from server
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Demo: Generate a fake secret based on the share ID
        // In production: fetch encrypted blob, decrypt with keyFragment
        const demoSecrets: Record<string, { key: string; value: string }> = {
          demo: { key: "DATABASE_URL", value: "postgresql://user:pass@localhost:5432/db" },
        };

        // Simulate decryption
        const decrypted = demoSecrets[params.id] || {
          key: "API_KEY",
          value: `sk-${params.id.slice(0, 8)}...${params.id.slice(-4)}`,
        };

        setSecret(decrypted);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to decrypt secret. The link may have expired.");
        setIsLoading(false);
      }
    };

    fetchAndDecrypt();
  }, [params.id]);

  const copyToClipboard = async () => {
    if (!secret) return;
    await navigator.clipboard.writeText(secret.value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Decrypting secret...</p>
        </div>
      </main>
    );
  }

  if (error || isExpired) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
        <div className="max-w-md w-full bg-zinc-900 rounded-xl p-8 border border-zinc-800 text-center">
          <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2">
            {isExpired ? "Link Expired" : "Invalid Link"}
          </h1>
          <p className="text-zinc-400 mb-6">
            {isExpired
              ? "This secret has already been viewed or has expired."
              : error}
          </p>
          <a
            href="/"
            className="inline-block bg-primary-600 hover:bg-primary-700 px-6 py-3 rounded-lg font-medium transition"
          >
            Go to EnvVault
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="h-16 w-16 bg-primary-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-primary-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Secret Received</h1>
          <p className="text-zinc-400">
            Someone shared a secret with you securely via EnvVault
          </p>
        </div>

        {/* Secret Card */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          {/* Key */}
          <div className="p-4 border-b border-zinc-800">
            <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">
              Secret Key
            </div>
            <div className="font-mono text-lg text-primary-400">
              {secret?.key}
            </div>
          </div>

          {/* Value */}
          <div className="p-4">
            <div className="text-xs text-zinc-500 uppercase tracking-wide mb-2">
              Secret Value
            </div>
            <div className="relative">
              <div className="bg-zinc-800 rounded-lg p-4 font-mono text-sm break-all">
                {showValue ? secret?.value : "•".repeat(32)}
              </div>
              <button
                onClick={() => setShowValue(!showValue)}
                className="absolute right-2 top-2 p-2 hover:bg-zinc-700 rounded-lg transition"
                title={showValue ? "Hide value" : "Show value"}
              >
                {showValue ? (
                  <EyeOff className="h-5 w-5 text-zinc-400" />
                ) : (
                  <Eye className="h-5 w-5 text-zinc-400" />
                )}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 bg-zinc-800/50 flex gap-2">
            <button
              onClick={copyToClipboard}
              className="flex-1 bg-primary-600 hover:bg-primary-700 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-5 w-5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-5 w-5" />
                  Copy to Clipboard
                </>
              )}
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center text-sm text-zinc-500">
          <Shield className="h-4 w-4 inline-block mr-1" />
          This secret was encrypted end-to-end.
          <br />
          EnvVault never saw the plaintext value.
        </div>

        {/* Warning */}
        <div className="mt-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-sm">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-yellow-500">One-time link</div>
              <div className="text-zinc-400 mt-1">
                This link will be invalidated after you leave this page.
                Make sure to copy the value before closing.
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
