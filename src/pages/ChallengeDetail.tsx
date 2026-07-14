import { useParams, Link } from "react-router";
import { trpc } from "@/providers/trpc";
import {
  Swords,
  Clock,
  Gamepad2,
  Shield,
  Mail,
  MessageCircle,
  AlertTriangle,
  CheckCircle,
  Bitcoin,
  ExternalLink,
  Loader2,
  ArrowLeft,
  Trophy,
  Skull,
  Users,
} from "lucide-react";
import { useState, useEffect } from "react";

// ─── Countdown Timer ────────────────────────────────────────────────────────
function CountdownTimer({ expiresAt }: { expiresAt: Date | null }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });

  useEffect(() => {
    if (!expiresAt) return;
    const calculate = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
        expired: false,
      };
    };
    setTimeLeft(calculate());
    const timer = setInterval(() => {
      const t = calculate();
      setTimeLeft(t);
      if (t.expired) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  if (timeLeft.expired) {
    return (
      <div className="flex items-center gap-2 text-red-500">
        <AlertTriangle className="w-5 h-5" />
        <span className="font-orbitron text-lg">TIME EXPIRED</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {(["days", "hours", "minutes", "seconds"] as const).map((unit, i) => (
        <div key={unit} className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <span className="font-orbitron text-4xl font-bold text-orange-500 tabular-nums" style={{ textShadow: "0 0 20px rgba(249,115,22,0.5)" }}>
              {String(timeLeft[unit]).padStart(2, "0")}
            </span>
            <span className="text-xs text-gray-500 uppercase">{unit}</span>
          </div>
          {i < 3 && <span className="text-orange-500/50 text-2xl font-bold">:</span>}
        </div>
      ))}
    </div>
  );
}

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
    <span className={`px-4 py-1.5 rounded-full text-sm font-orbitron font-semibold uppercase border ${map[status] ?? map.pending}`}>
      {status}
    </span>
  );
}

