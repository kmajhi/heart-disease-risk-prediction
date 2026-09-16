import { useState, type ComponentType, type SVGProps } from 'react'
import { useAuth } from '../auth/AuthContext'
import type { ShareChannel } from '../../types/user'
import {
  FacebookIcon,
  LinkedInIcon,
  LinkIcon,
  ShareIcon,
  TwitterIcon,
  WhatsAppIcon,
} from './icons'

interface Channel {
  id: ShareChannel
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  href: (url: string, text: string) => string
  className: string
}

const CHANNELS: Channel[] = [
  {
    id: 'twitter',
    label: 'X',
    icon: TwitterIcon,
    href: (url, text) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    className: 'hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: LinkedInIcon,
    href: (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    className: 'hover:bg-[#0A66C2] hover:text-white',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    icon: FacebookIcon,
    href: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    className: 'hover:bg-[#1877F2] hover:text-white',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    icon: WhatsAppIcon,
    href: (url, text) => `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
    className: 'hover:bg-[#25D366] hover:text-white',
  },
]

export function ShareButtons({ url, text }: { url: string; text: string }) {
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)

  const prefs = user?.share_preferences ?? {}
  const hasAnyPreference = Object.values(prefs).some(Boolean)
  const channels = hasAnyPreference ? CHANNELS.filter((channel) => prefs[channel.id]) : CHANNELS

  const openShare = (href: string) => window.open(href, '_blank', 'noopener,noreferrer,width=600,height=500')

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API can be unavailable (permissions, insecure context) —
      // fail quietly rather than showing a confusing error for a nice-to-have.
    }
  }

  const handleNativeShare = () => {
    void navigator.share?.({ title: 'Heart Risk AI report', text, url })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {typeof navigator !== 'undefined' && 'share' in navigator && (
        <button
          type="button"
          onClick={handleNativeShare}
          className="flex items-center gap-1.5 rounded-full border border-slate-300/80 bg-white/70 px-3.5 py-1.5 text-xs font-medium text-slate-600 transition-all duration-150 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700/80 dark:bg-slate-950/40 dark:text-slate-300 dark:hover:text-indigo-400"
        >
          <ShareIcon className="size-3.5" />
          Share
        </button>
      )}
      {channels.map(({ id, label, icon: Icon, href, className }) => (
        <button
          key={id}
          type="button"
          title={`Share on ${label}`}
          aria-label={`Share on ${label}`}
          onClick={() => openShare(href(url, text))}
          className={`flex size-8 items-center justify-center rounded-full border border-slate-300/80 bg-white/70 text-slate-600 transition-all duration-150 dark:border-slate-700/80 dark:bg-slate-950/40 dark:text-slate-300 ${className}`}
        >
          <Icon className="size-4" />
        </button>
      ))}
      <button
        type="button"
        onClick={handleCopy}
        className="flex items-center gap-1.5 rounded-full border border-slate-300/80 bg-white/70 px-3.5 py-1.5 text-xs font-medium text-slate-600 transition-all duration-150 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700/80 dark:bg-slate-950/40 dark:text-slate-300 dark:hover:text-indigo-400"
      >
        <LinkIcon className="size-3.5" />
        {copied ? 'Copied!' : 'Copy link'}
      </button>
    </div>
  )
}
