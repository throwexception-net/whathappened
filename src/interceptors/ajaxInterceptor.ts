export interface NetBodyDef {
  type: 'formData' | 'unknown' | 'string' | 'json' | null
  data?: string
}

export interface NetPayload {
  tag: string
  id: number
  time: number | null
  timestamp: number | null
  headers: Record<string, string>
  body: NetBodyDef | null
}

export interface NetReqPayload extends NetPayload {
  url: string | null
  method: string | null
  cookies: string | null
  type: 'xhr' | 'fetch' | null
}

export interface NetResPayload extends NetPayload {
  status: number | null
  ok: boolean
  isTimeout: boolean
  aborted: boolean
  responseType: string | null
}


interface Emitter {
  emit(name: string, payload: any): void
}

const nativeFetch = window.fetch

function formatUrl(url: string) {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  const { origin, pathname } = location
  if (pathname === '/' && url.indexOf('/') === 0) {
    return origin + url
  }
  return location.origin + location.pathname + url
}

function parseBody(body: Document | BodyInit | null | undefined): NetBodyDef {
  if (body == null) {
    return {
      type: null,
    }
  }
  if (typeof body === 'string') {
    return {
      type: 'string',
      data: body,
    }
  }
  if (typeof body === 'object') {
    if (body instanceof FormData || body instanceof URLSearchParams) {
      const data: Record<string, string> = {}
      body.forEach((v, k) => {
        data[k] = typeof v === 'string' ? v : '__IS_FILE__'
      })
      return {
        type: 'formData',
        data: JSON.stringify(data),
      }
    } else {
      return {
        type: 'json',
        data: JSON.stringify(body),
      }
    }
  }
  return {
    type: 'unknown',
  }
}

const lineRE = /[\r\n]+/

function parseHeader(headers: string) {
  const map: Record<string, string> = {}
  headers.trim().split(lineRE).forEach((line) => {
    const i = line.indexOf(': ')
    map[line.substr(0, i)] = line.substr(i + 2)
  })
  return map
}

function isRequest(input: RequestInfo | URL): input is Request {
  return typeof input !== 'string' && !(input instanceof URL)
}

function isURL(input: RequestInfo | URL): input is URL {
  return input instanceof URL
}

async function parseBodyFrom(input: Request | Response) {
  try {
    const fd = await input.clone().formData()
    if (fd) {
      return parseBody(fd)
    }
  } catch (e) {
    // noop
  }

  try {
    const json = await input.clone().json()
    if (json) {
      return parseBody(json)
    }
  } catch (e) {
    // noop
  }

  try {
    const text = await input.clone().text()
    if (text) {
      return parseBody(text)
    }
  } catch (e) {
    // noop
  }

  return null
}