// ─── Payment Modal ──────────────────────────────────────────────────────────
function PaymentModal({
  challenge,
  type,
  onClose,
}: {
  challenge: any;
  type: "accept" | "scrub";
  onClose: () => void;
}) {
  const [selectedCoin, setSelectedCoin] = useState("BTC");
  const [paymentData, setPaymentData] = useState<any>(null);

  const createAcceptInvoice = trpc.payment.createAcceptInvoice.useMutation({
    onSuccess: (data) => {
      if (data.success) setPaymentData(data);
    },
  });

  const createScrubInvoice = trpc.payment.createScrubInvoice.useMutation({
    onSuccess: (data) => {
      if (data.success) setPaymentData(data);
    },
  });

  const handlePay = () => {
    if (type === "accept") {
      createAcceptInvoice.mutate({ challengeId: challenge.id, coin: selectedCoin });
    } else {
      createScrubInvoice.mutate({ challengeId: challenge.id, coin: selectedCoin });
    }
  };

  const amount = type === "accept" ? (challenge.stakeAmount ?? "100") : (challenge.scrubFeeAmount ?? "150");
  const title = type === "accept" ? "Accept Challenge" : "Scrub Reputation";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="card-gaming p-6 sm:p-8 max-w-md w-full">
        {!paymentData ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Bitcoin className="w-7 h-7 text-orange-500" />
                <h3 className="font-orbitron text-xl text-white">{title}</h3>
              </div>
              <button onClick={onClose} className="text-gray-500 hover:text-white">
                <span className="sr-only">Close</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="bg-[#0a0a0a] rounded-lg p-4 mb-6 border border-[#222]">
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Challenge</span>
                <span className="text-white font-orbitron text-sm">{challenge.challengerClan} vs {challenge.targetClan}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#222]">
                <span className="text-gray-400">Amount</span>
                <span className="font-orbitron text-xl text-orange-500">${amount}</span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-orbitron text-gray-400 mb-3">Select Coin</label>
              <div className="grid grid-cols-3 gap-3">
                {["BTC", "ETH", "USDT"].map((coin) => (
                  <button
                    key={coin}
                    onClick={() => setSelectedCoin(coin)}
                    className={`p-3 rounded-lg border text-center font-orbitron transition-all ${
                      selectedCoin === coin ? "border-orange-500 bg-orange-500/10 text-orange-500" : "border-[#333] text-gray-400 hover:border-[#444]"
                    }`}
                  >
                    {coin}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handlePay}
              disabled={createAcceptInvoice.isPending || createScrubInvoice.isPending}
              className="btn-primary-gaming w-full disabled:opacity-50"
            >
              {(createAcceptInvoice.isPending || createScrubInvoice.isPending) ? (
                <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
              ) : (
                <Bitcoin className="w-5 h-5 inline mr-2" />
              )}
              Generate Invoice
            </button>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="font-orbitron text-xl text-white">Invoice Created!</h3>
            </div>
            {paymentData.invoiceUrl && (
              <a
                href={paymentData.invoiceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary-gaming w-full block text-center"
              >
                <ExternalLink className="w-5 h-5 inline mr-2" />
                Pay Now
              </a>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function ChallengeDetail() {
  const { id } = useParams<{ id: string }>();
  const challengeId = parseInt(id ?? "0");
  const { data, isLoading } = trpc.challenge.getById.useQuery({ id: challengeId });
  const [showPayment, setShowPayment] = useState<"accept" | "scrub" | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!data?.challenge) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h1 className="font-orbitron text-2xl text-white mb-2">Challenge Not Found</h1>
          <Link to="/" className="text-orange-500 hover:text-orange-400">
            <ArrowLeft className="w-4 h-4 inline mr-1" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const c = data.challenge;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <div className="border-b border-[#222]">
        <div className="max-w-5xl mx-auto section-padding py-4">
          <Link to="/" className="text-gray-400 hover:text-orange-500 transition-colors flex items-center gap-2 text-sm font-orbitron">
            <ArrowLeft className="w-4 h-4" />
            BACK TO HOME
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto section-padding py-10">
        {/* Status & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
          <StatusBadge status={c.status} />
          <span className="text-gray-500 text-sm flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Created {new Date(c.createdAt).toLocaleDateString()}
          </span>
        </div>

        {/* Main Card */}
        <div className="card-gaming p-6 sm:p-8 mb-6">
          {/* Clans */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 mb-8">
            <div className="text-center">
              <Users className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <h2 className="font-orbitron text-2xl sm:text-3xl font-bold text-white">{c.challengerClan}</h2>
              <span className="text-gray-500 text-sm">Challenger</span>
            </div>

            <div className="flex flex-col items-center">
              <Swords className="w-10 h-10 text-orange-500 mb-1" />
              <span className="font-orbitron text-lg text-orange-500 font-bold">VS</span>
            </div>

            <div className="text-center">
              <Users className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <h2 className={`font-orbitron text-2xl sm:text-3xl font-bold ${c.status === "expired" ? "text-red-400 line-through" : "text-white"}`}>
                {c.targetClan}
              </h2>
              <span className="text-gray-500 text-sm">Target</span>
            </div>
          </div>

          {/* Game Info */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-[#0a0a0a] rounded-lg p-4 border border-[#222]">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <Gamepad2 className="w-4 h-4" />
                Game
              </div>
              <p className="font-orbitron text-white">{c.game}</p>
            </div>
            <div className="bg-[#0a0a0a] rounded-lg p-4 border border-[#222]">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <Shield className="w-4 h-4" />
                Match Type
              </div>
              <p className="font-orbitron text-white">{c.matchType}</p>
            </div>
            <div className="bg-[#0a0a0a] rounded-lg p-4 border border-[#222]">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <Bitcoin className="w-4 h-4" />
                Stake
              </div>
              <p className="font-orbitron text-orange-500 text-xl">${c.stakeAmount}</p>
            </div>
          </div>

          {/* Countdown (if active) */}
          {c.status === "active" && c.expiresAt && (
            <div className="bg-[#0a0a0a] rounded-lg p-6 border border-orange-500/20 mb-8">
              <p className="text-gray-500 text-sm mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" />
                TIME REMAINING TO ACCEPT
              </p>
              <CountdownTimer expiresAt={c.expiresAt} />
            </div>
          )}

          {/* Description */}
          {c.description && (
            <div className="mb-8">
              <h3 className="font-orbitron text-lg text-white mb-3">Challenge Details</h3>
              <p className="text-gray-400 leading-relaxed">{c.description}</p>
            </div>
          )}

          {/* Match Result */}
          {c.status === "completed" && (
            <div className="bg-green-500/5 rounded-lg p-6 border border-green-500/20 mb-8">
              <div className="flex items-center gap-3 mb-3">
                <Trophy className="w-6 h-6 text-green-500" />
                <h3 className="font-orbitron text-lg text-green-500">Match Result</h3>
              </div>
              <p className="text-white font-orbitron text-xl mb-2">Winner: {c.winnerClan}</p>
              {c.matchResult && <p className="text-gray-400">{c.matchResult}</p>}
              {c.streamUrl && (
                <a href={c.streamUrl} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-400 text-sm mt-3 inline-flex items-center gap-1">
                  <ExternalLink className="w-4 h-4" />
                  Watch Stream
                </a>
              )}
            </div>
          )}

          {/* Chicken shame (if expired) */}
          {c.status === "expired" && (
            <div className="bg-red-500/5 rounded-lg p-6 border border-red-500/20 mb-8">
              <div className="flex items-center gap-3 mb-3">
                <Skull className="w-6 h-6 text-red-500" />
                <h3 className="font-orbitron text-lg text-red-500">Wall of Chickens</h3>
              </div>
              <p className="text-gray-400 mb-4">
                <span className="font-orbitron text-white">{c.targetClan}</span> failed to respond within 72 hours and has been branded a chicken.
              </p>
              <div className="flex items-center gap-2 text-yellow-500 text-sm">
                <AlertTriangle className="w-4 h-4" />
                Scrub Fee: ${c.scrubFeeAmount ?? "150"} to remove from the wall
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            {c.status === "active" && (
              <button
                onClick={() => setShowPayment("accept")}
                className="btn-primary-gaming flex-1"
              >
                <CheckCircle className="w-5 h-5 inline mr-2" />
                Accept Challenge (${c.stakeAmount})
              </button>
            )}

            {c.status === "expired" && (
              <button
                onClick={() => setShowPayment("scrub")}
                className="btn-primary-gaming flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
              >
                <Bitcoin className="w-5 h-5 inline mr-2" />
                Scrub Reputation (${c.scrubFeeAmount ?? "150"})
              </button>
            )}

            <Link to="/" className="btn-secondary-gaming text-center">
              <ArrowLeft className="w-4 h-4 inline mr-2" />
              Back
            </Link>
          </div>
        </div>

        {/* Contact Info */}
        <div className="card-gaming p-6">
          <h3 className="font-orbitron text-lg text-white mb-4">Contact Information</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 text-gray-400">
              <Mail className="w-4 h-4 text-orange-500" />
              <span className="text-sm">{c.challengerContact}</span>
            </div>
            {c.challengerDiscord && (
              <div className="flex items-center gap-3 text-gray-400">
                <MessageCircle className="w-4 h-4 text-orange-500" />
                <span className="text-sm">{c.challengerDiscord}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal
          challenge={c}
          type={showPayment}
          onClose={() => setShowPayment(null)}
        />
      )}
    </div>
  );
}
