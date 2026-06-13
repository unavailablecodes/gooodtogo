# 🐾 Pet Profile Score

A web application for creating verified pet behavior profiles with social scoring. Pet owners can create profiles for their pets, and businesses/neighbors can review pets based on real-world experiences.

## Features

### For Pet Owners
- Create and manage pet profiles with photos
- Unique QR code for each pet
- Social behavior score based on reviews
- Privacy controls for profile visibility
- Vaccination status tracking

### For Businesses
- Verify pets by scanning QR codes
- Leave reviews based on visits
- View pet behavior history
- Make informed access decisions

### For the Community
- Rate pets across 9 behavior categories
- Weighted scoring based on reviewer credibility
- Time-decay for older reviews
- Fraud prevention mechanisms

## Tech Stack

- **Frontend**: Next.js 14+ (App Router)
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Styling**: Tailwind CSS
- **Validation**: Zod
- **QR Codes**: qrcode library

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A Supabase account

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd pet-profile-score
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** in your Supabase dashboard
3. Run the `supabase-schema.sql` file (copy contents from this repo)
4. Go to **Settings > API** and copy:
   - `Project URL`
   - `anon/public` key

### 3. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Create Storage Bucket

In Supabase Dashboard:
1. Go to **Storage**
2. Create a new bucket named `pet-photos`
3. Set it as **Public**

### 5. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages (login, register)
│   ├── (app)/             # Protected app pages (dashboard, pets, etc.)
│   ├── (public)/          # Public pages (pet profiles)
│   └── admin/             # Admin dashboard
├── components/
│   ├── ui/                # Reusable UI components
│   ├── pet/               # Pet-related components
│   ├── review/            # Review components
│   └── layout/            # Layout components
├── hooks/                  # Custom React hooks
├── lib/
│   ├── supabase/          # Supabase client setup
│   ├── utils/             # Utility functions
│   └── constants/         # App constants
└── types/                 # TypeScript types
```

## Key Features Implementation

### Scoring Algorithm

The scoring system uses:
- 9 behavior categories with different weights
- Time decay (older reviews count less)
- Reviewer credibility scores
- Inverted scoring for negative behaviors (barking, aggression)

### Privacy Controls

Pets can be set to:
- **Public**: Visible to everyone
- **Limited**: Only verified users can view
- **Hidden**: Only the owner can see

### QR Code System

Each pet gets a unique ID (e.g., `PET-ABC123`) that generates a QR code linking to their public profile.

## Database Schema

See `supabase-schema.sql` for the complete database schema including:
- Profiles (extends auth.users)
- Pets
- Pet Photos
- Reviews
- Businesses
- Review Disputes
- User Credibility

## Future Enhancements

- [ ] Social login (Google, Apple)
- [ ] Mobile apps (React Native)
- [ ] Push notifications
- [ ] Advanced analytics
- [ ] API for third-party integration
- [ ] Travel partner integration
- [ ] Insurance integration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License

---

Built with ❤️ for pet lovers everywhere 🐾
