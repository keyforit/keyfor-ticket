import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { getPostLoginMessage } from '@/lib/post-login-message'

type LoginVariant = 'centered' | 'card' | 'spotlight'

export function LoginPage() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [variant, setVariant] = useState<LoginVariant>('centered')

  // Auto-redirect se la sessione KeyHub è già attiva
  useEffect(() => {
    if (!loading && user) {
      const loginMessage = getPostLoginMessage()
      navigate('/hub', { replace: true, state: loginMessage ? { loginMessage } : undefined })
    }
  }, [user, loading, navigate])

  useEffect(() => {
    const htmlStyle = document.documentElement.style
    const bodyStyle = document.body.style
    const previous = {
      htmlOverflow: htmlStyle.overflow,
      htmlOverscrollBehavior: htmlStyle.overscrollBehavior,
      bodyOverflow: bodyStyle.overflow,
      bodyOverscrollBehavior: bodyStyle.overscrollBehavior,
    }

    htmlStyle.overflow = 'hidden'
    htmlStyle.overscrollBehavior = 'none'
    bodyStyle.overflow = 'hidden'
    bodyStyle.overscrollBehavior = 'none'
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })

    return () => {
      htmlStyle.overflow = previous.htmlOverflow
      htmlStyle.overscrollBehavior = previous.htmlOverscrollBehavior
      bodyStyle.overflow = previous.bodyOverflow
      bodyStyle.overscrollBehavior = previous.bodyOverscrollBehavior
    }
  }, [])

  const handleSignIn = () => {
    // Reindirizza al login di KeyHub (stessa origin in produzione)
    window.location.href = '/login'
  }

  const LogoAndActions = (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="h-40 w-40">
        <img
          src={`${import.meta.env.BASE_URL}login-symbol.png`}
          alt="Key Ticket logo"
          className="h-full w-full object-contain"
        />
      </div>
      <h1 className="mt-5 text-4xl font-normal leading-none tracking-widest uppercase" aria-label="Key Ticket">
        <span className="text-[#201F1E]">Key </span>
        <span className="text-[#009B9B]">Ticket</span>
      </h1>
      <button
        onClick={handleSignIn}
        className="mt-7 inline-flex items-center justify-center rounded-md bg-[#009B9B] px-6 py-2.5 text-sm font-medium leading-none tracking-wide text-white shadow transition-colors hover:bg-[#007575]"
      >
        Sign In
      </button>
    </div>
  )

  return (
    <div className="absolute inset-0 bg-[#F8F9FA]">
      <div className="absolute right-4 top-4 z-10 inline-flex items-center gap-1 rounded-md border border-[#D2D0CE] bg-white p-1">
        {(
          [
            { id: 'centered', label: 'A' },
            { id: 'card', label: 'B' },
            { id: 'spotlight', label: 'C' },
          ] as { id: LoginVariant; label: string }[]
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setVariant(item.id)}
            className={`h-7 w-7 rounded text-xs font-semibold transition-colors ${
              variant === item.id
                ? 'bg-[#009B9B] text-white'
                : 'text-[#323130] hover:bg-[#F3F2F1]'
            }`}
            title={`Variante ${item.label}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {variant === 'centered' && (
        <div className="grid h-full w-full place-items-center px-4">
          {LogoAndActions}
        </div>
      )}

      {variant === 'card' && (
        <div className="grid h-full w-full place-items-center px-4">
          <div className="w-full max-w-[420px] rounded-2xl border border-[#D2D0CE] bg-white px-8 py-10 shadow-sm">
            {LogoAndActions}
          </div>
        </div>
      )}

      {variant === 'spotlight' && (
        <div className="relative grid h-full w-full place-items-center overflow-hidden px-4">
          <div className="pointer-events-none absolute left-1/2 top-[42%] h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#009B9B]/8 blur-3xl" />
          <div className="relative">
            {LogoAndActions}
          </div>
        </div>
      )}

      {variant === 'spotlight' && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#009B9B]/5 to-transparent" />
      )}

      {variant === 'card' && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/5 to-transparent" />
      )}

      {variant === 'centered' && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/[0.03] to-transparent" />
      )}
    </div>
  )
}
