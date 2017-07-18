

// function converttime(datetime){
// 	if (isNaN(datetime)){
// 		return "Invalid";
// 	}
// 	else{
// 		var h = datetime.getHours();
// 		var m = datetime.getMinutes();
// 		var hour = h;
// 		var min = m;
// 		if (h < 10){
// 			hour = '0' + h;
// 		}
// 		if (m < 10){
// 			min = '0' + m;
// 		}
// 		return hour + ":" + min + " " + datetime.toString().match(/\(([A-Za-z\s].*)\)/)[1];
// 	}
// };

// function converttime2(datetime){
// 	if (isNaN(datetime)){
// 		return "-";
// 	}
// 	else{
// 		var h = datetime.getHours();
// 		var m = datetime.getMinutes();
// 		var hour = h;
// 		var min = m;
// 		if (h < 10){
// 			hour = '0' + h;
// 		}
// 		if (m < 10){
// 			min = '0' + m;
// 		}
// 		return hour + ":" + min + " " + datetime.toString().match(/\(([A-Za-z\s].*)\)/)[1];
// 	}
// };


// // Pray Time
// var praytime = SunCalc.prayTimes(date, lat, lng);
// console.log(praytime);

// document.getElementById("subuh").innerHTML = converttime(praytime['subuh']);
// document.getElementById("dzuhur").innerHTML = converttime(praytime['dzuhur']);
// document.getElementById("ashar").innerHTML = converttime(praytime['ashar']);
// document.getElementById("maghrib").innerHTML = converttime(praytime['maghrib']);
// document.getElementById("isya").innerHTML = converttime(praytime['isya']);


//Kaaba Time

// var date = new Date();
// var lat = 50;
// var lng = -70.5886011;
// var sunpos = SunCalc.kiblaTimes(date, lat, lng, 120);
// console.log("yaya: ", sunpos);
// document.getElementById("indir").innerHTML = converttime2(sunpos['indir']);
// document.getElementById("outdir").innerHTML = converttime2(sunpos['outdir']);
// document.getElementById("rightangle1").innerHTML = converttime2(sunpos['rightangle1']);
// document.getElementById("rightangle2").innerHTML = converttime2(sunpos['rightangle2']);


// var date = new Date();
// var lat = -7;
// var lng = -70.5886011;
// var sunpos = SunCalc.kiblaTimes(date, lat, lng, 65);
// console.log("mama: ", sunpos);
