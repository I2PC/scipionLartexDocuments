function changeMarketCode(marketCode, finalUrl, accessLoyalty) {
	$.ajax({
		type : "GET",
		dataType : "json",
		url : portalhref + "/rest/secure/changeMarket/"+marketCode+"/"+finalUrl,
		contentType : "application/json; charset=utf-8",
		async : false,
		cache : false,
		success : function(data) {
			console.log(data);
			if(!accessLoyalty) {
				Hydra.bus.publish('account', 'logoff');
			}
			window.location.href = data;
		}
	});
}