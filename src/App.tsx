import { useState, useEffect } from 'react';
import { 
  Clock, Swords, Trophy, AlertTriangle, MessageCircle, Send, 
  Plus, Trash2, Edit3, Check, X, Shield, 
  LogOut, Menu, Gamepad2, DollarSign, Timer, Phone,
  Eye, EyeOff, Users, Target, Square, SquareCheck
} from 'lucide-react';
import { useChallenges, useShame, useSettings, useAdminAuth } from '@/hooks/useApi';
import type { TeamChallenge, ShameEntry } from '@/types';

/* ─── Utility: Countdown Timer ─── */
function useCountdown(deadline: Date) {
  const [timeLeft, setTimeLeft] = useState('');
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const end = deadline.getTime();
      const diff = end - now;
      if (diff <= 0) {
        setTimeLeft('00:00:00');
        setExpired(true);
        clearInterval(interval);
        return;
      }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${days}d ${hours.toString().padStart(2,'0')}h ${minutes.toString().padStart(2,'0')}m ${seconds.toString().padStart(2,'0')}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  return { timeLeft, expired };
}

function getDeadline(createdAt: Date, hours: number): Date {
  return new Date(createdAt.getTime() + hours * 3600000);
}

/* ─── Navigation ─── */
function Navigation({ currentPage, setPage, isAdmin }: { currentPage: string; setPage: (p: string) => void; isAdmin: boolean }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showHiddenAdmin, setShowHiddenAdmin] = useState(false);
  const navItems = [
    { id: 'home', label: 'Home', icon: Gamepad2 },
    { id: 'chopping', label: 'Chopping Block', icon: Clock },
    { id: 'confirmed', label: 'Confirmed', icon: Trophy },
    { id: 'coop', label: 'The Coop', icon: AlertTriangle },
    { id: 'removal', label: 'Get Removed', icon: DollarSign },
  ];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setShowHiddenAdmin(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-red-900/50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <button onClick={() => setPage('home')} className="flex items-center gap-2 group">
            <span className="text-2xl font-black text-red-500 tracking-tighter group-hover:text-red-400 transition">WHO IS THE CHICKEN?</span>
          </button>
          
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  currentPage === item.id 
                    ? 'bg-red-600 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
            {(showHiddenAdmin || isAdmin) && (
              <button
                onClick={() => setPage('admin')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  currentPage === 'admin' 
                    ? 'bg-red-600 text-white' 
                    : 'text-gray-500 hover:text-white hover:bg-white/10'
                }`}
              >
                <Shield size={16} />
                {isAdmin ? 'Dashboard' : 'Admin'}
              </button>
            )}
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-white p-2">
            <Menu size={24} />
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setPage(item.id); setMobileOpen(false); }}
                className={`flex items-center gap-2 w-full px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                  currentPage === item.id 
                    ? 'bg-red-600 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
            {(showHiddenAdmin || isAdmin) && (
              <button
                onClick={() => { setPage('admin'); setMobileOpen(false); }}
                className="flex items-center gap-2 w-full px-4 py-3 rounded-lg text-sm font-semibold text-gray-500 hover:text-white hover:bg-white/10 transition-all"
              >
                <Shield size={16} />
                Admin
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

/* ─── Home Page ─── */
function HomePage({ setPage, settings }: { setPage: (p: string) => void; settings: { admissionFee: number; whatsappNumber: string; removalFee: number } }) {
  return (
    <div className="min-h-screen pt-16">
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="/hero-chicken.jpg" alt="Gaming Chicken" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
            ARE YOU A <span className="text-red-500">CHICKEN</span>?
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 font-medium">
            The ultimate gaming call-out platform. Put your rival clan, team, or tribe to the test and see who has the guts to show up.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => setPage('chopping')}
              className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105"
            >
              <Swords size={20} />
              View Active Challenges
            </button>
            <a 
              href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g,'')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105"
            >
              <MessageCircle size={20} />
              Let's Talk on WhatsApp
            </a>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-black to-red-950/20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-black text-center text-white mb-4">HOW IT WORKS</h2>
          <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
            Got a rival team that keeps talking trash? Here's how you call them out and settle it once and for all.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Submit Your Team', desc: 'Tell us about your clan, team, or tribe. Share your game, your rivals, and what kind of match you want. We handle the rest.', icon: Users },
              { step: '02', title: 'We List the Challenge', desc: 'Your challenge goes live on the Chopping Block with a countdown timer. Your rivals now have a ticking clock to respond.', icon: Timer },
              { step: '03', title: 'They Accept or Get Egged', desc: 'If they show up and accept, it is game on. If they chicken out, their name lands on the Coop - our Wall of Shame.', icon: AlertTriangle },
            ].map((item, i) => (
              <div key={i} className="bg-gradient-to-b from-white/5 to-transparent border border-red-900/30 rounded-2xl p-6 hover:border-red-600/50 transition-all group">
                <div className="text-5xl font-black text-red-900/50 mb-4">{item.step}</div>
                <item.icon className="text-red-500 mb-4 group-hover:scale-110 transition-transform" size={32} />
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-black">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-4xl font-black text-center text-white mb-4">WHAT YOU CAN DO HERE</h2>
          <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
            This platform is built for competitive gamers who want to settle the score. Here is what is possible:
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: 'Call Out a Rival', desc: 'Have a rival clan, team, or tribe that keeps dodging? Submit their name, pick the game and match type, and we will put them on the Chopping Block with a timer. The whole community sees it.', icon: Swords, color: 'text-red-500' },
              { title: 'Accept a Challenge', desc: 'Someone called you out? Step up and accept. Show the community you are not afraid to compete. Your match moves to the Confirmed Battles section.', icon: Target, color: 'text-green-500' },
              { title: 'Track the Drama', desc: 'Browse the Chopping Block for active challenges, check out Confirmed Battles for upcoming showdowns, or visit The Coop to see who chickened out.', icon: Trophy, color: 'text-yellow-500' },
              { title: 'Any Game, Any Format', desc: 'Call of Duty, Valorant, Fortnite, Apex - whatever you play. Set it up as 1v1, 2v2, 3v3, 5v5, or any format your teams agree on.', icon: Users, color: 'text-blue-500' },
            ].map((item, i) => (
              <div key={i} className="bg-white/5 border border-red-900/30 rounded-2xl p-6 hover:border-red-600/50 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <item.icon className={item.color} size={28} />
                  <h3 className="text-xl font-bold text-white">{item.title}</h3>
                </div>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-black to-red-950/30">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/5 border border-red-900/50 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="text-green-400" size={32} />
                <h2 className="text-3xl font-black text-white">Get Listed</h2>
              </div>
              <p className="text-gray-400 text-lg mb-6">
                Want to get your challenge posted and your rival put on notice? There is a small listing fee to keep things serious and avoid spam. Reach out and we will get you set up.
              </p>
              <div className="flex items-center gap-3 bg-green-600/20 border border-green-600/50 rounded-lg p-4 mb-4">
                <DollarSign className="text-green-400" size={24} />
                <div>
                  <p className="text-green-400 font-bold text-lg">${settings.admissionFee} USD</p>
                  <p className="text-gray-400 text-sm">One-time listing fee per challenge</p>
                </div>
              </div>
              <div className="bg-red-900/30 rounded-lg p-4 border border-red-800/50">
                <p className="text-red-300 font-semibold text-sm">
                  <AlertTriangle className="inline mr-2" size={16} />
                  Dodge the challenge and your team lands on the Wall of Shame. Removal fee is ${settings.removalFee} USD.
                </p>
              </div>
            </div>

            <div className="bg-white/5 border border-red-900/50 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <Phone className="text-green-400" size={32} />
                <h2 className="text-3xl font-black text-white">Let's Talk</h2>
              </div>
              <p className="text-gray-400 text-lg mb-6">
                Ready to call someone out? Got questions? Just message us on WhatsApp and we will walk you through it.
              </p>
              <a 
                href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g,'')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-green-600/20 border border-green-600/50 rounded-lg p-4 hover:bg-green-600/30 transition mb-4"
              >
                <MessageCircle className="text-green-400" size={24} />
                <div>
                  <p className="text-green-400 font-bold">WhatsApp</p>
                  <p className="text-white">{settings.whatsappNumber}</p>
                </div>
              </a>
              <div className="flex items-center gap-3 bg-blue-600/20 border border-blue-600/50 rounded-lg p-4">
                <Send className="text-blue-400" size={24} />
                <div>
                  <p className="text-blue-400 font-bold">Telegram</p>
                  <p className="text-gray-400 text-sm">Coming soon...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-red-950/30 to-black">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Users className="text-red-500 mx-auto mb-6" size={64} />
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">GOT A TEAM TO CALL OUT?</h2>
          <p className="text-xl text-gray-400 mb-8">
            Whether it is a clan, a squad, a tribe, or just a group of friends talking trash - we will help you put them on the spot. Tell us your team name, your rivals, the game, and the match format. We handle the rest.
          </p>
          <p className="text-lg text-gray-500 mb-8">
            Listing fee applies to keep things serious. Message us to get started.
          </p>
          <a 
            href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g,'')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-10 py-5 rounded-2xl font-bold text-xl transition-all transform hover:scale-105 shadow-lg shadow-green-600/20"
          >
            <MessageCircle size={28} />
            Message Us on WhatsApp
          </a>
        </div>
      </section>

      <footer className="bg-black border-t border-red-900/30 py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-2xl font-black text-red-500 mb-4">WHO IS THE CHICKEN?</p>
          <p className="text-gray-500 mb-6">The ultimate gaming call-out platform. No dodging allowed.</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <button onClick={() => setPage('chopping')} className="text-gray-400 hover:text-white transition">Chopping Block</button>
            <button onClick={() => setPage('confirmed')} className="text-gray-400 hover:text-white transition">Confirmed</button>
            <button onClick={() => setPage('coop')} className="text-gray-400 hover:text-white transition">The Coop</button>
            <button onClick={() => setPage('removal')} className="text-gray-400 hover:text-white transition">Get Removed</button>
          </div>
          <p className="text-gray-600 mt-8 text-sm"> whoisthechicken.com - All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

/* ─── Chopping Block Page ─── */
function ChoppingBlockPage({ activeChallenges }: { activeChallenges: TeamChallenge[] }) {
  return (
    <div className="min-h-screen pt-16 bg-gradient-to-b from-black to-red-950/20">
      <div className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <img src="/chopping-block.jpg" alt="Chopping Block" className="absolute inset-0 w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="relative z-10 text-center px-4">
          <Clock className="text-red-500 mx-auto mb-4" size={48} />
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4">THE CHOPPING BLOCK</h1>
          <p className="text-xl text-gray-300">Active challenges waiting for a response. Time is ticking...</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {activeChallenges.length === 0 ? (
          <div className="text-center py-20">
            <Clock className="text-gray-600 mx-auto mb-4" size={64} />
            <p className="text-2xl text-gray-500 font-bold">No active challenges</p>
            <p className="text-gray-600 mt-2">Be the first to issue a challenge!</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {activeChallenges.map(challenge => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ChallengeCard({ challenge }: { challenge: TeamChallenge }) {
  const deadline = getDeadline(challenge.createdAt, challenge.responseDeadlineHours);
  const { timeLeft, expired } = useCountdown(deadline);

  return (
    <div className="bg-white/5 border border-red-900/50 rounded-2xl p-6 hover:border-red-500/50 transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">ACTIVE</span>
            <span className="text-gray-500 text-sm">{challenge.game}</span>
            <span className="text-red-400 text-sm font-semibold">{challenge.battleType}</span>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Challenger</p>
              <p className="text-xl font-bold text-white">{challenge.challengerTeam}</p>
              {challenge.challengerDiscord && <p className="text-sm text-gray-400">{challenge.challengerDiscord}</p>}
            </div>
            <Swords className="text-red-500" size={24} />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Target</p>
              <p className="text-xl font-bold text-red-400">{challenge.targetTeam}</p>
              {challenge.targetDiscord && <p className="text-sm text-gray-400">{challenge.targetDiscord}</p>}
            </div>
          </div>
        </div>

        <div className="bg-black/50 rounded-xl p-4 border border-red-900/30 min-w-[200px] text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Time Remaining</p>
          <p className={`text-2xl font-black font-mono ${expired ? 'text-red-500' : 'text-white'}`}>
            {timeLeft}
          </p>
          <p className="text-xs text-gray-600 mt-1">of {challenge.responseDeadlineHours}h limit</p>
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Stake</p>
          <p className="text-3xl font-black text-green-400">${challenge.stakeAmount}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Confirmed Battles Page ─── */
function ConfirmedPage({ confirmedChallenges }: { confirmedChallenges: TeamChallenge[] }) {
  return (
    <div className="min-h-screen pt-16 bg-gradient-to-b from-black to-green-950/20">
      <div className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <img src="/confirmed-battle.jpg" alt="Confirmed Battles" className="absolute inset-0 w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="relative z-10 text-center px-4">
          <Trophy className="text-yellow-500 mx-auto mb-4" size={48} />
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4">CONFIRMED BATTLES</h1>
          <p className="text-xl text-gray-300">These teams put their money where their mouth is. Respect.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {confirmedChallenges.length === 0 ? (
          <div className="text-center py-20">
            <Trophy className="text-gray-600 mx-auto mb-4" size={64} />
            <p className="text-2xl text-gray-500 font-bold">No confirmed battles yet</p>
            <p className="text-gray-600 mt-2">Challenges are waiting for acceptance...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {confirmedChallenges.map(challenge => (
              <div key={challenge.id} className="bg-gradient-to-b from-yellow-900/20 to-black border border-yellow-700/30 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">CONFIRMED</span>
                  <span className="text-gray-500 text-sm">{challenge.game}</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">{challenge.challengerTeam}</p>
                    {challenge.challengerDiscord && <p className="text-xs text-gray-400">{challenge.challengerDiscord}</p>}
                  </div>
                  <div className="bg-yellow-600/20 rounded-full p-3">
                    <Swords className="text-yellow-500" size={24} />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">{challenge.targetTeam}</p>
                    {challenge.targetDiscord && <p className="text-xs text-gray-400">{challenge.targetDiscord}</p>}
                  </div>
                </div>
                <div className="bg-black/30 rounded-lg p-3 text-center">
                  <p className="text-yellow-400 font-bold">{challenge.battleType}</p>
                  <p className="text-green-400 font-semibold">${challenge.stakeAmount} on the line</p>
                </div>
                {challenge.acceptedAt && (
                  <p className="text-xs text-gray-600 mt-3 text-center">
                    Accepted on {new Date(challenge.acceptedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Coop Page ─── */
function CoopPage({ shameEntries }: { shameEntries: ShameEntry[] }) {
  const unpaid = shameEntries.filter(e => !e.paidRemoval);
  return (
    <div className="min-h-screen pt-16 bg-gradient-to-b from-black to-orange-950/20">
      <div className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <img src="/coop-shame.jpg" alt="The Coop" className="absolute inset-0 w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="relative z-10 text-center px-4">
          <AlertTriangle className="text-orange-500 mx-auto mb-4" size={48} />
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4">THE COOP</h1>
          <p className="text-xl text-gray-300">Wall of Shame. These teams dodged their challenges. Certified chickens.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {unpaid.length === 0 ? (
          <div className="text-center py-20">
            <AlertTriangle className="text-gray-600 mx-auto mb-4" size={64} />
            <p className="text-2xl text-gray-500 font-bold">No chickens yet</p>
            <p className="text-gray-600 mt-2">The coop is empty... for now.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {unpaid.map(entry => (
              <div key={entry.id} className="bg-gradient-to-b from-orange-900/20 to-black border border-orange-800/30 rounded-2xl p-6 hover:border-orange-600/50 transition-all">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full">CHICKEN</span>
                </div>
                <h3 className="text-2xl font-black text-orange-400 mb-2">{entry.teamName}</h3>
                <div className="space-y-1 mb-4">
                  {entry.discord && <p className="text-sm text-gray-400">{entry.discord}</p>}
                  {entry.twitch && <p className="text-sm text-gray-400">Twitch: {entry.twitch}</p>}
                  {entry.platformId && <p className="text-sm text-gray-400">ID: {entry.platformId}</p>}
                </div>
                <div className="bg-black/30 rounded-lg p-3 mb-3">
                  <p className="text-sm text-gray-400">Challenged by: <span className="text-white font-semibold">{entry.challengerTeam}</span></p>
                  <p className="text-sm text-gray-400">Game: <span className="text-white">{entry.game}</span></p>
                  <p className="text-sm text-gray-400">Mode: <span className="text-white">{entry.battleType}</span></p>
                </div>
                <p className="text-xs text-gray-600">
                  Expired: {new Date(entry.expiredAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Removal Request Page ─── */
function RemovalPage({ settings }: { settings: { removalFee: number; whatsappNumber: string } }) {
  return (
    <div className="min-h-screen pt-16 bg-gradient-to-b from-black to-green-950/20">
      <div className="max-w-3xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <DollarSign className="text-green-500 mx-auto mb-4" size={48} />
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">GET OFF THE WALL</h1>
          <p className="text-xl text-gray-300">Made it to the Coop? There's only one way out.</p>
        </div>

        <div className="bg-white/5 border border-green-900/50 rounded-2xl p-8 mb-8">
          <div className="text-center mb-8">
            <p className="text-gray-400 mb-2">Reputation Scrub Fee</p>
            <p className="text-6xl font-black text-green-400">${settings.removalFee}</p>
            <p className="text-gray-500 mt-2">USD - One-time payment</p>
          </div>

          <div className="space-y-4 mb-8">
            {[
              'Your team name is permanently removed from the Wall of Shame',
              'All associated challenge records are cleared',
              'Your reputation is restored (until next time)',
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-3 bg-black/30 rounded-lg p-4">
                <Check className="text-green-500 mt-1 shrink-0" size={20} />
                <p className="text-gray-300">{text}</p>
              </div>
            ))}
          </div>

          <a 
            href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g,'')}?text=I want to pay the $${settings.removalFee} removal fee to get my team off the Wall of Shame.`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white px-8 py-5 rounded-xl font-bold text-xl transition-all w-full transform hover:scale-105"
          >
            <MessageCircle size={24} />
            Request Removal via WhatsApp
          </a>
        </div>

        <div className="bg-red-900/20 border border-red-900/50 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-red-500 mt-1 shrink-0" size={24} />
            <div>
              <p className="text-red-400 font-bold mb-1">No Negotiations</p>
              <p className="text-gray-400 text-sm">
                The removal fee is non-negotiable. If you're on the Wall of Shame, 
                you dodged a challenge. Pay the fee or wear the badge forever.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Admin Dashboard ─── */
function AdminDashboard({ 
  adminState, login, logout, isLockedOut, remainingAttempts,
  activeChallenges, confirmedChallenges, shameEntries,
  addChallenge, updateChallenge, deleteChallenge, deleteChallengesBulk, moveToConfirmed,
  addShameEntry, updateShameEntry, deleteShameEntry, deleteShameEntriesBulk, markAsPaid,
  settings, updateSettings,
}: {
  adminState: { isLoggedIn: boolean; email: string };
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isLockedOut: boolean;
  remainingAttempts: number;
  activeChallenges: TeamChallenge[];
  confirmedChallenges: TeamChallenge[];
  shameEntries: ShameEntry[];
  addChallenge: (c: unknown) => void;
  updateChallenge: (id: number, u: unknown) => void;
  deleteChallenge: (id: number) => void;
  deleteChallengesBulk: (ids: number[]) => void;
  moveToConfirmed: (id: number) => void;
  addShameEntry: (e: unknown) => void;
  updateShameEntry: (id: number, u: unknown) => void;
  deleteShameEntry: (id: number) => void;
  deleteShameEntriesBulk: (ids: number[]) => void;
  markAsPaid: (id: number) => void;
  settings: { defaultResponseHours: number; admissionFee: number; removalFee: number; whatsappNumber: string };
  updateSettings: (u: Partial<typeof settings>) => void;
}) {
  const [email, setEmail] = useState('ali.jasser@aol.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'challenges' | 'confirmed' | 'coop' | 'settings'>('challenges');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedChallenges, setSelectedChallenges] = useState<Set<number>>(new Set());
  const [selectedShame, setSelectedShame] = useState<Set<number>>(new Set());

  const [formData, setFormData] = useState<Record<string, unknown>>({
    responseDeadlineHours: settings.defaultResponseHours,
    stakeAmount: settings.admissionFee,
  });

  useEffect(() => {
    setSelectedChallenges(new Set());
    setSelectedShame(new Set());
  }, [activeTab]);

  const getCurrentList = () => {
    if (activeTab === 'challenges') return activeChallenges;
    if (activeTab === 'confirmed') return confirmedChallenges;
    if (activeTab === 'coop') return shameEntries.filter(e => !e.paidRemoval);
    return [];
  };

  const getSelectedSet = () => activeTab === 'coop' ? selectedShame : selectedChallenges;

  const allSelected = getCurrentList().length > 0 && getCurrentList().every((item: {id: number}) => getSelectedSet().has(item.id));
  const someSelected = getSelectedSet().size > 0;

  const toggleSelectAll = () => {
    if (allSelected) {
      if (activeTab === 'coop') setSelectedShame(new Set());
      else setSelectedChallenges(new Set());
    } else {
      const ids = getCurrentList().map((item: {id: number}) => item.id);
      if (activeTab === 'coop') setSelectedShame(new Set(ids));
      else setSelectedChallenges(new Set(ids));
    }
  };

  const toggleSelectOne = (id: number) => {
    if (activeTab === 'coop') {
      setSelectedShame(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
    } else {
      setSelectedChallenges(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
    }
  };

  const handleBulkDelete = () => {
    const ids = Array.from(getSelectedSet());
    if (ids.length === 0) return;
    if (!confirm(`Delete ${ids.length} item(s)? This cannot be undone.`)) return;
    if (activeTab === 'coop') { deleteShameEntriesBulk(ids); setSelectedShame(new Set()); }
    else { deleteChallengesBulk(ids); setSelectedChallenges(new Set()); }
  };

  const resetForm = () => {
    setFormData({ responseDeadlineHours: settings.defaultResponseHours, stakeAmount: settings.admissionFee });
    setEditingId(null); setShowAddForm(false);
  };

  const handleSave = () => {
    if (activeTab === 'coop') {
      if (!formData.teamName || !formData.challengerTeam || !formData.game || !formData.battleType) return;
      if (editingId) updateShameEntry(editingId, formData);
      else addShameEntry(formData);
    } else {
      if (!formData.challengerTeam || !formData.targetTeam || !formData.game || !formData.battleType) return;
      if (editingId) updateChallenge(editingId, formData);
      else addChallenge(formData);
    }
    resetForm();
  };

  const startEdit = (item: TeamChallenge | ShameEntry) => {
    setFormData({ ...(item as unknown as Record<string, unknown>) });
    setEditingId(item.id);
    setShowAddForm(true);
  };

  const handleExpire = (challenge: TeamChallenge) => {
    addShameEntry({
      teamName: challenge.targetTeam,
      discord: challenge.targetDiscord,
      twitch: challenge.targetTwitch,
      platformId: challenge.targetPlatformId,
      game: challenge.game,
      battleType: challenge.battleType,
      challengerTeam: challenge.challengerTeam,
    });
    deleteChallenge(challenge.id);
  };

  const CheckboxIcon = ({ checked, partial }: { checked: boolean; partial?: boolean }) => (
    checked ? <SquareCheck size={18} className="text-red-500" /> : 
    partial ? <div className="w-[18px] h-[18px] rounded border-2 border-red-500 bg-red-500/30" /> :
    <Square size={18} className="text-gray-600" />
  );

  if (!adminState.isLoggedIn) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center bg-black">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white/5 border border-red-900/50 rounded-2xl p-8">
            <div className="text-center mb-8">
              <Shield className="text-red-500 mx-auto mb-4" size={48} />
              <h1 className="text-2xl font-black text-white">ADMIN LOGIN</h1>
              <p className="text-gray-500 mt-2">Restricted access. 3 attempts only.</p>
              <p className="text-gray-600 mt-1 text-xs">Press Ctrl+Shift+A to reveal admin link</p>
            </div>
            {isLockedOut ? (
              <div className="bg-red-900/30 border border-red-600/50 rounded-lg p-4 text-center">
                <AlertTriangle className="text-red-500 mx-auto mb-2" size={32} />
                <p className="text-red-400 font-bold">Account Locked</p>
                <p className="text-gray-400 text-sm mt-1">Too many failed attempts. Clear browser data to reset.</p>
              </div>
            ) : (
              <form onSubmit={(e) => {
                e.preventDefault(); setError('');
                if (!email || !password) { setError('Please fill in all fields'); return; }
                login(email, password);
                setTimeout(() => {
                  const stored = localStorage.getItem('witc_admin');
                  if (stored) { const s = JSON.parse(stored); if (!s.isLoggedIn) setError(`Invalid credentials. ${s.loginAttempts >= 3 ? 'Account locked.' : `${3 - s.loginAttempts} attempts remaining.`}`); }
                }, 500);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-1">Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      className="w-full bg-black/50 border border-red-900/50 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none" placeholder="ali.jasser@aol.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-1">Password</label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                        className="w-full bg-black/50 border border-red-900/50 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none pr-12" placeholder="Enter password" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                  {error && <div className="bg-red-900/30 border border-red-600/50 rounded-lg p-3"><p className="text-red-400 text-sm">{error}</p></div>}
                  <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold transition">
                    Login ({remainingAttempts} attempts left)
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-black">
      <div className="bg-red-950/30 border-b border-red-900/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Shield className="text-red-500" size={28} />
              <div>
                <h1 className="text-xl font-black text-white">ADMIN DASHBOARD</h1>
                <p className="text-sm text-gray-500">{adminState.email}</p>
              </div>
            </div>
            <button onClick={logout} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Active', value: activeChallenges.length, icon: Clock, color: 'text-red-400' },
            { label: 'Confirmed', value: confirmedChallenges.length, icon: Trophy, color: 'text-green-400' },
            { label: 'Chickens', value: shameEntries.filter(e => !e.paidRemoval).length, icon: AlertTriangle, color: 'text-orange-400' },
            { label: 'Removed', value: shameEntries.filter(e => e.paidRemoval).length, icon: DollarSign, color: 'text-blue-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-white/5 border border-red-900/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2"><stat.icon className={stat.color} size={18} /><span className="text-sm text-gray-500">{stat.label}</span></div>
              <p className="text-3xl font-black text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { id: 'challenges' as const, label: 'Active Challenges', icon: Clock },
            { id: 'confirmed' as const, label: 'Confirmed', icon: Trophy },
            { id: 'coop' as const, label: 'The Coop', icon: AlertTriangle },
            { id: 'settings' as const, label: 'Settings', icon: Shield },
          ].map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); resetForm(); }}
              className={`flex items-center gap-2 px-5 py-3 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}>
              <tab.icon size={16} />{tab.label}
            </button>
          ))}
        </div>

        {activeTab !== 'settings' && !showAddForm && getCurrentList().length > 0 && (
          <div className="flex items-center justify-between bg-white/5 border border-red-900/30 rounded-xl p-3 mb-4">
            <div className="flex items-center gap-3">
              <button onClick={toggleSelectAll} className="flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-white transition">
                <CheckboxIcon checked={allSelected} partial={someSelected && !allSelected} />
                {allSelected ? 'Deselect All' : 'Select All'}
              </button>
              {someSelected && <span className="text-sm text-red-400 font-semibold">{getSelectedSet().size} selected</span>}
            </div>
            {someSelected && (
              <button onClick={handleBulkDelete} className="flex items-center gap-2 bg-red-600/80 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition">
                <Trash2 size={16} /> Delete Selected ({getSelectedSet().size})
              </button>
            )}
          </div>
        )}

        {showAddForm && (
          <div className="bg-white/5 border border-red-900/50 rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-bold text-white mb-4">{editingId ? 'Edit' : 'Add New'} {activeTab === 'coop' ? 'Shame Entry' : 'Challenge'}</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {activeTab === 'coop' ? (
                <>
                  <input placeholder="Team Name *" value={String(formData.teamName || '')} onChange={e => setFormData(p => ({ ...p, teamName: e.target.value }))} className="bg-black/50 border border-red-900/50 rounded-lg px-4 py-3 text-white focus:border-red-500 outline-none" />
                  <input placeholder="Discord" value={String(formData.discord || '')} onChange={e => setFormData(p => ({ ...p, discord: e.target.value }))} className="bg-black/50 border border-red-900/50 rounded-lg px-4 py-3 text-white focus:border-red-500 outline-none" />
                  <input placeholder="Twitch" value={String(formData.twitch || '')} onChange={e => setFormData(p => ({ ...p, twitch: e.target.value }))} className="bg-black/50 border border-red-900/50 rounded-lg px-4 py-3 text-white focus:border-red-500 outline-none" />
                  <input placeholder="Platform ID" value={String(formData.platformId || '')} onChange={e => setFormData(p => ({ ...p, platformId: e.target.value }))} className="bg-black/50 border border-red-900/50 rounded-lg px-4 py-3 text-white focus:border-red-500 outline-none" />
                  <input placeholder="Game *" value={String(formData.game || '')} onChange={e => setFormData(p => ({ ...p, game: e.target.value }))} className="bg-black/50 border border-red-900/50 rounded-lg px-4 py-3 text-white focus:border-red-500 outline-none" />
                  <input placeholder="Battle Type *" value={String(formData.battleType || '')} onChange={e => setFormData(p => ({ ...p, battleType: e.target.value }))} className="bg-black/50 border border-red-900/50 rounded-lg px-4 py-3 text-white focus:border-red-500 outline-none" />
                  <input placeholder="Challenger Team *" value={String(formData.challengerTeam || '')} onChange={e => setFormData(p => ({ ...p, challengerTeam: e.target.value }))} className="bg-black/50 border border-red-900/50 rounded-lg px-4 py-3 text-white focus:border-red-500 outline-none" />
                </>
              ) : (
                <>
                  <input placeholder="Challenger Team *" value={String(formData.challengerTeam || '')} onChange={e => setFormData(p => ({ ...p, challengerTeam: e.target.value }))} className="bg-black/50 border border-red-900/50 rounded-lg px-4 py-3 text-white focus:border-red-500 outline-none" />
                  <input placeholder="Challenger Discord" value={String(formData.challengerDiscord || '')} onChange={e => setFormData(p => ({ ...p, challengerDiscord: e.target.value }))} className="bg-black/50 border border-red-900/50 rounded-lg px-4 py-3 text-white focus:border-red-500 outline-none" />
                  <input placeholder="Challenger Twitch" value={String(formData.challengerTwitch || '')} onChange={e => setFormData(p => ({ ...p, challengerTwitch: e.target.value }))} className="bg-black/50 border border-red-900/50 rounded-lg px-4 py-3 text-white focus:border-red-500 outline-none" />
                  <input placeholder="Challenger Platform ID" value={String(formData.challengerPlatformId || '')} onChange={e => setFormData(p => ({ ...p, challengerPlatformId: e.target.value }))} className="bg-black/50 border border-red-900/50 rounded-lg px-4 py-3 text-white focus:border-red-500 outline-none" />
                  <input placeholder="Target Team *" value={String(formData.targetTeam || '')} onChange={e => setFormData(p => ({ ...p, targetTeam: e.target.value }))} className="bg-black/50 border border-red-900/50 rounded-lg px-4 py-3 text-white focus:border-red-500 outline-none" />
                  <input placeholder="Target Discord" value={String(formData.targetDiscord || '')} onChange={e => setFormData(p => ({ ...p, targetDiscord: e.target.value }))} className="bg-black/50 border border-red-900/50 rounded-lg px-4 py-3 text-white focus:border-red-500 outline-none" />
                  <input placeholder="Target Twitch" value={String(formData.targetTwitch || '')} onChange={e => setFormData(p => ({ ...p, targetTwitch: e.target.value }))} className="bg-black/50 border border-red-900/50 rounded-lg px-4 py-3 text-white focus:border-red-500 outline-none" />
                  <input placeholder="Target Platform ID" value={String(formData.targetPlatformId || '')} onChange={e => setFormData(p => ({ ...p, targetPlatformId: e.target.value }))} className="bg-black/50 border border-red-900/50 rounded-lg px-4 py-3 text-white focus:border-red-500 outline-none" />
                  <input placeholder="Game *" value={String(formData.game || '')} onChange={e => setFormData(p => ({ ...p, game: e.target.value }))} className="bg-black/50 border border-red-900/50 rounded-lg px-4 py-3 text-white focus:border-red-500 outline-none" />
                  <input placeholder="Battle Type * (e.g. 5v5)" value={String(formData.battleType || '')} onChange={e => setFormData(p => ({ ...p, battleType: e.target.value }))} className="bg-black/50 border border-red-900/50 rounded-lg px-4 py-3 text-white focus:border-red-500 outline-none" />
                  <div><label className="block text-xs text-gray-500 mb-1">Response Time (hours)</label>
                    <input type="number" placeholder="72" value={Number(formData.responseDeadlineHours) || ''} onChange={e => setFormData(p => ({ ...p, responseDeadlineHours: Number(e.target.value) }))} className="w-full bg-black/50 border border-red-900/50 rounded-lg px-4 py-3 text-white focus:border-red-500 outline-none" /></div>
                  <div><label className="block text-xs text-gray-500 mb-1">Stake Amount ($)</label>
                    <input type="number" placeholder="100" value={Number(formData.stakeAmount) || ''} onChange={e => setFormData(p => ({ ...p, stakeAmount: Number(e.target.value) }))} className="w-full bg-black/50 border border-red-900/50 rounded-lg px-4 py-3 text-white focus:border-red-500 outline-none" /></div>
                </>
              )}
              <textarea placeholder="Notes" value={String(formData.notes || '')} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} className="md:col-span-2 bg-black/50 border border-red-900/50 rounded-lg px-4 py-3 text-white focus:border-red-500 outline-none h-24 resize-none" />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={handleSave} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition"><Check size={16} /> {editingId ? 'Update' : 'Save'}</button>
              <button onClick={resetForm} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg font-semibold transition"><X size={16} /> Cancel</button>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white/5 border border-red-900/50 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">Site Settings</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { label: 'Default Response Time (hours)', key: 'defaultResponseHours', type: 'number', tip: 'Default hours for new challenges (can be overridden per challenge)' },
                { label: 'Admission Fee ($)', key: 'admissionFee', type: 'number' },
                { label: 'Removal Fee ($)', key: 'removalFee', type: 'number' },
                { label: 'WhatsApp Number', key: 'whatsappNumber', type: 'text' },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">{field.label}</label>
                  <input type={field.type} value={String((settings as Record<string, unknown>)[field.key] || '')}
                    onChange={e => updateSettings({ [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value })}
                    className="w-full bg-black/50 border border-red-900/50 rounded-lg px-4 py-3 text-white focus:border-red-500 outline-none" />
                  {field.tip && <p className="text-xs text-gray-600 mt-1">{field.tip}</p>}
                </div>
              ))}
            </div>
            <div className="mt-6 bg-red-900/20 border border-red-900/50 rounded-lg p-4">
              <p className="text-red-400 font-bold text-sm mb-2">Admin Credentials</p>
              <p className="text-gray-400 text-sm">Email: ali.jasser@aol.com</p>
              <p className="text-gray-400 text-sm">Password: ChickenAdmin2024!</p>
              <p className="text-gray-600 text-sm mt-2">Access: yoursite.com/#admin or Ctrl+Shift+A</p>
            </div>
          </div>
        )}

        {activeTab !== 'settings' && !showAddForm && (
          <button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition mb-6">
            <Plus size={18} /> Add {activeTab === 'coop' ? 'Shame Entry' : 'Challenge'}
          </button>
        )}

        {/* Active Challenges List */}
        {activeTab === 'challenges' && (
          <div className="space-y-4">
            {activeChallenges.length === 0 ? <p className="text-gray-500 text-center py-12">No active challenges</p> : activeChallenges.map(c => (
              <div key={c.id} className="bg-white/5 border border-red-900/30 rounded-xl p-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <button onClick={() => toggleSelectOne(c.id)} className="shrink-0 mt-1"><CheckboxIcon checked={selectedChallenges.has(c.id)} /></button>
                    <div>
                      <div className="flex items-center gap-2 mb-1"><span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">{c.game}</span><span className="text-red-400 text-xs font-semibold">{c.battleType}</span></div>
                      <p className="text-white font-semibold">{c.challengerTeam} vs {c.targetTeam}</p>
                      <p className="text-gray-500 text-sm">Timer: {c.responseDeadlineHours}h | Stake: ${c.stakeAmount}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => moveToConfirmed(c.id)} className="flex items-center gap-1 bg-green-600/20 hover:bg-green-600/40 text-green-400 px-3 py-2 rounded-lg text-sm font-semibold transition"><Check size={14} /> Accept</button>
                    <button onClick={() => handleExpire(c)} className="flex items-center gap-1 bg-orange-600/20 hover:bg-orange-600/40 text-orange-400 px-3 py-2 rounded-lg text-sm font-semibold transition"><AlertTriangle size={14} /> Expire</button>
                    <button onClick={() => startEdit(c)} className="flex items-center gap-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 px-3 py-2 rounded-lg text-sm font-semibold transition"><Edit3 size={14} /> Edit</button>
                    <button onClick={() => deleteChallenge(c.id)} className="flex items-center gap-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 px-3 py-2 rounded-lg text-sm font-semibold transition"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Confirmed List */}
        {activeTab === 'confirmed' && (
          <div className="space-y-4">
            {confirmedChallenges.length === 0 ? <p className="text-gray-500 text-center py-12">No confirmed battles</p> : confirmedChallenges.map(c => (
              <div key={c.id} className="bg-white/5 border border-green-900/30 rounded-xl p-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <button onClick={() => toggleSelectOne(c.id)} className="shrink-0 mt-1"><CheckboxIcon checked={selectedChallenges.has(c.id)} /></button>
                    <div>
                      <div className="flex items-center gap-2 mb-1"><span className="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded">{c.game}</span><span className="text-green-400 text-xs font-semibold">{c.battleType}</span></div>
                      <p className="text-white font-semibold">{c.challengerTeam} vs {c.targetTeam}</p>
                      <p className="text-gray-500 text-sm">Stake: ${c.stakeAmount}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(c)} className="flex items-center gap-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 px-3 py-2 rounded-lg text-sm font-semibold transition"><Edit3 size={14} /> Edit</button>
                    <button onClick={() => deleteChallenge(c.id)} className="flex items-center gap-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 px-3 py-2 rounded-lg text-sm font-semibold transition"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Coop List */}
        {activeTab === 'coop' && (
          <div className="space-y-4">
            {shameEntries.filter(e => !e.paidRemoval).length === 0 ? <p className="text-gray-500 text-center py-12">No chickens in the coop</p> : shameEntries.filter(e => !e.paidRemoval).map(e => (
              <div key={e.id} className="bg-white/5 border border-orange-900/30 rounded-xl p-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <button onClick={() => toggleSelectOne(e.id)} className="shrink-0 mt-1"><CheckboxIcon checked={selectedShame.has(e.id)} /></button>
                    <div>
                      <p className="text-orange-400 font-bold text-lg">{e.teamName}</p>
                      <p className="text-gray-500 text-sm">{e.game} - {e.battleType}</p>
                      <p className="text-gray-600 text-sm">Challenged by: {e.challengerTeam}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => markAsPaid(e.id)} className="flex items-center gap-1 bg-green-600/20 hover:bg-green-600/40 text-green-400 px-3 py-2 rounded-lg text-sm font-semibold transition"><DollarSign size={14} /> Mark Paid</button>
                    <button onClick={() => startEdit(e)} className="flex items-center gap-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 px-3 py-2 rounded-lg text-sm font-semibold transition"><Edit3 size={14} /> Edit</button>
                    <button onClick={() => deleteShameEntry(e.id)} className="flex items-center gap-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 px-3 py-2 rounded-lg text-sm font-semibold transition"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main App ─── */
function App() {
  const [page, setPage] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#admin') return 'admin';
    return 'home';
  });

  const {
    activeChallenges, confirmedChallenges,
    addChallenge, updateChallenge, deleteChallenge, deleteChallengesBulk, moveToConfirmed,
  } = useChallenges();
  const {
    shameEntries,
    addShameEntry, updateShameEntry, deleteShameEntry, deleteShameEntriesBulk, markAsPaid,
  } = useShame();
  const { settings, updateSettings } = useSettings();
  const { adminState, login, logout, isLockedOut, remainingAttempts } = useAdminAuth();

  useEffect(() => {
    const handler = () => { if (window.location.hash === '#admin') setPage('admin'); };
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  const renderPage = () => {
    switch (page) {
      case 'home': return <HomePage setPage={setPage} settings={settings} />;
      case 'chopping': return <ChoppingBlockPage activeChallenges={activeChallenges} />;
      case 'confirmed': return <ConfirmedPage confirmedChallenges={confirmedChallenges} />;
      case 'coop': return <CoopPage shameEntries={shameEntries} />;
      case 'removal': return <RemovalPage settings={settings} />;
      case 'admin': return (
        <AdminDashboard
          adminState={adminState} login={login} logout={logout} isLockedOut={isLockedOut} remainingAttempts={remainingAttempts}
          activeChallenges={activeChallenges} confirmedChallenges={confirmedChallenges} shameEntries={shameEntries}
          addChallenge={addChallenge} updateChallenge={updateChallenge} deleteChallenge={deleteChallenge} deleteChallengesBulk={deleteChallengesBulk} moveToConfirmed={moveToConfirmed}
          addShameEntry={addShameEntry} updateShameEntry={updateShameEntry} deleteShameEntry={deleteShameEntry} deleteShameEntriesBulk={deleteShameEntriesBulk} markAsPaid={markAsPaid}
          settings={settings} updateSettings={updateSettings}
        />
      );
      default: return <HomePage setPage={setPage} settings={settings} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation currentPage={page} setPage={setPage} isAdmin={adminState.isLoggedIn} />
      {renderPage()}
    </div>
  );
}

export default App;
