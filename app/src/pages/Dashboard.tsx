import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router";
import {
  Swords,
  Trophy,
  Skull,
  Clock,
  Bitcoin,
  ArrowLeft,
  Loader2,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  Search,
  Filter,
  Edit3,
  Save,
  X,
  Shield,
  Zap,
  BarChart3,
} from "lucide-react";

// ─── Status Badge ───────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    active: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    accepted: "bg-green-500/10 text-green-500 border-green-500/20",
    expired: "bg-red-500/10 text-red-500 border-red-500/20",
    completed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    scrubbed: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-orbitron font-semibold uppercase border ${map[status] ?? map.pending}`}>
      {status}
    </span>
  );
}

// ─── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="card-gaming p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
        <RefreshCw className="w-4 h-4 text-gray-600" />
      </div>
      <div className="font-orbitron text-2xl text-white font-bold">{value}</div>
      <div className="text-gray-500 text-sm mt-1">{label}</div>
    </div>
  );
}

// ─── Challenge Edit Modal ───────────────────────────────────────────────────
function EditChallengeModal({
  challenge,
  onClose,
  onUpdate,
}: {
  challenge: any;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [form, setForm] = useState({
    challengerClan: challenge.challengerClan ?? "",
    challengerContact: challenge.challengerContact ?? "",
    challengerDiscord: challenge.challengerDiscord ?? "",
    targetClan: challenge.targetClan ?? "",
    targetContact: challenge.targetContact ?? "",
    game: challenge.game ?? "",
    matchType: challenge.matchType ?? "",
    description: challenge.description ?? "",
    winnerClan: challenge.winnerClan ?? "",
    matchResult: challenge.matchResult ?? "",
    streamUrl: challenge.streamUrl ?? "",
    adminNotes: challenge.adminNotes ?? "",
  });

  const updateMutation = trpc.admin.updateChallenge.useMutation({
    onSuccess: () => {
      onUpdate();
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({ id: challenge.id, data: form });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="card-gaming p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-orbitron text-xl text-white">Edit Challenge</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Challenger Clan</label>
              <input
                type="text"
                value={form.challengerClan}
                onChange={(e) => setForm({ ...form, challengerClan: e.target.value })}
                className="input-gaming w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Challenger Email</label>
              <input
                type="email"
                value={form.challengerContact}
                onChange={(e) => setForm({ ...form, challengerContact: e.target.value })}
                className="input-gaming w-full"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Target Clan</label>
              <input
                type="text"
                value={form.targetClan}
                onChange={(e) => setForm({ ...form, targetClan: e.target.value })}
                className="input-gaming w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Target Email</label>
              <input
                type="email"
                value={form.targetContact ?? ""}
                onChange={(e) => setForm({ ...form, targetContact: e.target.value })}
                className="input-gaming w-full"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Game</label>
              <input
                type="text"
                value={form.game}
                onChange={(e) => setForm({ ...form, game: e.target.value })}
                className="input-gaming w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Match Type</label>
              <input
                type="text"
                value={form.matchType}
                onChange={(e) => setForm({ ...form, matchType: e.target.value })}
                className="input-gaming w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <textarea
              value={form.description ?? ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input-gaming w-full h-20 resize-none"
            />
          </div>

          <div className="border-t border-[#222] pt-4">
            <h4 className="font-orbitron text-sm text-orange-500 mb-3">Match Result (if completed)</h4>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Winner Clan</label>
                <input
                  type="text"
                  value={form.winnerClan}
                  onChange={(e) => setForm({ ...form, winnerClan: e.target.value })}
                  className="input-gaming w-full"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Stream URL</label>
                <input
                  type="text"
                  value={form.streamUrl}
                  onChange={(e) => setForm({ ...form, streamUrl: e.target.value })}
                  className="input-gaming w-full"
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-sm text-gray-400 mb-1">Match Result</label>
              <textarea
                value={form.matchResult ?? ""}
                onChange={(e) => setForm({ ...form, matchResult: e.target.value })}
                className="input-gaming w-full h-16 resize-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Admin Notes</label>
            <textarea
              value={form.adminNotes ?? ""}
              onChange={(e) => setForm({ ...form, adminNotes: e.target.value })}
              className="input-gaming w-full h-16 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={updateMutation.isPending} className="btn-primary-gaming flex-1 disabled:opacity-50">
              {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : <Save className="w-4 h-4 inline mr-2" />}
              Save Changes
            </button>
            <button type="button" onClick={onClose} className="btn-secondary-gaming">
              <X className="w-4 h-4 inline mr-2" />
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Complete Challenge Modal ───────────────────────────────────────────────
function CompleteChallengeModal({
  challenge,
  onClose,
  onComplete,
}: {
  challenge: any;
  onClose: () => void;
  onComplete: () => void;
}) {
  const [winnerClan, setWinnerClan] = useState("");
  const [matchResult, setMatchResult] = useState("");

  const completeMutation = trpc.admin.completeChallenge.useMutation({
    onSuccess: () => {
      onComplete();
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="card-gaming p-6 max-w-md w-full">
        <h3 className="font-orbitron text-xl text-white mb-4">Complete Challenge</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Winner Clan *</label>
            <input
              type="text"
              value={winnerClan}
              onChange={(e) => setWinnerClan(e.target.value)}
              className="input-gaming w-full"
              placeholder="Enter winning clan name"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Match Result</label>
            <textarea
              value={matchResult}
              onChange={(e) => setMatchResult(e.target.value)}
              className="input-gaming w-full h-20 resize-none"
              placeholder="e.g. 3-2, NightStalkers won"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => completeMutation.mutate({ id: challenge.id, winnerClan, matchResult })}
              disabled={!winnerClan || completeMutation.isPending}
              className="btn-primary-gaming flex-1 disabled:opacity-50"
            >
              {completeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : <Trophy className="w-4 h-4 inline mr-2" />}
              Mark Complete
            </button>
            <button onClick={onClose} className="btn-secondary-gaming">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth({
    redirectOnUnauthenticated: true,
  });

  const { data: statsData, refetch: refetchStats } = trpc.admin.stats.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: challengesData, refetch: refetchChallenges } = trpc.admin.challenges.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: paymentsData } = trpc.admin.payments.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const expireMutation = trpc.admin.expireOverdue.useQuery(undefined, {
    enabled: false,
  });

  const [editingChallenge, setEditingChallenge] = useState<any>(null);
  const [completingChallenge, setCompletingChallenge] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"challenges" | "payments">("challenges");

  const refetchAll = () => {
    refetchStats();
    refetchChallenges();
  };

  const handleExpireOverdue = async () => {
    await expireMutation.refetch();
    refetchAll();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="font-orbitron text-2xl text-white mb-2">Access Denied</h1>
          <p className="text-gray-500 mb-4">Admin access required</p>
          <Link to="/" className="text-orange-500 hover:text-orange-400">
            <ArrowLeft className="w-4 h-4 inline mr-1" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const stats = statsData?.stats;

  const filteredChallenges = challengesData?.challenges?.filter((c: any) => {
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      c.challengerClan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.targetClan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.game?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  }) ?? [];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <div className="border-b border-[#222]">
        <div className="max-w-7xl mx-auto section-padding py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-gray-400 hover:text-orange-500 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="font-orbitron text-xl text-white font-bold">ADMIN DASHBOARD</h1>
                <p className="text-gray-500 text-sm">Manage challenges and payments</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleExpireOverdue} className="btn-secondary-gaming text-sm py-2 px-3">
                <Zap className="w-4 h-4 inline mr-1" />
                Expire Overdue
              </button>
              <button onClick={refetchAll} className="btn-secondary-gaming text-sm py-2 px-3">
                <RefreshCw className="w-4 h-4 inline mr-1" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto section-padding py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <StatCard icon={<BarChart3 className="w-5 h-5 text-white" />} label="Total" value={stats.total} color="bg-gray-500/20" />
            <StatCard icon={<Clock className="w-5 h-5 text-yellow-500" />} label="Pending" value={stats.pending} color="bg-yellow-500/20" />
            <StatCard icon={<Swords className="w-5 h-5 text-orange-500" />} label="Active" value={stats.active} color="bg-orange-500/20" />
            <StatCard icon={<CheckCircle className="w-5 h-5 text-green-500" />} label="Accepted" value={stats.accepted} color="bg-green-500/20" />
            <StatCard icon={<Skull className="w-5 h-5 text-red-500" />} label="Expired" value={stats.expired} color="bg-red-500/20" />
            <StatCard icon={<Bitcoin className="w-5 h-5 text-orange-500" />} label="Revenue ($)" value={stats.revenue.toFixed(0)} color="bg-orange-500/20" />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-[#222]">
          <button
            onClick={() => setActiveTab("challenges")}
            className={`pb-3 font-orbitron text-sm uppercase tracking-wider transition-colors ${
              activeTab === "challenges" ? "text-orange-500 border-b-2 border-orange-500" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <Swords className="w-4 h-4 inline mr-2" />
            Challenges
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`pb-3 font-orbitron text-sm uppercase tracking-wider transition-colors ${
              activeTab === "payments" ? "text-orange-500 border-b-2 border-orange-500" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <Bitcoin className="w-4 h-4 inline mr-2" />
            Payments
          </button>
        </div>

        {/* Challenges Tab */}
        {activeTab === "challenges" && (
          <>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  type="text"
                  placeholder="Search clans or games..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-gaming w-full pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input-gaming py-2"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="accepted">Accepted</option>
                  <option value="expired">Expired</option>
                  <option value="completed">Completed</option>
                  <option value="scrubbed">Scrubbed</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="card-gaming overflow-x-auto">
              <table className="table-gaming">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Status</th>
                    <th>Challenger</th>
                    <th>Target</th>
                    <th>Game</th>
                    <th>Match Type</th>
                    <th>Stake</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredChallenges.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-gray-500">
                        No challenges found
                      </td>
                    </tr>
                  ) : (
                    filteredChallenges.map((c: any) => (
                      <tr key={c.id}>
                        <td className="font-mono text-gray-500">#{c.id}</td>
                        <td><StatusBadge status={c.status} /></td>
                        <td className="font-orbitron text-white text-sm">{c.challengerClan}</td>
                        <td className="font-orbitron text-white text-sm">{c.targetClan}</td>
                        <td className="text-gray-400 text-sm">{c.game}</td>
                        <td className="text-gray-400 text-sm">{c.matchType}</td>
                        <td className="font-orbitron text-orange-500">${c.stakeAmount}</td>
                        <td className="text-gray-500 text-sm">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/challenge/${c.id}`}
                              className="p-1.5 rounded hover:bg-[#222] text-gray-400 hover:text-orange-500 transition-colors"
                              title="View"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => setEditingChallenge(c)}
                              className="p-1.5 rounded hover:bg-[#222] text-gray-400 hover:text-blue-500 transition-colors"
                              title="Edit"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            {c.status === "accepted" && (
                              <button
                                onClick={() => setCompletingChallenge(c)}
                                className="p-1.5 rounded hover:bg-[#222] text-gray-400 hover:text-green-500 transition-colors"
                                title="Complete"
                              >
                                <Trophy className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Payments Tab */}
        {activeTab === "payments" && (
          <div className="card-gaming overflow-x-auto">
            <table className="table-gaming">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Challenge</th>
                  <th>Type</th>
                  <th>Amount (USD)</th>
                  <th>Coin</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {!paymentsData?.payments?.length ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      No payments yet
                    </td>
                  </tr>
                ) : (
                  paymentsData.payments.map((p: any) => (
                    <tr key={p.id}>
                      <td className="font-mono text-gray-500 text-xs">{p.invoiceId}</td>
                      <td className="text-white text-sm">#{p.challengeId}</td>
                      <td>
                        <span className={`px-2 py-0.5 rounded text-xs font-orbitron ${
                          p.type === "challenge_fee" ? "bg-orange-500/10 text-orange-500" :
                          p.type === "accept_fee" ? "bg-green-500/10 text-green-500" :
                          "bg-purple-500/10 text-purple-500"
                        }`}>
                          {p.type.replace("_", " ")}
                        </span>
                      </td>
                      <td className="font-orbitron text-orange-500">${p.amountUsd}</td>
                      <td className="text-gray-400">{p.coin}</td>
                      <td>
                        <span className={`px-2 py-0.5 rounded text-xs font-orbitron ${
                          p.status === "paid" ? "bg-green-500/10 text-green-500" :
                          p.status === "pending" ? "bg-yellow-500/10 text-yellow-500" :
                          "bg-red-500/10 text-red-500"
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="text-gray-500 text-sm">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {editingChallenge && (
        <EditChallengeModal
          challenge={editingChallenge}
          onClose={() => setEditingChallenge(null)}
          onUpdate={refetchAll}
        />
      )}
      {completingChallenge && (
        <CompleteChallengeModal
          challenge={completingChallenge}
          onClose={() => setCompletingChallenge(null)}
          onComplete={refetchAll}
        />
      )}
    </div>
  );
}
