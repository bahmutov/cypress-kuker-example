(function(f) {
  if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = f()
  } else if (typeof define === "function" && define.amd) {
      define([], f)
  } else {
      var g;
      if (typeof window !== "undefined") {
          g = window
      } else if (typeof global !== "undefined") {
          g = global
      } else if (typeof self !== "undefined") {
          g = self
      } else {
          g = this
      }
      g.ReactEmitter = f()
  }
})(function() {
  var define, module, exports;
  return (function e(t, n, r) {
      function s(o, u) {
          if (!n[o]) {
              if (!t[o]) {
                  var a = typeof require == "function" && require;
                  if (!u && a) return a(o, !0);
                  if (i) return i(o, !0);
                  var f = new Error("Cannot find module '" + o + "'");
                  throw f.code = "MODULE_NOT_FOUND", f
              }
              var l = n[o] = {
                  exports: {}
              };
              t[o][0].call(l.exports, function(e) {
                  var n = t[o][1][e];
                  return s(n ? n : e)
              }, l, l.exports, e, t, n, r)
          }
          return n[o].exports
      }
      var i = typeof require == "function" && require;
      for (var o = 0; o < r.length; o++) s(r[o]);
      return s
  })({
      1: [function(require, module, exports) {
          'use strict';

          exports.__esModule = true;

          var _extends = Object.assign || function(target) {
                  for (var i = 1; i < arguments.length; i++) {
                      var source = arguments[i];
                      for (var key in source) {
                          if (Object.prototype.hasOwnProperty.call(source, key)) {
                              target[key] = source[key];
                          }
                      }
                  }
                  return target;
              };

          exports.
          default = ReactEmitter;

          var _createMessenger = require('./helpers/createMessenger');

          var _createMessenger2 = _interopRequireDefault(_createMessenger);

          var _sanitize = require('./helpers/sanitize');

          var _sanitize2 = _interopRequireDefault(_sanitize);

          function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : {
                  default: obj
              };
          }

          function _objectWithoutProperties(obj, keys) {
              var target = {};
              for (var i in obj) {
                  if (keys.indexOf(i) >= 0) continue;
                  if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
                  target[i] = obj[i];
              }
              return target;
          }

          // Implementation taken from https://github.com/facebook/react-devtools/blob/master/backend/attachRenderer.js#L175-L181
          // If this breaks make sure that it is in sync with the original

          var tries = 5;
          var throttleTime = 1000;

          var Node = function Node() {
              var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

              // eslint-disable-next-line
              var _ref = data.props || {},
              children = _ref.children,
                  otherProps = _objectWithoutProperties(_ref, ['children']);
              // eslint-disable-next-line


              var _ref2 = data.state || {},
              childrenInState = _ref2.children,
                  otherStateProps = _objectWithoutProperties(_ref2, ['children']);

              return {
                  name: data.name,
                  props: (0, _sanitize2.
                  default)(_extends({}, otherProps)),
                  state: (0, _sanitize2.
                  default)(_extends({}, otherStateProps)),
                  children: []
              };
          };

          var traverseReactTree = function traverseReactTree(root, renderer, _ref3) {
              var getData = _ref3.getData,
                  getData012 = _ref3.getData012,
                  getDataFiber = _ref3.getDataFiber,
                  getDisplayName = _ref3.getDisplayName;

              if (!root) return {};

              var isPre013 = !renderer.Reconciler;
              var walkNode = function walkNode(internalInstance) {
                  var data = isPre013 ? getData012(internalInstance) : getData(internalInstance);
                  var item = Node(data);

                  if (data.children && Array.isArray(data.children)) {
                      item.children = data.children.map(function(child) {
                          return walkNode(child);
                      });
                  }
                  return item;
              };

              return walkNode(root);
          };

          var throttle = function throttle(func, wait, options) {
              var context, args, result;
              var timeout = null;
              var previous = 0;
              var throttleMeta = {
                  calls: 0,
                  components: []
              };

              var processThrottledCall = function processThrottledCall(_ref4) {
                  var data = _ref4.data;

                  throttleMeta.calls += 1;
                  data && data.name && throttleMeta.components.push(data.name);
              };
              var resetThrottleMeta = function resetThrottleMeta() {
                  throttleMeta = {
                      calls: 0,
                      components: []
                  };
              };
              var later = function later() {
                  previous = options.leading === false ? 0 : Date.now();
                  timeout = null;
                  result = func.apply(context, [throttleMeta].concat(args));
                  resetThrottleMeta();
                  if (!timeout) context = args = null;
              };

              if (!options) options = {};

              return function() {
                  var now = Date.now();

                  processThrottledCall.apply(undefined, arguments);
                  if (!previous && options.leading === false) previous = now;

                  // eslint-disable-next-line
                  var remaining = wait - (now - previous);

                  context = this;
                  args = arguments;
                  if (remaining <= 0 || remaining > wait) {
                      if (timeout) {
                          clearTimeout(timeout);
                          timeout = null;
                      }
                      previous = now;
                      result = func.apply(context, [throttleMeta].concat(args));
                      resetThrottleMeta();
                      if (!timeout) context = args = null;
                  } else if (!timeout && options.trailing !== false) {
                      timeout = setTimeout(later, remaining);
                  }
                  return result;
              };
          };

          var connect = function connect(callback) {
              if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
                  callback(window.__REACT_DEVTOOLS_GLOBAL_HOOK__);
                  return;
              }
              if (tries >= 0) {
                  tries -= 1;
                  setTimeout(function() {
                      return connect(callback);
                  }, 1500);
              }
          };

          function ReactEmitter() {
              if (typeof window === 'undefined') return;

              var postMessage = (0, _createMessenger2.
              default)('ReactEmitter');

              connect(function(hook) {
                  var getState = function getState() {
                      return {};
                  };

                  hook.on('renderer-attached', function(attached) {
                      var helpers = attached.helpers,
                          renderer = attached.renderer;

                      var rootNode = null;

                      (function findRootNode() {
                          helpers.walkTree(function() {}, function(root) {
                              var rootData = hook.__helpers.getData(root);

                              rootNode = root;
                              if (rootData.name === 'TopLevelWrapper' && rootData.children && rootData.children.length === 1) {
                                  root = rootData.children[0];
                              }
                              getState = function getState() {
                                  return (0, _sanitize2.
                                  default)(traverseReactTree(root, renderer, hook.__helpers));
                              };
                              postMessage({
                                  type: '@@react_root_detected',
                                  state: getState()
                              });
                          });
                          if (rootNode === null) {
                              setTimeout(findRootNode, 300);
                          }
                      })();
                  });
                  hook.on('root', throttle(function(_ref5) {
                      var calls = _ref5.calls,
                          components = _ref5.components;

                      postMessage({
                          type: '@@react_root',
                          state: getState(),
                          calls: calls,
                          components: components
                      });
                  }, throttleTime));
                  hook.on('mount', throttle(function(_ref6) {
                      var calls = _ref6.calls,
                          components = _ref6.components;

                      postMessage({
                          type: '@@react_mount',
                          state: getState(),
                          calls: calls,
                          components: components
                      });
                  }, throttleTime));
                  hook.on('update', throttle(function(_ref7) {
                      var calls = _ref7.calls,
                          components = _ref7.components;

                      postMessage({
                          type: '@@react_update',
                          state: getState(),
                          calls: calls,
                          components: components
                      });
                  }, throttleTime));
                  hook.on('unmount', throttle(function(_ref8) {
                      var calls = _ref8.calls,
                          components = _ref8.components;

                      postMessage({
                          type: '@@react_unmount',
                          state: getState(),
                          calls: calls,
                          components: components
                      });
                  }, throttleTime));
              });
          };

          ReactEmitter.Node = Node;
          ReactEmitter.traverseReactTree = traverseReactTree;
          ReactEmitter.throttle = throttle;
          module.exports = exports['default'];
      }, {
          "./helpers/createMessenger": 2,
          "./helpers/sanitize": 3
      }],
      2: [function(require, module, exports) {
          'use strict';

          exports.__esModule = true;

          var _extends = Object.assign || function(target) {
                  for (var i = 1; i < arguments.length; i++) {
                      var source = arguments[i];
                      for (var key in source) {
                          if (Object.prototype.hasOwnProperty.call(source, key)) {
                              target[key] = source[key];
                          }
                      }
                  }
                  return target;
              };

          exports.
          default = createMessenger;
          /* eslint-disable vars-on-top */
          var PORT = exports.PORT = 8228;
          var KUKER_EVENT = 'kuker-event';
          var NODE_ORIGIN = 'node (PORT: ' + PORT + ')';

          var isDefined = function isDefined(what) {
              return typeof what !== 'undefined';
          };

          function getOrigin() {
              if (isDefined(location) && isDefined(location.protocol) && isDefined(location.host)) {
                  return location.protocol + '//' + location.host;
              }
              return 'unknown';
          }

          var messagesBeforeSetup = [];
          var connections = null;
          var app = null;
          var isThereAnySocketServer = function isThereAnySocketServer() {
              return app !== null;
          };
          var isTheServerReady = false;

          function createMessenger(emitterName) {
              var emitterDescription = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';


              function enhanceEvent(origin, data) {
                  return _extends({
                      kuker: true,
                      time: new Date().getTime(),
                      origin: origin,
                      emitter: emitterName
                  }, data);
              }
              var socketPostMessage = function socketPostMessage(data) {
                  if (isThereAnySocketServer() && connections !== null) {
                      Object.keys(connections).forEach(function(id) {
                          return connections[id].emit(KUKER_EVENT, [enhanceEvent(NODE_ORIGIN, data)]);
                      });
                  } else {
                      messagesBeforeSetup.push(data);
                  }
              };
              var browserPostMessage = function browserPostMessage(data) {
                  window.postMessage(enhanceEvent(getOrigin(), data), '*');
              };

              // in node
              if (typeof window === 'undefined') {
                  if (isThereAnySocketServer()) {
                      socketPostMessage({
                          type: 'NEW_EMITTER',
                          emitterDescription: emitterDescription
                      });
                  } else {
                      if (isTheServerReady) {
                          return socketPostMessage;
                      }
                      var r = 'require';
                      var socketIO = module[r]('socket.io');
                      var http = module[r]('http');

                      app = http.createServer(function(req, res) {
                          res.writeHead(200);
                          res.end('Kuker: Hi!');
                      });
                      var io = socketIO(app);

                      io.on('connection', function(socket) {
                          if (connections === null) connections = {};
                          connections[socket.id] = socket;
                          socket.on('disconnect', function(reason) {
                              delete connections[socket.id];
                          });
                          // the very first client receives the pending messages
                          // for the rest ... sorry :)
                          if (messagesBeforeSetup.length > 0) {
                              socketPostMessage({
                                  type: 'NEW_EMITTER',
                                  emitterDescription: emitterDescription
                              });
                              messagesBeforeSetup.forEach(function(data) {
                                  return socketPostMessage(data);
                              });
                              messagesBeforeSetup = [];
                          }
                          console.log('Kuker(Messenger): client connected (' + Object.keys(connections).length + ' in total)');
                      });

                      app.listen(PORT);
                      isTheServerReady = true;
                      console.log('Kuker(Messenger): server running at ' + PORT);
                  }

                  return socketPostMessage;
              }

              // in the browser
              browserPostMessage({
                  type: 'NEW_EMITTER',
                  emitterDescription: emitterDescription
              });
              return browserPostMessage;
          };
      }, {}],
      3: [function(require, module, exports) {
          'use strict';

          exports.__esModule = true;
          exports.
          default = sanitize;

          var _CircularJSON = require('./vendors/CircularJSON');

          var _SerializeError = require('./vendors/SerializeError');

          var _SerializeError2 = _interopRequireDefault(_SerializeError);

          function _interopRequireDefault(obj) {
              return obj && obj.__esModule ? obj : {
                  default: obj
              };
          }

          function sanitize(something) {
              var showErrorInConsole = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

              var result;

              try {
                  result = JSON.parse((0, _CircularJSON.stringify)(something, function(key, value) {
                      if (typeof value === 'function') {
                          return value.name === '' ? '<anonymous>' : 'function ' + value.name + '()';
                      }
                      if (value instanceof Error) {
                          return (0, _SerializeError2.
                          default)(value);
                      }
                      return value;
                  }, undefined, true));
              } catch (error) {
                  if (showErrorInConsole) {
                      console.log(error);
                  }
                  result = null;
              }
              return result;
          }
          module.exports = exports['default'];
      }, {
          "./vendors/CircularJSON": 4,
          "./vendors/SerializeError": 5
      }],
      4: [function(require, module, exports) {
          'use strict';

          exports.__esModule = true;

          var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function(obj) {
                  return typeof obj;
              } : function(obj) {
                  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
              };

          /* eslint-disable */
          /*!
Copyright (C) 2013-2017 by Andrea Giammarchi - @WebReflection

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/
          var
          // should be a not so common char
          // possibly one JSON does not encode
          // possibly one encodeURIComponent does not encode
          // right now this char is '~' but this might change in the future
          specialChar = '~',
              safeSpecialChar = '\\x' + ('0' + specialChar.charCodeAt(0).toString(16)).slice(-2),
              escapedSafeSpecialChar = '\\' + safeSpecialChar,
              specialCharRG = new RegExp(safeSpecialChar, 'g'),
              safeSpecialCharRG = new RegExp(escapedSafeSpecialChar, 'g'),
              safeStartWithSpecialCharRG = new RegExp('(?:^|([^\\\\]))' + escapedSafeSpecialChar),
              indexOf = [].indexOf || function(v) {
                  for (var i = this.length; i-- && this[i] !== v;) {}
                  return i;
              },
              $String = String // there's no way to drop warnings in JSHint
              // about new String ... well, I need that here!
              // faked, and happy linter!
              ;

          function generateReplacer(value, replacer, resolve) {
              var inspect = !! replacer,
                  path = [],
                  all = [value],
                  seen = [value],
                  mapp = [resolve ? specialChar : '<circular>'],
                  last = value,
                  lvl = 1,
                  i,
                  fn;
              if (inspect) {
                  fn = (typeof replacer === 'undefined' ? 'undefined' : _typeof(replacer)) === 'object' ? function(key, value) {
                      return key !== '' && replacer.indexOf(key) < 0 ? void 0 : value;
                  } : replacer;
              }
              return function(key, value) {
                  // the replacer has rights to decide
                  // if a new object should be returned
                  // or if there's some key to drop
                  // let's call it here rather than "too late"
                  if (inspect) value = fn.call(this, key, value);

                  // did you know ? Safari passes keys as integers for arrays
                  // which means if (key) when key === 0 won't pass the check
                  if (key !== '') {
                      if (last !== this) {
                          i = lvl - indexOf.call(all, this) - 1;
                          lvl -= i;
                          all.splice(lvl, all.length);
                          path.splice(lvl - 1, path.length);
                          last = this;
                      }
                      // console.log(lvl, key, path);
                      if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && value) {
                          // if object isn't referring to parent object, add to the
                          // object path stack. Otherwise it is already there.
                          if (indexOf.call(all, value) < 0) {
                              all.push(last = value);
                          }
                          lvl = all.length;
                          i = indexOf.call(seen, value);
                          if (i < 0) {
                              i = seen.push(value) - 1;
                              if (resolve) {
                                  // key cannot contain specialChar but could be not a string
                                  path.push(('' + key).replace(specialCharRG, safeSpecialChar));
                                  mapp[i] = specialChar + path.join(specialChar);
                              } else {
                                  mapp[i] = mapp[0];
                              }
                          } else {
                              value = mapp[i];
                          }
                      } else {
                          if (typeof value === 'string' && resolve) {
                              // ensure no special char involved on deserialization
                              // in this case only first char is important
                              // no need to replace all value (better performance)
                              value = value.replace(safeSpecialChar, escapedSafeSpecialChar).replace(specialChar, safeSpecialChar);
                          }
                      }
                  }
                  return value;
              };
          }

          function retrieveFromPath(current, keys) {
              for (var i = 0, length = keys.length; i < length; current = current[
              // keys should be normalized back here
              keys[i++].replace(safeSpecialCharRG, specialChar)]) {}
              return current;
          }

          function generateReviver(reviver) {
              return function(key, value) {
                  var isString = typeof value === 'string';
                  if (isString && value.charAt(0) === specialChar) {
                      return new $String(value.slice(1));
                  }
                  if (key === '') value = regenerate(value, value, {});
                  // again, only one needed, do not use the RegExp for this replacement
                  // only keys need the RegExp
                  if (isString) value = value.replace(safeStartWithSpecialCharRG, '$1' + specialChar).replace(escapedSafeSpecialChar, safeSpecialChar);
                  return reviver ? reviver.call(this, key, value) : value;
              };
          }

          function regenerateArray(root, current, retrieve) {
              for (var i = 0, length = current.length; i < length; i++) {
                  current[i] = regenerate(root, current[i], retrieve);
              }
              return current;
          }

          function regenerateObject(root, current, retrieve) {
              for (var key in current) {
                  if (current.hasOwnProperty(key)) {
                      current[key] = regenerate(root, current[key], retrieve);
                  }
              }
              return current;
          }

          function regenerate(root, current, retrieve) {
              return current instanceof Array ?
              // fast Array reconstruction
              regenerateArray(root, current, retrieve) : current instanceof $String ?
              // root is an empty string
              current.length ? retrieve.hasOwnProperty(current) ? retrieve[current] : retrieve[current] = retrieveFromPath(root, current.split(specialChar)) : root : current instanceof Object ?
              // dedicated Object parser
              regenerateObject(root, current, retrieve) :
              // value as it is
              current;
          }

          function stringifyRecursion(value, replacer, space, doNotResolve) {
              return JSON.stringify(value, generateReplacer(value, replacer, !doNotResolve), space);
          }

          function parseRecursion(text, reviver) {
              return JSON.parse(text, generateReviver(reviver));
          }

          exports.
          default = {
              stringify: stringifyRecursion,
              parse: parseRecursion
          };
          module.exports = exports['default'];
      }, {}],
      5: [function(require, module, exports) {
          /* eslint-disable */
          // Credits: https://github.com/sindresorhus/serialize-error

          'use strict';

          var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function(obj) {
                  return typeof obj;
              } : function(obj) {
                  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
              };

          module.exports = function(value) {
              if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
                  return destroyCircular(value, []);
              }

              // People sometimes throw things besides Error objects, so…

              if (typeof value === 'function') {
                  // JSON.stringify discards functions. We do too, unless a function is thrown directly.
                  return '[Function: ' + (value.name || 'anonymous') + ']';
              }

              return value;
          };

          // https://www.npmjs.com/package/destroy-circular
          function destroyCircular(from, seen) {
              var to = Array.isArray(from) ? [] : {};

              seen.push(from);

              for (var _iterator = Object.keys(from), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
                  var _ref;

                  if (_isArray) {
                      if (_i >= _iterator.length) break;
                      _ref = _iterator[_i++];
                  } else {
                      _i = _iterator.next();
                      if (_i.done) break;
                      _ref = _i.value;
                  }

                  var key = _ref;

                  var value = from[key];

                  if (typeof value === 'function') {
                      continue;
                  }

                  if (!value || (typeof value === 'undefined' ? 'undefined' : _typeof(value)) !== 'object') {
                      to[key] = value;
                      continue;
                  }

                  if (seen.indexOf(from[key]) === -1) {
                      to[key] = destroyCircular(from[key], seen.slice(0));
                      continue;
                  }

                  to[key] = '[Circular]';
              }

              if (typeof from.name === 'string') {
                  to.name = from.name;
              }

              if (typeof from.message === 'string') {
                  to.message = from.message;
              }

              if (typeof from.stack === 'string') {
                  to.stack = from.stack;
              }

              return to;
          }
      }, {}]
  }, {}, [1])(1)
});