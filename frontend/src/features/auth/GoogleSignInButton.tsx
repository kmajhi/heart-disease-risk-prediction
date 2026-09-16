import { useEffect, useRef, useState } from 'react'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined

interface GoogleCredentialResponse {
  credential: string
}

interface GoogleIdClient {
  initialize: (config: {
    client_id: string
    callback: (response: GoogleCredentialResponse) => void
  }) => void
  renderButton: (parent: HTMLElement, options: Record<string, string>) => void
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleIdClient } }
  }
}

const SCRIPT_SRC = 'https://accounts.google.com/gsi/client'
let scriptLoadPromise: Promise<void> | null = null

function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve()
  if (scriptLoadPromise) return scriptLoadPromise

  scriptLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Sign-In script.'))
    document.head.appendChild(script)
  })
  return scriptLoadPromise
}

/**
 * Renders Google's own "Sign in with Google" button (via Google Identity
 * Services) rather than a hand-styled lookalike — required by Google's
 * branding guidelines. Signing in provisions an account automatically on
 * first use; there is no separate manual registration step for Google
 * sign-in.
 */
export function GoogleSignInButton({ onCredential }: { onCredential: (credential: string) => void }) {
  const buttonRef = useRef<HTMLDivElement>(null)
  const [scriptFailed, setScriptFailed] = useState(false)
  // Always calls the latest onCredential without re-initializing Google's
  // client (which only needs to happen once per mount).
  const onCredentialRef = useRef(onCredential)
  onCredentialRef.current = onCredential

  useEffect(() => {
    if (!CLIENT_ID) return

    let cancelled = false

    loadGoogleScript()
      .then(() => {
        if (cancelled || !buttonRef.current || !window.google) return
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (response) => onCredentialRef.current(response.credential),
        })
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'filled_black',
          size: 'large',
          shape: 'pill',
          text: 'continue_with',
          width: '336',
        })
      })
      .catch(() => {
        if (!cancelled) setScriptFailed(true)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!CLIENT_ID) {
    return import.meta.env.DEV ? (
      <p className="rounded-lg border border-dashed border-slate-700 bg-slate-900/60 px-3 py-2 text-center text-xs text-slate-500">
        Google sign-in isn&apos;t configured — set VITE_GOOGLE_CLIENT_ID to enable it.
      </p>
    ) : null
  }

  if (scriptFailed) {
    return (
      <p className="text-center text-xs text-slate-500">
        Couldn&apos;t load Google Sign-In. Check your connection and reload the page.
      </p>
    )
  }

  return (
    <div className="flex justify-center">
      <div ref={buttonRef} />
    </div>
  )
}
