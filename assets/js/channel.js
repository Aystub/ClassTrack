(function() {
    var h, n = this,
        p = function(a) {
            return void 0 !== a
        },
        q = function(a, b, c) {
            a = a.split(".");
            c = c || n;
            a[0] in c || !c.execScript || c.execScript("var " + a[0]);
            for (var d; a.length && (d = a.shift());) !a.length && p(b) ? c[d] = b : c = c[d] ? c[d] : c[d] = {}
        },
        aa = function(a, b) {
            for (var c = a.split("."), d = b || n, e; e = c.shift();)
                if (null != d[e]) d = d[e];
                else return null;
            return d
        },
        ba = function() {},
        ca = function(a) {
            var b = typeof a;
            if ("object" == b)
                if (a) {
                    if (a instanceof Array) return "array";
                    if (a instanceof Object) return b;
                    var c = Object.prototype.toString.call(a);
                    if ("[object Window]" == c) return "object";
                    if ("[object Array]" == c || "number" == typeof a.length && "undefined" != typeof a.splice && "undefined" != typeof a.propertyIsEnumerable && !a.propertyIsEnumerable("splice")) return "array";
                    if ("[object Function]" == c || "undefined" != typeof a.call && "undefined" != typeof a.propertyIsEnumerable && !a.propertyIsEnumerable("call")) return "function"
                } else return "null";
            else if ("function" == b && "undefined" == typeof a.call) return "object";
            return b
        },
        t = function(a) {
            return "array" == ca(a)
        },
        da = function(a) {
            var b =
                ca(a);
            return "array" == b || "object" == b && "number" == typeof a.length
        },
        u = function(a) {
            return "string" == typeof a
        },
        ea = function(a) {
            return "number" == typeof a
        },
        w = function(a) {
            return "function" == ca(a)
        },
        fa = function(a) {
            var b = typeof a;
            return "object" == b && null != a || "function" == b
        },
        ia = function(a) {
            return a[ga] || (a[ga] = ++ha)
        },
        ga = "closure_uid_" + (1E9 * Math.random() >>> 0),
        ha = 0,
        ja = function(a, b, c) {
            return a.call.apply(a.bind, arguments)
        },
        ka = function(a, b, c) {
            if (!a) throw Error();
            if (2 < arguments.length) {
                var d = Array.prototype.slice.call(arguments,
                    2);
                return function() {
                    var c = Array.prototype.slice.call(arguments);
                    Array.prototype.unshift.apply(c, d);
                    return a.apply(b, c)
                }
            }
            return function() {
                return a.apply(b, arguments)
            }
        },
        x = function(a, b, c) {
            x = Function.prototype.bind && -1 != Function.prototype.bind.toString().indexOf("native code") ? ja : ka;
            return x.apply(null, arguments)
        },
        la = function(a, b) {
            var c = Array.prototype.slice.call(arguments, 1);
            return function() {
                var b = c.slice();
                b.push.apply(b, arguments);
                return a.apply(this, b)
            }
        },
        y = Date.now || function() {
            return +new Date
        },
        z = function(a, b) {
            function c() {}
            c.prototype = b.prototype;
            a.C = b.prototype;
            a.prototype = new c;
            a.prototype.constructor = a;
            a.Hd = function(a, c, f) {
                for (var g = Array(arguments.length - 2), k = 2; k < arguments.length; k++) g[k - 2] = arguments[k];
                return b.prototype[c].apply(a, g)
            }
        };
    Function.prototype.bind = Function.prototype.bind || function(a, b) {
        if (1 < arguments.length) {
            var c = Array.prototype.slice.call(arguments, 1);
            c.unshift(this, a);
            return x.apply(null, c)
        }
        return x(this, a)
    };
    var A = function(a) {
        if (Error.captureStackTrace) Error.captureStackTrace(this, A);
        else {
            var b = Error().stack;
            b && (this.stack = b)
        }
        a && (this.message = String(a))
    };
    z(A, Error);
    A.prototype.name = "CustomError";
    var ma;
    var na = function(a, b) {
            for (var c = a.split("%s"), d = "", e = Array.prototype.slice.call(arguments, 1); e.length && 1 < c.length;) d += c.shift() + e.shift();
            return d + c.join("%s")
        },
        oa = String.prototype.trim ? function(a) {
            return a.trim()
        } : function(a) {
            return a.replace(/^[\s\xa0]+|[\s\xa0]+$/g, "")
        },
        wa = function(a) {
            if (!pa.test(a)) return a; - 1 != a.indexOf("&") && (a = a.replace(qa, "&amp;")); - 1 != a.indexOf("<") && (a = a.replace(ra, "&lt;")); - 1 != a.indexOf(">") && (a = a.replace(sa, "&gt;")); - 1 != a.indexOf('"') && (a = a.replace(ta, "&quot;")); - 1 != a.indexOf("'") &&
                (a = a.replace(ua, "&#39;")); - 1 != a.indexOf("\x00") && (a = a.replace(va, "&#0;"));
            return a
        },
        qa = /&/g,
        ra = /</g,
        sa = />/g,
        ta = /"/g,
        ua = /'/g,
        va = /\x00/g,
        pa = /[\x00&<>"']/,
        B = function(a, b) {
            return -1 != a.indexOf(b)
        },
        xa = function(a, b) {
            return a < b ? -1 : a > b ? 1 : 0
        };
    var ya = function(a, b) {
        b.unshift(a);
        A.call(this, na.apply(null, b));
        b.shift()
    };
    z(ya, A);
    ya.prototype.name = "AssertionError";
    var za = function(a, b, c, d) {
            var e = "Assertion failed";
            if (c) var e = e + (": " + c),
                f = d;
            else a && (e += ": " + a, f = b);
            throw new ya("" + e, f || []);
        },
        C = function(a, b, c) {
            a || za("", null, b, Array.prototype.slice.call(arguments, 2))
        },
        Aa = function(a, b) {
            throw new ya("Failure" + (a ? ": " + a : ""), Array.prototype.slice.call(arguments, 1));
        },
        Ba = function(a, b, c) {
            w(a) || za("Expected function but got %s: %s.", [ca(a), a], b, Array.prototype.slice.call(arguments, 2))
        };
    var D = Array.prototype,
        Ca = D.indexOf ? function(a, b, c) {
            C(null != a.length);
            return D.indexOf.call(a, b, c)
        } : function(a, b, c) {
            c = null == c ? 0 : 0 > c ? Math.max(0, a.length + c) : c;
            if (u(a)) return u(b) && 1 == b.length ? a.indexOf(b, c) : -1;
            for (; c < a.length; c++)
                if (c in a && a[c] === b) return c;
            return -1
        },
        Da = D.forEach ? function(a, b, c) {
            C(null != a.length);
            D.forEach.call(a, b, c)
        } : function(a, b, c) {
            for (var d = a.length, e = u(a) ? a.split("") : a, f = 0; f < d; f++) f in e && b.call(c, e[f], f, a)
        },
        Ea = D.filter ? function(a, b, c) {
            C(null != a.length);
            return D.filter.call(a,
                b, c)
        } : function(a, b, c) {
            for (var d = a.length, e = [], f = 0, g = u(a) ? a.split("") : a, k = 0; k < d; k++)
                if (k in g) {
                    var l = g[k];
                    b.call(c, l, k, a) && (e[f++] = l)
                }
            return e
        },
        Fa = D.some ? function(a, b, c) {
            C(null != a.length);
            return D.some.call(a, b, c)
        } : function(a, b, c) {
            for (var d = a.length, e = u(a) ? a.split("") : a, f = 0; f < d; f++)
                if (f in e && b.call(c, e[f], f, a)) return !0;
            return !1
        },
        Ga = function(a, b) {
            var c = Ca(a, b),
                d;
            if (d = 0 <= c) C(null != a.length), D.splice.call(a, c, 1);
            return d
        },
        Ha = function(a) {
            return D.concat.apply(D, arguments)
        },
        Ia = function(a) {
            var b = a.length;
            if (0 < b) {
                for (var c = Array(b), d = 0; d < b; d++) c[d] = a[d];
                return c
            }
            return []
        };
    var Ja = function(a, b) {
            for (var c in a) b.call(void 0, a[c], c, a)
        },
        Ka = "constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" "),
        La = function(a, b) {
            for (var c, d, e = 1; e < arguments.length; e++) {
                d = arguments[e];
                for (c in d) a[c] = d[c];
                for (var f = 0; f < Ka.length; f++) c = Ka[f], Object.prototype.hasOwnProperty.call(d, c) && (a[c] = d[c])
            }
        },
        Ma = function(a) {
            var b = arguments.length;
            if (1 == b && t(arguments[0])) return Ma.apply(null, arguments[0]);
            for (var c = {}, d = 0; d < b; d++) c[arguments[d]] = !0;
            return c
        };
    var E;
    t: {
        var Na = n.navigator;
        if (Na) {
            var Oa = Na.userAgent;
            if (Oa) {
                E = Oa;
                break t
            }
        }
        E = ""
    };
    var Pa = B(E, "Opera") || B(E, "OPR"),
        F = B(E, "Trident") || B(E, "MSIE"),
        Qa = B(E, "Gecko") && !B(E.toLowerCase(), "webkit") && !(B(E, "Trident") || B(E, "MSIE")),
        G = B(E.toLowerCase(), "webkit"),
        Ra = function() {
            var a = n.document;
            return a ? a.documentMode : void 0
        },
        Sa = function() {
            var a = "",
                b;
            if (Pa && n.opera) return a = n.opera.version, w(a) ? a() : a;
            Qa ? b = /rv\:([^\);]+)(\)|;)/ : F ? b = /\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/ : G && (b = /WebKit\/(\S+)/);
            b && (a = (a = b.exec(E)) ? a[1] : "");
            return F && (b = Ra(), b > parseFloat(a)) ? String(b) : a
        }(),
        Ua = {},
        H = function(a) {
            var b;
            if (!(b = Ua[a])) {
                b = 0;
                for (var c = oa(String(Sa)).split("."), d = oa(String(a)).split("."), e = Math.max(c.length, d.length), f = 0; 0 == b && f < e; f++) {
                    var g = c[f] || "",
                        k = d[f] || "",
                        l = RegExp("(\\d*)(\\D*)", "g"),
                        m = RegExp("(\\d*)(\\D*)", "g");
                    do {
                        var r = l.exec(g) || ["", "", ""],
                            v = m.exec(k) || ["", "", ""];
                        if (0 == r[0].length && 0 == v[0].length) break;
                        b = xa(0 == r[1].length ? 0 : parseInt(r[1], 10), 0 == v[1].length ? 0 : parseInt(v[1], 10)) || xa(0 == r[2].length, 0 == v[2].length) || xa(r[2], v[2])
                    } while (0 == b)
                }
                b = Ua[a] = 0 <= b
            }
            return b
        },
        Va = n.document,
        Wa = Va && F ? Ra() || ("CSS1Compat" ==
            Va.compatMode ? parseInt(Sa, 10) : 5) : void 0;
    var Xa = null,
        Ya = null,
        Za = null;
    var $a = function() {
        this.n = -1
    };
    var ab = function(a, b, c) {
        this.n = -1;
        this.u = a;
        this.n = c || a.n || 16;
        this.wc = Array(this.n);
        this.Fb = Array(this.n);
        a = b;
        a.length > this.n && (this.u.update(a), a = this.u.Ga(), this.u.reset());
        for (c = 0; c < this.n; c++) b = c < a.length ? a[c] : 0, this.wc[c] = b ^ 92, this.Fb[c] = b ^ 54;
        this.u.update(this.Fb)
    };
    z(ab, $a);
    ab.prototype.reset = function() {
        this.u.reset();
        this.u.update(this.Fb)
    };
    ab.prototype.update = function(a, b) {
        this.u.update(a, b)
    };
    ab.prototype.Ga = function() {
        var a = this.u.Ga();
        this.u.reset();
        this.u.update(this.wc);
        this.u.update(a);
        return this.u.Ga()
    };
    var bb = function() {
        this.n = -1;
        this.n = 64;
        this.h = [];
        this.xb = [];
        this.Zc = [];
        this.gb = [];
        this.gb[0] = 128;
        for (var a = 1; a < this.n; ++a) this.gb[a] = 0;
        this.qb = this.wa = 0;
        this.reset()
    };
    z(bb, $a);
    bb.prototype.reset = function() {
        this.h[0] = 1732584193;
        this.h[1] = 4023233417;
        this.h[2] = 2562383102;
        this.h[3] = 271733878;
        this.h[4] = 3285377520;
        this.qb = this.wa = 0
    };
    var cb = function(a, b, c) {
        c || (c = 0);
        var d = a.Zc;
        if (u(b))
            for (var e = 0; 16 > e; e++) d[e] = b.charCodeAt(c) << 24 | b.charCodeAt(c + 1) << 16 | b.charCodeAt(c + 2) << 8 | b.charCodeAt(c + 3), c += 4;
        else
            for (e = 0; 16 > e; e++) d[e] = b[c] << 24 | b[c + 1] << 16 | b[c + 2] << 8 | b[c + 3], c += 4;
        for (e = 16; 80 > e; e++) {
            var f = d[e - 3] ^ d[e - 8] ^ d[e - 14] ^ d[e - 16];
            d[e] = (f << 1 | f >>> 31) & 4294967295
        }
        b = a.h[0];
        c = a.h[1];
        for (var g = a.h[2], k = a.h[3], l = a.h[4], m, e = 0; 80 > e; e++) 40 > e ? 20 > e ? (f = k ^ c & (g ^ k), m = 1518500249) : (f = c ^ g ^ k, m = 1859775393) : 60 > e ? (f = c & g | k & (c | g), m = 2400959708) : (f = c ^ g ^ k, m = 3395469782),
            f = (b << 5 | b >>> 27) + f + l + m + d[e] & 4294967295, l = k, k = g, g = (c << 30 | c >>> 2) & 4294967295, c = b, b = f;
        a.h[0] = a.h[0] + b & 4294967295;
        a.h[1] = a.h[1] + c & 4294967295;
        a.h[2] = a.h[2] + g & 4294967295;
        a.h[3] = a.h[3] + k & 4294967295;
        a.h[4] = a.h[4] + l & 4294967295
    };
    bb.prototype.update = function(a, b) {
        if (null != a) {
            p(b) || (b = a.length);
            for (var c = b - this.n, d = 0, e = this.xb, f = this.wa; d < b;) {
                if (0 == f)
                    for (; d <= c;) cb(this, a, d), d += this.n;
                if (u(a))
                    for (; d < b;) {
                        if (e[f] = a.charCodeAt(d), ++f, ++d, f == this.n) {
                            cb(this, e);
                            f = 0;
                            break
                        }
                    } else
                        for (; d < b;)
                            if (e[f] = a[d], ++f, ++d, f == this.n) {
                                cb(this, e);
                                f = 0;
                                break
                            }
            }
            this.wa = f;
            this.qb += b
        }
    };
    bb.prototype.Ga = function() {
        var a = [],
            b = 8 * this.qb;
        56 > this.wa ? this.update(this.gb, 56 - this.wa) : this.update(this.gb, this.n - (this.wa - 56));
        for (var c = this.n - 1; 56 <= c; c--) this.xb[c] = b & 255, b /= 256;
        cb(this, this.xb);
        for (c = b = 0; 5 > c; c++)
            for (var d = 24; 0 <= d; d -= 8) a[b] = this.h[c] >> d & 255, ++b;
        return a
    };
    var db = Ma("area base br col command embed hr img input keygen link meta param source track wbr".split(" "));
    var fb = function() {
        this.pb = "";
        this.Xc = eb
    };
    fb.prototype.va = !0;
    fb.prototype.ra = function() {
        return this.pb
    };
    fb.prototype.toString = function() {
        return "Const{" + this.pb + "}"
    };
    var gb = function(a) {
            if (a instanceof fb && a.constructor === fb && a.Xc === eb) return a.pb;
            Aa("expected object of type Const, got '" + a + "'");
            return "type_error:Const"
        },
        eb = {};
    var ib = function() {
        this.ib = "";
        this.Vc = hb
    };
    ib.prototype.va = !0;
    var hb = {};
    ib.prototype.ra = function() {
        return this.ib
    };
    ib.prototype.toString = function() {
        return "SafeStyle{" + this.ib + "}"
    };
    ib.prototype.cb = function(a) {
        this.ib = a;
        return this
    };
    var jb = (new ib).cb(""),
        kb = /^[-,."'%_!# a-zA-Z0-9]+$/;
    var mb = function() {
        this.fa = "";
        this.Wc = lb
    };
    h = mb.prototype;
    h.va = !0;
    h.ra = function() {
        return this.fa
    };
    h.Eb = !0;
    h.Ha = function() {
        return 1
    };
    h.toString = function() {
        return "SafeUrl{" + this.fa + "}"
    };
    var lb = {};
    var ob = function() {
        this.Ob = "";
        this.Yc = nb
    };
    h = ob.prototype;
    h.va = !0;
    h.ra = function() {
        return this.Ob
    };
    h.Eb = !0;
    h.Ha = function() {
        return 1
    };
    h.toString = function() {
        return "TrustedResourceUrl{" + this.Ob + "}"
    };
    var nb = {};
    var qb = function() {
        this.fa = "";
        this.Uc = pb;
        this.lc = null
    };
    h = qb.prototype;
    h.Eb = !0;
    h.Ha = function() {
        return this.lc
    };
    h.va = !0;
    h.ra = function() {
        return this.fa
    };
    h.toString = function() {
        return "SafeHtml{" + this.fa + "}"
    };
    var rb = function(a) {
            if (a instanceof qb && a.constructor === qb && a.Uc === pb) return a.fa;
            Aa("expected object of type SafeHtml, got '" + a + "'");
            return "type_error:SafeHtml"
        },
        sb = /^[a-zA-Z0-9-]+$/,
        tb = Ma("action", "cite", "data", "formaction", "href", "manifest", "poster", "src");
    Ma("embed", "iframe", "link", "object", "script", "style", "template");
    var vb = function(a) {
            var b = 0,
                c = "",
                d = function(a) {
                    if (t(a)) Da(a, d);
                    else {
                        if (!(a instanceof qb)) {
                            var f = null;
                            a.Eb && (f = a.Ha());
                            a = ub(wa(a.va ? a.ra() : String(a)), f)
                        }
                        c += rb(a);
                        a = a.Ha();
                        0 == b ? b = a : 0 != a && b != a && (b = null)
                    }
                };
            Da(arguments, d);
            return ub(c, b)
        },
        pb = {},
        ub = function(a, b) {
            return (new qb).cb(a, b)
        };
    qb.prototype.cb = function(a, b) {
        this.fa = a;
        this.lc = b;
        return this
    };
    ub("", 0);
    var wb = !F || F && 9 <= Wa,
        xb = !Qa && !F || F && F && 9 <= Wa || Qa && H("1.9.1");
    F && H("9");
    var Bb = function(a) {
            a ? (C(a, "Node cannot be null or undefined."), a = new Ab(9 == a.nodeType ? a : a.ownerDocument || a.document)) : a = ma || (ma = new Ab);
            return a
        },
        Db = function(a, b) {
            Ja(b, function(b, d) {
                "style" == d ? a.style.cssText = b : "class" == d ? a.className = b : "for" == d ? a.htmlFor = b : d in Cb ? a.setAttribute(Cb[d], b) : 0 == d.lastIndexOf("aria-", 0) || 0 == d.lastIndexOf("data-", 0) ? a.setAttribute(d, b) : a[d] = b
            })
        },
        Cb = {
            cellpadding: "cellPadding",
            cellspacing: "cellSpacing",
            colspan: "colSpan",
            frameborder: "frameBorder",
            height: "height",
            maxlength: "maxLength",
            role: "role",
            rowspan: "rowSpan",
            type: "type",
            usemap: "useMap",
            valign: "vAlign",
            width: "width"
        },
        Fb = function(a, b, c) {
            function d(c) {
                c && b.appendChild(u(c) ? a.createTextNode(c) : c)
            }
            for (var e = 2; e < c.length; e++) {
                var f = c[e];
                !da(f) || fa(f) && 0 < f.nodeType ? d(f) : Da(Eb(f) ? Ia(f) : f, d)
            }
        },
        Gb = function(a) {
            return a && a.parentNode ? a.parentNode.removeChild(a) : null
        },
        Eb = function(a) {
            if (a && "number" == typeof a.length) {
                if (fa(a)) return "function" == typeof a.item || "string" == typeof a.item;
                if (w(a)) return "function" == typeof a.item
            }
            return !1
        },
        Ab = function(a) {
            this.$ =
                a || n.document || document
        },
        Hb = function(a, b) {
            var c;
            c = a.$;
            var d = b && "*" != b ? b.toUpperCase() : "";
            c = c.querySelectorAll && c.querySelector && d ? c.querySelectorAll(d + "") : c.getElementsByTagName(d || "*");
            return c
        };
    h = Ab.prototype;
    h.hc = function(a, b, c) {
        var d = this.$,
            e = arguments,
            f = e[0],
            g = e[1];
        if (!wb && g && (g.name || g.type)) {
            f = ["<", f];
            g.name && f.push(' name="', wa(g.name), '"');
            if (g.type) {
                f.push(' type="', wa(g.type), '"');
                var k = {};
                La(k, g);
                delete k.type;
                g = k
            }
            f.push(">");
            f = f.join("")
        }
        f = d.createElement(f);
        g && (u(g) ? f.className = g : t(g) ? f.className = g.join(" ") : Db(f, g));
        2 < e.length && Fb(d, f, e);
        return f
    };
    h.createElement = function(a) {
        return this.$.createElement(a)
    };
    h.createTextNode = function(a) {
        return this.$.createTextNode(String(a))
    };
    h.e = function() {
        var a = this.$;
        return a.parentWindow || a.defaultView
    };
    h.appendChild = function(a, b) {
        a.appendChild(b)
    };
    h.removeNode = Gb;
    h.sc = function(a) {
        return xb && void 0 != a.children ? a.children : Ea(a.childNodes, function(a) {
            return 1 == a.nodeType
        })
    };
    var I = function() {
        this.V = this.V;
        this.ja = this.ja
    };
    I.prototype.V = !1;
    I.prototype.mc = function() {
        this.V || (this.V = !0, this.f())
    };
    var Ib = function(a, b) {
        a.V ? b.call(void 0) : (a.ja || (a.ja = []), a.ja.push(p(void 0) ? x(b, void 0) : b))
    };
    I.prototype.f = function() {
        if (this.ja)
            for (; this.ja.length;) this.ja.shift()()
    };
    var J = function(a) {
        a && "function" == typeof a.mc && a.mc()
    };
    var Jb = function(a, b) {
        this.type = a;
        this.currentTarget = this.target = b;
        this.defaultPrevented = this.Aa = !1;
        this.Oc = !0
    };
    Jb.prototype.preventDefault = function() {
        this.defaultPrevented = !0;
        this.Oc = !1
    };
    var Kb = function(a) {
        Kb[" "](a);
        return a
    };
    Kb[" "] = ba;
    var Lb = function(a, b) {
        try {
            return Kb(a[b]), !0
        } catch (c) {}
        return !1
    };
    var Mb = !F || F && 9 <= Wa,
        Nb = F && !H("9");
    !G || H("528");
    Qa && H("1.9b") || F && H("8") || Pa && H("9.5") || G && H("528");
    Qa && !H("8") || F && H("9");
    var Ob = function(a, b) {
        Jb.call(this, a ? a.type : "");
        this.relatedTarget = this.currentTarget = this.target = null;
        this.charCode = this.keyCode = this.button = this.screenY = this.screenX = this.clientY = this.clientX = this.offsetY = this.offsetX = 0;
        this.metaKey = this.shiftKey = this.altKey = this.ctrlKey = !1;
        this.Za = this.state = null;
        if (a) {
            var c = this.type = a.type;
            this.target = a.target || a.srcElement;
            this.currentTarget = b;
            var d = a.relatedTarget;
            d ? Qa && (Lb(d, "nodeName") || (d = null)) : "mouseover" == c ? d = a.fromElement : "mouseout" == c && (d = a.toElement);
            this.relatedTarget = d;
            this.offsetX = G || void 0 !== a.offsetX ? a.offsetX : a.layerX;
            this.offsetY = G || void 0 !== a.offsetY ? a.offsetY : a.layerY;
            this.clientX = void 0 !== a.clientX ? a.clientX : a.pageX;
            this.clientY = void 0 !== a.clientY ? a.clientY : a.pageY;
            this.screenX = a.screenX || 0;
            this.screenY = a.screenY || 0;
            this.button = a.button;
            this.keyCode = a.keyCode || 0;
            this.charCode = a.charCode || ("keypress" == c ? a.keyCode : 0);
            this.ctrlKey = a.ctrlKey;
            this.altKey = a.altKey;
            this.shiftKey = a.shiftKey;
            this.metaKey = a.metaKey;
            this.state = a.state;
            this.Za =
                a;
            a.defaultPrevented && this.preventDefault()
        }
    };
    z(Ob, Jb);
    Ob.prototype.preventDefault = function() {
        Ob.C.preventDefault.call(this);
        var a = this.Za;
        if (a.preventDefault) a.preventDefault();
        else if (a.returnValue = !1, Nb) try {
            if (a.ctrlKey || 112 <= a.keyCode && 123 >= a.keyCode) a.keyCode = -1
        } catch (b) {}
    };
    var Pb = "closure_listenable_" + (1E6 * Math.random() | 0),
        Qb = function(a) {
            return !(!a || !a[Pb])
        },
        Rb = 0;
    var Sb = function(a, b, c, d, e) {
            this.ia = a;
            this.jb = null;
            this.src = b;
            this.type = c;
            this.Xa = !!d;
            this.bb = e;
            this.key = ++Rb;
            this.Ba = this.Wa = !1
        },
        Tb = function(a) {
            a.Ba = !0;
            a.ia = null;
            a.jb = null;
            a.src = null;
            a.bb = null
        };
    var Ub = function(a) {
        this.src = a;
        this.q = {};
        this.Sa = 0
    };
    Ub.prototype.add = function(a, b, c, d, e) {
        var f = a.toString();
        a = this.q[f];
        a || (a = this.q[f] = [], this.Sa++);
        var g = Vb(a, b, d, e); - 1 < g ? (b = a[g], c || (b.Wa = !1)) : (b = new Sb(b, this.src, f, !!d, e), b.Wa = c, a.push(b));
        return b
    };
    Ub.prototype.remove = function(a, b, c, d) {
        a = a.toString();
        if (!(a in this.q)) return !1;
        var e = this.q[a];
        b = Vb(e, b, c, d);
        return -1 < b ? (Tb(e[b]), C(null != e.length), D.splice.call(e, b, 1), 0 == e.length && (delete this.q[a], this.Sa--), !0) : !1
    };
    var Wb = function(a, b) {
        var c = b.type;
        if (!(c in a.q)) return !1;
        var d = Ga(a.q[c], b);
        d && (Tb(b), 0 == a.q[c].length && (delete a.q[c], a.Sa--));
        return d
    };
    Ub.prototype.kb = function(a) {
        a = a && a.toString();
        var b = 0,
            c;
        for (c in this.q)
            if (!a || c == a) {
                for (var d = this.q[c], e = 0; e < d.length; e++) ++b, Tb(d[e]);
                delete this.q[c];
                this.Sa--
            }
        return b
    };
    Ub.prototype.Ja = function(a, b, c, d) {
        a = this.q[a.toString()];
        var e = -1;
        a && (e = Vb(a, b, c, d));
        return -1 < e ? a[e] : null
    };
    var Vb = function(a, b, c, d) {
        for (var e = 0; e < a.length; ++e) {
            var f = a[e];
            if (!f.Ba && f.ia == b && f.Xa == !!c && f.bb == d) return e
        }
        return -1
    };
    var Xb = "closure_lm_" + (1E6 * Math.random() | 0),
        Yb = {},
        Zb = 0,
        $b = function(a, b, c, d, e) {
            if (t(b)) {
                for (var f = 0; f < b.length; f++) $b(a, b[f], c, d, e);
                return null
            }
            c = ac(c);
            return Qb(a) ? a.eb(b, c, d, e) : bc(a, b, c, !1, d, e)
        },
        bc = function(a, b, c, d, e, f) {
            if (!b) throw Error("Invalid event type");
            var g = !!e,
                k = cc(a);
            k || (a[Xb] = k = new Ub(a));
            c = k.add(b, c, d, e, f);
            if (c.jb) return c;
            d = dc();
            c.jb = d;
            d.src = a;
            d.ia = c;
            a.addEventListener ? a.addEventListener(b.toString(), d, g) : a.attachEvent(ec(b.toString()), d);
            Zb++;
            return c
        },
        dc = function() {
            var a = fc,
                b = Mb ? function(c) {
                    return a.call(b.src,
                        b.ia, c)
                } : function(c) {
                    c = a.call(b.src, b.ia, c);
                    if (!c) return c
                };
            return b
        },
        gc = function(a, b, c, d, e) {
            if (t(b)) {
                for (var f = 0; f < b.length; f++) gc(a, b[f], c, d, e);
                return null
            }
            c = ac(c);
            return Qb(a) ? a.xc(b, c, d, e) : bc(a, b, c, !0, d, e)
        },
        hc = function(a, b, c, d, e) {
            if (t(b))
                for (var f = 0; f < b.length; f++) hc(a, b[f], c, d, e);
            else c = ac(c), Qb(a) ? a.Vb(b, c, d, e) : a && (a = cc(a)) && (b = a.Ja(b, c, !!d, e)) && ic(b)
        },
        ic = function(a) {
            if (ea(a) || !a || a.Ba) return !1;
            var b = a.src;
            if (Qb(b)) return Wb(b.Q, a);
            var c = a.type,
                d = a.jb;
            b.removeEventListener ? b.removeEventListener(c,
                d, a.Xa) : b.detachEvent && b.detachEvent(ec(c), d);
            Zb--;
            (c = cc(b)) ? (Wb(c, a), 0 == c.Sa && (c.src = null, b[Xb] = null)) : Tb(a);
            return !0
        },
        jc = function(a, b, c, d, e) {
            c = ac(c);
            d = !!d;
            return Qb(a) ? a.Ja(b, c, d, e) : a ? (a = cc(a)) ? a.Ja(b, c, d, e) : null : null
        },
        ec = function(a) {
            return a in Yb ? Yb[a] : Yb[a] = "on" + a
        },
        lc = function(a, b, c, d) {
            var e = !0;
            if (a = cc(a))
                if (b = a.q[b.toString()])
                    for (b = b.concat(), a = 0; a < b.length; a++) {
                        var f = b[a];
                        f && f.Xa == c && !f.Ba && (f = kc(f, d), e = e && !1 !== f)
                    }
                return e
        },
        kc = function(a, b) {
            var c = a.ia,
                d = a.bb || a.src;
            a.Wa && ic(a);
            return c.call(d,
                b)
        },
        fc = function(a, b) {
            if (a.Ba) return !0;
            if (!Mb) {
                var c = b || aa("window.event"),
                    d = new Ob(c, this),
                    e = !0;
                if (!(0 > c.keyCode || void 0 != c.returnValue)) {
                    t: {
                        var f = !1;
                        if (0 == c.keyCode) try {
                            c.keyCode = -1;
                            break t
                        } catch (g) {
                            f = !0
                        }
                        if (f || void 0 == c.returnValue) c.returnValue = !0
                    }
                    c = [];
                    for (f = d.currentTarget; f; f = f.parentNode) c.push(f);
                    for (var f = a.type, k = c.length - 1; !d.Aa && 0 <= k; k--) {
                        d.currentTarget = c[k];
                        var l = lc(c[k], f, !0, d),
                            e = e && l
                    }
                    for (k = 0; !d.Aa && k < c.length; k++) d.currentTarget = c[k],
                    l = lc(c[k], f, !1, d),
                    e = e && l
                }
                return e
            }
            return kc(a, new Ob(b,
                this))
        },
        cc = function(a) {
            a = a[Xb];
            return a instanceof Ub ? a : null
        },
        mc = "__closure_events_fn_" + (1E9 * Math.random() >>> 0),
        ac = function(a) {
            C(a, "Listener can not be null.");
            if (w(a)) return a;
            C(a.handleEvent, "An object listener must have handleEvent method.");
            a[mc] || (a[mc] = function(b) {
                return a.handleEvent(b)
            });
            return a[mc]
        };
    var nc = function() {
        I.call(this);
        this.Q = new Ub(this);
        this.ad = this;
        this.Mb = null
    };
    z(nc, I);
    nc.prototype[Pb] = !0;
    h = nc.prototype;
    h.addEventListener = function(a, b, c, d) {
        $b(this, a, b, c, d)
    };
    h.removeEventListener = function(a, b, c, d) {
        hc(this, a, b, c, d)
    };
    h.dispatchEvent = function(a) {
        oc(this);
        var b, c = this.Mb;
        if (c) {
            b = [];
            for (var d = 1; c; c = c.Mb) b.push(c), C(1E3 > ++d, "infinite loop")
        }
        c = this.ad;
        d = a.type || a;
        if (u(a)) a = new Jb(a, c);
        else if (a instanceof Jb) a.target = a.target || c;
        else {
            var e = a;
            a = new Jb(d, c);
            La(a, e)
        }
        var e = !0,
            f;
        if (b)
            for (var g = b.length - 1; !a.Aa && 0 <= g; g--) f = a.currentTarget = b[g], e = pc(f, d, !0, a) && e;
        a.Aa || (f = a.currentTarget = c, e = pc(f, d, !0, a) && e, a.Aa || (e = pc(f, d, !1, a) && e));
        if (b)
            for (g = 0; !a.Aa && g < b.length; g++) f = a.currentTarget = b[g], e = pc(f, d, !1, a) && e;
        return e
    };
    h.f = function() {
        nc.C.f.call(this);
        this.Q && this.Q.kb(void 0);
        this.Mb = null
    };
    h.eb = function(a, b, c, d) {
        oc(this);
        return this.Q.add(String(a), b, !1, c, d)
    };
    h.xc = function(a, b, c, d) {
        return this.Q.add(String(a), b, !0, c, d)
    };
    h.Vb = function(a, b, c, d) {
        return this.Q.remove(String(a), b, c, d)
    };
    var pc = function(a, b, c, d) {
        b = a.Q.q[String(b)];
        if (!b) return !0;
        b = b.concat();
        for (var e = !0, f = 0; f < b.length; ++f) {
            var g = b[f];
            if (g && !g.Ba && g.Xa == c) {
                var k = g.ia,
                    l = g.bb || g.src;
                g.Wa && Wb(a.Q, g);
                e = !1 !== k.call(l, d) && e
            }
        }
        return e && 0 != d.Oc
    };
    nc.prototype.Ja = function(a, b, c, d) {
        return this.Q.Ja(String(a), b, c, d)
    };
    var oc = function(a) {
        C(a.Q, "Event target is not initialized. Did you call the superclass (goog.events.EventTarget) constructor?")
    };
    var qc = function(a) {
            n.setTimeout(function() {
                throw a;
            }, 0)
        },
        rc, sc = function() {
            var a = n.MessageChannel;
            "undefined" === typeof a && "undefined" !== typeof window && window.postMessage && window.addEventListener && !B(E, "Presto") && (a = function() {
                var a = document.createElement("iframe");
                a.style.display = "none";
                a.src = "";
                document.documentElement.appendChild(a);
                var b = a.contentWindow,
                    a = b.document;
                a.open();
                a.write("");
                a.close();
                var c = "callImmediate" + Math.random(),
                    d = "file:" == b.location.protocol ? "*" : b.location.protocol + "//" + b.location.host,
                    a = x(function(a) {
                        if (("*" == d || a.origin == d) && a.data == c) this.port1.onmessage()
                    }, this);
                b.addEventListener("message", a, !1);
                this.port1 = {};
                this.port2 = {
                    postMessage: function() {
                        b.postMessage(c, d)
                    }
                }
            });
            if ("undefined" !== typeof a && !B(E, "Trident") && !B(E, "MSIE")) {
                var b = new a,
                    c = {},
                    d = c;
                b.port1.onmessage = function() {
                    if (p(c.next)) {
                        c = c.next;
                        var a = c.cc;
                        c.cc = null;
                        a()
                    }
                };
                return function(a) {
                    d.next = {
                        cc: a
                    };
                    d = d.next;
                    b.port2.postMessage(0)
                }
            }
            return "undefined" !== typeof document && "onreadystatechange" in document.createElement("script") ?
                function(a) {
                    var b = document.createElement("script");
                    b.onreadystatechange = function() {
                        b.onreadystatechange = null;
                        b.parentNode.removeChild(b);
                        b = null;
                        a();
                        a = null
                    };
                    document.documentElement.appendChild(b)
                } : function(a) {
                    n.setTimeout(a, 0)
                }
        };
    var zc = function(a, b) {
            tc || uc();
            vc || (tc(), vc = !0);
            xc.push(new yc(a, b))
        },
        tc, uc = function() {
            if (n.Promise && n.Promise.resolve) {
                var a = n.Promise.resolve();
                tc = function() {
                    a.then(Ac)
                }
            } else tc = function() {
                var a = Ac;
                !w(n.setImmediate) || n.Window && n.Window.prototype && n.Window.prototype.setImmediate == n.setImmediate ? (rc || (rc = sc()), rc(a)) : n.setImmediate(a)
            }
        },
        vc = !1,
        xc = [],
        Ac = function() {
            for (; xc.length;) {
                var a = xc;
                xc = [];
                for (var b = 0; b < a.length; b++) {
                    var c = a[b];
                    try {
                        c.ld.call(c.scope)
                    } catch (d) {
                        qc(d)
                    }
                }
            }
            vc = !1
        },
        yc = function(a, b) {
            this.ld =
                a;
            this.scope = b
        };
    var Bc = function(a) {
            a.prototype.then = a.prototype.then;
            a.prototype.$goog_Thenable = !0
        },
        Cc = function(a) {
            if (!a) return !1;
            try {
                return !!a.$goog_Thenable
            } catch (b) {
                return !1
            }
        };
    var Gc = function(a, b) {
            this.j = 0;
            this.X = void 0;
            this.D = this.k = null;
            this.ab = this.Db = !1;
            if (a == Dc) Ec(this, 2, b);
            else try {
                var c = this;
                a.call(b, function(a) {
                    Ec(c, 2, a)
                }, function(a) {
                    if (!(a instanceof Fc)) try {
                        if (a instanceof Error) throw a;
                        throw Error("Promise rejected.");
                    } catch (b) {}
                    Ec(c, 3, a)
                })
            } catch (d) {
                Ec(this, 3, d)
            }
        },
        Dc = function() {};
    Gc.prototype.then = function(a, b, c) {
        null != a && Ba(a, "opt_onFulfilled should be a function.");
        null != b && Ba(b, "opt_onRejected should be a function. Did you pass opt_context as the second argument instead of the third?");
        return Hc(this, w(a) ? a : null, w(b) ? b : null, c)
    };
    Bc(Gc);
    Gc.prototype.cancel = function(a) {
        0 == this.j && zc(function() {
            var b = new Fc(a);
            Ic(this, b)
        }, this)
    };
    var Ic = function(a, b) {
            if (0 == a.j)
                if (a.k) {
                    var c = a.k;
                    if (c.D) {
                        for (var d = 0, e = -1, f = 0, g; g = c.D[f]; f++)
                            if (g = g.Ea)
                                if (d++, g == a && (e = f), 0 <= e && 1 < d) break;
                        0 <= e && (0 == c.j && 1 == d ? Ic(c, b) : (d = c.D.splice(e, 1)[0], Jc(c, d, 3, b)))
                    }
                    a.k = null
                } else Ec(a, 3, b)
        },
        Lc = function(a, b) {
            a.D && a.D.length || 2 != a.j && 3 != a.j || Kc(a);
            a.D || (a.D = []);
            a.D.push(b)
        },
        Hc = function(a, b, c, d) {
            var e = {
                Ea: null,
                Fc: null,
                Gc: null
            };
            e.Ea = new Gc(function(a, g) {
                e.Fc = b ? function(c) {
                    try {
                        var e = b.call(d, c);
                        a(e)
                    } catch (m) {
                        g(m)
                    }
                } : a;
                e.Gc = c ? function(b) {
                    try {
                        var e = c.call(d, b);
                        !p(e) &&
                            b instanceof Fc ? g(b) : a(e)
                    } catch (m) {
                        g(m)
                    }
                } : g
            });
            e.Ea.k = a;
            Lc(a, e);
            return e.Ea
        };
    Gc.prototype.Sc = function(a) {
        C(1 == this.j);
        this.j = 0;
        Ec(this, 2, a)
    };
    Gc.prototype.Tc = function(a) {
        C(1 == this.j);
        this.j = 0;
        Ec(this, 3, a)
    };
    var Ec = function(a, b, c) {
            if (0 == a.j) {
                if (a == c) b = 3, c = new TypeError("Promise cannot resolve to itself");
                else {
                    if (Cc(c)) {
                        a.j = 1;
                        c.then(a.Sc, a.Tc, a);
                        return
                    }
                    if (fa(c)) try {
                        var d = c.then;
                        if (w(d)) {
                            Mc(a, c, d);
                            return
                        }
                    } catch (e) {
                        b = 3, c = e
                    }
                }
                a.X = c;
                a.j = b;
                a.k = null;
                Kc(a);
                3 != b || c instanceof Fc || Nc(a, c)
            }
        },
        Mc = function(a, b, c) {
            a.j = 1;
            var d = !1,
                e = function(b) {
                    d || (d = !0, a.Sc(b))
                },
                f = function(b) {
                    d || (d = !0, a.Tc(b))
                };
            try {
                c.call(b, e, f)
            } catch (g) {
                f(g)
            }
        },
        Kc = function(a) {
            a.Db || (a.Db = !0, zc(a.kd, a))
        };
    Gc.prototype.kd = function() {
        for (; this.D && this.D.length;) {
            var a = this.D;
            this.D = null;
            for (var b = 0; b < a.length; b++) Jc(this, a[b], this.j, this.X)
        }
        this.Db = !1
    };
    var Jc = function(a, b, c, d) {
            if (2 == c) b.Fc(d);
            else {
                if (b.Ea)
                    for (; a && a.ab; a = a.k) a.ab = !1;
                b.Gc(d)
            }
        },
        Nc = function(a, b) {
            a.ab = !0;
            zc(function() {
                a.ab && Oc.call(null, b)
            })
        },
        Oc = qc,
        Fc = function(a) {
            A.call(this, a)
        };
    z(Fc, A);
    Fc.prototype.name = "cancel";
    var Pc = function(a, b) {
        nc.call(this);
        this.xa = a || 1;
        this.Ca = b || n;
        this.wb = x(this.Ed, this);
        this.Gb = y()
    };
    z(Pc, nc);
    h = Pc.prototype;
    h.enabled = !1;
    h.K = null;
    h.Ed = function() {
        if (this.enabled) {
            var a = y() - this.Gb;
            0 < a && a < .8 * this.xa ? this.K = this.Ca.setTimeout(this.wb, this.xa - a) : (this.K && (this.Ca.clearTimeout(this.K), this.K = null), this.dispatchEvent("tick"), this.enabled && (this.K = this.Ca.setTimeout(this.wb, this.xa), this.Gb = y()))
        }
    };
    h.start = function() {
        this.enabled = !0;
        this.K || (this.K = this.Ca.setTimeout(this.wb, this.xa), this.Gb = y())
    };
    h.stop = function() {
        this.enabled = !1;
        this.K && (this.Ca.clearTimeout(this.K), this.K = null)
    };
    h.f = function() {
        Pc.C.f.call(this);
        this.stop();
        delete this.Ca
    };
    var Qc = function(a, b) {
        if (!w(a))
            if (a && "function" == typeof a.handleEvent) a = x(a.handleEvent, a);
            else throw Error("Invalid listener argument");
        return 2147483647 < b ? -1 : n.setTimeout(a, b || 0)
    };
    var Rc = function(a, b, c) {
        I.call(this);
        this.Hb = a;
        this.xa = b || 0;
        this.ta = c;
        this.cd = x(this.hd, this)
    };
    z(Rc, I);
    h = Rc.prototype;
    h.H = 0;
    h.f = function() {
        Rc.C.f.call(this);
        this.stop();
        delete this.Hb;
        delete this.ta
    };
    h.start = function(a) {
        this.stop();
        this.H = Qc(this.cd, p(a) ? a : this.xa)
    };
    h.stop = function() {
        0 != this.H && n.clearTimeout(this.H);
        this.H = 0
    };
    h.hd = function() {
        this.H = 0;
        this.Hb && this.Hb.call(this.ta)
    };
    var K = function(a) {
        I.call(this);
        this.ta = a;
        this.g = {}
    };
    z(K, I);
    var Sc = [];
    K.prototype.eb = function(a, b, c, d) {
        t(b) || (b && (Sc[0] = b.toString()), b = Sc);
        for (var e = 0; e < b.length; e++) {
            var f = $b(a, b[e], c || this.handleEvent, d || !1, this.ta || this);
            if (!f) break;
            this.g[f.key] = f
        }
        return this
    };
    K.prototype.xc = function(a, b, c, d) {
        return Tc(this, a, b, c, d)
    };
    var Tc = function(a, b, c, d, e, f) {
        if (t(c))
            for (var g = 0; g < c.length; g++) Tc(a, b, c[g], d, e, f);
        else {
            b = gc(b, c, d || a.handleEvent, e, f || a.ta || a);
            if (!b) return a;
            a.g[b.key] = b
        }
        return a
    };
    K.prototype.Vb = function(a, b, c, d, e) {
        if (t(b))
            for (var f = 0; f < b.length; f++) this.Vb(a, b[f], c, d, e);
        else if (a = jc(a, b, c || this.handleEvent, d, e || this.ta || this)) ic(a), delete this.g[a.key];
        return this
    };
    K.prototype.kb = function() {
        Ja(this.g, ic);
        this.g = {}
    };
    K.prototype.f = function() {
        K.C.f.call(this);
        this.kb()
    };
    K.prototype.handleEvent = function() {
        throw Error("EventHandler.handleEvent not implemented");
    };
    var Uc = function(a) {
            a = String(a);
            if (/^\s*$/.test(a) ? 0 : /^[\],:{}\s\u2028\u2029]*$/.test(a.replace(/\\["\\\/bfnrtu]/g, "@").replace(/"[^"\\\n\r\u2028\u2029\x00-\x08\x0a-\x1f]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:[\s\u2028\u2029]*\[)+/g, ""))) try {
                return eval("(" + a + ")")
            } catch (b) {}
            throw Error("Invalid JSON string: " + a);
        },
        Xc = function(a) {
            var b = [];
            Vc(new Wc, a, b);
            return b.join("")
        },
        Wc = function() {
            this.lb = void 0
        },
        Vc = function(a, b, c) {
            switch (typeof b) {
                case "string":
                    Yc(b, c);
                    break;
                case "number":
                    c.push(isFinite(b) && !isNaN(b) ? b : "null");
                    break;
                case "boolean":
                    c.push(b);
                    break;
                case "undefined":
                    c.push("null");
                    break;
                case "object":
                    if (null == b) {
                        c.push("null");
                        break
                    }
                    if (t(b)) {
                        var d = b.length;
                        c.push("[");
                        for (var e = "", f = 0; f < d; f++) c.push(e), e = b[f], Vc(a, a.lb ? a.lb.call(b, String(f), e) : e, c), e = ",";
                        c.push("]");
                        break
                    }
                    c.push("{");
                    d = "";
                    for (f in b) Object.prototype.hasOwnProperty.call(b, f) && (e = b[f], "function" != typeof e && (c.push(d), Yc(f, c), c.push(":"), Vc(a, a.lb ? a.lb.call(b, f, e) : e, c), d = ","));
                    c.push("}");
                    break;
                case "function":
                    break;
                default:
                    throw Error("Unknown type: " + typeof b);
            }
        },
        Zc = {
            '"': '\\"',
            "\\": "\\\\",
            "/": "\\/",
            "\b": "\\b",
            "\f": "\\f",
            "\n": "\\n",
            "\r": "\\r",
            "\t": "\\t",
            "\x0B": "\\u000b"
        },
        $c = /\uffff/.test("\uffff") ? /[\\\"\x00-\x1f\x7f-\uffff]/g : /[\\\"\x00-\x1f\x7f-\xff]/g,
        Yc = function(a, b) {
            b.push('"', a.replace($c, function(a) {
                if (a in Zc) return Zc[a];
                var b = a.charCodeAt(0),
                    e = "\\u";
                16 > b ? e += "000" : 256 > b ? e += "00" : 4096 > b && (e += "0");
                return Zc[a] = e + b.toString(16)
            }), '"')
        };
    var ad = "StopIteration" in n ? n.StopIteration : Error("StopIteration"),
        bd = function() {};
    bd.prototype.next = function() {
        throw ad;
    };
    bd.prototype.$c = function() {
        return this
    };
    var cd = function(a, b) {
        this.S = {};
        this.g = [];
        this.tb = this.l = 0;
        var c = arguments.length;
        if (1 < c) {
            if (c % 2) throw Error("Uneven number of arguments");
            for (var d = 0; d < c; d += 2) this.set(arguments[d], arguments[d + 1])
        } else if (a) {
            var e;
            if (a instanceof cd) e = a.Ia(), d = a.sa();
            else {
                var c = [],
                    f = 0;
                for (e in a) c[f++] = e;
                e = c;
                c = [];
                f = 0;
                for (d in a) c[f++] = a[d];
                d = c
            }
            for (c = 0; c < e.length; c++) this.set(e[c], d[c])
        }
    };
    cd.prototype.sa = function() {
        dd(this);
        for (var a = [], b = 0; b < this.g.length; b++) a.push(this.S[this.g[b]]);
        return a
    };
    cd.prototype.Ia = function() {
        dd(this);
        return this.g.concat()
    };
    cd.prototype.Fa = function(a) {
        return ed(this.S, a)
    };
    cd.prototype.remove = function(a) {
        return ed(this.S, a) ? (delete this.S[a], this.l--, this.tb++, this.g.length > 2 * this.l && dd(this), !0) : !1
    };
    var dd = function(a) {
        if (a.l != a.g.length) {
            for (var b = 0, c = 0; b < a.g.length;) {
                var d = a.g[b];
                ed(a.S, d) && (a.g[c++] = d);
                b++
            }
            a.g.length = c
        }
        if (a.l != a.g.length) {
            for (var e = {}, c = b = 0; b < a.g.length;) d = a.g[b], ed(e, d) || (a.g[c++] = d, e[d] = 1), b++;
            a.g.length = c
        }
    };
    h = cd.prototype;
    h.get = function(a, b) {
        return ed(this.S, a) ? this.S[a] : b
    };
    h.set = function(a, b) {
        ed(this.S, a) || (this.l++, this.g.push(a), this.tb++);
        this.S[a] = b
    };
    h.forEach = function(a, b) {
        for (var c = this.Ia(), d = 0; d < c.length; d++) {
            var e = c[d],
                f = this.get(e);
            a.call(b, f, e, this)
        }
    };
    h.clone = function() {
        return new cd(this)
    };
    h.$c = function(a) {
        dd(this);
        var b = 0,
            c = this.g,
            d = this.S,
            e = this.tb,
            f = this,
            g = new bd;
        g.next = function() {
            for (;;) {
                if (e != f.tb) throw Error("The map has changed since the iterator was created");
                if (b >= c.length) throw ad;
                var g = c[b++];
                return a ? g : d[g]
            }
        };
        return g
    };
    var ed = function(a, b) {
        return Object.prototype.hasOwnProperty.call(a, b)
    };
    var fd = function(a, b, c, d, e) {
        this.reset(a, b, c, d, e)
    };
    fd.prototype.ob = 0;
    fd.prototype.oc = null;
    var gd = 0;
    fd.prototype.reset = function(a, b, c, d, e) {
        this.ob = "number" == typeof e ? e : gd++;
        d || y();
        this.La = a;
        this.qd = b;
        delete this.oc
    };
    fd.prototype.Qc = function(a) {
        this.La = a
    };
    var hd = function(a) {
            this.Bc = a;
            this.tc = this.zb = this.La = this.k = null
        },
        id = function(a, b) {
            this.name = a;
            this.value = b
        };
    id.prototype.toString = function() {
        return this.name
    };
    var jd = new id("SEVERE", 1E3),
        kd = new id("WARNING", 900),
        ld = new id("INFO", 800),
        md = new id("CONFIG", 700),
        nd = new id("FINE", 500),
        od = new id("FINEST", 300);
    hd.prototype.getName = function() {
        return this.Bc
    };
    hd.prototype.getParent = function() {
        return this.k
    };
    hd.prototype.sc = function() {
        this.zb || (this.zb = {});
        return this.zb
    };
    hd.prototype.Qc = function(a) {
        this.La = a
    };
    var pd = function(a) {
        if (a.La) return a.La;
        if (a.k) return pd(a.k);
        Aa("Root logger has no level set.");
        return null
    };
    hd.prototype.log = function(a, b, c) {
        if (a.value >= pd(this).value)
            for (w(b) && (b = b()), a = new fd(a, String(b), this.Bc), c && (a.oc = c), c = "log:" + a.qd, n.console && (n.console.timeStamp ? n.console.timeStamp(c) : n.console.markTimeline && n.console.markTimeline(c)), n.msWriteProfilerMark && n.msWriteProfilerMark(c), c = this; c;) {
                b = c;
                var d = a;
                if (b.tc)
                    for (var e = 0, f = void 0; f = b.tc[e]; e++) f(d);
                c = c.getParent()
            }
    };
    hd.prototype.info = function(a, b) {
        this.log(ld, a, b)
    };
    var qd = {},
        rd = null,
        sd = function(a) {
            rd || (rd = new hd(""), qd[""] = rd, rd.Qc(md));
            var b;
            if (!(b = qd[a])) {
                b = new hd(a);
                var c = a.lastIndexOf("."),
                    d = a.substr(c + 1),
                    c = sd(a.substr(0, c));
                c.sc()[d] = b;
                b.k = c;
                qd[a] = b
            }
            return b
        };
    var N = function(a) {
            var b = L;
            b && b.log(od, a, void 0)
        },
        O = function(a, b) {
            var c = L;
            c && c.log(jd, a, b)
        },
        P = function(a, b, c) {
            a && a.log(kd, b, c)
        },
        Q = function(a) {
            var b = L;
            b && b.info(a, void 0)
        },
        R = function(a) {
            var b = L;
            b && b.log(nd, a, void 0)
        };
    var td = function() {
        I.call(this);
        this.Sb = {}
    };
    z(td, I);
    td.prototype.Ib = sd("goog.messaging.AbstractChannel");
    td.prototype.O = function(a) {
        a && a()
    };
    td.prototype.J = function() {
        return !0
    };
    var ud = function(a, b, c) {
        a.Sb[b] = {
            w: c,
            Cc: !1
        }
    };
    td.prototype.f = function() {
        td.C.f.call(this);
        delete this.Ib;
        delete this.Sb;
        delete this.kc
    };
    var vd = /^(?:([^:/?#.]+):)?(?:\/\/(?:([^/?#]*)@)?([^/#?]*?)(?::([0-9]+))?(?=[/#?]|$))?([^?#]+)?(?:\?([^#]*))?(?:#(.*))?$/,
        xd = function(a) {
            if (wd) {
                wd = !1;
                var b = n.location;
                if (b) {
                    var c = b.href;
                    if (c && (c = (c = xd(c)[3] || null) ? decodeURI(c) : c) && c != b.hostname) throw wd = !0, Error();
                }
            }
            return a.match(vd)
        },
        wd = G,
        yd = function(a) {
            var b = xd(a);
            a = b[1];
            var c = b[2],
                d = b[3],
                b = b[4],
                e = "";
            a && (e += a + ":");
            d && (e += "//", c && (e += c + "@"), e += d, b && (e += ":" + b));
            return e
        },
        zd = function(a, b) {
            for (var c = a.split("&"), d = 0; d < c.length; d++) {
                var e = c[d].indexOf("="),
                    f = null,
                    g = null;
                0 <= e ? (f = c[d].substring(0, e), g = c[d].substring(e + 1)) : f = c[d];
                b(f, g ? decodeURIComponent(g.replace(/\+/g, " ")) : "")
            }
        };
    var Ad = function(a, b) {
        var c;
        if (a instanceof Ad) this.I = p(b) ? b : a.I, Bd(this, a.B), c = a.ma, S(this), this.ma = c, Cd(this, a.aa), Dd(this, a.ea), Ed(this, a.ca), Fd(this, a.M.clone()), c = a.ha, S(this), this.ha = c;
        else if (a && (c = xd(String(a)))) {
            this.I = !!b;
            Bd(this, c[1] || "", !0);
            var d = c[2] || "";
            S(this);
            this.ma = Gd(d);
            Cd(this, c[3] || "", !0);
            Dd(this, c[4]);
            Ed(this, c[5] || "", !0);
            Fd(this, c[6] || "", !0);
            c = c[7] || "";
            S(this);
            this.ha = Gd(c)
        } else this.I = !!b, this.M = new Hd(null, 0, this.I)
    };
    h = Ad.prototype;
    h.B = "";
    h.ma = "";
    h.aa = "";
    h.ea = null;
    h.ca = "";
    h.ha = "";
    h.pd = !1;
    h.I = !1;
    h.toString = function() {
        var a = [],
            b = this.B;
        b && a.push(Id(b, Jd, !0), ":");
        if (b = this.aa) {
            a.push("//");
            var c = this.ma;
            c && a.push(Id(c, Jd, !0), "@");
            a.push(encodeURIComponent(String(b)).replace(/%25([0-9a-fA-F]{2})/g, "%$1"));
            b = this.ea;
            null != b && a.push(":", String(b))
        }
        if (b = this.ca) this.aa && "/" != b.charAt(0) && a.push("/"), a.push(Id(b, "/" == b.charAt(0) ? Kd : Ld, !0));
        (b = this.M.toString()) && a.push("?", b);
        (b = this.ha) && a.push("#", Id(b, Md));
        return a.join("")
    };
    h.resolve = function(a) {
        var b = this.clone(),
            c = !!a.B;
        c ? Bd(b, a.B) : c = !!a.ma;
        if (c) {
            var d = a.ma;
            S(b);
            b.ma = d
        } else c = !!a.aa;
        c ? Cd(b, a.aa) : c = null != a.ea;
        d = a.ca;
        if (c) Dd(b, a.ea);
        else if (c = !!a.ca) {
            if ("/" != d.charAt(0))
                if (this.aa && !this.ca) d = "/" + d;
                else {
                    var e = b.ca.lastIndexOf("/"); - 1 != e && (d = b.ca.substr(0, e + 1) + d)
                }
            e = d;
            if (".." == e || "." == e) d = "";
            else if (B(e, "./") || B(e, "/.")) {
                for (var d = 0 == e.lastIndexOf("/", 0), e = e.split("/"), f = [], g = 0; g < e.length;) {
                    var k = e[g++];
                    "." == k ? d && g == e.length && f.push("") : ".." == k ? ((1 < f.length || 1 == f.length &&
                        "" != f[0]) && f.pop(), d && g == e.length && f.push("")) : (f.push(k), d = !0)
                }
                d = f.join("/")
            } else d = e
        }
        c ? Ed(b, d) : c = "" !== a.M.toString();
        c ? Fd(b, Gd(a.M.toString())) : c = !!a.ha;
        c && (a = a.ha, S(b), b.ha = a);
        return b
    };
    h.clone = function() {
        return new Ad(this)
    };
    var Bd = function(a, b, c) {
            S(a);
            a.B = c ? Gd(b, !0) : b;
            a.B && (a.B = a.B.replace(/:$/, ""))
        },
        Cd = function(a, b, c) {
            S(a);
            a.aa = c ? Gd(b, !0) : b
        },
        Dd = function(a, b) {
            S(a);
            if (b) {
                b = Number(b);
                if (isNaN(b) || 0 > b) throw Error("Bad port number " + b);
                a.ea = b
            } else a.ea = null
        },
        Ed = function(a, b, c) {
            S(a);
            a.ca = c ? Gd(b, !0) : b
        },
        Fd = function(a, b, c) {
            S(a);
            b instanceof Hd ? (a.M = b, a.M.Tb(a.I)) : (c || (b = Id(b, Od)), a.M = new Hd(b, 0, a.I))
        },
        S = function(a) {
            if (a.pd) throw Error("Tried to modify a read-only Uri");
        };
    Ad.prototype.Tb = function(a) {
        this.I = a;
        this.M && this.M.Tb(a);
        return this
    };
    var Gd = function(a, b) {
            return a ? b ? decodeURI(a) : decodeURIComponent(a) : ""
        },
        Id = function(a, b, c) {
            return u(a) ? (a = encodeURI(a).replace(b, Pd), c && (a = a.replace(/%25([0-9a-fA-F]{2})/g, "%$1")), a) : null
        },
        Pd = function(a) {
            a = a.charCodeAt(0);
            return "%" + (a >> 4 & 15).toString(16) + (a & 15).toString(16)
        },
        Jd = /[#\/\?@]/g,
        Ld = /[\#\?:]/g,
        Kd = /[\#\?]/g,
        Od = /[\#\?@]/g,
        Md = /#/g,
        Hd = function(a, b, c) {
            this.F = a || null;
            this.I = !!c
        },
        Qd = function(a) {
            a.i || (a.i = new cd, a.l = 0, a.F && zd(a.F, function(b, c) {
                a.add(decodeURIComponent(b.replace(/\+/g, " ")), c)
            }))
        };
    h = Hd.prototype;
    h.i = null;
    h.l = null;
    h.add = function(a, b) {
        Qd(this);
        this.F = null;
        a = Rd(this, a);
        var c = this.i.get(a);
        c || this.i.set(a, c = []);
        c.push(b);
        this.l++;
        return this
    };
    h.remove = function(a) {
        Qd(this);
        a = Rd(this, a);
        return this.i.Fa(a) ? (this.F = null, this.l -= this.i.get(a).length, this.i.remove(a)) : !1
    };
    h.Fa = function(a) {
        Qd(this);
        a = Rd(this, a);
        return this.i.Fa(a)
    };
    h.Ia = function() {
        Qd(this);
        for (var a = this.i.sa(), b = this.i.Ia(), c = [], d = 0; d < b.length; d++)
            for (var e = a[d], f = 0; f < e.length; f++) c.push(b[d]);
        return c
    };
    h.sa = function(a) {
        Qd(this);
        var b = [];
        if (u(a)) this.Fa(a) && (b = Ha(b, this.i.get(Rd(this, a))));
        else {
            a = this.i.sa();
            for (var c = 0; c < a.length; c++) b = Ha(b, a[c])
        }
        return b
    };
    h.set = function(a, b) {
        Qd(this);
        this.F = null;
        a = Rd(this, a);
        this.Fa(a) && (this.l -= this.i.get(a).length);
        this.i.set(a, [b]);
        this.l++;
        return this
    };
    h.get = function(a, b) {
        var c = a ? this.sa(a) : [];
        return 0 < c.length ? String(c[0]) : b
    };
    h.toString = function() {
        if (this.F) return this.F;
        if (!this.i) return "";
        for (var a = [], b = this.i.Ia(), c = 0; c < b.length; c++)
            for (var d = b[c], e = encodeURIComponent(String(d)), d = this.sa(d), f = 0; f < d.length; f++) {
                var g = e;
                "" !== d[f] && (g += "=" + encodeURIComponent(String(d[f])));
                a.push(g)
            }
        return this.F = a.join("&")
    };
    h.clone = function() {
        var a = new Hd;
        a.F = this.F;
        this.i && (a.i = this.i.clone(), a.l = this.l);
        return a
    };
    var Rd = function(a, b) {
        var c = String(b);
        a.I && (c = c.toLowerCase());
        return c
    };
    Hd.prototype.Tb = function(a) {
        a && !this.I && (Qd(this), this.F = null, this.i.forEach(function(a, c) {
            var d = c.toLowerCase();
            c != d && (this.remove(c), this.remove(d), 0 < a.length && (this.F = null, this.i.set(Rd(this, d), Ia(a)), this.l += a.length))
        }, this));
        this.I = a
    };
    /*
     Portions of this code are from MochiKit, received by
     The Closure Authors under the MIT license. All other code is Copyright
     2005-2009 The Closure Authors. All Rights Reserved.
    */
    var T = function(a, b) {
        this.Y = [];
        this.Dc = a;
        this.jc = b || null;
        this.Ka = this.G = !1;
        this.X = void 0;
        this.Ub = this.bc = this.vb = !1;
        this.sb = 0;
        this.k = null;
        this.Va = 0
    };
    T.prototype.cancel = function(a) {
        if (this.G) this.X instanceof T && this.X.cancel();
        else {
            if (this.k) {
                var b = this.k;
                delete this.k;
                a ? b.cancel(a) : (b.Va--, 0 >= b.Va && b.cancel())
            }
            this.Dc ? this.Dc.call(this.jc, this) : this.Ub = !0;
            this.G || this.nc(new Sd)
        }
    };
    T.prototype.gc = function(a, b) {
        this.vb = !1;
        Td(this, a, b)
    };
    var Td = function(a, b, c) {
            a.G = !0;
            a.X = c;
            a.Ka = !b;
            Ud(a)
        },
        Wd = function(a) {
            if (a.G) {
                if (!a.Ub) throw new Vd;
                a.Ub = !1
            }
        };
    T.prototype.w = function(a) {
        Wd(this);
        Xd(a);
        Td(this, !0, a)
    };
    T.prototype.nc = function(a) {
        Wd(this);
        Xd(a);
        Td(this, !1, a)
    };
    var Xd = function(a) {
            C(!(a instanceof T), "An execution sequence may not be initiated with a blocking Deferred.")
        },
        Zd = function(a, b, c) {
            Yd(a, b, null, c)
        },
        Yd = function(a, b, c, d) {
            C(!a.bc, "Blocking Deferreds can not be re-used");
            a.Y.push([b, c, d]);
            a.G && Ud(a)
        };
    T.prototype.then = function(a, b, c) {
        var d, e, f = new Gc(function(a, b) {
            d = a;
            e = b
        });
        Yd(this, d, function(a) {
            a instanceof Sd ? f.cancel() : e(a)
        });
        return f.then(a, b, c)
    };
    Bc(T);
    var $d = function(a, b) {
        b instanceof T ? Zd(a, x(b.bd, b)) : Zd(a, function() {
            return b
        })
    };
    T.prototype.bd = function(a) {
        var b = new T;
        Yd(this, b.w, b.nc, b);
        a && (b.k = this, this.Va++);
        return b
    };
    var ae = function(a) {
            return Fa(a.Y, function(a) {
                return w(a[1])
            })
        },
        Ud = function(a) {
            if (a.sb && a.G && ae(a)) {
                var b = a.sb,
                    c = be[b];
                c && (n.clearTimeout(c.H), delete be[b]);
                a.sb = 0
            }
            a.k && (a.k.Va--, delete a.k);
            for (var b = a.X, d = c = !1; a.Y.length && !a.vb;) {
                var e = a.Y.shift(),
                    f = e[0],
                    g = e[1],
                    e = e[2];
                if (f = a.Ka ? g : f) try {
                    var k = f.call(e || a.jc, b);
                    p(k) && (a.Ka = a.Ka && (k == b || k instanceof Error), a.X = b = k);
                    Cc(b) && (d = !0, a.vb = !0)
                } catch (l) {
                    b = l, a.Ka = !0, ae(a) || (c = !0)
                }
            }
            a.X = b;
            d && (k = x(a.gc, a, !0), d = x(a.gc, a, !1), b instanceof T ? (Yd(b, k, d), b.bc = !0) : b.then(k,
                d));
            c && (b = new ce(b), be[b.H] = b, a.sb = b.H)
        },
        Vd = function() {
            A.call(this)
        };
    z(Vd, A);
    Vd.prototype.message = "Deferred has already fired";
    Vd.prototype.name = "AlreadyCalledError";
    var Sd = function() {
        A.call(this)
    };
    z(Sd, A);
    Sd.prototype.message = "Deferred was canceled";
    Sd.prototype.name = "CanceledError";
    var ce = function(a) {
        this.H = n.setTimeout(x(this.Dd, this), 0);
        this.jd = a
    };
    ce.prototype.Dd = function() {
        C(be[this.H], "Cannot throw an error that is not scheduled.");
        delete be[this.H];
        throw this.jd;
    };
    var be = {};
    var de = {
            1: "NativeMessagingTransport",
            2: "FrameElementMethodTransport",
            3: "IframeRelayTransport",
            4: "IframePollingTransport",
            5: "FlashTransport",
            6: "NixTransport",
            7: "DirectTransport"
        },
        ee = ["pu", "lru", "pru", "lpu", "ppu"],
        U = {},
        ge = function(a) {
            for (var b = fe, c = b.length, d = ""; 0 < a--;) d += b.charAt(Math.floor(Math.random() * c));
            return d
        },
        fe = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        L = sd("goog.net.xpc");
    var V = function(a) {
        I.call(this);
        this.P = a || Bb()
    };
    z(V, I);
    V.prototype.la = 0;
    V.prototype.e = function() {
        return this.P.e()
    };
    V.prototype.getName = function() {
        return de[String(this.la)] || ""
    };
    var ie = function(a, b) {
        V.call(this, b);
        this.a = a;
        this.qa = new K(this);
        Ib(this, la(J, this.qa));
        this.T = new Pc(100, this.e());
        Ib(this, la(J, this.T));
        this.r = new T;
        this.t = new T;
        this.o = new T;
        this.Cb = ge(10);
        this.da = null;
        this.oa = {};
        this.vd = this.a.name;
        he(this.a, this.a.name + "_" + W(this.a));
        this.R = !1;
        $d(this.o, this.r);
        $d(this.o, this.t);
        Zd(this.o, this.Kb, this);
        this.o.w(!0);
        this.qa.eb(this.T, "tick", this.Ma);
        Q("DirectTransport created. role=" + W(this.a))
    };
    z(ie, V);
    var je = {},
        me = function(a) {
            var b = new ke(a.channelName, a.service, a.payload);
            a = b.yb;
            var c = b.Ra,
                b = b.ka;
            R("messageReceived: channel=" + a + ", service=" + c + ", payload=" + b);
            var d = U[a];
            if (d) return d.N(c, b), !0;
            var d = le(b)[0],
                e;
            for (e in U) {
                var f = U[e];
                if (1 == W(f) && !f.J() && "tp" == c && "SETUP" == d) return he(f, a), f.N(c, b), !0
            }
            Q("channel name mismatch; message ignored.");
            return !1
        };
    h = ie.prototype;
    h.la = 7;
    h.rb = function(a) {
        a = le(a);
        var b = a[1];
        switch (a[0]) {
            case "SETUP_ACK":
                this.r.G || this.r.w(!0);
                break;
            case "SETUP":
                this.nb(), null != this.da && this.da != b && (Q("Sending SETUP and changing peer ID to: " + b), this.Oa()), this.da = b
        }
    };
    h.Oa = function() {
        var a;
        a = "SETUP," + this.Cb;
        this.send("tp", a)
    };
    h.nb = function() {
        this.send("tp", "SETUP_ACK");
        this.t.G || this.t.w(!0)
    };
    h.O = function() {
        var a = this.e();
        if (a) {
            var b = ia(a);
            0 == (je[b] || 0) && null == aa("crosswindowmessaging.channel", a) && q("crosswindowmessaging.channel", me, a);
            je[b] ++;
            this.R = !0;
            this.Ma()
        } else R("connect(): no window to initialize.")
    };
    h.Ma = function() {
        this.a.J() ? this.T.stop() : (this.T.start(), this.Oa())
    };
    h.send = function(a, b) {
        if (this.a.A) {
            var c = new ke(this.vd + "_" + (0 == W(this.a) ? 1 : 0), a, b);
            this.a.b.directSyncMode ? this.pc(c) : this.oa[ia(c)] = Qc(x(this.pc, this, c), 0)
        } else R("send(): window not ready")
    };
    h.pc = function(a) {
        var b = ia(a);
        this.oa[b] && delete this.oa[b];
        try {
            var c = aa("crosswindowmessaging.channel", this.a.A)
        } catch (d) {
            P(L, "Can't access other window, ignoring.", d);
            return
        }
        if (null === c) P(L, "Peer window had no global function.");
        else try {
            c({
                channelName: a.yb,
                service: a.Ra,
                payload: a.ka
            }), Q("send(): channelName=" + a.yb + " service=" + a.Ra + " payload=" + a.ka)
        } catch (e) {
            P(L, "Error performing call, ignoring.", e)
        }
    };
    h.Kb = function() {
        ne(this.a, 0)
    };
    h.f = function() {
        if (this.R) {
            var a = this.e(),
                b = ia(a);
            1 == --je[b] && q("crosswindowmessaging.channel", null, a)
        }
        this.oa && (Ja(this.oa, function(a) {
            n.clearTimeout(a)
        }), this.oa = null);
        this.r && (this.r.cancel(), delete this.r);
        this.t && (this.t.cancel(), delete this.t);
        this.o && (this.o.cancel(), delete this.o);
        ie.C.f.call(this)
    };
    var le = function(a) {
            a = a.split(",");
            a[1] = a[1] || null;
            return a
        },
        ke = function(a, b, c) {
            this.yb = a;
            this.Ra = b;
            this.ka = c
        };
    var oe = function(a, b) {
        V.call(this, b);
        this.a = a;
        this.Na = [];
        this.fd = x(this.gd, this)
    };
    z(oe, V);
    h = oe.prototype;
    h.la = 2;
    h.Qb = !1;
    h.K = 0;
    h.O = function() {
        0 == W(this.a) ? (this.W = this.a.ua, this.W.XPC_toOuter = x(this.vc, this)) : this.$b()
    };
    h.$b = function() {
        var a = !0;
        try {
            this.W || (this.W = this.e().frameElement), this.W && this.W.XPC_toOuter && (this.Lb = this.W.XPC_toOuter, this.W.XPC_toOuter.XPC_toInner = x(this.vc, this), a = !1, this.send("tp", "SETUP_ACK"), ne(this.a))
        } catch (b) {
            O("exception caught while attempting setup: " + b)
        }
        a && (this.Zb || (this.Zb = x(this.$b, this)), this.e().setTimeout(this.Zb, 100))
    };
    h.rb = function(a) {
        if (0 != W(this.a) || this.a.J() || "SETUP_ACK" != a) throw Error("Got unexpected transport message.");
        this.Lb = this.W.XPC_toOuter.XPC_toInner;
        ne(this.a)
    };
    h.vc = function(a, b) {
        this.Qb || 0 != this.Na.length ? (this.Na.push({
            Cd: a,
            ka: b
        }), 1 == this.Na.length && (this.K = this.e().setTimeout(this.fd, 1))) : this.a.N(a, b)
    };
    h.gd = function() {
        for (; this.Na.length;) {
            var a = this.Na.shift();
            this.a.N(a.Cd, a.ka)
        }
    };
    h.send = function(a, b) {
        this.Qb = !0;
        this.Lb(a, b);
        this.Qb = !1
    };
    h.f = function() {
        oe.C.f.call(this);
        this.W = this.Lb = null
    };
    var X = function(a, b) {
            V.call(this, b);
            this.a = a;
            this.Qa = this.a.b.ppu;
            this.Ad = this.a.b.lpu;
            this.mb = []
        },
        pe, qe;
    z(X, V);
    h = X.prototype;
    h.xd = 5;
    h.la = 4;
    h.Y = 0;
    h.Da = !1;
    h.R = !1;
    h.Mc = null;
    var re = function(a) {
            return "googlexpc_" + a.a.name + "_msg"
        },
        se = function(a) {
            return "googlexpc_" + a.a.name + "_ack"
        },
        ue = function(a) {
            try {
                if (!a.V && te(a.a)) return a.a.A.frames || {}
            } catch (b) {
                R("error retrieving peer frames")
            }
            return {}
        },
        ve = function(a, b) {
            return ue(a)[b]
        };
    X.prototype.O = function() {
        if (!this.V && te(this.a)) {
            R("transport connect called");
            if (!this.R) {
                R("initializing...");
                var a = re(this);
                this.za = we(this, a);
                this.Jb = this.e().frames[a];
                a = se(this);
                this.na = we(this, a);
                this.ub = this.e().frames[a];
                this.R = !0
            }
            if (xe(this, re(this)) && xe(this, se(this))) R("foreign frames present"), this.zc = new ye(this, ve(this, re(this)), x(this.zd, this)), this.Wb = new ye(this, ve(this, se(this)), x(this.yd, this)), this.ec();
            else {
                N("foreign frames not (yet) present");
                if (1 == W(this.a)) this.Mc || 0 < this.xd-- ||
                    (N("Inner peer reconnect triggered."), he(this.a, ge(10)), N("switching channels: " + this.a.name), ze(this), this.R = !1, this.Mc = we(this, "googlexpc_reconnect_" + this.a.name));
                else if (0 == W(this.a)) {
                    N("outerPeerReconnect called");
                    for (var a = ue(this), b = a.length, c = 0; c < b; c++) {
                        var d;
                        try {
                            a[c] && a[c].name && (d = a[c].name)
                        } catch (e) {}
                        if (d) {
                            var f = d.split("_");
                            if (3 == f.length && "googlexpc" == f[0] && "reconnect" == f[1]) {
                                this.a.name = f[2];
                                ze(this);
                                this.R = !1;
                                break
                            }
                        }
                    }
                }
                this.e().setTimeout(x(this.O, this), 100)
            }
        }
    };
    var we = function(a, b) {
            N("constructing sender frame: " + b);
            var c;
            c = document.createElement("iframe");
            var d = c.style;
            d.position = "absolute";
            d.top = "-10px";
            d.left = "10px";
            d.width = "1px";
            d.height = "1px";
            c.id = c.name = b;
            c.src = a.Qa + "#INITIAL";
            a.e().document.body.appendChild(c);
            return c
        },
        ze = function(a) {
            N("deconstructSenderFrames called");
            a.za && (a.za.parentNode.removeChild(a.za), a.za = null, a.Jb = null);
            a.na && (a.na.parentNode.removeChild(a.na), a.na = null, a.ub = null)
        },
        xe = function(a, b) {
            N("checking for receive frame: " + b);
            try {
                var c =
                    ve(a, b);
                if (!c || 0 != c.location.href.indexOf(a.Ad)) return !1
            } catch (d) {
                return !1
            }
            return !0
        };
    X.prototype.ec = function() {
        var a = ue(this);
        a[se(this)] && a[re(this)] ? (this.Ac = new Ae(this.Qa, this.Jb), this.Ua = new Ae(this.Qa, this.ub), R("local frames ready"), this.e().setTimeout(x(function() {
            this.Ac.send("SETUP");
            this.Da = !0;
            R("SETUP sent")
        }, this), 100)) : (this.dc || (this.dc = x(this.ec, this)), this.e().setTimeout(this.dc, 100), R("local frames not (yet) present"))
    };
    var Be = function(a) {
        if (a.Rb && a.Kc) {
            if (ne(a.a), a.pa) {
                R("delivering queued messages (" + a.pa.length + ")");
                for (var b = 0, c; b < a.pa.length; b++) c = a.pa[b], a.a.N(c.Ra, c.ka);
                delete a.pa
            }
        } else N("checking if connected: ack sent:" + a.Rb + ", ack rcvd: " + a.Kc)
    };
    X.prototype.zd = function(a) {
        N("msg received: " + a);
        if ("SETUP" == a) this.Ua && (this.Ua.send("SETUP_ACK"), N("SETUP_ACK sent"), this.Rb = !0, Be(this));
        else if (this.a.J() || this.Rb) {
            var b = a.indexOf("|"),
                c = a.substring(0, b);
            a = a.substring(b + 1);
            b = c.indexOf(",");
            if (-1 == b) {
                var d;
                this.Ua.send("ACK:" + c);
                Ce(this, a)
            } else d = c.substring(0, b), this.Ua.send("ACK:" + d), c = c.substring(b + 1).split("/"), b = parseInt(c[0], 10), c = parseInt(c[1], 10), 1 == b && (this.Nb = []), this.Nb.push(a), b == c && (Ce(this, this.Nb.join("")), delete this.Nb)
        } else P(L,
            "received msg, but channel is not connected")
    };
    X.prototype.yd = function(a) {
        N("ack received: " + a);
        "SETUP_ACK" == a ? (this.Da = !1, this.Kc = !0, Be(this)) : this.a.J() ? this.Da ? parseInt(a.split(":")[1], 10) == this.Y ? (this.Da = !1, De(this)) : P(L, "got ack with wrong sequence") : P(L, "got unexpected ack") : P(L, "received ack, but channel not connected")
    };
    var De = function(a) {
            if (!a.Da && a.mb.length) {
                var b = a.mb.shift();
                ++a.Y;
                a.Ac.send(a.Y + b);
                N("msg sent: " + a.Y + b);
                a.Da = !0
            }
        },
        Ce = function(a, b) {
            var c = b.indexOf(":"),
                d = b.substr(0, c),
                c = b.substring(c + 1);
            a.a.J() ? a.a.N(d, c) : ((a.pa || (a.pa = [])).push({
                Ra: d,
                ka: c
            }), N("queued delivery"))
        };
    X.prototype.Ta = 3800;
    X.prototype.send = function(a, b) {
        var c = a + ":" + b;
        if (!F || b.length <= this.Ta) this.mb.push("|" + c);
        else
            for (var d = b.length, e = Math.ceil(d / this.Ta), f = 0, g = 1; f < d;) this.mb.push("," + g + "/" + e + "|" + c.substr(f, this.Ta)), g++, f += this.Ta;
        De(this)
    };
    X.prototype.f = function() {
        X.C.f.call(this);
        var a = Ee;
        Ga(a, this.zc);
        Ga(a, this.Wb);
        this.zc = this.Wb = null;
        Gb(this.za);
        Gb(this.na);
        this.Jb = this.ub = this.za = this.na = null
    };
    var Ee = [],
        Fe = x(function() {
            var a = Ee,
                b, c = !1;
            try {
                for (var d = 0; b = a[d]; d++) {
                    var e;
                    if (!(e = c)) {
                        var f = b,
                            g = f.Jc.location.href;
                        if (g != f.ic) {
                            f.ic = g;
                            var k = g.split("#")[1];
                            k && (k = k.substr(1), f.dd(decodeURIComponent(k)));
                            e = !0
                        } else e = !1
                    }
                    c = e
                }
            } catch (l) {
                if (Q("receive_() failed: " + l), b = b.p.a, Q("Transport Error"), b.close(), !a.length) return
            }
            a = y();
            c && (pe = a);
            qe = window.setTimeout(Fe, 1E3 > a - pe ? 10 : 100)
        }, X),
        Ge = function() {
            R("starting receive-timer");
            pe = y();
            qe && window.clearTimeout(qe);
            qe = window.setTimeout(Fe, 10)
        },
        Ae = function(a, b) {
            this.Qa =
                a;
            this.Pc = b;
            this.Bb = 0
        };
    Ae.prototype.send = function(a) {
        this.Bb = ++this.Bb % 2;
        a = this.Qa + "#" + this.Bb + encodeURIComponent(a);
        try {
            G ? this.Pc.location.href = a : this.Pc.location.replace(a)
        } catch (b) {
            O("sending failed", b)
        }
        Ge()
    };
    var ye = function(a, b, c) {
        this.p = a;
        this.Jc = b;
        this.dd = c;
        this.ic = this.Jc.location.href.split("#")[0] + "#INITIAL";
        Ee.push(this);
        Ge()
    };
    var Ie = function(a, b) {
        V.call(this, b);
        this.a = a;
        this.wd = this.a.b.pru;
        this.Ic = this.a.b.ifrid;
        G && He()
    };
    z(Ie, V);
    if (G) var Je = [],
        Ke = 0,
        He = function() {
            Ke || (Ke = window.setTimeout(function() {
                Le()
            }, 1E3))
        },
        Le = function(a) {
            var b = y();
            for (a = a || 3E3; Je.length && b - Je[0].timestamp >= a;) {
                var c = Je.shift().od;
                Gb(c);
                N("iframe removed")
            }
            Ke = window.setTimeout(Me, 1E3)
        },
        Me = function() {
            Le()
        };
    var Ne = {};
    Ie.prototype.la = 3;
    Ie.prototype.O = function() {
        this.e().xpcRelay || (this.e().xpcRelay = Oe);
        this.send("tp", "SETUP")
    };
    var Oe = function(a, b) {
        var c = b.indexOf(":"),
            d = b.substr(0, c),
            e = b.substr(c + 1);
        if (F && -1 != (c = d.indexOf("|"))) {
            var f = d.substr(0, c),
                d = d.substr(c + 1),
                c = d.indexOf("+"),
                g = d.substr(0, c),
                c = parseInt(d.substr(c + 1), 10),
                k = Ne[g];
            k || (k = Ne[g] = {
                rc: [],
                Lc: 0,
                qc: 0
            });
            B(d, "++") && (k.qc = c + 1);
            k.rc[c] = e;
            k.Lc++;
            if (k.Lc != k.qc) return;
            e = k.rc.join("");
            delete Ne[g]
        } else var f = d;
        U[a].N(f, decodeURIComponent(e))
    };
    Ie.prototype.rb = function(a) {
        "SETUP" == a ? (this.send("tp", "SETUP_ACK"), ne(this.a)) : "SETUP_ACK" == a && ne(this.a)
    };
    Ie.prototype.send = function(a, b) {
        var c = encodeURIComponent(b),
            d = c.length;
        if (F && 1800 < d)
            for (var e = Math.floor(2147483648 * Math.random()).toString(36) + Math.abs(Math.floor(2147483648 * Math.random()) ^ y()).toString(36), f = 0, g = 0; f < d; g++) {
                var k = c.substr(f, 1800),
                    f = f + 1800;
                Pe(this, a, k, e + (f >= d ? "++" : "+") + g)
            } else Pe(this, a, c)
    };
    var Pe = function(a, b, c, d) {
            if (F) {
                var e = a.e().document.createElement("div"),
                    f;
                f = new fb;
                f.pb = "this.xpcOnload()";
                var g = {
                        onload: f,
                        sandbox: null
                    },
                    k = {
                        src: null,
                        srcdoc: null
                    },
                    l = {
                        sandbox: ""
                    };
                f = {};
                for (var m in k) C(m.toLowerCase() == m, "Must be lower case"), f[m] = k[m];
                for (m in l) C(m.toLowerCase() == m, "Must be lower case"), f[m] = l[m];
                for (m in g) {
                    var r = m.toLowerCase();
                    if (r in k) throw Error('Cannot override "' + r + '" attribute, got "' + m + '" with value "' + g[m] + '"');
                    r in l && delete f[r];
                    f[m] = g[m]
                }
                m = null;
                g = "<iframe";
                if (f)
                    for (var v in f) {
                        if (!sb.test(v)) throw Error('Invalid attribute name "' +
                            v + '".');
                        l = f[v];
                        if (null != l) {
                            k = v;
                            if (l instanceof fb) l = gb(l);
                            else if ("style" == k.toLowerCase()) {
                                if (!fa(l)) throw Error('The "style" attribute requires goog.html.SafeStyle or map of style properties, ' + typeof l + " given: " + l);
                                if (!(l instanceof ib)) {
                                    var r = "",
                                        Ta = void 0;
                                    for (Ta in l) {
                                        if (!/^[-_a-zA-Z0-9]+$/.test(Ta)) throw Error("Name allows only [-_a-zA-Z0-9], got: " + Ta);
                                        var M = l[Ta];
                                        if (null != M) {
                                            if (M instanceof fb) M = gb(M), C(!/[{;}]/.test(M), "Value does not allow [{;}].");
                                            else if (kb.test(M)) {
                                                for (var yb = !0, zb = !0,
                                                        wc = 0; wc < M.length; wc++) {
                                                    var Nd = M.charAt(wc);
                                                    "'" == Nd && zb ? yb = !yb : '"' == Nd && yb && (zb = !zb)
                                                }
                                                yb && zb || (Aa("String value requires balanced quotes, got: " + M), M = "zClosurez")
                                            } else Aa("String value allows only [-,.\"'%_!# a-zA-Z0-9], got: " + M), M = "zClosurez";
                                            r += Ta + ":" + M + ";"
                                        }
                                    }
                                    r ? (C(!/[<>]/.test(r), "Forbidden characters in style string: " + r), l = (new ib).cb(r)) : l = jb
                                }
                                r = void 0;
                                l instanceof ib && l.constructor === ib && l.Vc === hb ? r = l.ib : (Aa("expected object of type SafeStyle, got '" + l + "'"), r = "type_error:SafeStyle");
                                l = r
                            } else {
                                if (/^on/i.test(k)) throw Error('Attribute "' +
                                    k + '" requires goog.string.Const value, "' + l + '" given.');
                                if (k.toLowerCase() in tb)
                                    if (l instanceof ob) l instanceof ob && l.constructor === ob && l.Yc === nb ? l = l.Ob : (Aa("expected object of type TrustedResourceUrl, got '" + l + "'"), l = "type_error:TrustedResourceUrl");
                                    else if (l instanceof mb) l instanceof mb && l.constructor === mb && l.Wc === lb ? l = l.fa : (Aa("expected object of type SafeUrl, got '" + l + "'"), l = "type_error:SafeUrl");
                                else throw Error('Attribute "' + k + '" on tag "iframe" requires goog.html.SafeUrl or goog.string.Const value, "' +
                                    l + '" given.');
                            }
                            l.va && (l = l.ra());
                            C(u(l) || ea(l), "String or number value expected, got " + typeof l + " with value: " + l);
                            k = k + '="' + wa(String(l)) + '"';
                            g += " " + k
                        }
                    }
                v = void 0;
                p(v) ? t(v) || (v = [v]) : v = [];
                !0 === db.iframe ? (C(!v.length, "Void tag <iframe> does not allow content."), g += ">") : (v = vb(v), g += ">" + rb(v) + "</iframe>", m = v.Ha());
                (f = f && f.dir) && (m = /^(ltr|rtl|auto)$/i.test(f) ? 0 : null);
                f = ub(g, m);
                e.innerHTML = rb(f);
                e = e.childNodes[0];
                e.xpcOnload = Qe
            } else e = a.e().document.createElement("iframe"), G ? Je.push({
                    timestamp: y(),
                    od: e
                }) :
                $b(e, "load", Qe);
            f = e.style;
            f.visibility = "hidden";
            f.width = e.style.height = "0px";
            f.position = "absolute";
            f = a.wd;
            f += "#" + a.a.name;
            a.Ic && (f += "," + a.Ic);
            f += "|" + b;
            d && (f += "|" + d);
            f += ":" + c;
            e.src = f;
            a.e().document.body.appendChild(e);
            N("msg sent: " + f)
        },
        Qe = function() {
            N("iframe-load");
            Gb(this)
        };
    Ie.prototype.f = function() {
        Ie.C.f.call(this);
        G && Le(0)
    };
    var Y = function(a, b, c, d, e) {
        V.call(this, c);
        this.a = a;
        this.L = e || 2;
        C(1 <= this.L);
        C(2 >= this.L);
        this.Hc = b || "*";
        this.qa = new K(this);
        this.T = new Pc(100, this.e());
        this.fb = !!d;
        this.r = new T;
        this.t = new T;
        this.o = new T;
        this.Cb = ge(10);
        this.da = null;
        this.fb ? 1 == W(this.a) ? $d(this.o, this.r) : $d(this.o, this.t) : ($d(this.o, this.r), 2 == this.L && $d(this.o, this.t));
        Zd(this.o, this.Kb, this);
        this.o.w(!0);
        this.qa.eb(this.T, "tick", this.Ma);
        Q("NativeMessagingTransport created.  protocolVersion=" + this.L + ", oneSidedHandshake=" + this.fb +
            ", role=" + W(this.a))
    };
    z(Y, V);
    Y.prototype.v = null;
    Y.prototype.R = !1;
    Y.prototype.la = 1;
    var Re = {};
    Y.prototype.Pa = 0;
    var Te = function(a) {
        var b = a.Za.data;
        if (!u(b)) return !1;
        var c = b.indexOf("|"),
            d = b.indexOf(":");
        if (-1 == c || -1 == d) return !1;
        var e = b.substring(0, c),
            c = b.substring(c + 1, d),
            b = b.substring(d + 1);
        R("messageReceived: channel=" + e + ", service=" + c + ", payload=" + b);
        if (d = U[e]) return d.N(c, b, a.Za.origin), !0;
        a = Se(b)[0];
        for (var f in U)
            if (d = U[f], 1 == W(d) && !d.J() && "tp" == c && ("SETUP" == a || "SETUP_NTPV2" == a)) return he(d, e), d.N(c, b), !0;
        Q('channel name mismatch; message ignored"');
        return !1
    };
    Y.prototype.rb = function(a) {
        var b = Se(a);
        a = b[1];
        switch (b[0]) {
            case "SETUP_ACK":
                Ue(this, 1);
                this.r.G || this.r.w(!0);
                break;
            case "SETUP_ACK_NTPV2":
                2 == this.L && (Ue(this, 2), this.r.G || this.r.w(!0));
                break;
            case "SETUP":
                Ue(this, 1);
                this.nb(1);
                break;
            case "SETUP_NTPV2":
                2 == this.L && (b = this.v, Ue(this, 2), this.nb(2), 1 != b && null == this.da || this.da == a || (Q("Sending SETUP and changing peer ID to: " + a), this.Oa()), this.da = a)
        }
    };
    Y.prototype.Oa = function() {
        C(!(1 == this.L && 2 == this.v));
        if (2 == this.L && (null == this.v || 2 == this.v)) {
            var a;
            a = "SETUP_NTPV2," + this.Cb;
            this.send("tp", a)
        }
        null != this.v && 1 != this.v || this.send("tp", "SETUP")
    };
    Y.prototype.nb = function(a) {
        C(1 != this.L || 2 != a, "Shouldn't try to send a v2 setup ack in v1 mode.");
        if (2 != this.L || null != this.v && 2 != this.v || 2 != a) {
            if (null != this.v && 1 != this.v || 1 != a) return;
            this.send("tp", "SETUP_ACK")
        } else this.send("tp", "SETUP_ACK_NTPV2");
        this.t.G || this.t.w(!0)
    };
    var Ue = function(a, b) {
        b > a.v && (a.v = b);
        1 == a.v && (a.t.G || a.fb || a.t.w(!0), a.da = null)
    };
    h = Y.prototype;
    h.O = function() {
        var a = this.e(),
            b = ia(a),
            c = Re[b];
        ea(c) || (c = 0);
        0 == c && $b(a.postMessage ? a : a.document, "message", Te, !1, Y);
        Re[b] = c + 1;
        this.R = !0;
        this.Ma()
    };
    h.Ma = function() {
        var a = 0 == W(this.a);
        this.fb && a || this.a.J() || this.V ? this.T.stop() : (this.T.start(), this.Oa())
    };
    h.send = function(a, b) {
        var c = this.a.A;
        c ? (this.send = function(a, b) {
            var f = this,
                g = this.a.name;
            this.Pa = Qc(function() {
                f.Pa = 0;
                try {
                    var k = c.postMessage ? c : c.document;
                    k.postMessage ? (k.postMessage(g + "|" + a + ":" + b, f.Hc), R("send(): service=" + a + " payload=" + b + " to hostname=" + f.Hc)) : P(L, "Peer window had no postMessage function.")
                } catch (l) {
                    P(L, "Error performing postMessage, ignoring.", l)
                }
            }, 0)
        }, this.send(a, b)) : R("send(): window not ready")
    };
    h.Kb = function() {
        ne(this.a, 1 == this.L || 1 == this.v ? 200 : void 0)
    };
    h.f = function() {
        if (this.R) {
            var a = this.e(),
                b = ia(a),
                c = Re[b];
            Re[b] = c - 1;
            1 == c && hc(a.postMessage ? a : a.document, "message", Te, !1, Y)
        }
        this.Pa && (n.clearTimeout(this.Pa), this.Pa = 0);
        J(this.qa);
        delete this.qa;
        J(this.T);
        delete this.T;
        this.r.cancel();
        delete this.r;
        this.t.cancel();
        delete this.t;
        this.o.cancel();
        delete this.o;
        delete this.send;
        Y.C.f.call(this)
    };
    var Se = function(a) {
        a = a.split(",");
        a[1] = a[1] || null;
        return a
    };
    var Ve = function(a, b) {
        V.call(this, b);
        this.a = a;
        this.ac = a.at || "";
        this.Nc = a.rat || "";
        var c = this.e();
        if (!c.nix_setup_complete) try {
            c.execScript("Class GCXPC____NIXVBS_wrapper\n Private m_Transport\nPrivate m_Auth\nPublic Sub SetTransport(transport)\nIf isEmpty(m_Transport) Then\nSet m_Transport = transport\nEnd If\nEnd Sub\nPublic Sub SetAuth(auth)\nIf isEmpty(m_Auth) Then\nm_Auth = auth\nEnd If\nEnd Sub\nPublic Function GetAuthToken()\n GetAuthToken = m_Auth\nEnd Function\nPublic Sub SendMessage(service, payload)\n Call m_Transport.GCXPC____NIXJS_handle_message(service, payload)\nEnd Sub\nPublic Sub CreateChannel(channel)\n Call m_Transport.GCXPC____NIXJS_create_channel(channel)\nEnd Sub\nPublic Sub GCXPC____NIXVBS_container()\n End Sub\nEnd Class\n Function GCXPC____NIXVBS_get_wrapper(transport, auth)\nDim wrap\nSet wrap = New GCXPC____NIXVBS_wrapper\nwrap.SetTransport transport\nwrap.SetAuth auth\nSet GCXPC____NIXVBS_get_wrapper = wrap\nEnd Function",
                "vbscript"), c.nix_setup_complete = !0
        } catch (d) {
            O("exception caught while attempting global setup: " + d)
        }
        this.GCXPC____NIXJS_handle_message = this.md;
        this.GCXPC____NIXJS_create_channel = this.ed
    };
    z(Ve, V);
    h = Ve.prototype;
    h.la = 6;
    h.ya = !1;
    h.ba = null;
    h.O = function() {
        0 == W(this.a) ? this.Yb() : this.Xb()
    };
    h.Yb = function() {
        if (!this.ya) {
            var a = this.a.ua;
            try {
                a.contentWindow.opener = (0, this.e().GCXPC____NIXVBS_get_wrapper)(this, this.ac), this.ya = !0
            } catch (b) {
                O("exception caught while attempting setup: " + b)
            }
            this.ya || this.e().setTimeout(x(this.Yb, this), 100)
        }
    };
    h.Xb = function() {
        if (!this.ya) {
            try {
                var a = this.e().opener;
                if (a && "GCXPC____NIXVBS_container" in a) {
                    this.ba = a;
                    if (this.ba.GetAuthToken() != this.Nc) {
                        O("Invalid auth token from other party");
                        return
                    }
                    this.ba.CreateChannel((0, this.e().GCXPC____NIXVBS_get_wrapper)(this, this.ac));
                    this.ya = !0;
                    ne(this.a)
                }
            } catch (b) {
                O("exception caught while attempting setup: " + b);
                return
            }
            this.ya || this.e().setTimeout(x(this.Xb, this), 100)
        }
    };
    h.ed = function(a) {
        "unknown" == typeof a && "GCXPC____NIXVBS_container" in a || O("Invalid NIX channel given to createChannel_");
        this.ba = a;
        this.ba.GetAuthToken() != this.Nc ? O("Invalid auth token from other party") : ne(this.a)
    };
    h.md = function(a, b) {
        this.e().setTimeout(x(function() {
            this.a.N(a, b)
        }, this), 1)
    };
    h.send = function(a, b) {
        "unknown" !== typeof this.ba && O("NIX channel not connected");
        this.ba.SendMessage(a, b)
    };
    h.f = function() {
        Ve.C.f.call(this);
        this.ba = null
    };
    var Z = function(a, b) {
        td.call(this);
        for (var c = 0, d; d = ee[c]; c++)
            if (d in a && !/^https?:\/\//.test(a[d])) throw Error("URI " + a[d] + " is invalid for field " + d);
        this.b = a;
        this.name = this.b.cn || ge(10);
        this.P = b || Bb();
        this.Ya = [];
        this.hb = new K(this);
        a.lpu = a.lpu || yd(this.P.e().location.href) + "/robots.txt";
        a.ppu = a.ppu || yd(a.pu || "") + "/robots.txt";
        U[this.name] = this;
        jc(window, "unload", We) || gc(window, "unload", We);
        Q("CrossPageChannel created: " + this.name)
    };
    z(Z, td);
    var Xe = /^%*tp$/,
        Ye = /^%+tp$/;
    h = Z.prototype;
    h.Z = null;
    h.U = null;
    h.p = null;
    h.j = 1;
    h.J = function() {
        return 2 == this.j
    };
    h.A = null;
    h.ua = null;
    var te = function(a) {
            try {
                return !!a.A && !Boolean(a.A.closed)
            } catch (b) {
                return !1
            }
        },
        af = function(a) {
            var b = document.body;
            Q("createPeerIframe()");
            var c = a.b.ifrid;
            c || (c = a.b.ifrid = "xpcpeer" + ge(4));
            var d = Bb(b).createElement("IFRAME");
            d.id = d.name = c;
            d.style.width = d.style.height = "100%";
            Ze(a);
            a.U = new T(void 0, a);
            var e = $e(a);
            Tc(a.hb, d, "load", a.U.w, !1, a.U);
            Qa || G ? window.setTimeout(x(function() {
                b.appendChild(d);
                d.src = e.toString();
                Q("peer iframe created (" + c + ")")
            }, a), 1) : (d.src = e.toString(), b.appendChild(d), Q("peer iframe created (" +
                c + ")"))
        },
        Ze = function(a) {
            a.U && (a.U.cancel(), a.U = null);
            a.Ya.length = 0;
            a.hb.kb()
        },
        $e = function(a) {
            var b = a.b.pu;
            u(b) && (b = a.b.pu = new Ad(b));
            var c = {};
            c.cn = a.name;
            c.tp = a.b.tp;
            c.osh = a.b.osh;
            a.b.lru && (c.pru = a.b.lru);
            a.b.lpu && (c.ppu = a.b.lpu);
            a.b.ppu && (c.lpu = a.b.ppu);
            (a = a.b.role) && (c.role = 1 == a ? 0 : 1);
            a = b;
            c = Xc(c);
            S(a);
            a.M.set("xpc", c);
            return b
        };
    Z.prototype.O = function(a) {
        this.Ab = a || ba;
        3 == this.j && (this.j = 1);
        this.U ? Zd(this.U, this.fc) : this.fc()
    };
    Z.prototype.fc = function() {
        Q("continueConnection_()");
        this.U = null;
        if (this.b.ifrid) {
            var a = this.b.ifrid;
            this.ua = u(a) ? this.P.$.getElementById(a) : a
        }
        this.ua && ((a = this.ua.contentWindow) || (a = window.frames[this.b.ifrid]), this.A = a);
        if (!this.A) {
            if (window == window.top) throw Error("CrossPageChannel: Can't connect, peer window-object not set.");
            this.A = window.parent
        }
        if (!this.p) {
            if (!this.b.tp) {
                var a = this.b,
                    b;
                if (w(document.postMessage) || w(window.postMessage) || F && window.postMessage) b = 1;
                else if (Qa) b = 2;
                else if (F && this.b.pru) b =
                    3;
                else {
                    var c;
                    if (c = F) {
                        c = !1;
                        try {
                            b = window.opener, window.opener = {}, c = Lb(window, "opener"), window.opener = b
                        } catch (d) {}
                    }
                    b = c ? 6 : 4
                }
                a.tp = b
            }
            switch (this.b.tp) {
                case 1:
                    this.p = new Y(this, this.b.ph, this.P, !!this.b.osh, this.b.nativeProtocolVersion || 2);
                    break;
                case 6:
                    this.p = new Ve(this, this.P);
                    break;
                case 2:
                    this.p = new oe(this, this.P);
                    break;
                case 3:
                    this.p = new Ie(this, this.P);
                    break;
                case 4:
                    this.p = new X(this, this.P);
                    break;
                case 7:
                    if (a = this.A) try {
                        a = window.document.domain == this.A.document.domain
                    } catch (e) {
                        a = !1
                    }
                    a ? this.p = new ie(this,
                        this.P) : Q("DirectTransport not supported for this window, peer window in different security context or not set yet.")
            }
            if (this.p) Q("Transport created: " + this.p.getName());
            else throw Error("CrossPageChannel: No suitable transport found!");
        }
        for (this.p.O(); 0 < this.Ya.length;) this.Ya.shift()()
    };
    Z.prototype.close = function() {
        Ze(this);
        this.j = 3;
        J(this.p);
        this.Ab = this.p = null;
        J(this.Z);
        this.Z = null;
        Q('Channel "' + this.name + '" closed')
    };
    var ne = function(a, b) {
        a.J() || a.Z && 0 != a.Z.H || (a.j = 2, Q('Channel "' + a.name + '" connected'), J(a.Z), p(b) ? (a.Z = new Rc(a.Ab, b), a.Z.start()) : (a.Z = null, a.Ab()))
    };
    Z.prototype.send = function(a, b) {
        this.J() ? te(this) ? (fa(b) && (b = Xc(b)), this.p.send(bf(a), b)) : (O("Peer has disappeared."), this.close()) : O("Can't send. Channel not connected.")
    };
    Z.prototype.N = function(a, b, c) {
        if (this.U) this.Ya.push(x(this.N, this, a, b, c));
        else {
            var d = this.b.ph;
            if (/^[\s\xa0]*$/.test(null == c ? "" : String(c)) || /^[\s\xa0]*$/.test(null == d ? "" : String(d)) || c == this.b.ph)
                if (this.V || 3 == this.j) P(L, "CrossPageChannel::xpcDeliver(): Channel closed.");
                else if (a && "tp" != a)
                if (this.J()) {
                    if (a = a.replace(/%[0-9a-f]{2}/gi, decodeURIComponent), a = Ye.test(a) ? a.substring(1) : a, c = this.Sb[a], c || (this.kc ? c = {
                            w: la(this.kc, a),
                            Cc: fa(b)
                        } : (P(this.Ib, 'Unknown service name "' + a + '"'), c = null)), c) {
                        var e;
                        t: {
                            if ((d = c.Cc) && u(b)) try {
                                e = Uc(b);
                                break t
                            } catch (f) {
                                P(this.Ib, "Expected JSON payload for " + a + ', was "' + b + '"');
                                e = null;
                                break t
                            } else if (!d && !u(b)) {
                                e = Xc(b);
                                break t
                            }
                            e = b
                        }
                        null != e && c.w(e)
                    }
                } else Q("CrossPageChannel::xpcDeliver(): Not connected.");
            else this.p.rb(b);
            else P(L, 'Message received from unapproved origin "' + c + '" - rejected.')
        }
    };
    var bf = function(a) {
            Xe.test(a) && (a = "%" + a);
            return a.replace(/[%:|]/g, encodeURIComponent)
        },
        W = function(a) {
            var b = a.b.role;
            return ea(b) ? b : window.parent == a.A ? 1 : 0
        },
        he = function(a, b) {
            R("changing channel name to " + b);
            delete U[a.name];
            a.name = b;
            U[b] = a
        };
    Z.prototype.f = function() {
        this.close();
        this.ua = this.A = null;
        delete U[this.name];
        J(this.hb);
        delete this.hb;
        Z.C.f.call(this)
    };
    var We = function() {
        for (var a in U) J(U[a])
    };
    var cf = function(a, b, c, d, e, f) {
        d = new Ad(d || window.location.href);
        var g = new Ad;
        e = e ? e : Math.floor(1E3 * Math.random()) + ".talkgadget.google.com";
        Cd(g, e);
        Ed(g, "/talkgadget/d");
        S(g);
        g.M.set("token", a);
        f && Dd(g, f);
        a = c || "wcs-iframe";
        c = "#" + a + " { display: none; }";
        var k = Bb(void 0),
            l = null,
            m = k.$;
        if (F && m.createStyleSheet) k = l = m.createStyleSheet(), F && p(k.cssText) ? k.cssText = c : k.innerHTML = c;
        else {
            m = Hb(k, "head")[0];
            m || (l = Hb(k, "body")[0], m = k.hc("head"), l.parentNode.insertBefore(m, l));
            var r = l = k.hc("style");
            F && p(r.cssText) ?
                r.cssText = c : r.innerHTML = c;
            k.appendChild(m, l)
        }
        c = {};
        k = new Ad;
        Cd(k, e);
        f && Dd(k, f);
        Ed(k, "/talkgadget/xpc_blank");
        "http" == d.B || "https" == d.B ? (Bd(g, d.B), Bd(k, d.B), f = new Ad, Bd(f, d.B), Cd(f, d.aa), 80 != d.ea && Dd(f, d.ea), Ed(f, b)) : (Bd(g, "http"), Bd(k, "http"), f = new Ad("http://www.google.com/xpc_blank"));
        c.lpu = f.toString();
        c.ppu = k.toString();
        c.ifrid = a;
        c.pu = g.toString();
        Z.call(this, c)
    };
    z(cf, Z);
    var ef = function(a, b, c, d, e) {
        this.readyState = 0;
        this.Pb = [];
        this.onopen = b.onopen;
        this.onmessage = b.onmessage;
        this.onerror = b.onerror;
        this.onclose = b.onclose;
        this.ga = c || new cf(a, "/_ah/channel/xpc_blank");
        this.uc = c ? d : "wcs-iframe";
        this.yc = e || new df(a);
        if (!document.body) throw "document.body is not defined -- do not create socket from script in <head>.";
        af(this.ga);
        ud(this.ga, "onOpened", x(this.ud, this));
        ud(this.ga, "onMessage", x(this.td, this));
        ud(this.ga, "onError", x(this.sd, this));
        ud(this.ga, "onClosed", x(this.Ec,
            this));
        this.ga.O(x(this.rd, this))
    };
    ef.prototype.send = function() {
        return !1
    };
    ef.prototype.close = function() {
        this.Ec()
    };
    ef.prototype.Bd = function() {
        for (var a = 0, b; b = this.Pb[a]; a++) switch (b.type) {
            case 0:
                this.onopen(b.$a);
                break;
            case 1:
                this.onmessage(b.$a);
                break;
            case 2:
                this.onerror(b.$a);
                break;
            case 3:
                this.onclose(b.$a)
        }
        this.Pb = []
    };
    var ff = function(a, b, c) {
            a.Pb.push({
                type: b,
                $a: c
            });
            window.setTimeout(x(a.Bd, a), 1)
        },
        gf = function(a) {
            return "string" == typeof a ? window.JSON && window.JSON.parse ? window.JSON.parse(a) : Uc(a) : a
        };
    h = ef.prototype;
    h.td = function(a) {
        var b = gf(a);
        if (b) {
            a = b.m;
            for (var b = b.s, c = this.yc, d = [], e = 0, f = 0; f < a.length; f++) {
                for (var g = a.charCodeAt(f); 255 < g;) d[e++] = g & 255, g >>= 8;
                d[e++] = g
            }
            d.push(c.ob);
            t: if (c = c.nd, c.reset(), c.update(d), d = c.Ga(), da(d) && da(b) && d.length == b.length) {
                c = d.length;
                for (e = 0; e < c; e++)
                    if (d[e] !== b[e]) {
                        b = !1;
                        break t
                    }
                b = !0
            } else b = !1;
            b && (ff(this, 1, {
                data: a
            }), this.yc.ob++)
        }
    };
    h.sd = function(a) {
        (a = gf(a)) && ff(this, 2, {
            description: a.d,
            code: a.c
        })
    };
    h.rd = function() {};
    h.ud = function() {
        this.readyState = 1;
        ff(this, 0, {})
    };
    h.Ec = function() {
        J(this.ga);
        this.readyState = 3;
        ff(this, 3, {});
        if (this.uc) {
            var a = new Ab,
                b;
            b = this.uc;
            (b = u(b) ? a.$.getElementById(b) : b) && a.removeNode(b)
        }
    };
    var df = function(a) {
        for (; 0 != a.length % 4;) a += ".";
        this.ob = 0;
        try {
            if (!Xa) {
                Xa = {};
                Ya = {};
                Za = {};
                for (var b = 0; 65 > b; b++) Xa[b] = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(b), Ya[b] = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.".charAt(b), Za[Ya[b]] = b, 62 <= b && (Za["ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(b)] = b)
            }
            for (var b = Za, c = [], d = 0; d < a.length;) {
                var e = b[a.charAt(d++)],
                    f = d < a.length ? b[a.charAt(d)] : 0;
                ++d;
                var g = d < a.length ? b[a.charAt(d)] :
                    64;
                ++d;
                var k = d < a.length ? b[a.charAt(d)] : 64;
                ++d;
                if (null == e || null == f || null == g || null == k) throw Error();
                c.push(e << 2 | f >> 4);
                64 != g && (c.push(f << 4 & 240 | g >> 2), 64 != k && c.push(g << 6 & 192 | k))
            }
            this.Rc = c
        } catch (l) {
            if (l.message) throw Error("The provided token is invalid (" + l.name + ": " + l.message + ")");
            throw Error("The provided token is invalid.");
        }
        this.u = new bb;
        this.nd = new ab(this.u, this.Rc, this.Rc.length)
    };
    var hf = function(a) {
            this.Fd = a
        },
        jf = {
            onopen: function() {},
            onclose: function() {},
            onerror: function() {},
            onmessage: function() {}
        };
    hf.prototype.open = function(a) {
        a = a || jf;
        return new ef(this.Fd, a)
    };
    q("goog.appengine.Socket", ef, void 0);
    q("goog.appengine.Socket.ReadyState", {
        CONNECTING: 0,
        OPEN: 1,
        Gd: 2,
        CLOSED: 3
    }, void 0);
    q("goog.appengine.Socket.ReadyState.CONNECTING", 0, void 0);
    q("goog.appengine.Socket.ReadyState.OPEN", 1, void 0);
    q("goog.appengine.Socket.ReadyState.CLOSING", 2, void 0);
    q("goog.appengine.Socket.ReadyState.CLOSED", 3, void 0);
    q("goog.appengine.Socket.prototype.send", ef.prototype.send, void 0);
    q("goog.appengine.Socket.prototype.close", ef.prototype.close, void 0);
    q("goog.appengine.Channel", hf, void 0);
    q("goog.appengine.Channel.prototype.open", hf.prototype.open, void 0);
    q("chat.WcsCrossPageChannel", cf, void 0);
})()