var date = new Date();
var lat = -33.4486;
var lng = -70.66636;

// console.log(QiblaFinder.pos)

// var sunPos = SunCalc.getPosition(date, lat, lng);
// console.log(sunPos);

// var times = SunCalc.getTimes(date, lat, lng);
// console.log(times);

var praytime = SunCalc.prayTimes(date, lat, lng);
console.log(praytime);

var sunpos = SunCalc.kiblaTimes(date, lat, lng, 81);
console.log(sunpos);



