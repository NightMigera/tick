
/**
 * if use browserify or other module.exports system,
 * tick return to module.exports, else set tick to global method
 * tick.getSafe() return soft-safe version (check params)
 * tick.getSecure() return hard-safe version (strong check params, try-catch execute queue)
 */

(function() {
  var chrome, mode, nextTickMO, nextTickPM, nextTickPR, nextTickTO, opera, ref, ref1, ref2, ref3, secure, tick;

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
    };
    secureTick = function(fn) {
      nextTick(function() {
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
    };
    secureTick = function(fn) {
      nextTick(function() {
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
    };
    secureTick = function(fn) {
      nextTick(function() {
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
    };
    secureTick = function(fn) {
      nextTick(function() {
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

  if ((typeof module !== "undefined" && module !== null) && 'exports' in module) {
    module.exports = tick;
  } else {
    window.tick = tick;
  }

}).call(this);
