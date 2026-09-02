import { Cloud } from 'lucide-react';

function BrandMark({ light = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-[#3b82f6] text-white shadow-sm">
        <Cloud className="h-6 w-6" strokeWidth={2.25} />
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#22c55e] text-[10px] font-bold text-white">
          ↑
        </span>
      </div>
      <div className="font-[family-name:var(--font-display)] text-2xl font-bold leading-none tracking-tight sm:text-[1.75rem]">
        <span className={light ? 'text-white' : 'text-[#3b82f6]'}>Strovix</span>{' '}
        <span className={light ? 'text-[#bbf7d0]' : 'text-[#22c55e]'}>Drive</span>
      </div>
    </div>
  );
}

/**
 * @param {boolean} [compactOnMobile] Hide left panel on mobile; logo top-left + form only
 */
export default function AuthLayout({ title, subtitle, children, footerLink, compactOnMobile = false }) {
  const mobileSafe = compactOnMobile
    ? {
        paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0px))',
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))',
        paddingLeft: 'max(1rem, env(safe-area-inset-left, 0px))',
        paddingRight: 'max(1rem, env(safe-area-inset-right, 0px))',
      }
    : undefined;

  return (
    <div
      className={
        compactOnMobile
          ? 'flex h-dvh max-h-dvh min-h-0 flex-col overflow-hidden bg-[#4A90E2] lg:h-full lg:max-h-none lg:min-h-0 lg:flex-row lg:overflow-y-auto lg:bg-white'
          : 'flex h-full min-h-0 flex-col overflow-y-auto overflow-x-hidden bg-white lg:flex-row'
      }
    >
      {/* Left panel — desktop/tablet only when compactOnMobile */}
      <section
        className={
          compactOnMobile
            ? 'hidden flex-col justify-between px-8 py-10 sm:px-12 lg:flex lg:flex-1 lg:px-16 lg:py-14 xl:px-20'
            : 'flex flex-1 flex-col justify-between px-8 py-10 sm:px-12 lg:px-16 lg:py-14 xl:px-20'
        }
      >
        <div>
          <BrandMark />

          <h2 className="mt-10 font-[family-name:var(--font-display)] text-2xl font-bold text-slate-800 sm:text-[1.75rem]">
            Cloud Storage & Sharing —
          </h2>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-slate-500">
            From uploads to secure sharing, our platform helps teams store files
            smarter, faster, and more securely. Trusted by growing teams for
            seamless cloud file management.
          </p>

          <div className="mt-12 grid max-w-lg grid-cols-3 gap-6">
            {[
              { value: '10GB+', label: 'Free storage' },
              { value: 'Fast', label: 'Signed uploads' },
              { value: '99.9%', label: 'Uptime' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#5ba3e8] sm:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p
          className="mt-14 text-2xl text-[#14b8a6] sm:text-3xl"
          style={{ fontFamily: '"Caveat", cursive' }}
        >
          Your Files, Our Responsibility
        </p>
      </section>

      {/* Form panel */}
      <section
        className={
          compactOnMobile
            ? 'relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[#4A90E2] text-white lg:justify-center lg:overflow-visible lg:px-16 lg:py-14 xl:px-20'
            : 'relative flex flex-1 flex-col justify-center bg-[#4A90E2] px-8 py-12 text-white sm:px-12 lg:px-16 xl:px-20'
        }
        style={compactOnMobile ? mobileSafe : undefined}
      >
        {compactOnMobile ? (
          <header className="mb-3 shrink-0 lg:hidden">
            <BrandMark light />
          </header>
        ) : null}

        <div
          className={
            compactOnMobile
              ? 'auth-mobile-scroll mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col lg:overflow-visible'
              : 'mx-auto w-full max-w-md'
          }
        >
          <div className={compactOnMobile ? 'flex flex-col py-1 lg:py-0' : undefined}>
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              {title}
            </h1>
            <p className="mt-1.5 text-sm text-white/85 sm:text-base">{subtitle}</p>
            <div className="mt-5 sm:mt-8 lg:mt-10">{children}</div>
            {footerLink ? <div className="mt-4 sm:mt-6">{footerLink}</div> : null}
          </div>
        </div>

        {compactOnMobile ? (
          <p className="mt-2 shrink-0 text-center text-[10px] text-white/60 lg:hidden">
            © 2026 Strovix Cloud. All rights reserved.
          </p>
        ) : (
          <p className="mt-12 text-center text-xs text-white/70 lg:absolute lg:bottom-8 lg:left-0 lg:right-0">
            © 2026 Strovix Cloud. All rights reserved.
          </p>
        )}
      </section>
    </div>
  );
}

export function AuthField({
  label,
  type = 'text',
  value,
  onChange,
  required,
  readOnly,
  placeholder,
  autoComplete,
  rightSlot,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-white">{label}</label>
      <div className="relative">
        <input
          type={type}
          required={required}
          readOnly={readOnly}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full rounded-xl border-0 bg-white/90 px-4 py-3.5 text-slate-800 outline-none placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-white/60 ${
            rightSlot ? 'pr-12' : ''
          } ${readOnly ? 'opacity-90' : ''}`}
        />
        {rightSlot ? (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">{rightSlot}</div>
        ) : null}
      </div>
    </div>
  );
}

export function AuthPrimaryButton({ children, disabled, type = 'submit' }) {
  return (
    <button
      type={type}
      disabled={disabled}
      className="w-full rounded-xl bg-white py-3.5 text-base font-semibold text-[#4A90E2] shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
}
