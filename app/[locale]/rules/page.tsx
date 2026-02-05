'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

export default function RulesPage() {
  const t = useTranslations('rules')
  const items = t.raw('items') as string[] | string
  const rules = Array.isArray(items) ? items : [String(items)]

  return (
    <div className="w-full relative min-h-screen">
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <Image
          src="/background.png"
          alt={t('backgroundAlt')}
          fill
          priority
          className="object-cover"
        />
      </div>

      <section className="relative w-full px-6 pb-20 pt-24">
        <div className="mx-auto w-full max-w-3xl text-center">
          <div className="mx-auto w-full max-w-2xl">
            <Image
              src="/gottalent.png"
              alt={t('headerAlt')}
              width={20000}
              height={14000}
              priority
              className="h-auto w-full"
            />
          </div>

          <div className="mt-10 text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            {t('title')}
          </div>
          <div className="mt-4 whitespace-pre-line font-sans text-lg leading-8 text-white/70 md:text-xl">
            {t('subtitle')}
          </div>

          <div className="mt-8 text-left">
            <div className="rounded-3xl bg-white/6 px-6 py-6 ring-1 ring-white/10 backdrop-blur">
              <div className="space-y-4 font-sans text-lg leading-8 text-white/90 md:text-xl">
                {rules.map((rule, idx) => (
                  <div key={rule} className="flex items-start gap-3">
                    <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-bold text-white/90">
                      {idx + 1}
                    </div>
                    <div>{rule}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 flex justify-center">
            <Link
              href="/"
              className={[
                'rounded-full px-10 py-4',
                'font-sans font-bold uppercase',
                'text-sm tracking-wide',
                'text-black',
                'shadow-xl',
                'transition-transform duration-200 hover:scale-[1.03] active:scale-[0.97]',
                'bg-gradient-to-r from-[#b8860b] via-[#f3e3bd] to-white',
                'ring-1 ring-black/10',
              ].join(' ')}
            >
              {t('backHome')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
