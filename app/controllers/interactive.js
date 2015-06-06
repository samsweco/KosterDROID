Ti.include("/geoFunctions.js");
Ti.include("/mapFunctions.js");

var args = arguments[0] || {};

var wrongWord = 0;
var correctLetters = "A, T, R, Ö, N, N, E, M, O";

$.lblInfoText.text = "Vandra äventyrslingan och leta efter de 9 bokstäverna som finns gömda längs leden! Försök sedan klura ut det hemliga ordet. Längs vägen kommer du få ledtrådar som hjälper dig finna bokstäverna. Du kan se bokstävernas ungefärliga läge med hjälp av gröna plupparna. Vi kommer även påminna dig när du börjar närma dig en bokstav.";

//-----------------------------------------------------------
// Hämtar letterCollection
//-----------------------------------------------------------
// try {
// var letterCollection = Alloy.Collections.letterModel;
// letterCollection.fetch();
// jsonCollection = letterCollection.toJSON();
// Alloy.Globals.jsonCollection = jsonCollection;
// } catch(e) {
// newError("Något gick fel när sidan skulle laddas, prova igen!", "Bokstavsjakten");
// }

//-----------------------------------------------------------
// Onload
//-----------------------------------------------------------
displayMap();

//-----------------------------------------------------------
// Visar kartan
//-----------------------------------------------------------
function displayMap() {
	$.showFamilyTrail.add(showDetailMap(interactiveMap, 7, 'Äventyrsleden', 'purple'));
	addClueZone();
	displaySpecificMarkers(7, interactiveMap);
	getSpecificIconsForTrail(7, interactiveMap);
	interactiveMap.addEventListener('click', function(evt) {
		if (evt.clicksource == 'rightButton') {
			showHotspot(evt.annotation.id);
		}
	});
}

//-----------------------------------------------------------
// Kickar igång spelet/jakten
//-----------------------------------------------------------
function startInteractive() {
	try {
		if (!Ti.Geolocation.locationServicesEnabled) {
			var alertDialog = Ti.UI.createAlertDialog({
				title : 'Påminnelser',
				message : 'Tillåt gpsen för att kunna få påminnelser när du närmar dig en bokstav!'
			});
			alertDialog.show();
		}

		Alloy.Globals.getUserPos('letter');
		loadClue(foundLetterId);
		interactiveGPS = true;

		// $.btnStartQuiz.hide();
		// $.btnStartQuiz.height = 0;
		//
		// $.txtLetter.show();
		// $.txtLetter.height = '35dp';
		//
		// $.lblLetters.show();
		// $.lblLetters.height = '40dp';
		//
		// $.lblCollectedLetters.show();
		// $.lblCollectedLetters.text = 'Bokstäver: ';
		//
		// $.viewNext.show();
		// $.viewNext.height = '60dp';
		//
		// $.nextClue.height = '30dp';
		//
		// $.horizontalView.show();
		// $.horizontalView.height = '75dp';

		$.btnStartQuiz.hide();
		$.btnStartQuiz.height = 0;

		$.txtLetter.show();
		$.txtLetter.height = '40dp';

		$.lblLetters.show();
		$.lblLetters.height = '40dp';

		$.lblCollectedLetters.show();

		$.viewNext.show();
		$.viewNext.height = '50dp';

		$.lblnextClue.show();
		$.lblnextClue.height = '25dp';

		$.nextClue.show();
		$.nextClue.height = '25dp';

		$.lbls1.hide();
		$.lbls1.height = 0;

		$.lbls2.hide();
		$.lbls2.height = 0;

		$.lbls3.hide();
		$.lbls3.height = 0;

		$.lbls4.hide();
		$.lbls4.height = 0;

		$.horizontalView.show();
		$.horizontalView.height = Ti.UI.SIZE;

	} catch(e) {
		newError("Något gick fel när sidan skulle laddas, prova igen!", "Bokstavsjakten");
	}
}

