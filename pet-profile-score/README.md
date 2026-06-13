# 🐾 Pet Profile Score

> **"Good pets shouldn't suffer because of bad ones. Responsible owners deserve recognition."**

A trusted behavior verification system for pets — like a credit score is for banking, Pet Score proves your pet's good behavior. Built to help pet-friendly businesses make informed decisions and give well-behaved pets the access they deserve.

---

## 🎯 The Problem We're Solving

- 🏨 Hotels, cafes, and housing societies ban ALL pets because of a few bad actors
- ✈️ Airlines refuse all pets — good dogs can't travel because bad dogs exist
- 😔 Pet parents with well-trained pets get denied everywhere
- 💔 Good pets suffer for others' mistakes

**Pet Profile Score** creates verified behavior profiles so businesses can say "yes" to the right pets.

---

## 🔑 Key Features

### Multi-Source Scoring System
The score isn't just based on reviews — it's calculated from **4 verified sources**:

| Source | Weight | Description |
|--------|--------|-------------|
| ⭐ Reviews | 40% | Full behavior ratings from people who met your pet |
| 🏪 Business Check-ins | 25% | Verified visits rated by businesses |
| 👥 Neighbor Verifications | 20% | Quick "I met this pet" confirmations |
| 📋 Behavioral Assessments | 15% | Professional assessments from vets/trainers |

This makes the score **harder to manipulate** — even if reviews are faked, the overall score includes other verified data.

### 9 Behavior Categories
Each review covers: Friendliness with Humans, Friendliness with Pets, Barking Control, Aggression-Free, Public Manners, Indoor Manners, Travel Friendliness, Cleanliness, Leash Discipline.

### KCI Certificate Support
Pets with verified lineage/certification get a **golden badge** and special profile frame.

### QR Code Sharing
Every pet gets a unique QR code for instant verification at any business.

### Admin Approval Workflow
Pet deletion requests go to admin for approval — no accidental deletions.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- A Supabase account (free tier works)

### 1. Clone & Install
```bash
git clone https://github.com/unavailablecodes/gooodtogo.git
cd gooodtogo/pet-profile-score
npm install
```

### 2. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste contents of `supabase-schema.sql` → **Run**
3. Go to **Storage** → create bucket named `pet-photos` → set as **Public**
4. Go to **Settings → API** → copy:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Configure Environment
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Run
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
pet-profile-score/
├── src/
│   ├── app/
│   │   ├── (auth)/          # Login, Register pages
│   │   ├── (app)/           # Protected pages (dashboard, pets, settings)
│   │   ├── (public)/         # Public pet profiles
│   │   ├── admin/           # Admin panel with separate login
│   │   └── page.tsx         # Landing page
│   ├── components/
│   │   ├── ui/              # Button, Input, Card, ScoreDisplay, etc.
│   │   ├── layout/          # Header, HeaderWrapper
│   │   ├── pet/             # PetCard
│   │   └── review/          # ReviewCard
│   ├── hooks/               # useAuth, usePets, useReviews
│   ├── lib/
│   │   ├── supabase/        # Client setup
│   │   ├── utils/           # Scoring, QR, format utilities
│   │   └── constants/       # Categories, breeds, options
│   └── types/               # TypeScript interfaces
├── supabase-schema.sql      # Database schema
└── .env.local               # Environment variables (create this)
```

---

## 🗄️ Database Tables

| Table | Description |
|-------|-------------|
| `profiles` | User accounts (extends auth.users) |
| `pets` | Pet profiles with scores |
| `pet_photos` | Pet images |
| `pet_certificates` | KCI/certification documents |
| `reviews` | 9-category behavior reviews |
| `business_checkins` | Business visit verifications |
| `neighbor_verifications` | Neighbor confirmations |
| `behavioral_assessments` | Professional assessments |
| `businesses` | Business accounts |
| `review_disputes` | Dispute handling |
| `pet_visits` | Visit history |
| `user_credibility` | Reviewer trust scores |

---

## 🎨 Design Philosophy

- **Minimalist Apple/Tesla aesthetic** — clean, spacious, elegant
- **Semi-rounded elements** — modern without being childish
- **Subtle shadows** — depth without heaviness
- **Apple gray palette** — professional and clean
- **Paw animations** — loading states use bouncing 🐾

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Setting Up Development Environment

1. **Fork the repo** and clone locally
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** following the existing code style
4. **Test locally** with `npm run dev`
5. **Commit with clear messages:**
   ```bash
   git commit -m "feat: add new feature"
   ```
6. **Push and create PR**

### Areas Needing Work

- [ ] **Business Check-in Flow** — businesses need UI to log visits
- [ ] **Neighbor Verification** — simple "I met this pet" confirmation
- [ ] **Behavioral Assessment Forms** — for vets/trainers
- [ ] **Public QR Scanner** — `/scan` page implementation
- [ ] **Social Login** — Google/Apple authentication
- [ ] **Mobile App** — React Native version
- [ ] **Email Notifications** — review alerts, delete approvals
- [ ] **Analytics Dashboard** — for admins
- [ ] **API Endpoints** — for third-party integrations

### Code Style

- Use **TypeScript** for all new code
- Follow **Tailwind CSS** conventions
- Keep components **minimal and reusable**
- Use the **existing color palette** (Apple grays)

---

## 📝 Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `NEXT_PUBLIC_SITE_URL` | Production URL |

---

## 🔒 Security Notes

- Row Level Security (RLS) should be configured in Supabase
- Admin role required for `/admin/*` routes
- Delete requests require admin approval
- Sensitive data should use Service Role key server-side only

---

## 📜 License

MIT License — feel free to use this for your own projects!

---

## 🙏 Built With

- **Next.js 16** — React framework
- **Supabase** — PostgreSQL, Auth, Storage
- **Tailwind CSS** — Styling
- **TypeScript** — Type safety
- **Lucide React** — Icons

---

**Built with ❤️ for pets and their people** 🐾