export default function ajaxInterceptor(emitter: Emitter, offset: number) {
  const { open, send, setRequestHeader } = XMLHttpRequest.prototype
  let idx = 100
  const reqMap = new WeakMap<object, NetReqPayload>()
  function get(ctx: object): NetReqPayload {
    let data = reqMap.get(ctx)
    if (!data) {
      data = {
        tag: 'req',
        id: idx++,
        headers: {},
        time: null,
        timestamp: null,
        url: null,
        method: null,
        type: null,
        body: null,
        cookies: null,
      }
      reqMap.set(ctx, data)
    }
    return data
  }

  function proxyOpen(
    this: XMLHttpRequest,
    method: string,
    url: string,
    async?: boolean,
    username?: string | null,
    password?: string | null,
  ): void {
    const data = get(this)
    data.method = method.toUpperCase()
    data.type = 'xhr'
    data.url = formatUrl(url)
    // @ts-ignore
    return open.apply(this, arguments)
  }

  function proxySetRequestHeader(this: XMLHttpRequest, name: string, value: string) {
    const data = get(this)
    data.headers[name] = value
    // @ts-ignore
    return setRequestHeader.apply(this, arguments)
  }

  function proxySend(this: XMLHttpRequest, body?: Document | BodyInit | null): void {
    const data = get(this)
    data.time = Date.now() - offset
    data.timestamp = Date.now()
    data.cookies = document.cookie.toString()
    data.body = parseBody(body)
    emitter.emit('event:ajax', data)
    const resData: NetResPayload = {
      tag: 'res',
      id: data.id,
      time: null,
      timestamp: null,
      headers: {},
      status: null,
      ok: false,
      isTimeout: false,
      aborted: false,
      body: null,
      responseType: null,
    }

    this.addEventListener('load', () => {
      resData.time = Date.now() - offset
      resData.timestamp = Date.now()
      resData.ok = true
      resData.status = this.status
      resData.headers = parseHeader(this.getAllResponseHeaders())
      resData.responseType = this.responseType
      resData.body = {
        type: 'string',
        data: this.responseText,
      }
      emitter.emit('event:ajax', resData)
    })
    this.addEventListener('error', () => {
      resData.time = Date.now() - offset
      resData.timestamp = Date.now()
      resData.status = this.status
      resData.responseType = this.responseType
      resData.body = {
        type: 'string',
        data: this.responseText,
      }
      emitter.emit('event:ajax', resData)
    })
    this.addEventListener('abort', () => {
      resData.time = Date.now() - offset
      resData.timestamp = Date.now()
      resData.aborted = true
      emitter.emit('event:ajax', resData)
    })
    this.addEventListener('timeout', () => {
      resData.time = Date.now() - offset
      resData.timestamp = Date.now()
      resData.isTimeout = true
      emitter.emit('event:ajax', resData)
    })
    // @ts-ignore
    return send.apply(this, arguments)
  }

  async function proxyFetch(this: any, input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const id = idx++
    const fetchSelf = this
    const reqData: NetReqPayload = {
      id,
      tag: 'req',
      headers: {},
      time: Date.now() - offset,
      timestamp: Date.now(),
      url: '',
      method: 'GET',
      type: 'fetch',
      body: null,
      cookies: document.cookie,
    }
    let info: Request | RequestInit | null = null
    if (isRequest(input)) {
      info = input
      reqData.method = input.method.toUpperCase()
      if (reqData.method !== 'GET') {
        reqData.body = await parseBodyFrom(input)
      }
      reqData.url = formatUrl(input.url)
    } else {
      if (typeof input === 'string') {
        reqData.url = formatUrl(input)
      } else if (isURL(input)) {
        reqData.url = input.toString()
      }
      if (init && typeof init === 'object') {
        info = init
        reqData.body = parseBody(init?.body)
      } else {
        reqData.body = parseBody(null)
      }
    }

    if (info && info.method) {
      reqData.method = info.method.toUpperCase()
      if (info.headers instanceof Headers) {
        info.headers.forEach((k, v) => {
          reqData.headers[k] = v
        })
      } else if (typeof info.headers === 'object') {
        Object.assign(reqData.headers, info.headers)
      }
    }

    emitter.emit('event:ajax', reqData)
    const resData: NetResPayload = {
      id,
      tag: 'res',
      time: null,
      timestamp: null,
      headers: {},
      status: null,
      ok: false,
      isTimeout: false,
      aborted: false,
      body: null,
      responseType: null,
    }
    try {
      const fetchPromise = nativeFetch.call(fetchSelf, input, init)
      const ret = await fetchPromise
      resData.time = Date.now() - offset
      resData.timestamp = Date.now()
      resData.status = ret.status
      resData.ok = ret.ok
      if (ret.headers) {
        ret.headers.forEach((k, v) => {
          resData.headers[k] = v
        })
      }
      resData.body = await parseBodyFrom(ret)
      return ret
    } catch (e) {
      resData.time = Date.now() - offset
      resData.timestamp = Date.now()
      throw e
    } finally {
      emitter.emit('event:ajax', resData)
    }
  }

  XMLHttpRequest.prototype.open = proxyOpen
  XMLHttpRequest.prototype.send = proxySend
  XMLHttpRequest.prototype.setRequestHeader = proxySetRequestHeader
  window.fetch = proxyFetch

  return function release() {
    XMLHttpRequest.prototype.open = open
    XMLHttpRequest.prototype.send = send
    XMLHttpRequest.prototype.setRequestHeader = setRequestHeader
    window.fetch = nativeFetch
  }
}

