###*
 * if use browserify or other module.exports system,
 * tick return to module.exports, else set tick to global method
 * tick.getSafe() return soft-safe version (check params)
 * tick.getSecure() return hard-safe version (strong check params, try-catch execute queue)
###

MutationObserver = window.MutationObserver
TypeError = window.TypeError or window.Error or Object
RangeError = window.RangeError or window.Error or Object

nextTickPM = ->
  i = 0
  queue = new Array(16)
  fire = false

  window.onmessage = (message) ->
    data = message.data
    return if data isnt 'a'
    track = queue
    len = i
    s = 0
    queue = new Array(16)
    i = 0
    fire = false
    while s < len
      track[s++]()
    return

  nextTick = (fn) ->
    queue[i++] = fn
    if !fire
      fire = true
      postMessage 'a', '*'
    return i <= 16

  secureTick = (fn) ->
    nextTick ->
      try fn()
      return

  [nextTick, secureTick]

nextTickMO = ->
  i = 0
  r = 0
  queue = new Array(16)
  fire = false
  a = document.createElement('a')
  observer = new MutationObserver ->
    track = queue
    len = i
    s = 0
    queue = new Array(16)
    i = 0
    fire = false
    while s < len
      track[s++]()
    return

  observer.observe a,
    attributes: true
    attributeFilter: [ 'lang' ]

  nextTick = (fn) ->
    queue[i++] = fn
    if !fire
      fire = true
      a.setAttribute 'lang', (r++).toString()
    return i <= 16

  secureTick = (fn) ->
    nextTick ->
      try fn()
      return

  [nextTick, secureTick]

nextTickPR = ->
  i = 0
  queue = new Array(16)
  fire = false
  p = Promise.resolve()

  call = ->
    track = queue
    len = i
    s = 0
    queue = new Array(16)
    i = 0
    fire = false
    while s < len
      track[s++]()
    return

  nextTick = (fn) ->
    queue[i++] = fn
    if !fire
      fire = true
      p = p.then(call)
    return i <= 16

  secureTick = (fn) ->
    nextTick ->
      try fn()
      return

  [nextTick, secureTick]

nextTickTO = ->
  i = 0
  queue = new Array(16)
  fire = false

  call = (message) ->
    track = queue
    len = i
    s = 0
    queue = new Array(16)
    i = 0
    fire = false
    while s < len
      track[s++]()
    return

  nextTick = (fn) ->
    queue[i++] = fn
    if !fire
      fire = true
      setTimeout call, 0
    return i <= 16

  secureTick = (fn) ->
    nextTick ->
      try fn()
      return

  [nextTick, secureTick]

chrome = navigator.userAgent.match(/Chrome\/(\d+)/)
opera = navigator.userAgent.match(/Opera\/(\d+)/)

mode = 'T' # timeout
if chrome?
  if parseInt(chrome[1]) >= 39 and window.Promise?
    mode = 'P' # Promise
else if opera?
  if parseInt(chrome[1]) >= 15 and window.Promise?
    mode = 'P' # Promise
if mode is 'T'
  if window.MutationObserver?
    mode = 'M'
  else if window.WebkitMutationObserver
    MutationObserver = window.WebkitMutationObserver
    mode = 'M'
  else if typeof window.postMessage is 'function'
    mode = 'S'

switch mode
  when 'P' then [tick, secure] = nextTickPR(false)
  when 'M' then [tick, secure] = nextTickMO(false)
  when 'S' then [tick, secure] = nextTickPM(false)
  when 'T' then [tick, secure] = nextTickTO(false)
  else throw new Error 'Impossible state'

# wrap func to get safe version
safeTick = null
tick.getSafe = ->
  return safeTick if safeTick isnt null
  safeTick = (fn) ->
    err = null
    if typeof fn isnt 'function'
      return new TypeError 'fn is not a function'
    unless tick fn
      err = new RangeError 'more than 16 task wait end of queue, not critical'
    return err

# wrap secure secure version
secureTick = null
tick.getSecure = ->
  return secureTick if secureTick isnt null
  secureTick = (fn) ->
    err = null
    if typeof fn isnt 'function'
      throw new TypeError 'fn is not a function'
    unless secure fn
      err = new RangeError 'more than 16 task wait end of queue, not critical'
    return err

tick.mode = mode

if module? and 'exports' of module
  module.exports = tick
else
  window.tick = tick
