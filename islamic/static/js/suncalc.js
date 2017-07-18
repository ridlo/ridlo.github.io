/*
 (c) 2011-2015, Vladimir Agafonkin
 SunCalc is a JavaScript library for calculating sun/moon position and light phases.
 https://github.com/mourner/suncalc

 edited by Ridlo W. Wibowo (2017) for praytime calc
*/

(function () { 'use strict';

// shortcuts for easier to read formulas

var PI   = Math.PI,
    sin  = Math.sin,
    cos  = Math.cos,
    tan  = Math.tan,
    asin = Math.asin,
    atan = Math.atan2,
    acos = Math.acos,
    abs = Math.abs,
    deg = 180 / PI,
    swic = false,
    rad  = PI / 180;

// sun calculations are based on http://aa.quae.nl/en/reken/zonpositie.html formulas


// date/time constants and conversions

var dayMs = 1000 * 60 * 60 * 24,
    J1970 = 2440588,
    J2000 = 2451545;

function toJulian(date) { return date.valueOf() / dayMs - 0.5 + J1970; }
function fromJulian(j)  { return new Date((j + 0.5 - J1970) * dayMs); }
function toDays(date)   { return toJulian(date) - J2000; }


// general calculations for position

var e = rad * 23.4397; // obliquity of the Earth

function rightAscension(l, b) { return atan(sin(l) * cos(e) - tan(b) * sin(e), cos(l)); }
function declination(l, b)    { return asin(sin(b) * cos(e) + cos(b) * sin(e) * sin(l)); }

//function azimuth(H, phi, dec)  { return atan(sin(H), cos(H) * sin(phi) - tan(dec) * cos(phi)); }

// North to East +
// North to West -
function azimuth(H, phi, dec)  { return atan(sin(H), tan(dec) * cos(phi) - cos(H) * sin(phi)); }

function altitude(H, phi, dec) { return asin(sin(phi) * sin(dec) + cos(phi) * cos(dec) * cos(H)); }

function siderealTime(d, lw) { return rad * (280.16 + 360.9856235 * d) - lw; }

function astroRefraction(h) {
    if (h < 0) // the following formula works for positive altitudes only.
        h = 0; // if h = -0.08901179 a div/0 would occur.

    // formula 16.4 of "Astronomical Algorithms" 2nd edition by Jean Meeus (Willmann-Bell, Richmond) 1998.
    // 1.02 / tan(h + 10.26 / (h + 5.10)) h in degrees, result in arc minutes -> converted to rad:
    return 0.0002967 / Math.tan(h + 0.00312536 / (h + 0.08901179));
}

// general sun calculations

function solarMeanAnomaly(d) { return rad * (357.5291 + 0.98560028 * d); }

function eclipticLongitude(M) {

    var C = rad * (1.9148 * sin(M) + 0.02 * sin(2 * M) + 0.0003 * sin(3 * M)), // equation of center
        P = rad * 102.9372; // perihelion of the Earth

    return M + C + P + PI;
}

function sunCoords(d) {

    var M = solarMeanAnomaly(d),
        L = eclipticLongitude(M);

    return {
        dec: declination(L, 0),
        ra: rightAscension(L, 0)
    };
}


var SunCalc = {};


// calculates sun position for a given date and latitude/longitude

SunCalc.getPosition = function (date, lat, lng) {

    var lw  = rad * -lng,
        phi = rad * lat,
        d   = toDays(date),

        c  = sunCoords(d),
        H  = siderealTime(d, lw) - c.ra;

    return {
        azimuth: azimuth(H, phi, c.dec),
        altitude: altitude(H, phi, c.dec)
    };
};


// sun times configuration (angle, morning name, evening name)

var times = SunCalc.times = [
    [-0.833, 'sunrise',       'sunset'      ],
    [  -0.3, 'sunriseEnd',    'sunsetStart' ],
    [    -6, 'dawn',          'dusk'        ],
    [   -12, 'nauticalDawn',  'nauticalDusk'],
    [   -18, 'nightEnd',      'night'       ],
    [     6, 'goldenHourEnd', 'goldenHour'  ]
];

// adds a custom time to the times config

SunCalc.addTime = function (angle, riseName, setName) {
    times.push([angle, riseName, setName]);
};


// calculations for sun times

var J0 = 0.0009;

function julianCycle(d, lw) { return Math.round(d - J0 - lw / (2 * PI)); }

function approxTransit(Ht, lw, n) { return J0 + (Ht + lw) / (2 * PI) + n; }
function solarTransitJ(ds, M, L)  { return J2000 + ds + 0.0053 * sin(M) - 0.0069 * sin(2 * L); }

function hourAngle(h, phi, d) { return acos((sin(h) - sin(phi) * sin(d)) / (cos(phi) * cos(d))); }

// returns set time for the given sun altitude
function getSetJ(h, lw, phi, dec, n, M, L) {

    var w = hourAngle(h, phi, dec),
        a = approxTransit(w, lw, n);
    return solarTransitJ(a, M, L);
}


// calculates sun times for a given date and latitude/longitude

SunCalc.getTimes = function (date, lat, lng) {

    var lw = rad * -lng,
        phi = rad * lat,

        d = toDays(date),
        n = julianCycle(d, lw),
        ds = approxTransit(0, lw, n),

        M = solarMeanAnomaly(ds),
        L = eclipticLongitude(M),
        dec = declination(L, 0),

        Jnoon = solarTransitJ(ds, M, L),

        i, len, time, Jset, Jrise;


    var result = {
        solarNoon: fromJulian(Jnoon),
        nadir: fromJulian(Jnoon - 0.5)
    };

    for (i = 0, len = times.length; i < len; i += 1) {
        time = times[i];

        Jset = getSetJ(time[0] * rad, lw, phi, dec, n, M, L);
        Jrise = Jnoon - (Jset - Jnoon);

        result[time[1]] = fromJulian(Jrise);
        result[time[2]] = fromJulian(Jset);
    }

    return result;
};

// ---------------------------
// calculates pray times for a given date and latitude/longitude
SunCalc.prayTimes = function (date, lat, lng) {

    var lw = rad * -lng,
        phi = rad * lat,

        d = toDays(date),
        n = julianCycle(d, lw),
        ds = approxTransit(0, lw, n),

        M = solarMeanAnomaly(ds),
        L = eclipticLongitude(M),
        dec = declination(L, 0),

        Jnoon = solarTransitJ(ds, M, L),

        i, len, time, Jset, Jrise;


    // manual "correction"
    var corr = [2/1440, 3/1440, 2/1440, 2/1440, 2/1440] // in day

    var result = {
        'subuh': 0, 
        'dzuhur': 0, 
        'ashar': 0, 
        'maghrib': 0, 
        'isya': 0
    };

    // dzuhur
    result['dzuhur'] = fromJulian(Jnoon + corr[1]);

    // calculate set time using getSetJ (after transit)
    // subuh
    var t = getSetJ(-20 * rad, lw, phi, dec, n, M, L);
    var subuh = Jnoon - (t - Jnoon); // invert
    result['subuh'] = fromJulian(subuh + corr[0]);

    // maghrib
    // and height correction
    // for H = 500 m above sea level 
    // height = 500
    // heightcorr = acos(6378000/(height+6378000))
    // heightcorr = heightcorr*4 // in min
    // heightcorr = heightcorr/60/24 // in day
    var heightcorr = 0.002; 
    var maghrib = getSetJ(-0.833 * rad, lw, phi, dec, n, M, L);
    result['maghrib'] = fromJulian(maghrib + heightcorr + corr[3]);

    // ashar
    // (Shafi'i, Maliki, Ja'fari, and Hanbali)
    // h = 45 deg + length when noon
    var x = atan(1, (1 + tan(abs(phi-dec))))
    var ashar = acos( (sin(x) - sin(phi)*sin(dec))/(cos(phi)*cos(dec)) );
    ashar = (1./15) * deg * ashar
    //var ashar = Jnoon + ashar/24.0
    result['ashar'] = fromJulian(Jnoon + ashar/24.0 + corr[2]);
    
    // isya
    var isya = getSetJ(-18.0 * rad, lw, phi, dec, n, M, L);
    result['isya'] = fromJulian(isya + corr[4]);


    return result;
};

// Function to evaluate, zero means near the dirsearch
function finddirection(date, lat, lng, dirsearch){
    var newpos = SunCalc.getPosition(date, lat, lng)
    var azi = newpos['azimuth']
    if (swic){
        if (azi < 0){
            azi += 6.283185307179586;
        }
    }

    //console.log(azi*deg);
    return dirsearch-azi
};

// Bisection to search the correct time so that sun has azimuth dirsearch
function bisection(initmin, initmax, lat, lng, dirsearch, tnoon, itermax=10000, dirtol=0.00001){
    var i = 0,
        stop = false,
        mini = initmin,
        maxi = initmax,
        newi, newres;
    var sol = NaN;

    if (swic){
        if (dirsearch < 0){
            dirsearch += 6.283185307179586;
        }
    }

    var resnoon = finddirection(tnoon, lat, lng, dirsearch);
    var resmin = finddirection(mini, lat, lng, dirsearch);
    var resmax = finddirection(maxi, lat, lng, dirsearch);


    if (abs(resnoon) <= dirtol){
        sol = tnoon;
        return sol;
    }
    if (abs(resmin) <= dirtol){
        sol = initmin;
        return sol;
    }
    if (abs(resmax) <= dirtol){
        sol = initmax;
        return sol;
    }


    if (resnoon*resmin < 0){
        mini = initmin;
        maxi = tnoon;
    } 
    else if (resnoon*resmax < 0){
        mini = tnoon;
        maxi = initmax;
    }
    else{
        // console.log("No solution, impossible region")
        return sol
    }

    // real bisection here
    while ((i < itermax) && !stop){
        resmin = finddirection(mini, lat, lng, dirsearch)
        resmax = finddirection(maxi, lat, lng, dirsearch)

        newi = (toJulian(mini) + toJulian(maxi))/2.
        newi = fromJulian(newi) // convert to date format again
        // console.log(newi)
        newres = finddirection(newi, lat, lng, dirsearch)
        if (newres*resmax < 0.0){
            mini = newi;
        }
        else if (newres == 0){
            stop = true;
            console.log(newres);
            sol = newi;
        }
        else{
            maxi = newi;
        }

        if (abs(newres) < dirtol){
            stop = true;
            //console.log(newres)
            //console.log(i)
            sol = newi;}

        i += 1

        if (i >= itermax){
            console.log("No solution, itermax")
            sol = NaN;
        }

    };

    return sol
};


// calculate when the Sun Azimuth is in 'good' position relative to Kibla
// searah
// berlawanan arah
// tegak lurus
SunCalc.kiblaTimes = function(date, lat, lng, kiblaAzimuth){
    var kiblaAzimuth = rad * kiblaAzimuth;

    var times = SunCalc.getTimes(date, lat, lng);
    
    var initmin = times['sunriseEnd'] // sunrise
    var initmax = times['sunsetStart'] // sunset
    var tnoon = times['solarNoon'] // noon
    var lw  = rad * -lng,
        phi = rad * lat,
        d   = toDays(date),
        c  = sunCoords(d)

    swic = false;
    //console.log(phi)
    //console.log(c.dec)
    if ( ((c.dec > 0) && (phi > c.dec)) || ((c.dec < 0) && (phi < c.dec)) ) {
        swic = true;
    }
    //console.log(swic)

    // sun direction
    var dirsearch = kiblaAzimuth 
    //console.log("indir")
    var indir = bisection(initmin, initmax, lat, lng, dirsearch, tnoon)
    
    // shadow direction
    dirsearch = kiblaAzimuth - PI
    //console.log("out")
    var outdir = bisection(initmin, initmax, lat, lng, dirsearch, tnoon)

    // right angle 1 
    dirsearch = kiblaAzimuth - PI/2.
    //console.log("1")
    var rigdir1 = bisection(initmin, initmax, lat, lng, dirsearch, tnoon)

    // right angle 2
    dirsearch = kiblaAzimuth + PI/2.
    //console.log("2")
    var rigdir2 = bisection(initmin, initmax, lat, lng, dirsearch, tnoon)

    // HA sun in radian
    var dirtime = {
        'indir': indir,
        'outdir' : outdir,
        'rightangle1': rigdir1,
        'rightangle2': rigdir2
    };

    return dirtime;
};

//------------------------------------------








// moon calculations, based on http://aa.quae.nl/en/reken/hemelpositie.html formulas

function moonCoords(d) { // geocentric ecliptic coordinates of the moon

    var L = rad * (218.316 + 13.176396 * d), // ecliptic longitude
        M = rad * (134.963 + 13.064993 * d), // mean anomaly
        F = rad * (93.272 + 13.229350 * d),  // mean distance

        l  = L + rad * 6.289 * sin(M), // longitude
        b  = rad * 5.128 * sin(F),     // latitude
        dt = 385001 - 20905 * cos(M);  // distance to the moon in km

    return {
        ra: rightAscension(l, b),
        dec: declination(l, b),
        dist: dt
    };
}

SunCalc.getMoonPosition = function (date, lat, lng) {

    var lw  = rad * -lng,
        phi = rad * lat,
        d   = toDays(date),

        c = moonCoords(d),
        H = siderealTime(d, lw) - c.ra,
        h = altitude(H, phi, c.dec),
        // formula 14.1 of "Astronomical Algorithms" 2nd edition by Jean Meeus (Willmann-Bell, Richmond) 1998.
        pa = atan(sin(H), tan(phi) * cos(c.dec) - sin(c.dec) * cos(H));

    h = h + astroRefraction(h); // altitude correction for refraction

    return {
        azimuth: azimuth(H, phi, c.dec),
        altitude: h,
        distance: c.dist,
        parallacticAngle: pa
    };
};


// calculations for illumination parameters of the moon,
// based on http://idlastro.gsfc.nasa.gov/ftp/pro/astro/mphase.pro formulas and
// Chapter 48 of "Astronomical Algorithms" 2nd edition by Jean Meeus (Willmann-Bell, Richmond) 1998.

SunCalc.getMoonIllumination = function (date) {

    var d = toDays(date || new Date()),
        s = sunCoords(d),
        m = moonCoords(d),

        sdist = 149598000, // distance from Earth to Sun in km

        phi = acos(sin(s.dec) * sin(m.dec) + cos(s.dec) * cos(m.dec) * cos(s.ra - m.ra)),
        inc = atan(sdist * sin(phi), m.dist - sdist * cos(phi)),
        angle = atan(cos(s.dec) * sin(s.ra - m.ra), sin(s.dec) * cos(m.dec) -
                cos(s.dec) * sin(m.dec) * cos(s.ra - m.ra));

    return {
        fraction: (1 + cos(inc)) / 2,
        phase: 0.5 + 0.5 * inc * (angle < 0 ? -1 : 1) / Math.PI,
        angle: angle
    };
};


function hoursLater(date, h) {
    return new Date(date.valueOf() + h * dayMs / 24);
}

// calculations for moon rise/set times are based on http://www.stargazing.net/kepler/moonrise.html article

SunCalc.getMoonTimes = function (date, lat, lng, inUTC) {
    var t = new Date(date);
    if (inUTC) t.setUTCHours(0, 0, 0, 0);
    else t.setHours(0, 0, 0, 0);

    var hc = 0.133 * rad,
        h0 = SunCalc.getMoonPosition(t, lat, lng).altitude - hc,
        h1, h2, rise, set, a, b, xe, ye, d, roots, x1, x2, dx;

    // go in 2-hour chunks, each time seeing if a 3-point quadratic curve crosses zero (which means rise or set)
    for (var i = 1; i <= 24; i += 2) {
        h1 = SunCalc.getMoonPosition(hoursLater(t, i), lat, lng).altitude - hc;
        h2 = SunCalc.getMoonPosition(hoursLater(t, i + 1), lat, lng).altitude - hc;

        a = (h0 + h2) / 2 - h1;
        b = (h2 - h0) / 2;
        xe = -b / (2 * a);
        ye = (a * xe + b) * xe + h1;
        d = b * b - 4 * a * h1;
        roots = 0;

        if (d >= 0) {
            dx = Math.sqrt(d) / (Math.abs(a) * 2);
            x1 = xe - dx;
            x2 = xe + dx;
            if (Math.abs(x1) <= 1) roots++;
            if (Math.abs(x2) <= 1) roots++;
            if (x1 < -1) x1 = x2;
        }

        if (roots === 1) {
            if (h0 < 0) rise = i + x1;
            else set = i + x1;

        } else if (roots === 2) {
            rise = i + (ye < 0 ? x2 : x1);
            set = i + (ye < 0 ? x1 : x2);
        }

        if (rise && set) break;

        h0 = h2;
    }

    var result = {};

    if (rise) result.rise = hoursLater(t, rise);
    if (set) result.set = hoursLater(t, set);

    if (!rise && !set) result[ye > 0 ? 'alwaysUp' : 'alwaysDown'] = true;

    return result;
};


// export as Node module / AMD module / browser variable
if (typeof exports === 'object' && typeof module !== 'undefined') module.exports = SunCalc;
else if (typeof define === 'function' && define.amd) define(SunCalc);
else window.SunCalc = SunCalc;

}());


