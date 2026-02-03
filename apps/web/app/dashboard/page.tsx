"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Plus,
  Search,
  Eye,
  EyeOff,
  Copy,
  Check,
  Share2,
  Trash2,
  Edit2,
  FolderOpen,
  AlertTriangle,
  TrendingUp,
  Clock,
  Key,
  LogOut,
} from "lucide-react";
import {
  getEncryptionKey,
  encryptSecret,
  decryptSecret,
  EncryptedSecret,
  clearEncryptionKey,
} from "@/lib/crypto";
import { ShareModal } from "@/components/share/share-modal";

interface DecryptedSecretItem {
  id: string;
  key: string;
  value: string;
  createdAt: Date;
  encrypted: EncryptedSecret;
}

export default function DashboardPage() {
  const router = useRouter();
  const [secrets, setSecrets] = useState<DecryptedSecretItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [environment, setEnvironment] = useState("development");
  const [showAddModal, setShowAddModal] = useState(false);
  const [shareSecret, setShareSecret] = useState<DecryptedSecretItem | null>(null);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const encryptionKey = getEncryptionKey();
      if (!encryptionKey) {
        router.push("/login");
        return;
      }

      // Load demo secrets
      await loadSecrets(encryptionKey);
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  const loadSecrets = async (key: CryptoKey) => {
    // Demo: load some sample encrypted secrets
    const demoSecrets = [
      { key: "DATABASE_URL", value: "postgresql://user:pass@localhost:5432/envvault", age: 45 },
      { key: "REDIS_URL", value: "redis://localhost:6379", age: 12 },
      { key: "JWT_SECRET", value: "super-secret-jwt-key-that-should-be-rotated", age: 90 },
      { key: "STRIPE_SECRET_KEY", value: "sk_test_xxxxxxxxxxxxxxxxxxxx", age: 30 },
      { key: "AWS_ACCESS_KEY_ID", value: "AKIAIOSFODNN7EXAMPLE", age: 120 },
      { key: "SENDGRID_API_KEY", value: "SG.xxxxx.yyyyy", age: 60 },
    ];

    const encrypted = await Promise.all(
      demoSecrets.map(async (s) => {
        const enc = await encryptSecret(key, s.key, s.value);
        return {
          id: `sec_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          key: s.key,
          value: s.value,
          createdAt: new Date(Date.now() - s.age * 24 * 60 * 60 * 1000),
          encrypted: enc,
        };
      })
    );

    setSecrets(encrypted);
  };

  const handleAddSecret = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey || !newValue) return;

    const encryptionKey = getEncryptionKey();
    if (!encryptionKey) {
      router.push("/login");
      return;
    }

    setIsAdding(true);

    try {
      const encrypted = await encryptSecret(encryptionKey, newKey, newValue);

      const newSecret: DecryptedSecretItem = {
        id: `sec_${Date.now()}`,
        key: newKey,
        value: newValue,
        createdAt: new Date(),
        encrypted,
      };

      setSecrets((prev) => [newSecret, ...prev]);
      setNewKey("");
      setNewValue("");
      setShowAddModal(false);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = (id: string) => {
    setSecrets((prev) => prev.filter((s) => s.id !== id));
  };

  const handleCopy = async (id: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLogout = () => {
    clearEncryptionKey();
    localStorage.removeItem("envvault_email");
    router.push("/");
  };

  const toggleShowValue = (id: string) => {
    setShowValues((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredSecrets = secrets.filter((s) =>
    s.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate health metrics
  const healthMetrics = calculateHealthMetrics(secrets);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="h-12 w-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  const email = typeof window !== "undefined" ? localStorage.getItem("envvault_email") : null;

  return (
    <main className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary-500" />
              <span className="text-xl font-bold">EnvVault</span>
            </div>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-400">{email}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Health Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <HealthCard
            icon={<TrendingUp className="h-6 w-6" />}
            label="Health Score"
            value={`${healthMetrics.score}%`}
            color={healthMetrics.score >= 70 ? "green" : healthMetrics.score >= 40 ? "yellow" : "red"}
          />
          <HealthCard
            icon={<Key className="h-6 w-6" />}
            label="Total Secrets"
            value={secrets.length.toString()}
            color="blue"
          />
          <HealthCard
            icon={<AlertTriangle className="h-6 w-6" />}
            label="Needs Rotation"
            value={healthMetrics.needsRotation.toString()}
            color={healthMetrics.needsRotation > 0 ? "yellow" : "green"}
          />
          <HealthCard
            icon={<Clock className="h-6 w-6" />}
            label="Avg Age"
            value={`${healthMetrics.avgAge}d`}
            color="blue"
          />
        </div>

        {/* Environment Tabs */}
        <div className="flex items-center gap-2 mb-6">
          {["development", "staging", "production"].map((env) => (
            <button
              key={env}
              onClick={() => setEnvironment(env)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                environment === env
                  ? "bg-primary-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              {env.charAt(0).toUpperCase() + env.slice(1)}
            </button>
          ))}
        </div>

        {/* Search and Add */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search secrets..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-primary-500 transition"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary-600 hover:bg-primary-700 px-6 py-3 rounded-lg font-medium transition flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Secret
          </button>
        </div>

        {/* Secrets List */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          {filteredSecrets.length === 0 ? (
            <div className="p-12 text-center">
              <FolderOpen className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No secrets yet</h3>
              <p className="text-zinc-500 mb-4">Add your first secret to get started</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-lg font-medium transition inline-flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Add Secret
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-zinc-800/50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400">Key</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400">Value</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400">Age</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-zinc-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredSecrets.map((secret) => {
                  const age = Math.floor((Date.now() - secret.createdAt.getTime()) / (1000 * 60 * 60 * 24));
                  const needsRotation = age > 60;

                  return (
                    <tr key={secret.id} className="hover:bg-zinc-800/30 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-primary-400">{secret.key}</span>
                          {needsRotation && (
                            <span className="bg-yellow-500/10 text-yellow-500 text-xs px-2 py-0.5 rounded">
                              Rotate
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-zinc-400">
                            {showValues[secret.id]
                              ? secret.value
                              : "•".repeat(Math.min(secret.value.length, 20))}
                          </span>
                          <button
                            onClick={() => toggleShowValue(secret.id)}
                            className="p-1 hover:bg-zinc-700 rounded transition"
                          >
                            {showValues[secret.id] ? (
                              <EyeOff className="h-4 w-4 text-zinc-500" />
                            ) : (
                              <Eye className="h-4 w-4 text-zinc-500" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm ${needsRotation ? "text-yellow-500" : "text-zinc-500"}`}>
                          {age}d
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleCopy(secret.id, secret.value)}
                            className="p-2 hover:bg-zinc-700 rounded-lg transition"
                            title="Copy value"
                          >
                            {copiedId === secret.id ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4 text-zinc-400" />
                            )}
                          </button>
                          <button
                            onClick={() => setShareSecret(secret)}
                            className="p-2 hover:bg-zinc-700 rounded-lg transition"
                            title="Share"
                          >
                            <Share2 className="h-4 w-4 text-zinc-400" />
                          </button>
                          <button
                            className="p-2 hover:bg-zinc-700 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4 text-zinc-400" />
                          </button>
                          <button
                            onClick={() => handleDelete(secret.id)}
                            className="p-2 hover:bg-zinc-700 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-zinc-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Encryption Notice */}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-zinc-500">
          <Shield className="h-4 w-4" />
          All values encrypted with AES-256-GCM. Server stores only ciphertext.
        </div>
      </div>

      {/* Add Secret Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-xl max-w-md w-full border border-zinc-800">
            <div className="p-6 border-b border-zinc-800">
              <h2 className="text-xl font-bold">Add Secret</h2>
              <p className="text-zinc-400 text-sm mt-1">
                Will be encrypted before leaving your device
              </p>
            </div>
            <form onSubmit={handleAddSecret} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Key</label>
                <input
                  type="text"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_"))}
                  placeholder="DATABASE_URL"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 font-mono focus:outline-none focus:border-primary-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Value</label>
                <textarea
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="Enter secret value..."
                  rows={4}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 font-mono text-sm focus:outline-none focus:border-primary-500 transition resize-none"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 border border-zinc-700 hover:border-zinc-600 py-3 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
                >
                  {isAdding ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Encrypting...
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5" />
                      Add Secret
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareSecret && (
        <ShareModal
          isOpen={true}
          onClose={() => setShareSecret(null)}
          secretKey={shareSecret.key}
          secretValue={shareSecret.value}
        />
      )}
    </main>
  );
}

function HealthCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: "green" | "yellow" | "red" | "blue";
}) {
  const colorClasses = {
    green: "bg-green-500/10 text-green-500",
    yellow: "bg-yellow-500/10 text-yellow-500",
    red: "bg-red-500/10 text-red-500",
    blue: "bg-blue-500/10 text-blue-500",
  };

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
      <div className={`inline-flex p-3 rounded-lg mb-3 ${colorClasses[color]}`}>
        {icon}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-zinc-500">{label}</div>
    </div>
  );
}

function calculateHealthMetrics(secrets: DecryptedSecretItem[]) {
  if (secrets.length === 0) {
    return { score: 100, needsRotation: 0, avgAge: 0 };
  }

  const ages = secrets.map((s) =>
    Math.floor((Date.now() - s.createdAt.getTime()) / (1000 * 60 * 60 * 24))
  );
  const avgAge = Math.round(ages.reduce((a, b) => a + b, 0) / ages.length);
  const needsRotation = ages.filter((age) => age > 60).length;

  // Score: 100 - (% needing rotation * 50) - (avgAge > 30 penalty)
  let score = 100;
  score -= (needsRotation / secrets.length) * 50;
  if (avgAge > 30) score -= Math.min((avgAge - 30), 20);
  score = Math.max(0, Math.round(score));

  return { score, needsRotation, avgAge };
}