//-----------------------------------------------------------
// Laddar in nästa ledtråd om man inte hittar bokstaven
//-----------------------------------------------------------
function toNextClue() {
	try {
		var nextDialog = Ti.UI.createAlertDialog({
			title : 'Gå till nästa',
			message : 'Är du säker på att du inte hittar bokstaven?',
			buttonNames : ['Ja, visa nästa ledtråd', 'Stäng']
		});

		nextDialog.addEventListener('click', function(e) {
			if (e.index == 0) {
				if (jsonCollection[foundLetterId].found == 0) {
					foundLettersModel.fetch({
						'id' : (foundJSON.length + 1)
					});

					foundLettersModel.set({
						'letter' : '-',
						'found' : 1
					});

					foundLettersModel.save();
					getFound();
					foundLetterId++;
					loadClue(foundLetterId);
					$.lblCollectedLetters.text = 'Bokstäver:  ' + foundJSON;
				}
			}
		});

		nextDialog.show();
	} catch(e) {
		newError("Något gick fel när sidan skulle laddas, prova igen!", "Bokstavsjakten");
	}
}

function showCorrectLetters() {
	$.lblCorrectLetters.show();
	$.lblCorrectLetters.height = '40dp';
	$.lblCorrectLetters.text = correctLetters;
	$.btnShowCorrect.hide();
	$.btnShowCorrect.height = 0;
}

//-----------------------------------------------------------
// Laddar in nästa ledtråd om man inte hittar bokstaven
//-----------------------------------------------------------
function toNextClue(lId) {
	// try {
	var nextDialog = Ti.UI.createAlertDialog({
		title : 'Gå till nästa',
		message : 'Är du säker på att du vill visa nästa ledtråd?',
		buttonNames : ['Ja, visa nästa ledtråd', 'Stäng']
	});

	nextDialog.addEventListener('click', function(e) {
		if (e.index == 0) {
			setNoLetter(lId);
			loadClue(foundLetterId);
			setLabelText();
		}
	});

	nextDialog.show();
	// } catch(e) {
	// newError("Något gick fel när sidan skulle laddas, prova igen!", "Bokstavsjakten");
	// }
}

$.nextClue.addEventListener('click', function(e) {
	toNextClue(foundLetterId);
});

//-----------------------------------------------------------
// Läser upp rätt ledtråd
//-----------------------------------------------------------
function loadClue(id) {
	var col = fetchAllLetters();
	try {
		if (id < 10) {
			$.lblWelcome.text = "Ledtråd " + id + ":";
			$.lblInfoText.text = col[id - 1].clue;
		} else {
			allLetters();
		}
	} catch(e) {
		newError("Något gick fel när sidan skulle laddas, prova igen!", "Bokstavsjakten");
	}
}

Alloy.Globals.loadClue = loadClue;

//-----------------------------------------------------------
// Efter bokstaven validerats läses den upp bland de andra
// bokstäverna i en label
//-----------------------------------------------------------
function sendLetter() {
	try {
		var letter = $.txtLetter.value;
		var sendletter = letter.toUpperCase();

		checkLetter(sendletter);
	} catch(e) {
		newError("Något gick fel när sidan skulle laddas, prova igen!", "Bokstavsjakten");
	}
}

//-----------------------------------------------------------
// Validerar bokstaven som skrivits in, sätter found till
// 1 i letterModel och läser upp nästa ledtråd
//-----------------------------------------------------------
function checkLetter(letterToCheck) {
	try {
		var messageDialog = Ti.UI.createAlertDialog();

		if (letterToCheck.length > 1) {
			messageDialog.message = "Man får bara skriva in en bokstav.";
			messageDialog.title = 'Ojdå, nu blev det fel';
			messageDialog.buttonNames = ['Stäng'];

			messageDialog.show();
		} else if (letterToCheck.length < 1) {
			messageDialog.message = "Man måste skriva in en bokstav.";
			messageDialog.title = 'Ojdå, nu blev det fel';
			messageDialog.buttonNames = ['Stäng'];

			messageDialog.show();
		} else {
			messageDialog.message = "Vill du spara bokstaven " + letterToCheck + "?";
			messageDialog.title = 'Spara bokstav';
			messageDialog.buttonNames = ['Ja, jag vill spara!', 'Stäng'];

			messageDialog.addEventListener('click', function(e) {
				if (e.index == 0) {
					$.txtLetter.value = '';

					setLetterOne(foundLetterId, letterToCheck);
					setLabelText();

				}
			});

			messageDialog.show();

			// messageDialog.addEventListener('click', function(e) {
			// if (e.index == 0) {
			// $.txtLetter.value = '';
			//
			// foundLettersModel.fetch({
			// 'id' : foundLetterId
			// });
			// foundLettersModel.set({
			// 'letter' : letterToCheck,
			// 'found' : 1
			// });
			// foundLettersModel.save();
			//
			// jsonCollection[foundLetterId - 1].found = 1;
			//
			// // foundJSON.push(' ' + letterToCheck);
			// getFound();
			// foundLetterId++;
			// loadClue(foundLetterId);
			//
			// $.lblCollectedLetters.text = 'Bokstäver:  ' + foundJSON;
			// }
			// });
			//
			// messageDialog.show();
		}
	} catch(e) {
		newError("Något gick fel när sidan skulle laddas, prova igen!", "Bokstavsjakten");
	}
}

