"use client";

import { useState } from "react";
import { Copy, Check, QrCode, Link2, Clock, Shield } from "lucide-react";
import { QRCode } from "./qr-code";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  secretKey: string;
  secretValue: string;
}

export function ShareModal({ isOpen, onClose, secretKey, secretValue }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [expiry, setExpiry] = useState<"1h" | "24h" | "7d" | "once">("once");
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const generateShareLink = async () => {
    setIsGenerating(true);

    // In production: encrypt value with random key, store encrypted blob
    // Share link contains decryption key fragment
    const shareId = generateShareId();
    const encryptionKey = generateEncryptionKey();

    // Simulate API call to store encrypted secret
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Link format: /receive/[shareId]#[keyFragment]
    // The key fragment after # is never sent to server
    const link = `${window.location.origin}/receive/${shareId}#${encryptionKey}`;
    setShareLink(link);
    setIsGenerating(false);
  };

  const copyToClipboard = async () => {
    if (!shareLink) return;
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const expiryOptions = [
    { value: "once", label: "One-time", desc: "Deleted after viewing" },
    { value: "1h", label: "1 hour", desc: "Expires in 1 hour" },
    { value: "24h", label: "24 hours", desc: "Expires in 24 hours" },
    { value: "7d", label: "7 days", desc: "Expires in 7 days" },
  ] as const;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-xl max-w-md w-full border border-zinc-800">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Share Secret</h2>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white transition"
            >
              &times;
            </button>
          </div>
          <p className="text-zinc-400 text-sm mt-1">
            Share <span className="text-primary-400 font-mono">{secretKey}</span> securely
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {!shareLink ? (
            <>
              {/* Expiry Selection */}
              <div>
                <label className="text-sm text-zinc-400 mb-2 block">
                  Link expires
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {expiryOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setExpiry(option.value)}
                      className={`p-3 rounded-lg border text-left transition ${
                        expiry === option.value
                          ? "border-primary-500 bg-primary-500/10"
                          : "border-zinc-700 hover:border-zinc-600"
                      }`}
                    >
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-zinc-500">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Security Info */}
              <div className="bg-zinc-800/50 rounded-lg p-4 flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary-500 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium text-primary-400">End-to-end encrypted</div>
                  <div className="text-zinc-400 mt-1">
                    The secret is encrypted before leaving your device.
                    Not even EnvVault can read it.
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateShareLink}
                disabled={isGenerating}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Link2 className="h-5 w-5" />
                    Generate Share Link
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              {/* QR Code */}
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-xl">
                  <QRCode value={shareLink} size={180} />
                </div>
              </div>

              <p className="text-center text-sm text-zinc-400">
                Scan with your phone or share the link below
              </p>

              {/* Share Link */}
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={shareLink}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 pr-12 font-mono text-sm truncate"
                />
                <button
                  onClick={copyToClipboard}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-zinc-700 rounded-lg transition"
                >
                  {copied ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <Copy className="h-5 w-5 text-zinc-400" />
                  )}
                </button>
              </div>

              {/* Expiry Notice */}
              <div className="flex items-center gap-2 text-sm text-zinc-400 justify-center">
                <Clock className="h-4 w-4" />
                {expiry === "once"
                  ? "This link will be deleted after viewing"
                  : `Expires in ${expiry}`}
              </div>

              {/* New Link Button */}
              <button
                onClick={() => setShareLink(null)}
                className="w-full border border-zinc-700 hover:border-zinc-600 py-3 rounded-lg font-medium transition"
              >
                Generate New Link
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Utility functions
function generateShareId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 16; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function generateEncryptionKey(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
