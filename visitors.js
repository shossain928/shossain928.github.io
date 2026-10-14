/* =========================================================
   Visitor map: counts each visitor once, by the country of their device's time zone,
   and draws the totals on the world map on the About page.
   Counts are kept by Abacus (https://abacus.jasoncameron.dev), a free counting service
   that needs no account. No cookies and no personal data are used.
   To start counting from zero, change NS below to a new name.
   ========================================================= */
(function () {
  "use strict";

  var TEST = window.VISITOR_MAP_TEST || {};
  var API = TEST.api || "https://abacus.jasoncameron.dev";
  var NS = "shossain928.github.io";
  var BINS = [1, 3, 10, 30, 100];      // map shades: 1-2, 3-9, 10-29, 30-99, 100+
  var TOP = 8;                         // countries listed before "Show all"
  var WORDS = 5, BITS = 52;            // the list of visited countries is stored as 5 numbers x 52 bits
  // Position of each country in that list. Never reorder: only add new codes at the end.
  var ORDER = "AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS XK YE YT ZA ZM ZW ZZ".split(" ");
  // Time zone -> country, grouped by country: {"BD": "Asia/Dhaka Asia/Dacca", ...}
  var TZ = {"AD":"Europe/Andorra","AE":"Asia/Dubai","AF":"Asia/Kabul","AG":"America/Antigua","AI":"America/Anguilla","AL":"Europe/Tirane","AM":"Asia/Yerevan","AO":"Africa/Luanda","AR":"America/Argentina/Buenos_Aires America/Argentina/Catamarca America/Argentina/ComodRivadavia America/Argentina/Cordoba America/Argentina/Jujuy America/Argentina/La_Rioja America/Argentina/Mendoza America/Argentina/Rio_Gallegos America/Argentina/Salta America/Argentina/San_Juan America/Argentina/San_Luis America/Argentina/Tucuman America/Argentina/Ushuaia America/Buenos_Aires America/Catamarca America/Cordoba America/Jujuy America/Mendoza America/Rosario","AS":"Pacific/Pago_Pago Pacific/Samoa US/Samoa","AT":"Europe/Vienna","AU":"Antarctica/Macquarie Australia/ACT Australia/Adelaide Australia/Brisbane Australia/Broken_Hill Australia/Canberra Australia/Currie Australia/Darwin Australia/Eucla Australia/Hobart Australia/LHI Australia/Lindeman Australia/Lord_Howe Australia/Melbourne Australia/NSW Australia/North Australia/Perth Australia/Queensland Australia/South Australia/Sydney Australia/Tasmania Australia/Victoria Australia/West Australia/Yancowinna","AW":"America/Aruba","AX":"Europe/Mariehamn","AZ":"Asia/Baku","BA":"Europe/Sarajevo","BB":"America/Barbados","BD":"Asia/Dacca Asia/Dhaka","BE":"CET Europe/Brussels MET","BF":"Africa/Ouagadougou","BG":"Europe/Sofia","BH":"Asia/Bahrain","BI":"Africa/Bujumbura","BJ":"Africa/Porto-Novo","BL":"America/St_Barthelemy","BM":"Atlantic/Bermuda","BN":"Asia/Brunei","BO":"America/La_Paz","BQ":"America/Kralendijk","BR":"America/Araguaina America/Bahia America/Belem America/Boa_Vista America/Campo_Grande America/Cuiaba America/Eirunepe America/Fortaleza America/Maceio America/Manaus America/Noronha America/Porto_Acre America/Porto_Velho America/Recife America/Rio_Branco America/Santarem America/Sao_Paulo Brazil/Acre Brazil/DeNoronha Brazil/East Brazil/West","BS":"America/Nassau","BT":"Asia/Thimbu Asia/Thimphu","BW":"Africa/Gaborone","BY":"Europe/Minsk","BZ":"America/Belize","CA":"America/Atikokan America/Blanc-Sablon America/Cambridge_Bay America/Coral_Harbour America/Creston America/Dawson America/Dawson_Creek America/Edmonton America/Fort_Nelson America/Glace_Bay America/Goose_Bay America/Halifax America/Inuvik America/Iqaluit America/Moncton America/Montreal America/Nipigon America/Pangnirtung America/Rainy_River America/Rankin_Inlet America/Regina America/Resolute America/St_Johns America/Swift_Current America/Thunder_Bay America/Toronto America/Vancouver America/Whitehorse America/Winnipeg America/Yellowknife Canada/Atlantic Canada/Central Canada/Eastern Canada/Mountain Canada/Newfoundland Canada/Pacific Canada/Saskatchewan Canada/Yukon","CC":"Indian/Cocos","CD":"Africa/Kinshasa Africa/Lubumbashi","CF":"Africa/Bangui","CG":"Africa/Brazzaville","CH":"Europe/Zurich","CI":"Africa/Abidjan","CK":"Pacific/Rarotonga","CL":"America/Coyhaique America/Punta_Arenas America/Santiago Chile/Continental Chile/EasterIsland Pacific/Easter","CM":"Africa/Douala","CN":"Asia/Chongqing Asia/Chungking Asia/Harbin Asia/Kashgar Asia/Shanghai Asia/Urumqi PRC","CO":"America/Bogota","CR":"America/Costa_Rica","CU":"America/Havana Cuba","CV":"Atlantic/Cape_Verde","CW":"America/Curacao","CX":"Indian/Christmas","CY":"Asia/Famagusta Asia/Nicosia Europe/Nicosia","CZ":"Europe/Prague","DE":"Europe/Berlin Europe/Busingen","DJ":"Africa/Djibouti","DK":"Europe/Copenhagen","DM":"America/Dominica","DO":"America/Santo_Domingo","DZ":"Africa/Algiers","EC":"America/Guayaquil Pacific/Galapagos","EE":"Europe/Tallinn","EG":"Africa/Cairo Egypt","EH":"Africa/El_Aaiun","ER":"Africa/Asmara Africa/Asmera","ES":"Africa/Ceuta Atlantic/Canary Europe/Madrid","ET":"Africa/Addis_Ababa","FI":"Europe/Helsinki","FJ":"Pacific/Fiji","FK":"Atlantic/Stanley","FM":"Pacific/Chuuk Pacific/Kosrae Pacific/Pohnpei Pacific/Ponape Pacific/Truk Pacific/Yap","FO":"Atlantic/Faeroe Atlantic/Faroe","FR":"Europe/Paris","GA":"Africa/Libreville","GB":"Europe/Belfast Europe/London GB GB-Eire","GD":"America/Grenada","GE":"Asia/Tbilisi","GF":"America/Cayenne","GG":"Europe/Guernsey","GH":"Africa/Accra","GI":"Europe/Gibraltar","GL":"America/Danmarkshavn America/Godthab America/Nuuk America/Scoresbysund America/Thule","GM":"Africa/Banjul","GN":"Africa/Conakry","GP":"America/Guadeloupe","GQ":"Africa/Malabo","GR":"EET Europe/Athens","GS":"Atlantic/South_Georgia","GT":"America/Guatemala","GU":"Pacific/Guam","GW":"Africa/Bissau","GY":"America/Guyana","HK":"Asia/Hong_Kong Hongkong","HN":"America/Tegucigalpa","HR":"Europe/Zagreb","HT":"America/Port-au-Prince","HU":"Europe/Budapest","ID":"Asia/Jakarta Asia/Jayapura Asia/Makassar Asia/Pontianak Asia/Ujung_Pandang","IE":"Eire Europe/Dublin","IL":"Asia/Jerusalem Asia/Tel_Aviv Israel","IM":"Europe/Isle_of_Man","IN":"Asia/Calcutta Asia/Kolkata","IO":"Indian/Chagos","IQ":"Asia/Baghdad","IR":"Asia/Tehran Iran","IS":"Atlantic/Reykjavik Iceland","IT":"Europe/Rome","JE":"Europe/Jersey","JM":"America/Jamaica Jamaica","JO":"Asia/Amman","JP":"Asia/Tokyo Japan","KE":"Africa/Nairobi","KG":"Asia/Bishkek","KH":"Asia/Phnom_Penh","KI":"Pacific/Enderbury Pacific/Kanton Pacific/Kiritimati Pacific/Tarawa","KM":"Indian/Comoro","KN":"America/St_Kitts","KP":"Asia/Pyongyang","KR":"Asia/Seoul ROK","KW":"Asia/Kuwait","KY":"America/Cayman","KZ":"Asia/Almaty Asia/Aqtau Asia/Aqtobe Asia/Atyrau Asia/Oral Asia/Qostanay Asia/Qyzylorda","LA":"Asia/Vientiane","LB":"Asia/Beirut","LC":"America/St_Lucia","LI":"Europe/Vaduz","LK":"Asia/Colombo","LR":"Africa/Monrovia","LS":"Africa/Maseru","LT":"Europe/Vilnius","LU":"Europe/Luxembourg","LV":"Europe/Riga","LY":"Africa/Tripoli Libya","MA":"Africa/Casablanca","MC":"Europe/Monaco","MD":"Europe/Chisinau Europe/Tiraspol","ME":"Europe/Podgorica","MF":"America/Marigot","MG":"Indian/Antananarivo","MH":"Kwajalein Pacific/Kwajalein Pacific/Majuro","MK":"Europe/Skopje","ML":"Africa/Bamako Africa/Timbuktu","MM":"Asia/Rangoon Asia/Yangon","MN":"Asia/Choibalsan Asia/Hovd Asia/Ulaanbaatar Asia/Ulan_Bator","MO":"Asia/Macao Asia/Macau","MP":"Pacific/Saipan","MQ":"America/Martinique","MR":"Africa/Nouakchott","MS":"America/Montserrat","MT":"Europe/Malta","MU":"Indian/Mauritius","MV":"Indian/Maldives","MW":"Africa/Blantyre","MX":"America/Bahia_Banderas America/Cancun America/Chihuahua America/Ciudad_Juarez America/Ensenada America/Hermosillo America/Matamoros America/Mazatlan America/Merida America/Mexico_City America/Monterrey America/Ojinaga America/Santa_Isabel America/Tijuana Mexico/BajaNorte Mexico/BajaSur Mexico/General","MY":"Asia/Kuala_Lumpur Asia/Kuching","MZ":"Africa/Maputo","NA":"Africa/Windhoek","NC":"Pacific/Noumea","NE":"Africa/Niamey","NF":"Pacific/Norfolk","NG":"Africa/Lagos","NI":"America/Managua","NL":"Europe/Amsterdam","NO":"Europe/Oslo","NP":"Asia/Kathmandu Asia/Katmandu","NR":"Pacific/Nauru","NU":"Pacific/Niue","NZ":"NZ NZ-CHAT Pacific/Auckland Pacific/Chatham","OM":"Asia/Muscat","PA":"America/Panama EST","PE":"America/Lima","PF":"Pacific/Gambier Pacific/Marquesas Pacific/Tahiti","PG":"Pacific/Bougainville Pacific/Port_Moresby","PH":"Asia/Manila","PK":"Asia/Karachi","PL":"Europe/Warsaw Poland","PM":"America/Miquelon","PN":"Pacific/Pitcairn","PR":"America/Puerto_Rico","PS":"Asia/Gaza Asia/Hebron","PT":"Atlantic/Azores Atlantic/Madeira Europe/Lisbon Portugal WET","PW":"Pacific/Palau","PY":"America/Asuncion","QA":"Asia/Qatar","RE":"Indian/Reunion","RO":"Europe/Bucharest","RS":"Europe/Belgrade","RU":"Asia/Anadyr Asia/Barnaul Asia/Chita Asia/Irkutsk Asia/Kamchatka Asia/Khandyga Asia/Krasnoyarsk Asia/Magadan Asia/Novokuznetsk Asia/Novosibirsk Asia/Omsk Asia/Sakhalin Asia/Srednekolymsk Asia/Tomsk Asia/Ust-Nera Asia/Vladivostok Asia/Yakutsk Asia/Yekaterinburg Europe/Astrakhan Europe/Kaliningrad Europe/Kirov Europe/Moscow Europe/Samara Europe/Saratov Europe/Simferopol Europe/Ulyanovsk Europe/Volgograd W-SU","RW":"Africa/Kigali","SA":"Asia/Riyadh","SB":"Pacific/Guadalcanal","SC":"Indian/Mahe","SD":"Africa/Khartoum","SE":"Europe/Stockholm","SG":"Asia/Singapore Singapore","SH":"Atlantic/St_Helena","SI":"Europe/Ljubljana","SJ":"Arctic/Longyearbyen Atlantic/Jan_Mayen","SK":"Europe/Bratislava","SL":"Africa/Freetown","SM":"Europe/San_Marino","SN":"Africa/Dakar","SO":"Africa/Mogadishu","SR":"America/Paramaribo","SS":"Africa/Juba","ST":"Africa/Sao_Tome","SV":"America/El_Salvador","SX":"America/Lower_Princes","SY":"Asia/Damascus","SZ":"Africa/Mbabane","TC":"America/Grand_Turk","TD":"Africa/Ndjamena","TF":"Indian/Kerguelen","TG":"Africa/Lome","TH":"Asia/Bangkok","TJ":"Asia/Dushanbe","TK":"Pacific/Fakaofo","TL":"Asia/Dili","TM":"Asia/Ashgabat Asia/Ashkhabad","TN":"Africa/Tunis","TO":"Pacific/Tongatapu","TR":"Asia/Istanbul Europe/Istanbul Turkey","TT":"America/Port_of_Spain","TV":"Pacific/Funafuti","TW":"Asia/Taipei ROC","TZ":"Africa/Dar_es_Salaam","UA":"Europe/Kiev Europe/Kyiv Europe/Uzhgorod Europe/Zaporozhye","UG":"Africa/Kampala","UM":"Pacific/Johnston Pacific/Midway Pacific/Wake","US":"America/Adak America/Anchorage America/Atka America/Boise America/Chicago America/Denver America/Detroit America/Fort_Wayne America/Indiana/Indianapolis America/Indiana/Knox America/Indiana/Marengo America/Indiana/Petersburg America/Indiana/Tell_City America/Indiana/Vevay America/Indiana/Vincennes America/Indiana/Winamac America/Indianapolis America/Juneau America/Kentucky/Louisville America/Kentucky/Monticello America/Knox_IN America/Los_Angeles America/Louisville America/Menominee America/Metlakatla America/New_York America/Nome America/North_Dakota/Beulah America/North_Dakota/Center America/North_Dakota/New_Salem America/Phoenix America/Shiprock America/Sitka America/Yakutat CST6CDT EST5EDT HST MST MST7MDT Navajo PST8PDT Pacific/Honolulu US/Alaska US/Aleutian US/Arizona US/Central US/East-Indiana US/Eastern US/Hawaii US/Indiana-Starke US/Michigan US/Mountain US/Pacific","UY":"America/Montevideo","UZ":"Asia/Samarkand Asia/Tashkent","VA":"Europe/Vatican","VC":"America/St_Vincent","VE":"America/Caracas","VG":"America/Tortola","VI":"America/St_Thomas America/Virgin","VN":"Asia/Ho_Chi_Minh Asia/Saigon","VU":"Pacific/Efate","WF":"Pacific/Wallis","WS":"Pacific/Apia","YE":"Asia/Aden","YT":"Indian/Mayotte","ZA":"Africa/Johannesburg","ZM":"Africa/Lusaka","ZW":"Africa/Harare"};

  if (!window.fetch || !window.Promise) return;

  /* ---------- storage (this browser only) ---------- */
  var shelf = (function () {
    var names = ["localStorage", "sessionStorage"];
    for (var i = 0; i < names.length; i++) {
      try { var s = window[names[i]]; s.setItem("vm:test", "1"); s.removeItem("vm:test"); return s; } catch (e) {}
    }
    return null;
  })();
  function load(key) { try { var raw = shelf && shelf.getItem("vm:" + key); return raw ? JSON.parse(raw) : null; } catch (e) { return null; } }
  function save(key, value) { try { if (!shelf) return false; shelf.setItem("vm:" + key, JSON.stringify(value)); return true; } catch (e) { return false; } }
  function drop(key) { try { if (shelf) shelf.removeItem("vm:" + key); } catch (e) {} }
  function wait(ms) { return new Promise(function (resolve) { setTimeout(resolve, ms); }); }

  /* ---------- counter API ----------
     At most 4 requests at once, and it waits and retries when the service says "too many requests".
     Writes go first and use keepalive, so they still finish if the visitor leaves the page. */
  var active = 0, queue = [];
  function pump() {
    while (active < 4 && queue.length) {
      var job = queue.shift();
      active++;
      send(job.path, job.write, 0).then(job.ok, job.fail).then(function () { active--; pump(); });
    }
  }
  function call(path, write) {
    return new Promise(function (ok, fail) {
      var job = { path: path, write: write, ok: ok, fail: fail };
      if (write) queue.unshift(job); else queue.push(job);
      pump();
    });
  }
  function send(path, write, tries) {
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, 12000) : 0;
    return fetch(API + path, { cache: "no-store", credentials: "omit", referrerPolicy: "no-referrer", keepalive: !!write, signal: ctrl ? ctrl.signal : undefined })
      .then(function (res) {
        clearTimeout(timer);
        if (res.status === 429 && tries < 3) return wait(10500 + Math.random() * 1500).then(function () { return send(path, write, tries + 1); });
        if (res.status === 404 || res.status === 409) return { status: res.status, value: null };
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json().then(function (body) { return { status: res.status, value: typeof body.value === "number" ? body.value : null }; });
      }, function (err) { clearTimeout(timer); throw err; });
  }
  var base = "/" + encodeURIComponent(NS) + "/";
  function value(r) { return r.value; }
  function hit(key) { return call("/hit" + base + key, true).then(value); }                     // add 1, returns the new total
  function get(key) { return call("/get" + base + key, false).then(value); }                   // null when the key doesn't exist yet
  function create(key, n) { return call("/create" + base + key + "?initializer=" + n, true); }  // set once; later calls are ignored

  /* ---------- which country (from the time zone, so no location lookup is needed) ---------- */
  var zones = null;
  function countryOf(zone) {
    if (!zones) {
      zones = {};
      Object.keys(TZ).forEach(function (cc) { TZ[cc].split(" ").forEach(function (z) { zones[z] = cc; }); });
    }
    return zones[zone] || "ZZ";
  }
  function detectCountry() {
    var zone = "";
    try { zone = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) {}
    return countryOf(zone);
  }

  /* ---------- the shared list of visited countries ----------
     Stored as numbered versions. Each version is 5 numbers whose bits mark countries
     (bit i = ORDER[i]). Adding a country writes a new, complete version; readers use the
     newest complete one. Versions are written once and never changed. */
  function isWord(w) { return typeof w === "number" && w >= 0 && w < 4503599627370496 && Math.floor(w) === w; }
  function hasBit(words, i) { return Math.floor(words[Math.floor(i / BITS)] / Math.pow(2, i % BITS)) % 2 === 1; }
  function withBit(words, i) {
    var w = words.slice();
    if (!hasBit(w, i)) w[Math.floor(i / BITS)] += Math.pow(2, i % BITS);
    return w;
  }
  function codesIn(words) {
    var out = [];
    for (var i = 0; i < ORDER.length && i < WORDS * BITS; i++) if (hasBit(words, i)) out.push(ORDER[i]);
    return out;
  }
  function zeros() { var w = []; for (var i = 0; i < WORDS; i++) w.push(0); return w; }

  var known = {};                        // version number -> words, for versions already read or written
  var lastDir = load("dir");             // newest complete version seen in this browser
  if (lastDir && lastDir.words && lastDir.words.length === WORDS && lastDir.words.every(isWord)) known[lastDir.v] = lastDir.words;
  else lastDir = null;

  function readVersion(v) {
    if (known[v]) return Promise.resolve(known[v]);
    var gets = [];
    for (var k = 0; k < WORDS; k++) gets.push(get("dir-" + v + "-" + k));
    return Promise.all(gets).then(function (words) {
      if (!words.every(isWord)) return null;   // not complete (still being written, or broken)
      known[v] = words;
      return words;
    });
  }
  var dirInFlight = null;
  function readDirectory() {
    if (dirInFlight) return dirInFlight;
    dirInFlight = get("dir-v").then(function (latest) {
      latest = latest || 0;
      function attempt(v, left) {
        if (v < 1 || left === 0) return { v: 0, words: lastDir ? lastDir.words : zeros() };
        return readVersion(v).then(function (words) {
          if (!words) return attempt(v - 1, left - 1);
          if (!lastDir || v >= lastDir.v) { lastDir = { v: v, words: words }; save("dir", lastDir); }
          return { v: v, words: words };
        });
      }
      return attempt(latest, 5);
    });
    var shared = dirInFlight;
    shared.then(function () { dirInFlight = null; }, function () { dirInFlight = null; });
    return shared;
  }

  // Add a country to the shared list. `start` is a list already read (optional).
  // Resolves once the new version is written; a second check then runs in the background.
  var registering = {};
  function listed(words, cc) { var i = ORDER.indexOf(cc); return i < 0 || hasBit(words, i); }
  function register(cc, start) {
    var i = ORDER.indexOf(cc);
    if (i < 0) return Promise.resolve();
    if (registering[cc]) return registering[cc];
    var tries = 0, waits = 0;
    function newest() {
      return get("dir-v").then(function (latest) {
        if (!latest) return zeros();
        return readVersion(latest).then(function (words) {
          if (words) return words;
          if (waits++ < 2) return wait(1500).then(newest);       // still being written: look again shortly
          return readDirectory().then(function (dir) { return dir.words; });   // a writer gave up: build on the newest complete one
        });
      });
    }
    function write(current) {
      if (hasBit(current, i) || tries++ >= 4) return Promise.resolve(false);
      var words = withBit(current, i);
      return hit("dir-v").then(function (v) {
        if (!v) return false;
        var writes = [];
        for (var k = 0; k < WORDS; k++) writes.push(create("dir-" + v + "-" + k, words[k]));
        return Promise.all(writes).then(function () { known[v] = words; return true; });
      });
    }
    // Check again a little later, in case another new country was added at the same moment.
    function recheck() {
      return wait(1200 + Math.random() * 1200).then(newest).then(write).then(function (wrote) { if (wrote) return recheck(); });
    }
    registering[cc] = (start ? Promise.resolve(start.words) : newest()).then(write)
      .then(function (wrote) { if (wrote) recheck().catch(function () {}); })
      .catch(function () {});
    return registering[cc];
  }

  /* ---------- counting this visit (once per browser) ---------- */
  function looksLikeBot() {
    if (TEST.allowBots) return false;
    if (navigator.webdriver) return true;
    return /bot|crawl|spider|slurp|preview|headless|lighthouse|pagespeed|prerender|scrap/i.test(navigator.userAgent || "");
  }
  function isLocalCopy() {
    if (TEST.countLocal) return false;
    var h = location.hostname;
    return location.protocol === "file:" || h === "" || h === "localhost" || h === "127.0.0.1" || h === "[::1]";
  }
  function today() {
    var d = new Date();
    return d.getUTCFullYear() * 10000 + (d.getUTCMonth() + 1) * 100 + d.getUTCDate();
  }
  function countVisit(cc) {
    if (load("counted") || looksLikeBot() || isLocalCopy()) return Promise.resolve(null);
    if (!save("counted", { cc: cc, t: Date.now() })) return Promise.resolve(null); // can't remember the visit, so don't count it
    var dir = readDirectory().catch(function () { return null; });   // read the shared list at the same time
    return hit("c-" + cc).then(function (n) {
      if (n === 1) create("since", today()).catch(function () {});   // the very first visitor starts the clock
      if (n > 0) dir.then(function (d) { if (d && !listed(d.words, cc)) register(cc, d); });
      return n;
    }, function () { drop("counted"); return null; });               // try again on the next page
  }

  var cc = detectCountry();
  var mapEl = document.getElementById("visitor-map");

  function start() {
    var mine = countVisit(cc);
    if (mapEl && window.VISITOR_MAP_DATA) showMap(mapEl, mine);
    else if (mapEl) {
      var st = mapEl.querySelector('[data-vm="status"]');
      if (st) st.textContent = "The map couldn’t be loaded. Please refresh the page.";
    }
  }
  if (document.prerendering) document.addEventListener("prerenderingchange", start, { once: true });
  else start();

  /* =========================================================
     The map on the About page
     ========================================================= */
  function showMap(root, mine) {
    var D = window.VISITOR_MAP_DATA;
    var SVG = "http://www.w3.org/2000/svg";
    function part(name) { return root.querySelector('[data-vm="' + name + '"]'); }
    var svg = part("svg"), box = part("map"), tip = part("tip"), tipValue = part("tip-value"), tipName = part("tip-name");
    var list = part("list"), all = part("all"), allList = part("all-list"), more = part("more"), status = part("status");
    var lists = [list, allList];
    var counts = {}, since = null, expanded = false, failed = false, done = false;

    function make(tag, attrs) {
      var node = document.createElementNS(SVG, tag);
      for (var a in attrs) node.setAttribute(a, attrs[a]);
      return node;
    }
    function nameOf(code) { return D.names[code] || code; }
    function fmt(n) { return Number(n).toLocaleString("en-US"); }
    function people(n) { return fmt(n) + (n === 1 ? " visitor" : " visitors"); }
    function shade(n) { var b = 0; for (var i = 0; i < BINS.length; i++) if (n >= BINS[i]) b = i + 1; return b; }

    /* draw the countries */
    svg.setAttribute("viewBox", "0 0 " + D.w + " " + D.h);
    var land = make("g", { "class": "vm-land" }), dots = make("g", { "class": "vm-dots" });
    var shapes = {};
    Object.keys(D.shapes).forEach(function (code) {
      var p = make("path", { d: D.shapes[code], "class": "vm-c", "data-cc": code });
      shapes[code] = p;
      land.appendChild(p);
    });
    svg.appendChild(land);
    svg.appendChild(dots);

    /* small places (Singapore, Malta, ...) are dots; size them in screen pixels */
    function scale() { var w = svg.getBoundingClientRect().width; return w ? w / D.w : 1; }
    function sizeDots() {
      var s = scale();
      Array.prototype.forEach.call(dots.querySelectorAll(".vm-dot"), function (c) { c.setAttribute("r", (4.5 / s).toFixed(2)); });
      Array.prototype.forEach.call(dots.querySelectorAll(".vm-dot-hit"), function (c) { c.setAttribute("r", (12 / s).toFixed(2)); });
    }
    if (window.ResizeObserver) new ResizeObserver(sizeDots).observe(svg);
    else window.addEventListener("resize", sizeDots);

    /* render counts */
    var pending = false;
    function soon() { if (!pending) { pending = true; setTimeout(function () { pending = false; render(); }, 120); } }

    function render() {
      var codes = Object.keys(counts).filter(function (c) { return counts[c] > 0; });
      codes.sort(function (a, b) { return counts[b] - counts[a] || nameOf(a).localeCompare(nameOf(b)); });
      var places = codes.filter(function (c) { return c !== "ZZ"; });
      if (counts.ZZ > 0) codes = places.concat(["ZZ"]);
      var total = codes.reduce(function (t, c) { return t + counts[c]; }, 0);

      // map
      Object.keys(shapes).forEach(function (code) {
        var n = counts[code] || 0, hot = shapes[code].classList.contains("is-hot");
        shapes[code].setAttribute("class", "vm-c" + (n ? " vm-b" + shade(n) : "") + (hot ? " is-hot" : ""));
      });
      while (dots.firstChild) dots.removeChild(dots.firstChild);
      places.forEach(function (code) {
        if (shapes[code] || !D.dots[code]) return;
        var xy = D.dots[code];
        dots.appendChild(make("circle", { cx: xy[0], cy: xy[1], r: 4, "class": "vm-dot vm-b" + shade(counts[code]), "data-cc": code }));
        dots.appendChild(make("circle", { cx: xy[0], cy: xy[1], r: 10, "class": "vm-dot-hit", "data-cc": code }));
      });
      sizeDots();

      // numbers
      var haveNumbers = total > 0 || (done && !failed);
      part("total").textContent = haveNumbers ? fmt(total) : "–";
      part("countries").textContent = haveNumbers ? fmt(places.length) : "–";
      if (since) {
        var s = String(since), d = new Date(Date.UTC(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8)));
        part("since").textContent = isNaN(d) ? "–" : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
      }

      // lists: the top countries beside the map, and the full list (shown on request) under it.
      // Keyboard focus stays on the same country while they update.
      var focused = null;
      lists.forEach(function (ol) { if (document.activeElement && ol.contains(document.activeElement)) focused = [ol, document.activeElement.getAttribute("data-cc")]; });
      var max = codes.length ? counts[codes[0]] : 1;
      fill(list, codes.slice(0, TOP), max);
      fill(allList, expanded ? codes : [], max);
      if (focused) { var again = focused[0].querySelector('.vm-row[data-cc="' + focused[1] + '"]'); if (again) again.focus(); }
      all.hidden = !expanded;
      more.hidden = codes.length <= TOP;
      more.textContent = expanded ? "Hide the full list" : "Show all " + codes.length + " countries";
      more.setAttribute("aria-expanded", expanded ? "true" : "false");

      // words for screen readers and the status line
      var top3 = places.slice(0, 3).map(function (c) { return nameOf(c) + " (" + fmt(counts[c]) + ")"; });
      svg.setAttribute("aria-label", "World map of visitors: " + fmt(total) + " visitors from " + places.length +
        (places.length === 1 ? " country" : " countries") + (top3.length ? ". Most visitors: " + top3.join(", ") + "." : "."));
      if (failed && !total) status.textContent = "Visitor counts can’t be loaded right now. The map will fill in when the counter is reachable.";
      else if (failed) status.textContent = "Showing the last saved counts. Live counts can’t be loaded right now.";
      else if (!done) status.textContent = "Loading visitor counts…";
      else status.textContent = cc !== "ZZ" ? "You’re visiting from " + nameOf(cc) + "." : "";
      root.setAttribute("data-state", failed && !total ? "error" : done ? "ready" : "loading");
    }

    function fill(ol, codes, max) {
      while (ol.firstChild) ol.removeChild(ol.firstChild);
      if (!codes.length && ol === list) {
        var empty = document.createElement("li");
        empty.className = "vm-empty";
        empty.textContent = failed ? "Counts are not available right now." : done ? "No visitors recorded yet." : "Loading…";
        ol.appendChild(empty);
      }
      codes.forEach(function (code, i) {
        var li = document.createElement("li");
        li.className = "vm-row" + (code === hot ? " is-hot" : "");
        li.tabIndex = 0;
        li.setAttribute("data-cc", code);
        li.setAttribute("aria-label", nameOf(code) + ": " + people(counts[code]));
        var rank = document.createElement("span"); rank.className = "vm-rank"; rank.textContent = code === "ZZ" ? "–" : String(i + 1);
        var name = document.createElement("span"); name.className = "vm-name"; name.textContent = nameOf(code);
        var num = document.createElement("span"); num.className = "vm-num"; num.textContent = fmt(counts[code]);
        var bar = document.createElement("span"); bar.className = "vm-bar"; bar.setAttribute("aria-hidden", "true");
        var len = document.createElement("span"); len.style.width = Math.max(2, Math.round(counts[code] / max * 100)) + "%";
        bar.appendChild(len);
        li.appendChild(rank); li.appendChild(name); li.appendChild(num); li.appendChild(bar);
        ol.appendChild(li);
      });
    }
    more.addEventListener("click", function () {
      expanded = !expanded;
      render();
      if (expanded && all.scrollIntoView) all.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });

    /* tooltip: hover a country (or tap it on a phone), or focus a row in the list */
    var hot = null;
    function markOf(code) { return shapes[code] || dots.querySelector('.vm-dot[data-cc="' + code + '"]'); }
    function highlight(code) {
      if (hot === code) return;
      clearHighlight();
      hot = code;
      var mark = markOf(code);
      if (mark) { mark.classList.add("is-hot"); if (mark.parentNode === land) land.appendChild(mark); }
      lists.forEach(function (ol) { var row = ol.querySelector('.vm-row[data-cc="' + code + '"]'); if (row) row.classList.add("is-hot"); });
    }
    function clearHighlight() {
      if (!hot) return;
      var mark = markOf(hot);
      if (mark) mark.classList.remove("is-hot");
      lists.forEach(function (ol) { var row = ol.querySelector('.vm-row[data-cc="' + hot + '"]'); if (row) row.classList.remove("is-hot"); });
      hot = null;
    }
    function showTip(code, x, y) {
      var n = counts[code] || 0;
      tipValue.textContent = n ? people(n) : "No visitors yet";
      tipName.textContent = nameOf(code);
      tip.hidden = false;
      var b = box.getBoundingClientRect(), tw = tip.offsetWidth, th = tip.offsetHeight;
      var left = Math.min(Math.max(x - b.left - tw / 2, 4), b.width - tw - 4);
      var top = y - b.top - th - 14;
      if (top < 4) top = y - b.top + 18;
      tip.style.transform = "translate(" + Math.round(left) + "px," + Math.round(top) + "px)";
    }
    function hideTip() { tip.hidden = true; clearHighlight(); }
    function codeAt(target) {
      while (target && target !== svg) { if (target.getAttribute && target.getAttribute("data-cc")) return target.getAttribute("data-cc"); target = target.parentNode; }
      return null;
    }
    svg.addEventListener("pointermove", function (e) {
      if (e.pointerType === "touch") return;
      var code = codeAt(e.target);
      if (!code) return hideTip();
      highlight(code);
      showTip(code, e.clientX, e.clientY);
    });
    svg.addEventListener("pointerleave", function (e) { if (e.pointerType !== "touch") hideTip(); });
    svg.addEventListener("click", function (e) {
      var code = codeAt(e.target);
      if (!code) return hideTip();
      highlight(code);
      showTip(code, e.clientX, e.clientY);
    });
    document.addEventListener("pointerdown", function (e) { if (!box.contains(e.target)) hideTip(); });
    function rowEvent(e) {
      var row = e.target.closest ? e.target.closest(".vm-row") : null;
      if (!row) return;
      var code = row.getAttribute("data-cc"), mark = markOf(code);
      highlight(code);
      if (mark) { var r = mark.getBoundingClientRect(); showTip(code, r.left + r.width / 2, r.top + r.height / 2); }
      else tip.hidden = true;
    }
    lists.forEach(function (ol) {
      ol.addEventListener("mouseover", rowEvent);
      ol.addEventListener("focusin", rowEvent);
      ol.addEventListener("mouseleave", hideTip);
      ol.addEventListener("focusout", function (e) { if (!ol.contains(e.relatedTarget)) hideTip(); });
    });

    /* data: show what this browser saw last time straight away, then fetch fresh counts */
    var snap = load("snap");
    if (snap && snap.counts) { counts = snap.counts; since = snap.since || null; }
    render();

    var mineN = null;
    mine.then(function (n) { if (n) { mineN = n; counts[cc] = Math.max(counts[cc] || 0, n); soon(); } });

    var sinceP = get("since").then(function (s) { since = s; soon(); return s; }, function () { return null; });
    var dirP = readDirectory();

    dirP.then(function (dir) {
      var codes = codesIn(dir.words);
      if (codes.indexOf(cc) < 0) codes.push(cc);          // always look up this visitor's own country
      codes.sort(function (a, b) { return (counts[b] || 0) - (counts[a] || 0); });   // biggest first
      var fresh = {};
      return Promise.all(codes.map(function (code) {
        return get("c-" + code).then(function (n) {
          fresh[code] = n || 0;
          counts[code] = n || 0;
          if (code === cc && mineN) counts[code] = Math.max(counts[code], mineN);
          soon();
        }, function () { fresh[code] = counts[code] || 0; });
      })).then(function () {
        Object.keys(counts).forEach(function (code) { if (!(code in fresh)) delete counts[code]; });
        return mine;
      }).then(function () {
        if (mineN) counts[cc] = Math.max(counts[cc] || 0, mineN);
        // Keep the shared list right: if this visitor's country has visits but isn't listed yet, add it
        // (and wait for that, so the page only says "ready" once it is saved).
        if (counts[cc] > 0 && !listed(dir.words, cc)) return register(cc, dir);
      });
    }).then(function () {
      return sinceP.then(function (s) {
        var total = Object.keys(counts).reduce(function (t, c) { return t + (counts[c] || 0); }, 0);
        if (!s && total > 0) { since = today(); create("since", since).catch(function () {}); }
      });
    }).then(function () {
      done = true;
      save("snap", { counts: counts, since: since, t: Date.now() });
      render();
    }, function () {
      done = true;
      failed = true;
      render();
    });
  }
})();
