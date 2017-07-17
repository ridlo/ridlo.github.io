var date = new Date();
var lat = -33.4486;
var lng = -70.66636;

var times = SunCalc.getTimes(date, lat, lng);
console.log(times);
var pos = SunCalc.getPosition(date, lat, lng)
console.log(pos)

// Pray Time
var praytime = SunCalc.prayTimes(date, lat, lng);
console.log(praytime);

function converttime(datetime){
	if (isNaN(datetime)){
		return "Invalid";
	}
	else{
		var h = datetime.getHours();
		var m = datetime.getMinutes();
		var hour = h;
		var min = m;
		if (h < 10){
			hour = '0' + h;
		}
		if (m < 10){
			min = '0' + m;
		}
		return hour + ":" + min + " " + datetime.toString().match(/\(([A-Za-z\s].*)\)/)[1];
	}
};

document.getElementById("subuh").innerHTML = converttime(praytime['subuh']);
document.getElementById("dzuhur").innerHTML = converttime(praytime['dzuhur']);
document.getElementById("ashar").innerHTML = converttime(praytime['ashar']);
document.getElementById("maghrib").innerHTML = converttime(praytime['maghrib']);
document.getElementById("isya").innerHTML = converttime(praytime['isya']);


// Kaaba Time
function converttime2(datetime){
	if (isNaN(datetime)){
		return "-";
	}
	else{
		var h = datetime.getHours();
		var m = datetime.getMinutes();
		var hour = h;
		var min = m;
		if (h < 10){
			hour = '0' + h;
		}
		if (m < 10){
			min = '0' + m;
		}
		return hour + ":" + min + " " + datetime.toString().match(/\(([A-Za-z\s].*)\)/)[1];
	}
};

var sunpos = SunCalc.kiblaTimes(date, lat, lng, -81);

document.getElementById("indir").innerHTML = converttime2(sunpos['indir']);
document.getElementById("outdir").innerHTML = converttime2(sunpos['outdir']);
document.getElementById("rightangle1").innerHTML = converttime2(sunpos['rightangle1']);
document.getElementById("rightangle2").innerHTML = converttime2(sunpos['rightangle2']);
