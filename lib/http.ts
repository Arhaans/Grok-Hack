export function json(data: unknown, init: ResponseInit = {}) {
  return Response.json(data, { ...init, headers: { "cache-control": "no-store", ...(init.headers || {}) } })
}

export function bad(message: string, status = 400) {
  return json({ error: message }, { status })
}

export function originOf(req: Request) {
  return new URL(req.url).origin
}

export async function body<T>(req: Request): Promise<Partial<T>> {
  try {
    return (await req.json()) as Partial<T>
  } catch {
    return {}
  }
}
