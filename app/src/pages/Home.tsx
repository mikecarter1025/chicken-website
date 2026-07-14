import { useState, useEffect } from "react";
import { trpc } from "@/providers/trpc";
import { Link } from "react-router";
import {
  Swords,
  Trophy,
  Skull,
  Clock,
  Zap,
  Shield,
  ChevronRight,
  Gamepad2,
  Users,
  Mail,
  MessageCircle,
  Send,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Loader2,
  Bitcoin,
} from "lucide-react";

// ─── Countdown Timer Component ──────────────────────────────────────────────
function CountdownTimer({ expiresAt }: { expiresAt: Date | null }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false,
  });

  useEffect(() => {
    if (!expiresAt) return;
    
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
      }

      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
        expired: false,
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (remaining.expired) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  if (timeLeft.expired) {
    return (
      <div className="flex items-center gap-2 text-red-500">
        <AlertTriangle className="w-4 h-4" />
        <span className="font-orbitron text-sm">EXPIRED</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <TimeUnit value={timeLeft.days} label="D" />
      <span className="text-orange-500/50 text-xl font-bold">:</span>
      <TimeUnit value={timeLeft.hours} label="H" />
      <span className="text-orange-500/50 text-xl font-bold">:</span>
      <TimeUnit value={timeLeft.minutes} label="M" />
      <span className="text-orange-500/50 text-xl font-bold">:</span>
      <TimeUnit value={timeLeft.seconds} label="S" />
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="countdown-digit tabular-nums">
        {String(value).padStart(2, "0")}
      </span>
      <span className="countdown-label">{label}</span>
    </div>
  );
}

// ─── Status Badge ───────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const statusClasses: Record<string, string> = {
    pending: "status-pending",
    active: "status-active",
    accepted: "status-accepted",
    expired: "status-expired",
    completed: "status-completed",
    scrubbed: "status-scrubbed",
  };
  return (
    <span className={`status-badge ${statusClasses[status] ?? "status-pending"}`}>
      {status}
    </span>
  );
}

// ─── Navigation ─────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#222]" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto section-padding">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <img src="/hero-mascot.png" alt="Chicken" className="w-8 h-8 object-contain" />
            <span className="font-orbitron font-bold text-lg gradient-text">
              CHICKEN.GG
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollTo("chopping-block")} className="nav-link">
              Chopping Block
            </button>
            <button onClick={() => scrollTo("confirmed")} className="nav-link">
              Confirmed
            </button>
            <button onClick={() => scrollTo("coop")} className="nav-link">
              The Coop
            </button>
            <Link to="/dashboard" className="nav-link">
              Dashboard
            </Link>
          </div>

          <button
            onClick={() => scrollTo("challenge-form")}
            className="btn-primary-gaming text-sm py-2 px-4"
          >
            <Swords className="w-4 h-4 inline mr-2" />
            Start Challenge
          </button>
        </div>
      </div>
    </nav>
  );
}

// ─── Hero Section ───────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="/hero-bg.jpg"
          alt=""
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a]" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto section-padding text-center pt-20">
        <div className="animate-float mb-8">
          <img
            src="/hero-mascot.png"
            alt="Who is the Chicken?"
            className="w-48 h-48 sm:w-64 sm:h-64 mx-auto object-contain drop-shadow-2xl"
          />
        </div>

        <h1 className="font-orbitron text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight">
          <span className="text-white">WHO IS THE</span>
          <br />
          <span className="gradient-text">CHICKEN?</span>
        </h1>

        <p className="font-rajdhani text-lg sm:text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
          The ultimate gaming challenge platform. Call out rival clans, put your
          crypto where your mouth is, and expose the cowards who refuse to fight.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => document.getElementById("challenge-form")?.scrollIntoView({ behavior: "smooth" })}
            className="btn-primary-gaming text-lg"
          >
            <Zap className="w-5 h-5 inline mr-2" />
            Issue a Challenge — $100
          </button>
          <button
            onClick={() => document.getElementById("chopping-block")?.scrollIntoView({ behavior: "smooth" })}
            className="btn-secondary-gaming text-lg"
          >
            View Active Challenges
            <ChevronRight className="w-5 h-5 inline ml-2" />
          </button>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <StatCard icon={<Swords className="w-6 h-6" />} label="Active Challenges" value="Live" />
          <StatCard icon={<Trophy className="w-6 h-6" />} label="Battles Fought" value=" tracked" />
          <StatCard icon={<Skull className="w-6 h-6" />} label="Chickens Exposed" value="Shamed" />
          <StatCard icon={<Bitcoin className="w-6 h-6" />} label="Crypto Payments" value="Secure" />
        </div>
      </div>
    </section>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="card-gaming p-4 text-center">
      <div className="text-orange-500 mb-2 flex justify-center">{icon}</div>
      <div className="font-orbitron text-white font-bold text-lg">{value}</div>
      <div className="text-gray-500 text-sm">{label}</div>
    </div>
  );
}

