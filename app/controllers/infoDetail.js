var args = arguments[0] || {};
var urlCollection = Alloy.Collections.info_urlModel;

//-----------------------------------------------------------
// Args skickade från listvy
//-----------------------------------------------------------
try {
	$.lblInfoTitle.text = args.name || "Title";
	$.lblInfoText.text = args.infoTxt || "Info";
	$.infoImg.image = "/pics/" + args.img;
	var id = args.id;
	
} catch(e) {
	newError("Något gick fel när sidan skulle laddas, prova igen!", "infoDetail - load data into labels");
}

setRowData();

function showinfoDetails(info) {
	try {
		var selectedInfo = info.row;
		var args = {
			id : selectedInfo.id,
			name : selectedInfo.name,
			infoTxt : selectedInfo.infoTxt,
			link : selectedInfo.link,
			img : selectedInfo.image,
			desc : selectedInfo.desc
		};

		var infoDetail = Alloy.createController("infoDetail", args).getView();
		infoDetail.open();
	} catch(e) {
		newError("Något gick fel när sidan skulle laddas, prova igen!", "infoDetail - showInfoDetail");
	}
}

//-----------------------------------------------------------
// sätter alla items i listan
//-----------------------------------------------------------
function setRowData() {
	try {
		var tableViewData = [];
		urlCollection.fetch({
			query : 'SELECT * from info_urlModel WHERE info_id ="' + id + '"'
		});

		var urlJson = urlCollection.toJSON();

		for (var i = 0; i < urlJson.length; i++) {
			var row = Ti.UI.createTableViewRow({
				id : urlJson[i].id,
				height : '60dp',
				top : '0dp',
				hasChild : true
			});

			var linkName = Ti.UI.createLabel({
				width : Ti.UI.FILL,
				left : '15dp',
				right : '15dp',
				font : {
					fontSize : '13dp',
				},
				color : '#0098C3',
				text : urlJson[i].linkname
			});

			row.add(linkName);
			tableViewData.push(row);
		}

		if (tableViewData.length > 0) {
			$.tableView.data = tableViewData;
			$.lblLink.show();
		}
		else {
			$.lblLink.hide();
			$.tableView.height = 0;
		}

	} catch(e) {
		newError("Något gick fel när sidan skulle laddas, prova igen!", "infoList - setRowData");
	}
}

//-----------------------------------------------------------
// Hämtar all info som ska läsas in i listan
//-----------------------------------------------------------
function getLink(e) {

	var rowId = e.rowData.id;
	urlCollection.fetch({
		query : 'SELECT url FROM info_urlModel WHERE id = "' + rowId + '"'
	});

	var jsonObj = urlCollection.toJSON();
	var web = jsonObj[0].url;

	openLink(web);
}


//-----------------------------------------------------------
// Öppnar url'en i en webView.
//-----------------------------------------------------------
function openLink(link) {
	try {
		var webview = Titanium.UI.createWebView({
			url : link
		});
		var window = Titanium.UI.createWindow();
		window.add(webview);
		Alloy.CFG.tabs.activeTab.open(window);
		
	} catch(e) {
		newError("Något gick fel när sidan skulle laddas, prova igen!", "infoDetail - openLink");
	}
}