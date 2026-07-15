export interface TeamChallenge {
  id: number;
  challengerTeam: string;
  challengerDiscord: string | null;
  challengerTwitch: string | null;
  challengerPlatformId: string | null;
  targetTeam: string;
  targetDiscord: string | null;
  targetTwitch: string | null;
  targetPlatformId: string | null;
  game: string;
  battleType: string;
  stakeAmount: number;
  responseDeadlineHours: number;
  status: 'pending' | 'confirmed' | 'expired' | 'completed';
  createdAt: Date;
  acceptedAt: Date | null;
  completedAt: Date | null;
  winner: string | null;
  notes: string | null;
}

export interface ShameEntry {
  id: number;
  teamName: string;
  discord: string | null;
  twitch: string | null;
  platformId: string | null;
  game: string;
  battleType: string;
  challengerTeam: string;
  expiredAt: Date;
  removalFee: number;
  paidRemoval: boolean;
  notes: string | null;
}

export interface AdminSettings {
  id: number;
  defaultResponseHours: number;
  admissionFee: number;
  removalFee: number;
  whatsappNumber: string;
  telegramLink: string;
}

export interface AdminState {
  isLoggedIn: boolean;
  loginAttempts: number;
  email: string;
}