// ─── Chopping Block Section ─────────────────────────────────────────────────
function ChoppingBlockSection() {
  const { data, isLoading, refetch } = trpc.challenge.active.useQuery();

  // Auto-refetch every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => refetch(), 30000);
    return () => clearInterval(interval);
  }, [refetch]);

  return (
    <section id="chopping-block" className="py-20 relative">
      <div className="divider-gradient mb-20" />
      <div className="max-w-7xl mx-auto section-padding">
        <div className="flex items-center gap-4 mb-4">
          <img src="/chopping-block.png" alt="Chopping Block" className="w-16 h-16 object-contain" />
          <div>
            <h2 className="font-orbitron text-3xl sm:text-4xl font-bold text-white">
              THE <span className="text-orange-500">CHOPPING BLOCK</span>
            </h2>
            <p className="text-gray-500 mt-1">Active challenges — 72 hours to respond or be branded a chicken</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : !data?.challenges?.length ? (
          <div className="card-gaming p-12 text-center">
            <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="font-orbitron text-xl text-gray-400 mb-2">No Active Challenges</h3>
            <p className="text-gray-600 mb-6">Be the first to call out a rival clan</p>
            <button
              onClick={() => document.getElementById("challenge-form")?.scrollIntoView({ behavior: "smooth" })}
              className="btn-primary-gaming"
            >
              Start a Challenge
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {data.challenges.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Challenge Card ─────────────────────────────────────────────────────────
function ChallengeCard({ challenge }: { challenge: any }) {
  return (
    <div className="card-gaming p-4 sm:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
        {/* Status & Game */}
        <div className="flex items-center gap-3 min-w-[140px]">
          <StatusBadge status={challenge.status} />
          <span className="text-gray-400 text-sm flex items-center gap-1">
            <Gamepad2 className="w-4 h-4" />
            {challenge.game}
          </span>
        </div>

        {/* Clans */}
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="font-orbitron font-bold text-white text-lg">{challenge.challengerClan}</span>
            <span className="text-orange-500 font-bold">VS</span>
            <span className="font-orbitron font-bold text-red-400 text-lg">{challenge.targetClan}</span>
          </div>
          <p className="text-gray-500 text-sm mt-1">{challenge.matchType}</p>
        </div>

        {/* Countdown */}
        {challenge.status === "active" && (
          <div className="min-w-[200px]">
            <CountdownTimer expiresAt={challenge.expiresAt} />
          </div>
        )}

        {/* Stake & Actions */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="font-orbitron text-orange-500 font-bold">${challenge.stakeAmount}</div>
            <div className="text-gray-600 text-xs">at stake</div>
          </div>
          <Link
            to={`/challenge/${challenge.id}`}
            className="btn-secondary-gaming py-2 px-4 text-sm"
          >
            View
            <ExternalLink className="w-4 h-4 inline ml-1" />
          </Link>
        </div>
      </div>

      {challenge.description && (
        <p className="text-gray-500 text-sm mt-3 border-t border-[#1a1a1a] pt-3">
          {challenge.description}
        </p>
      )}
    </div>
  );
}

// ─── Confirmed Battles Section ──────────────────────────────────────────────
function ConfirmedBattlesSection() {
  const { data, isLoading } = trpc.challenge.confirmed.useQuery();

  return (
    <section id="confirmed" className="py-20">
      <div className="divider-gradient mb-20" />
      <div className="max-w-7xl mx-auto section-padding">
        <div className="flex items-center gap-4 mb-4">
          <img src="/confirmed-battles.png" alt="Confirmed" className="w-16 h-16 object-contain" />
          <div>
            <h2 className="font-orbitron text-3xl sm:text-4xl font-bold text-white">
              CONFIRMED <span className="text-green-500">BATTLES</span>
            </h2>
            <p className="text-gray-500 mt-1">These clans stepped up and accepted the challenge</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-green-500" />
          </div>
        ) : !data?.challenges?.length ? (
          <div className="card-gaming p-12 text-center">
            <Shield className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="font-orbitron text-xl text-gray-400 mb-2">No Confirmed Battles Yet</h3>
            <p className="text-gray-600">When a clan accepts a challenge, it appears here</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {data.challenges.map((challenge) => (
              <div key={challenge.id} className="card-gaming p-4 sm:p-6 border-l-4 border-l-green-500">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex items-center gap-3 min-w-[140px]">
                    <StatusBadge status={challenge.status} />
                    <span className="text-gray-400 text-sm flex items-center gap-1">
                      <Gamepad2 className="w-4 h-4" />
                      {challenge.game}
                    </span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-orbitron font-bold text-white">{challenge.challengerClan}</span>
                      <span className="text-green-500 font-bold">VS</span>
                      <span className="font-orbitron font-bold text-white">{challenge.targetClan}</span>
                    </div>
                    <p className="text-gray-500 text-sm mt-1">{challenge.matchType}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-orbitron text-green-500 font-bold">MATCH CONFIRMED</div>
                      <div className="text-gray-600 text-xs">
                        {challenge.acceptedAt ? new Date(challenge.acceptedAt).toLocaleDateString() : ""}
                      </div>
                    </div>
                    <Link
                      to={`/challenge/${challenge.id}`}
                      className="btn-secondary-gaming py-2 px-4 text-sm"
                    >
                      View
                      <ExternalLink className="w-4 h-4 inline ml-1" />
                    </Link>
                  </div>
                </div>

                {challenge.streamUrl && (
                  <a
                    href={challenge.streamUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-3 text-orange-500 hover:text-orange-400 text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Watch Stream
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── The Coop (Wall of Chickens) ────────────────────────────────────────────
function CoopSection() {
  const { data, isLoading } = trpc.challenge.wallOfChickens.useQuery();

  return (
    <section id="coop" className="py-20">
      <div className="divider-gradient mb-20" />
      <div className="max-w-7xl mx-auto section-padding">
        <div className="flex items-center gap-4 mb-4">
          <img src="/chicken-shame.png" alt="The Coop" className="w-16 h-16 object-contain" />
          <div>
            <h2 className="font-orbitron text-3xl sm:text-4xl font-bold text-white">
              THE <span className="text-red-500">COOP</span>
            </h2>
            <p className="text-gray-500 mt-1">
              Hall of shame — Clans that let the timer run out. Pay $150 to scrub your name.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-red-500" />
          </div>
        ) : !data?.challenges?.length ? (
          <div className="card-gaming p-12 text-center">
            <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="font-orbitron text-xl text-gray-400 mb-2">No Chickens Yet</h3>
            <p className="text-gray-600">All clans are fighting — for now</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {data.challenges.map((challenge) => (
              <div key={challenge.id} className="card-gaming p-4 sm:p-6 border-l-4 border-l-red-500">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex items-center gap-3 min-w-[140px]">
                    <StatusBadge status={challenge.status} />
                    <span className="text-gray-400 text-sm flex items-center gap-1">
                      <Gamepad2 className="w-4 h-4" />
                      {challenge.game}
                    </span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-orbitron font-bold text-white">{challenge.challengerClan}</span>
                      <span className="text-red-500 font-bold">VS</span>
                      <span className="font-orbitron font-bold text-red-400 line-through">{challenge.targetClan}</span>
                      <Skull className="w-5 h-5 text-red-500" />
                    </div>
                    <p className="text-gray-500 text-sm mt-1">{challenge.matchType}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-orbitron text-red-500 font-bold text-sm">CHICKEN</div>
                      <div className="text-gray-600 text-xs">
                        Expired {challenge.expiresAt ? new Date(challenge.expiresAt).toLocaleDateString() : ""}
                      </div>
                    </div>
                    <Link
                      to={`/challenge/${challenge.id}`}
                      className="btn-secondary-gaming py-2 px-4 text-sm"
                    >
                      Details
                    </Link>
                  </div>
                </div>

                {challenge.status === "expired" && (
                  <div className="mt-3 pt-3 border-t border-[#1a1a1a] flex items-center justify-between">
                    <p className="text-gray-500 text-sm">
                      <AlertTriangle className="w-4 h-4 inline mr-1 text-yellow-500" />
                      Pay ${challenge.scrubFeeAmount ?? "150"} to remove from the Wall of Chickens
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Challenge Form Section ─────────────────────────────────────────────────
function ChallengeFormSection() {
  const [formData, setFormData] = useState({
    challengerClan: "",
    challengerContact: "",
    challengerDiscord: "",
    targetClan: "",
    targetContact: "",
    game: "",
    matchType: "",
    description: "",
  });
  const [step, setStep] = useState<"form" | "payment" | "success">("form");
  const [createdChallenge, setCreatedChallenge] = useState<any>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [selectedCoin, setSelectedCoin] = useState("BTC");

  const createChallenge = trpc.challenge.create.useMutation({
    onSuccess: (data) => {
      if (data.success && data.challenge) {
        setCreatedChallenge(data.challenge);
        setStep("payment");
      }
    },
  });

  const createInvoice = trpc.payment.createChallengeInvoice.useMutation({
    onSuccess: (data) => {
      if (data.success && data.payment) {
        setPaymentData(data);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createChallenge.mutate(formData);
  };

  const handlePay = () => {
    if (createdChallenge) {
      createInvoice.mutate({
        challengeId: createdChallenge.id,
        coin: selectedCoin,
      });
    }
  };

  return (
    <section id="challenge-form" className="py-20">
      <div className="divider-gradient mb-20" />
      <div className="max-w-3xl mx-auto section-padding">
        <div className="text-center mb-10">
          <h2 className="font-orbitron text-3xl sm:text-4xl font-bold text-white mb-3">
            ISSUE A <span className="text-orange-500">CHALLENGE</span>
          </h2>
          <p className="text-gray-500">
            Call out a rival clan. $100 challenge fee. They have 72 hours to accept or face the Coop.
          </p>
        </div>

        {step === "form" && (
          <form onSubmit={handleSubmit} className="card-gaming p-6 sm:p-8 space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-orbitron text-gray-400 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Your Clan Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.challengerClan}
                  onChange={(e) => setFormData({ ...formData, challengerClan: e.target.value })}
                  className="input-gaming w-full"
                  placeholder="e.g. NightStalkers"
                />
              </div>
              <div>
                <label className="block text-sm font-orbitron text-gray-400 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Your Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.challengerContact}
                  onChange={(e) => setFormData({ ...formData, challengerContact: e.target.value })}
                  className="input-gaming w-full"
                  placeholder="clan@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-orbitron text-gray-400 mb-2">
                <MessageCircle className="w-4 h-4 inline mr-1" />
                Your Discord (optional)
              </label>
              <input
                type="text"
                value={formData.challengerDiscord}
                onChange={(e) => setFormData({ ...formData, challengerDiscord: e.target.value })}
                className="input-gaming w-full"
                placeholder="username#0000"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-orbitron text-gray-400 mb-2">
                  <Swords className="w-4 h-4 inline mr-1" />
                  Target Clan Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.targetClan}
                  onChange={(e) => setFormData({ ...formData, targetClan: e.target.value })}
                  className="input-gaming w-full"
                  placeholder="e.g. ShadowLegion"
                />
              </div>
              <div>
                <label className="block text-sm font-orbitron text-gray-400 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Target Clan Email (optional)
                </label>
                <input
                  type="email"
                  value={formData.targetContact}
                  onChange={(e) => setFormData({ ...formData, targetContact: e.target.value })}
                  className="input-gaming w-full"
                  placeholder="target@email.com"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-orbitron text-gray-400 mb-2">
                  <Gamepad2 className="w-4 h-4 inline mr-1" />
                  Game *
                </label>
                <input
                  type="text"
                  required
                  value={formData.game}
                  onChange={(e) => setFormData({ ...formData, game: e.target.value })}
                  className="input-gaming w-full"
                  placeholder="e.g. Call of Duty"
                />
              </div>
              <div>
                <label className="block text-sm font-orbitron text-gray-400 mb-2">
                  <Shield className="w-4 h-4 inline mr-1" />
                  Match Type *
                </label>
                <input
                  type="text"
                  required
                  value={formData.matchType}
                  onChange={(e) => setFormData({ ...formData, matchType: e.target.value })}
                  className="input-gaming w-full"
                  placeholder="e.g. 5v5 Search & Destroy"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-orbitron text-gray-400 mb-2">
                Challenge Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-gaming w-full h-24 resize-none"
                placeholder="Describe the challenge rules, map preferences, etc."
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#222]">
              <div className="text-gray-400">
                <span className="text-sm">Challenge Fee:</span>
                <span className="font-orbitron text-2xl text-orange-500 ml-2">$100</span>
              </div>
              <button
                type="submit"
                disabled={createChallenge.isPending}
                className="btn-primary-gaming disabled:opacity-50"
              >
                {createChallenge.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                ) : (
                  <Send className="w-5 h-5 inline mr-2" />
                )}
                Continue to Payment
              </button>
            </div>
          </form>
        )}

        {step === "payment" && createdChallenge && (
          <div className="card-gaming p-6 sm:p-8">
            {!paymentData ? (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <Bitcoin className="w-8 h-8 text-orange-500" />
                  <h3 className="font-orbitron text-xl text-white">Pay with Crypto</h3>
                </div>

                <div className="bg-[#0a0a0a] rounded-lg p-4 mb-6 border border-[#222]">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Challenge</span>
                    <span className="text-white font-orbitron">{createdChallenge.challengerClan} vs {createdChallenge.targetClan}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Game</span>
                    <span className="text-white">{createdChallenge.game}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#222]">
                    <span className="text-gray-400">Amount</span>
                    <span className="font-orbitron text-xl text-orange-500">$100.00</span>
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
                          selectedCoin === coin
                            ? "border-orange-500 bg-orange-500/10 text-orange-500"
                            : "border-[#333] text-gray-400 hover:border-[#444]"
                        }`}
                      >
                        {coin}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handlePay}
                  disabled={createInvoice.isPending}
                  className="btn-primary-gaming w-full disabled:opacity-50"
                >
                  {createInvoice.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                  ) : (
                    <Bitcoin className="w-5 h-5 inline mr-2" />
                  )}
                  Generate Payment Invoice
                </button>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="font-orbitron text-2xl text-white mb-2">Invoice Created!</h3>
                  <p className="text-gray-400">Send the payment to activate your challenge</p>
                </div>

                {paymentData.invoiceUrl && (
                  <a
                    href={paymentData.invoiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary-gaming w-full block text-center mb-4"
                  >
                    <ExternalLink className="w-5 h-5 inline mr-2" />
                    Open Payment Page
                  </a>
                )}

                <div className="bg-[#0a0a0a] rounded-lg p-4 border border-[#222]">
                  <p className="text-gray-500 text-sm text-center">
                    Invoice ID: {paymentData.payment?.invoiceId}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setStep("form");
                    setPaymentData(null);
                    setCreatedChallenge(null);
                    setFormData({
                      challengerClan: "",
                      challengerContact: "",
                      challengerDiscord: "",
                      targetClan: "",
                      targetContact: "",
                      game: "",
                      matchType: "",
                      description: "",
                    });
                  }}
                  className="btn-secondary-gaming w-full mt-4"
                >
                  Create Another Challenge
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Footer ─────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="py-12 border-t border-[#222]">
      <div className="max-w-7xl mx-auto section-padding">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <img src="/hero-mascot.png" alt="" className="w-8 h-8 object-contain" />
            <span className="font-orbitron font-bold gradient-text">CHICKEN.GG</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-500">
            <span>The ultimate gaming challenge platform</span>
          </div>

          <div className="flex items-center gap-4 text-gray-600 text-sm">
            <Bitcoin className="w-5 h-5" />
            <span>Powered by CoinRemitter</span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#1a1a1a] text-center text-gray-600 text-sm">
          <p>No clan is safe. Challenge or be challenged.</p>
        </div>
      </div>
    </footer>
  );
}

// ─── Main Home Page ─────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <HeroSection />
      <ChoppingBlockSection />
      <ConfirmedBattlesSection />
      <CoopSection />
      <ChallengeFormSection />
      <Footer />
    </div>
  );
}
