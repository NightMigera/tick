
/**
 * if use browserify or other module.exports system,
 * tick return to module.exports, else set tick to global method
 * tick.getSafe() return soft-safe version (check params)
 * tick.getSecure() return hard-safe version (strong check params, try-catch execute queue)
 */

(function() {
  var MutationObserver, RangeError, TypeError, chrome, mode, nextTickMO, nextTickPM, nextTickPR, nextTickTO, opera, ref, ref1, ref2, ref3, safeTick, secure, secureTick, tick;

  MutationObserver = window.MutationObserver;

  TypeError = window.TypeError || window.Error || Object;

  RangeError = window.RangeError || window.Error || Object;

  nextTickPM = function() {
    var fire, i, nextTick, queue, secureTick;
    i = 0;
    queue = new Array(16);
    fire = false;
    window.onmessage = function(message) {
      var data, len, s, track;
      data = message.data;
      if (data !== 'a') {
        return;
      }
      track = queue;
      len = i;
      s = 0;
      queue = new Array(16);
      i = 0;
      fire = false;
      while (s < len) {
        track[s++]();
      }
    };
    nextTick = function(fn) {
      queue[i++] = fn;
      if (!fire) {
        fire = true;
        postMessage('a', '*');
      }
      return i <= 16;
    };
    secureTick = function(fn) {
      return nextTick(function() {
        try {
          fn();
        } catch (_error) {}
      });
    };
    return [nextTick, secureTick];
  };

  nextTickMO = function() {
    var a, fire, i, nextTick, observer, queue, r, secureTick;
    i = 0;
    r = 0;
    queue = new Array(16);
    fire = false;
    a = document.createElement('a');
    observer = new MutationObserver(function() {
      var len, s, track;
      track = queue;
      len = i;
      s = 0;
      queue = new Array(16);
      i = 0;
      fire = false;
      while (s < len) {
        track[s++]();
      }
    });
    observer.observe(a, {
      attributes: true,
      attributeFilter: ['lang']
    });
    nextTick = function(fn) {
      queue[i++] = fn;
      if (!fire) {
        fire = true;
        a.setAttribute('lang', (r++).toString());
      }
      return i <= 16;
    };
    secureTick = function(fn) {
      return nextTick(function() {
        try {
          fn();
        } catch (_error) {}
      });
    };
    return [nextTick, secureTick];
  };

  nextTickPR = function() {
    var call, fire, i, nextTick, p, queue, secureTick;
    i = 0;
    queue = new Array(16);
    fire = false;
    p = Promise.resolve();
    call = function() {
      var len, s, track;
      track = queue;
      len = i;
      s = 0;
      queue = new Array(16);
      i = 0;
      fire = false;
      while (s < len) {
        track[s++]();
      }
    };
    nextTick = function(fn) {
      queue[i++] = fn;
      if (!fire) {
        fire = true;
        p = p.then(call);
      }
      return i <= 16;
    };
    secureTick = function(fn) {
      return nextTick(function() {
        try {
          fn();
        } catch (_error) {}
      });
    };
    return [nextTick, secureTick];
  };

  nextTickTO = function() {
    var call, fire, i, nextTick, queue, secureTick;
    i = 0;
    queue = new Array(16);
    fire = false;
    call = function(message) {
      var len, s, track;
      track = queue;
      len = i;
      s = 0;
      queue = new Array(16);
      i = 0;
      fire = false;
      while (s < len) {
        track[s++]();
      }
    };
    nextTick = function(fn) {
      queue[i++] = fn;
      if (!fire) {
        fire = true;
        setTimeout(call, 0);
      }
      return i <= 16;
    };
    secureTick = function(fn) {
      return nextTick(function() {
        try {
          fn();
        } catch (_error) {}
      });
    };
    return [nextTick, secureTick];
  };

  chrome = navigator.userAgent.match(/Chrome\/(\d+)/);

  opera = navigator.userAgent.match(/Opera\/(\d+)/);

  mode = 'T';

  if (chrome != null) {
    if (parseInt(chrome[1]) >= 39 && (window.Promise != null)) {
      mode = 'P';
    }
  } else if (opera != null) {
    if (parseInt(chrome[1]) >= 15 && (window.Promise != null)) {
      mode = 'P';
    }
  }

  if (mode === 'T') {
    if (window.MutationObserver != null) {
      mode = 'M';
    } else if (window.WebkitMutationObserver) {
      MutationObserver = window.WebkitMutationObserver;
      mode = 'M';
    } else if (typeof window.postMessage === 'function') {
      mode = 'S';
    }
  }

  switch (mode) {
    case 'P':
      ref = nextTickPR(false), tick = ref[0], secure = ref[1];
      break;
    case 'M':
      ref1 = nextTickMO(false), tick = ref1[0], secure = ref1[1];
      break;
    case 'S':
      ref2 = nextTickPM(false), tick = ref2[0], secure = ref2[1];
      break;
    case 'T':
      ref3 = nextTickTO(false), tick = ref3[0], secure = ref3[1];
      break;
    default:
      throw new Error('Impossible state');
  }

  safeTick = null;

  tick.getSafe = function() {
    if (safeTick !== null) {
      return safeTick;
    }
    return safeTick = function(fn) {
      var err;
      err = null;
      if (typeof fn !== 'function') {
        return new TypeError('fn is not a function');
      }
      if (!tick(fn)) {
        err = new RangeError('more than 16 task wait end of queue, not critical');
      }
      return err;
    };
  };

  secureTick = null;

  tick.getSecure = function() {
    if (secureTick !== null) {
      return secureTick;
    }
    return secureTick = function(fn) {
      var err;
      err = null;
      if (typeof fn !== 'function') {
        throw new TypeError('fn is not a function');
      }
      if (!secure(fn)) {
        err = new RangeError('more than 16 task wait end of queue, not critical');
      }
      return err;
    };
  };

  tick.mode = mode;

  if ((typeof module !== "undefined" && module !== null) && 'exports' in module) {
    module.exports = tick;
  } else {
    window.tick = tick;
  }

}).call(this);