function setLabelText() {
	$.lblCollectedLetters.text = 'Bokstäver: ';
	var found = fetchFoundLettersCol();
	foundLetterId++;
	loadClue(foundLetterId);

	for (var i = 0; i < found.length; i++) {
		$.lblCollectedLetters.text += found[i].letter;
	}
}

//-----------------------------------------------------------
// Kontrollerar om användaren fått ihop alla bokstäver
//-----------------------------------------------------------
function allLetters() {
	try {
		if (foundLetterId > 9) {
			$.txtLetter.hide();
			$.txtLetter.height = 0;

			$.lblLetters.hide();
			$.lblLetters.height = 0;

			$.horizontalView.hide();
			$.horizontalView.height = 0;

			$.btnStartQuiz.height = 0;

			$.wordView.show();
			$.wordView.height = '80dp';

			$.viewNext.hide();
			$.viewNext.height = 0;

			$.txtWord.show();
			$.txtWord.height = '40dp';

			$.lblWord.show();
			$.lblWord.height = '40dp';

			$.lblWelcome.text = 'Skriv ordet du bildat av bokstäverna!';
			$.lblInfoText.text = 'Ledtråd: En svävande geléklump i havet.';
		}
	} catch(e) {
		newError("Något gick fel när sidan skulle laddas, prova igen!", "Bokstavsjakten");
	}
}

//-----------------------------------------------------------
// Kontrollerar det inskickade ordet mot "facit"
//-----------------------------------------------------------
function checkWord() {
	try {
		var check = $.txtWord.value;
		var checkword = check.toUpperCase();
		var alertDialog = Ti.UI.createAlertDialog({
			buttonNames : ['Stäng'],
			title : "Fel ord"
		});

		if (checkword == word) {

			$.lblWelcome.text = "Bra jobbat!";
			$.lblWelcome.fontSize = '30dp';

			$.lblInfoText.text = "Du hittade det rätta ordet!";

			$.lblCollectedLetters.text = '';
			$.lblCollectedLetters.hide();

			$.wordView.hide();
			$.wordView.height = 0;

			$.txtWord.hide();
			$.txtWord.height = 0;

			$.lblWord.hide();
			$.lblWord.height = 0;

			// $.lblWelcome.text = "Bra jobbat!";
			// $.lblWelcome.fontSize = '30dp';
			//
			// $.lblInfoText.text = "Du hittade det rätta ordet!";
			//
			// $.txtLetter.hide();
			// $.txtLetter.height = '0dp';
			//
			// $.lblLetters.hide();
			// $.lblLetters.height = '0dp';
			//
			// $.lblCollectedLetters.text = '';
			// $.lblCollectedLetters.hide();
			//
			// $.wordView.visible = false;
			// $.wordView.height = 0;
			// $.horizontalView.visible = false;
			// $.horizontalView.height = 0;

			Alloy.Globals.stopGame();
			interactiveGPS = false;
		} else {
			alertDialog.message = "Försök igen! Du har snart klurat ut det!";
			alertDialog.show();
		}
	} catch(e) {
		newError("Något gick fel när sidan skulle laddas, prova igen!", "Bokstavsjakten");
	}
}

//-----------------------------------------------------------
// Eventlistener för att rensa de funna bokstäverna när appen stängs
//-----------------------------------------------------------
Titanium.App.addEventListener('close', function() {
	startOver();
});

var cleanup = function() {
	stopGPS();
	$.destroy();
	$.off();
	$.interactiveWin = null;
};

$.interactiveWin.addEventListener('close', cleanup);
