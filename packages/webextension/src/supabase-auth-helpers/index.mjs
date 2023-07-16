var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) =>
	function __require() {
		return (
			mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports
		);
	};
var __copyProps = (to, from, except, desc) => {
	if ((from && typeof from === 'object') || typeof from === 'function') {
		for (let key of __getOwnPropNames(from))
			if (!__hasOwnProp.call(to, key) && key !== except)
				__defProp(to, key, {
					get: () => from[key],
					enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
				});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (
	(target = mod != null ? __create(__getProtoOf(mod)) : {}),
	__copyProps(
		isNodeMode || !mod || !mod.__esModule
			? __defProp(target, 'default', { value: mod, enumerable: true })
			: target,
		mod
	)
);

// ../../node_modules/.pnpm/cookie@0.5.0/node_modules/cookie/index.js
var require_cookie = __commonJS({
	'../../node_modules/.pnpm/cookie@0.5.0/node_modules/cookie/index.js'(exports) {
		'use strict';
		exports.parse = parse3;
		exports.serialize = serialize3;
		var __toString = Object.prototype.toString;
		var fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
		function parse3(str, options) {
			if (typeof str !== 'string') {
				throw new TypeError('argument str must be a string');
			}
			var obj = {};
			var opt = options || {};
			var dec = opt.decode || decode;
			var index = 0;
			while (index < str.length) {
				var eqIdx = str.indexOf('=', index);
				if (eqIdx === -1) {
					break;
				}
				var endIdx = str.indexOf(';', index);
				if (endIdx === -1) {
					endIdx = str.length;
				} else if (endIdx < eqIdx) {
					index = str.lastIndexOf(';', eqIdx - 1) + 1;
					continue;
				}
				var key = str.slice(index, eqIdx).trim();
				if (void 0 === obj[key]) {
					var val = str.slice(eqIdx + 1, endIdx).trim();
					if (val.charCodeAt(0) === 34) {
						val = val.slice(1, -1);
					}
					obj[key] = tryDecode(val, dec);
				}
				index = endIdx + 1;
			}
			return obj;
		}
		function serialize3(name, val, options) {
			var opt = options || {};
			var enc = opt.encode || encode;
			if (typeof enc !== 'function') {
				throw new TypeError('option encode is invalid');
			}
			if (!fieldContentRegExp.test(name)) {
				throw new TypeError('argument name is invalid');
			}
			var value = enc(val);
			if (value && !fieldContentRegExp.test(value)) {
				throw new TypeError('argument val is invalid');
			}
			var str = name + '=' + value;
			if (null != opt.maxAge) {
				var maxAge = opt.maxAge - 0;
				if (isNaN(maxAge) || !isFinite(maxAge)) {
					throw new TypeError('option maxAge is invalid');
				}
				str += '; Max-Age=' + Math.floor(maxAge);
			}
			if (opt.domain) {
				if (!fieldContentRegExp.test(opt.domain)) {
					throw new TypeError('option domain is invalid');
				}
				str += '; Domain=' + opt.domain;
			}
			if (opt.path) {
				if (!fieldContentRegExp.test(opt.path)) {
					throw new TypeError('option path is invalid');
				}
				str += '; Path=' + opt.path;
			}
			if (opt.expires) {
				var expires = opt.expires;
				if (!isDate(expires) || isNaN(expires.valueOf())) {
					throw new TypeError('option expires is invalid');
				}
				str += '; Expires=' + expires.toUTCString();
			}
			if (opt.httpOnly) {
				str += '; HttpOnly';
			}
			if (opt.secure) {
				str += '; Secure';
			}
			if (opt.priority) {
				var priority = typeof opt.priority === 'string' ? opt.priority.toLowerCase() : opt.priority;
				switch (priority) {
					case 'low':
						str += '; Priority=Low';
						break;
					case 'medium':
						str += '; Priority=Medium';
						break;
					case 'high':
						str += '; Priority=High';
						break;
					default:
						throw new TypeError('option priority is invalid');
				}
			}
			if (opt.sameSite) {
				var sameSite = typeof opt.sameSite === 'string' ? opt.sameSite.toLowerCase() : opt.sameSite;
				switch (sameSite) {
					case true:
						str += '; SameSite=Strict';
						break;
					case 'lax':
						str += '; SameSite=Lax';
						break;
					case 'strict':
						str += '; SameSite=Strict';
						break;
					case 'none':
						str += '; SameSite=None';
						break;
					default:
						throw new TypeError('option sameSite is invalid');
				}
			}
			return str;
		}
		function decode(str) {
			return str.indexOf('%') !== -1 ? decodeURIComponent(str) : str;
		}
		function encode(val) {
			return encodeURIComponent(val);
		}
		function isDate(val) {
			return __toString.call(val) === '[object Date]' || val instanceof Date;
		}
		function tryDecode(str, decode2) {
			try {
				return decode2(str);
			} catch (e) {
				return str;
			}
		}
	}
});

// src/browserCookieStorage.ts
var import_cookie2 = __toESM(require_cookie());

// src/utils/cookies.ts
var import_cookie = __toESM(require_cookie());
import { base64url } from 'jose';
function parseSupabaseCookie(str) {
	if (!str) {
		return null;
	}
	try {
		const session = JSON.parse(str);
		if (!session) {
			return null;
		}
		if (session.constructor.name === 'Object') {
			return session;
		}
		if (session.constructor.name !== 'Array') {
			throw new Error(`Unexpected format: ${session.constructor.name}`);
		}
		const [_header, payloadStr, _signature] = session[0].split('.');
		const payload = base64url.decode(payloadStr);
		const decoder = new TextDecoder();
		const { exp, sub, ...user } = JSON.parse(decoder.decode(payload));
		return {
			expires_at: exp,
			expires_in: exp - Math.round(Date.now() / 1e3),
			token_type: 'bearer',
			access_token: session[0],
			refresh_token: session[1],
			provider_token: session[2],
			provider_refresh_token: session[3],
			user: {
				id: sub,
				factors: session[4],
				...user
			}
		};
	} catch (err) {
		console.warn('Failed to parse cookie string:', err);
		return null;
	}
}
function stringifySupabaseSession(session) {
	var _a;
	return JSON.stringify([
		session.access_token,
		session.refresh_token,
		session.provider_token,
		session.provider_refresh_token,
		((_a = session.user) == null ? void 0 : _a.factors) ?? null
	]);
}

// src/utils/helpers.ts
function isBrowser() {
	return typeof window !== 'undefined' && typeof window.document !== 'undefined';
}

// src/utils/constants.ts
var DEFAULT_COOKIE_OPTIONS = {
	path: '/',
	maxAge: 60 * 60 * 24 * 365 * 1e3
};

// src/cookieAuthStorageAdapter.ts
var CookieAuthStorageAdapter = class {
	constructor(cookieOptions) {
		this.cookieOptions = {
			...DEFAULT_COOKIE_OPTIONS,
			...cookieOptions
		};
	}
	async getItem(key) {
		const value = await this.getCookie(key);
		if (!value) return null;
		if (key.endsWith('-code-verifier')) {
			return value;
		}
		return JSON.stringify(parseSupabaseCookie(value));
	}
	setItem(key, value) {
		if (key.endsWith('-code-verifier')) {
			this.setCookie(key, value);
			return;
		}
		let session = JSON.parse(value);
		const sessionStr = stringifySupabaseSession(session);
		this.setCookie(key, sessionStr);
	}
	removeItem(key) {
		this.deleteCookie(key);
	}
};

// src/browserCookieStorage.ts
var BrowserCookieAuthStorageAdapter = class extends CookieAuthStorageAdapter {
	constructor(cookieOptions) {
		super(cookieOptions);
	}
	getCookie(name) {
		if (!isBrowser()) return null;
		const cookies = (0, import_cookie2.parse)(document.cookie);
		return cookies[name];
	}
	setCookie(name, value) {
		if (!isBrowser()) return null;
		document.cookie = (0, import_cookie2.serialize)(name, value, {
			...this.cookieOptions,
			httpOnly: false
		});
	}
	deleteCookie(name) {
		if (!isBrowser()) return null;
		document.cookie = (0, import_cookie2.serialize)(name, '', {
			...this.cookieOptions,
			maxAge: 0,
			httpOnly: false
		});
	}
};

// src/createClient.ts
import { createClient } from '@supabase/supabase-js';
function createSupabaseClient(supabaseUrl, supabaseKey, options) {
	var _a;
	const bowser = isBrowser();
	return createClient(supabaseUrl, supabaseKey, {
		...options,
		auth: {
			flowType: 'pkce',
			autoRefreshToken: bowser,
			detectSessionInUrl: bowser,
			persistSession: true,
			storage: options.auth.storage,
			...(((_a = options.auth) == null ? void 0 : _a.storageKey)
				? {
						storageKey: options.auth.storageKey
				  }
				: {})
		}
	});
}
var export_parseCookies = import_cookie.parse;
var export_serializeCookie = import_cookie.serialize;
export {
	BrowserCookieAuthStorageAdapter,
	CookieAuthStorageAdapter,
	DEFAULT_COOKIE_OPTIONS,
	createSupabaseClient,
	isBrowser,
	export_parseCookies as parseCookies,
	parseSupabaseCookie,
	export_serializeCookie as serializeCookie,
	stringifySupabaseSession
};
/*!
 * cookie
 * Copyright(c) 2012-2014 Roman Shtylman
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */
//# sourceMappingURL=index.mjs.map
