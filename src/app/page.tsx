import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { SITE_NAME } from '@/lib/constants/categories';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-black/[0.03]">
        <div className="max-w-5xl mx-auto px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#1d1d1f] rounded-xl flex items-center justify-center">
              <span className="text-white text-sm">🐾</span>
            </div>
            <span className="text-[15px] font-semibold text-[#1d1d1f]">{SITE_NAME}</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-40 pb-28 px-8">
        <div className="max-w-2xl mx-auto text-center animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-semibold text-[#1d1d1f] tracking-tight leading-[1.1]">
            Your pet deserves<br />to be understood.
          </h1>
          <p className="text-xl text-[#86868b] mt-8 max-w-lg mx-auto leading-relaxed">
            One profile. Nine behavior categories. Proof that your pet is different.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-12">
            <Link href="/register">
              <Button size="lg">Create Profile</Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="lg">Sign In</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-28 px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-[#1d1d1f] rounded-[40px] p-14 md:p-20">
            <h2 className="text-3xl font-semibold text-white tracking-tight">
              The future we&apos;re building.
            </h2>

            <div className="mt-12 space-y-10">
              <div className="flex gap-5">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🏨</span>
                </div>
                <div>
                  <h3 className="text-white font-medium text-lg">Every pet is judged the same.</h3>
                  <p className="text-white/50 mt-2 text-[15px] leading-relaxed">
                    One bad experience and suddenly all pets are banned. Your well-trained dog pays the price.
                  </p>
                </div>
              </div>

              <div className="flex gap-5">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">✈️</span>
                </div>
                <div>
                  <h3 className="text-white font-medium text-lg">Left behind.</h3>
                  <p className="text-white/50 mt-2 text-[15px] leading-relaxed">
                    Vacations, visits, adventures — always without your pet. Because no one accepts pets anymore.
                  </p>
                </div>
              </div>

              <div className="flex gap-5">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">💔</span>
                </div>
                <div>
                  <h3 className="text-white font-medium text-lg">The guilt.</h3>
                  <p className="text-white/50 mt-2 text-[15px] leading-relaxed">
                    Watching your pet wait by the window. They deserve better than &quot;no pets allowed.&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-28 px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-semibold text-[#1d1d1f] tracking-tight">
              A profile that speaks.
            </h2>
            <p className="text-lg text-[#86868b] mt-4">
              Your pet&apos;s behavior. Verified. Shared.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-[#fafafa] rounded-3xl p-10 text-center">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <span className="text-3xl">📋</span>
              </div>
              <h3 className="text-[17px] font-semibold text-[#1d1d1f]">9 Categories</h3>
              <p className="text-[14px] text-[#86868b] mt-3 leading-relaxed">
                Every dimension of behavior, scored by people who met your pet.
              </p>
            </div>

            <div className="bg-[#fafafa] rounded-3xl p-10 text-center">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <span className="text-3xl">✓</span>
              </div>
              <h3 className="text-[17px] font-semibold text-[#1d1d1f]">Real Reviews</h3>
              <p className="text-[14px] text-[#86868b] mt-3 leading-relaxed">
                From neighbors, cafes, hotels, vets — people who actually know your pet.
              </p>
            </div>

            <div className="bg-[#fafafa] rounded-3xl p-10 text-center">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <span className="text-3xl">📱</span>
              </div>
              <h3 className="text-[17px] font-semibold text-[#1d1d1f]">One Scan</h3>
              <p className="text-[14px] text-[#86868b] mt-3 leading-relaxed">
                Share your pet&apos;s profile instantly. No app required.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Both */}
      <section className="py-28 px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Pet Parents */}
            <div className="bg-white rounded-[32px] p-10 md:p-12 border border-black/[0.04]">
              <span className="text-[12px] font-medium text-[#86868b] uppercase tracking-wider">For Pet Parents</span>
              <h3 className="text-2xl font-semibold text-[#1d1d1f] mt-4 tracking-tight">
                Prove who they really are.
              </h3>
              <p className="text-[15px] text-[#86868b] mt-4 leading-relaxed">
                Your pet is more than a breed. They have a personality, good manners, and a gentle soul. Let the world see it.
              </p>

              <div className="mt-10 space-y-4">
                {[
                  'Build their reputation',
                  'Skip the interrogations',
                  'Access places that say no',
                  'You control what they share',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full bg-[#34c759]/10 flex items-center justify-center">
                      <svg className="w-3 h-3 text-[#34c759]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[15px] text-[#1d1d1f]">{item}</span>
                  </div>
                ))}
              </div>

              <Link href="/register" className="inline-block mt-10">
                <Button size="lg">Start Building</Button>
              </Link>
            </div>

            {/* Businesses */}
            <div className="bg-[#1d1d1f] rounded-[32px] p-10 md:p-12">
              <span className="text-[12px] font-medium text-white/50 uppercase tracking-wider">For Businesses</span>
              <h3 className="text-2xl font-semibold text-white mt-4 tracking-tight">
                Open your doors.
              </h3>
              <p className="text-[15px] text-white/60 mt-4 leading-relaxed">
                Allow the right pets. Say yes more often. One scan tells you everything.
              </p>

              <div className="mt-10 space-y-4">
                {[
                  'Verify before you allow',
                  'Score-based exceptions',
                  'Reduce risk, not joy',
                  'Build a pet-friendly reputation',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-white/80 text-[15px]">{item}</span>
                  </div>
                ))}
              </div>

              <Link href="/register?type=business" className="inline-block mt-10">
                <Button variant="secondary" size="lg">Register Business</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-28 px-8 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-semibold text-[#1d1d1f] tracking-tight">
              Simple by design.
            </h2>
          </div>

          <div className="space-y-4">
            {[
              { num: '01', title: 'Create a profile', desc: 'Add your pet&apos;s photo, basics, and what makes them special.' },
              { num: '02', title: 'Share with anyone', desc: 'One link or scan shows their verified profile and score.' },
              { num: '03', title: 'Collect reviews', desc: 'After visits, reviewers rate 9 behavior categories.' },
              { num: '04', title: 'Build trust everywhere', desc: 'Hotels, cafes, landlords — everyone sees the same proof.' },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-6 bg-[#fafafa] rounded-2xl p-8">
                <div className="w-12 h-12 rounded-full bg-[#1d1d1f] text-white flex items-center justify-center font-medium text-[15px] flex-shrink-0">
                  {step.num}
                </div>
                <div>
                  <h3 className="text-[17px] font-semibold text-[#1d1d1f]">{step.title}</h3>
                  <p className="text-[14px] text-[#86868b] mt-1">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-8">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-semibold text-[#1d1d1f] tracking-tight">
            Every good pet deserves a chance.
          </h2>
          <p className="text-lg text-[#86868b] mt-5">
            Free to start. No credit card required.
          </p>
          <Link href="/register" className="inline-block mt-10">
            <Button size="lg">Create Your Pet&apos;s Profile</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-8 border-t border-black/[0.04]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#1d1d1f] rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">🐾</span>
            </div>
            <span className="text-[14px] font-medium text-[#1d1d1f]">{SITE_NAME}</span>
          </div>
          <p className="text-[13px] text-[#86868b]">
            A better future for pets and their people.
          </p>
        </div>
      </footer>
    </div>
  );
}
