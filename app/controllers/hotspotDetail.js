var args = arguments[0] || {};

$.lblHotspotName.text = args.title || "Name";
$.lblHotspotInfoTxt.text = args.infoTxt || "Info";

var hotspotId = args.id || "Id";
var picId = args.filename || "filename";

setPics();
//setPicText();

//-----------------------------------------------------------
// Sätter bilder till bildspelet
//-----------------------------------------------------------
function setPics() {
	try {
		selectHotspotPics();
	} catch(e) {
		newError("Något gick fel när sidan skulle laddas, prova igen!", "HotspotDetail - setPics");
	}
}

//-----------------------------------------------------------
// Hämtar bilder för bildspelet
//-----------------------------------------------------------
function selectHotspotPics() {
	try {
	
		Ti.API.info('id : ' + hotspotId);
		
		var mediaCollection = getMediaCollection();
		mediaCollection.fetch({
			query : 'SELECT * FROM mediaModel WHERE hotspot_id = "' + hotspotId + '"'
		});
		var jsonMedia = mediaCollection.toJSON();

		for (var i = 0; i < jsonMedia.length; i++) {

			var img_view = Ti.UI.createView({
				backgroundColor : 'green',
				backgroundImage : "/pics/" + jsonMedia[i].filename + '.png',	
				width : '100%',
				height : '240dp' ,
				top : '0dp'
				});

			var lblImgTxt = Ti.UI.createLabel({
				left : '5dp',
				top : '0dp',
				text : jsonMedia[i].img_txt,
				color : 'white',
				font : {
					fontSize : '12dp',
					fontStyle : 'italic',
					textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
					fontFamily: 'Raleway-Light'
				},
				
			});

			var backgroundView = Ti.UI.createView({
				layout : 'vertical',
				backgroundColor : 'black',
				height : Ti.UI.SIZE,
				width : Ti.UI.SIZE
			});

			backgroundView.add(img_view);
			backgroundView.add(lblImgTxt);
			
			$.slideShowHotspotDetail.addView(backgroundView);
			//$.slideShowHotspotDetail.add(lblImgTxt);
		}

	} catch(e) {
		newError("Något gick fel när sidan skulle laddas, prova igen!", "HotspotDetail - selectHotspotPics");
	}
}

//---------------------------------------------------------
//Sätter bildtexter till hotspotsen
//---------------------------------------------------------
function setPicText() {

	var textCollection = Alloy.Collections.mediaModel;
	textCollection.fetch('SELECT img_txt FROM mediaModel where filename = anemon.png');

	txt = textCollection.toJSON();
	text = JSON.stringify(txt);
}

