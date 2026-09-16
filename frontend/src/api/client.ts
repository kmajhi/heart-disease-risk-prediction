export class ApiError extends Error {
  status: number
  detail: string
  fieldErrors?: Record<string, string[]>

  constructor(status: number, detail: string, fieldErrors?: Record<string, string[]>) {
    super(detail)
    this.status = status
    this.detail = detail
    this.fieldErrors = fieldErrors
  }
}

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method ?? 'GET').toUpperCase()
  const headers = new Headers(options.headers)

  if (!SAFE_METHODS.has(method)) {
    const csrfToken = readCookie('csrftoken')
    if (csrfToken) headers.set('X-CSRFToken', csrfToken)
  }
  // FormData must NOT get an explicit Content-Type — the browser sets the
  // multipart boundary itself only when the header is left unset.
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`/api${path}`, {
    ...options,
    method,
    headers,
    credentials: 'include',
  })

  if (response.status === 204) {
    return undefined as T
  }

  const isJson = response.headers.get('content-type')?.includes('application/json')
  const body = isJson ? await response.json().catch(() => undefined) : undefined

  if (!response.ok) {
    if (response.status === 401) {
      throw new ApiError(401, 'Not authenticated.')
    }
    const detail =
      (body && typeof body === 'object' && 'detail' in body && String(body.detail)) ||
      `Request failed (${response.status})`
    const fieldErrors =
      body && typeof body === 'object'
        ? Object.fromEntries(
            Object.entries(body as Record<string, unknown>).filter(
              ([key, value]) => key !== 'detail' && Array.isArray(value),
            ),
          )
        : undefined
    throw new ApiError(
      response.status,
      detail,
      fieldErrors && Object.keys(fieldErrors).length ? (fieldErrors as Record<string, string[]>) : undefined,
    )
  }

  return body as T
}
