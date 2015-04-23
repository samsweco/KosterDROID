var args = arguments[0] || {};

showMap();
createMapRoute();
var familyMap;
displayTrailMarkers();
addClueZone();

var letterCollection = getLetterCollection();

//-----------------------------------------------------------
// Kontrollerar det inskickade ordet mot "facit"
//-----------------------------------------------------------
function checkWord() {
	var check = $.word.value;
	check.toLowerCase();

	if (check == word) {
		alert("Bra jobbat!");
	} else {
		alert("Nej du, nu blev det fel...");
	}
}

//-----------------------------------------
// Zoomar in kartan på äventyrsleden
//-----------------------------------------
function showMap() {
	try {
		familyMap = MapModule.createView({
			userLocation : true,
			mapType : MapModule.HYBRID_TYPE,
			animate : true,
			height : '100%',
			width : Ti.UI.FILL
		});
		$.showFamilyTrail.add(familyMap);

	} catch(e) {
		newError("Något gick fel när sidan skulle laddas, prova igen!", "interactive - showMap");
	}
}

//-----------------------------------------------------------
// Beräknar nivån av inzoomning på en vald led
//-----------------------------------------------------------
function calculateMapRegion(trailCoordinates) {
	try {
		if (trailCoordinates.length != 0) {
			var poiCenter = {};
			var delta = 0.02;
			var minLat = trailCoordinates[0].latitude,
			    maxLat = trailCoordinates[0].latitude,
			    minLon = trailCoordinates[0].longitude,
			    maxLon = trailCoordinates[0].longitude;
			for (var i = 0; i < trailCoordinates.length - 1; i++) {
				minLat = Math.min(trailCoordinates[i + 1].latitude, minLat);
				maxLat = Math.max(trailCoordinates[i + 1].latitude, maxLat);
				minLon = Math.min(trailCoordinates[i + 1].longitude, minLon);
				maxLon = Math.max(trailCoordinates[i + 1].longitude, maxLon);
			}

			var deltaLat = maxLat - minLat;
			var deltaLon = maxLon - minLon;

			delta = Math.max(deltaLat, deltaLon);
			// Ändra om det ska vara mer zoomat
			delta = delta * 0.6;

			poiCenter.lat = maxLat - parseFloat((maxLat - minLat) / 2);
			poiCenter.lon = maxLon - parseFloat((maxLon - minLon) / 2);

			region = {
				latitude : poiCenter.lat,
				longitude : poiCenter.lon,
				latitudeDelta : delta,
				longitudeDelta : delta

			};
		}
		return region;

	} catch(e) {
		newError("Något gick fel när sidan skulle laddas, prova igen!", "interactive - calculateMapRegion");
	}

}

//-----------------------------------------------------------
// skapar vandringsleden och sätter den på kartan
//-----------------------------------------------------------
function createMapRoute() {
	try {
		var zoomedRoute = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory + "/routes/adventureroute.json").read().text;
		var parsedRoute = JSON.parse(zoomedRoute);

		var geoArray = [];
		geoArray.push(parsedRoute);

		var coordArray = [];

		for (var u = 0; u < geoArray.length; u++) {
			var coords = geoArray[0].features[0].geometry.paths[u];

			for (var i = 0; i < coords.length; i++) {

				var point = {
					latitude : coords[i][1],
					longitude : coords[i][0]
				};
				coordArray.push(point);
			}

			var route = {
				name : 'Äventyrsleden',
				points : coordArray,
				color : 'purple',
				width : 4.0
			};

			familyMap.addRoute(MapModule.createRoute(route));
		}

		familyMap.region = calculateMapRegion(coordArray);
	} catch(e) {
		newError("Något gick fel när sidan skulle laddas, prova igen!", "interactive - createMapRoute");
	}
}

//-----------------------------------------------------------
// Visar marker för vandringsleden
//-----------------------------------------------------------
function displayTrailMarkers() {
	try {
		var markerAnnotation = MapModule.createAnnotation({
			latitude : 58.893198,
			longitude : 11.047852,
			title : 'Äventyrsleden',
			pincolor : MapModule.ANNOTATION_PURPLE,
			subtitle : 'Vandringsleden startar här!',
			font : {
				fontFamily : 'Gotham Rounded'
			}
		});

		familyMap.addAnnotation(markerAnnotation);

	} catch(e) {
		newError("Något gick fel när sidan skulle laddas, prova igen!", "interactive - displayTrailMarkers");
	}
}

function addClueZone() {
	var clueCollection = getLetterCollection();
	clueCollection.fetch({
		query : 'SELECT * FROM letterModel'
	});

	var jsonObjLetter = clueCollection.toJSON();

	for (var c = 0; c < jsonObjLetter.length; c++) {
		var markerAnnotation = MapModule.createAnnotation({
			id : 1,
			latitude : jsonObjLetter[c].latitude,
			longitude : jsonObjLetter[c].longitude
		});

		if (jsonObjLetter[c].found == 0) {
			markerAnnotation.image = '/images/red.png';
		} else {
			markerAnnotation.image = '/images/green.png';
		}

		familyMap.addAnnotation(markerAnnotation);
	}
}

function startInteractive(){
	Alloy.Globals.getGPSpos();
	loadClue();
}

function loadClue() {
		$.btnStartQuiz.hide();
		$.txtLetter.show();
		$.lblLetters.show();
		$.lblCollectedLetters.show();
		
	if (foundId == !null) {
		letterCollection.fetch({
			query : 'SELECT * FROM letterModel where id = "' + foundId + '"'
		});

		var letterJSON = letterCollection.toJSON();

		$.lblWelcome.text = "Nästa ledtråd: ";
		$.lblInfoText.text = letterJSON[0].clue;


	}
	
	else{
		Ti.API.info("foundId är null");
	}

}

function sendLetter() {
	checkLetter(getLetter());
}

function getLetter() {
	var letter = $.txtLetter.value;
	//if (validate(letter)) {
	return letter.toUpperCase();
	//};
}

function checkLetter(letterToCheck) {
	var correctLetter = false;

	letterCollection.fetch({
		query : 'SELECT * FROM letterModel where id = "' + foundId + '"'
	});

	var letterJSON = letterCollection.toJSON();
	//Skriv om denna loop så att den kollar id't på bokstaven, alltså platsen i arrayen och kollar om den stämmer...

	if (letterJSON[0].letter == letterToCheck) {
		lettersArray.push(letterJSON[0].letter);
		Ti.API.info(JSON.stringify(lettersArray));
		$.lblCollectedLetters.text += lettersArray;
	}
	else{
		alert("Är du säker på att det var rätt bokstav?");
	}
}