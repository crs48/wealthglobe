import { META } from '../data/meta'

export function Footer({ className = '' }: { className?: string }) {
  return (
    <footer className={`text-[10.5px] leading-snug text-fog ${className}`}>
      <p>
        Wealth: {META.wealthVintage}, {META.ubsMarkets} markets, ~{Math.round(META.sampleCoverage * 100)}% of world personal wealth. Other countries: {META.databookVintage}. Billionaires:{' '}
        {META.billionaireVintage}; those numbers move daily.
      </p>
      <p className="mt-1">Land is area, not value. Manhattan and the Sahara count the same. A thought experiment, not a deed.</p>
    </footer>
  )
}
