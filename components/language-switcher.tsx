'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import Image from 'next/image'

const LOCALES = [
  { code: 'vi', label: 'VI' },
  { code: 'en', label: 'EN' },
  { code: 'zh', label: '中文' },
] as const

type AppLocale = (typeof LOCALES)[number]['code']

export default function LanguageSwitcher() {
  const locale = useLocale() as AppLocale
  const router = useRouter()
  const pathname = usePathname() // ✅ pathname WITHOUT locale prefix (next-intl)

  const handleLocaleChange = (newLocale: AppLocale) => {
    if (newLocale === locale) return
    router.replace(pathname, { locale: newLocale }) // ✅ auto => /en/results
  }

  return (
    <div className="fixed z-50 flex w-full items-center justify-between p-4 pt-3">
      <Image src="/logo.png" alt="Logo" width={100} height={40} />
      <div className="flex items-center gap-1 rounded-full bg-black/30 px-2 py-1 backdrop-blur-md">
        {LOCALES.map((item) => {
          const isActive = locale === item.code

          return (
            <button
              key={item.code}
              type="button"
              onClick={() => handleLocaleChange(item.code)}
              className={[
                'rounded-full px-3 py-1',
                'text-xs font-sans font-bold',
                'transition-colors duration-200',
                isActive
                  ? 'bg-white text-black'
                  : 'text-white/80 hover:bg-white/20',
              ].join(' ')}
            >
              {item.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
