window.updateGtm = function(dataLayerValues) {

  /* Define dataLayerValues in case the param is void */
  if (!dataLayerValues) dataLayerValues = {};

  /* Define product name for transactionProductName */
  if (typeof dataLayerValues.origen != 'undefined' &&
      typeof dataLayerValues.destino != 'undefined' &&
      typeof dataLayerValues.ow != 'undefined')
  {
      var transactionProductName = '';
      transactionProductName += (dataLayerValues.ow == 'S') ? 'OW' : 'RT';
      transactionProductName += '-'+dataLayerValues.origen+'-'+dataLayerValues.destino;
  }

  /* Update values */
  var newDataLayer = {

    'event'                : 'FireTags',

    'pageArea'             : dataLayerValues.pageArea || '',
    'pageCategory'         : dataLayerValues.pageCategory || '',
    'pageContent'          : dataLayerValues.pageContent || '',

    'firstView'            : dataLayerValues.firstView || '',

    'tag.pagina'           : dataLayerValues.pagina || '',

    'tag.ow'               : dataLayerValues.ow || '',
    'tag.business'         : dataLayerValues.business || '',
    'tag.fareFamilyIda'    : dataLayerValues.fareFamilyIda || '',
    'tag.fareFamilyVuelta' : dataLayerValues.fareFamilyVuelta || '',
    'tag.origen'           : dataLayerValues.origen || '',
    'tag.destino'          : dataLayerValues.destino || '',
    'tag.fechaida'         : dataLayerValues.fechaida || '',
    'tag.fecharegreso'     : dataLayerValues.fecharegreso || '',
    'tag.residente'        : dataLayerValues.residente || '',
    'tag.numpax'           : dataLayerValues.numpax || '',
    'tag.expediente'       : dataLayerValues.expediente || '',
    'tag.valorventa'       : dataLayerValues.valorventa || '',
    'tag.valordivisa'      : dataLayerValues.valordivisa || '',
    'tag.divisa'           : dataLayerValues.divisa || '',
    'tag.mercado'          : window.market || '',
    'tag.amadeus'          : dataLayerValues.amadeus || '',

    'tag.asientoida'       : dataLayerValues.asientoida || '',
    'tag.asientovuelta'    : dataLayerValues.asientovuelta || '',
    'tag.equipajeida'      : dataLayerValues.equipajeida || '',
    'tag.equipajevuelta'   : dataLayerValues.equipajevuelta || '',
    'tag.seguro'           : dataLayerValues.seguro || '',
    'tag.opcioncambio'     : dataLayerValues.opcioncambio || '',

    'transactionId'        : dataLayerValues.expediente || '',
    'transactionTotal'     : dataLayerValues.valorventa || '',

    'tag.formapago'        : dataLayerValues.formapago || '',

    'tag.market'           : window.market || '',
    'tag.lang'             : window.langCode || '',

    'tag.usuario-suma'     : User.isLoggedIn() ? 'SI' : 'NO',
    'tag.puntos-SUMA'      : localStorage.ly_acumulatedMiles || '',
    'tag.id-SUMA'          : localStorage.ly_frequentFlyerIdentity || '',
    'tag.nivel-SUMA'       : localStorage.ly_loyaltyTierType || '',

    'tag.errors'           : dataLayerValues.errors || [],

    'transactionProducts': [
      {
        'sku'              : dataLayerValues.amadeus || '',
        'name'             : transactionProductName || '',
        'category'         : dataLayerValues.business || '',
        'price'            : dataLayerValues.valorventa || '',
        'quantity'         : dataLayerValues.numpax || ''
      }
    ],
    'canjeo-millas':dataLayerValues['canjeo-millas'] || '',
    'millas-canjeadas':dataLayerValues['millas-canjeadas'] || ''
  };

  //console.log('dataLayer:', newDataLayer);

  /* Push event FireTags to dataLayer */
  dataLayer.push(newDataLayer);

};

window.getGTMPageData = function(restofurl){
  var result = {};

  if (  (restofurl === "equipaje" )
      || (restofurl === "seguridad" )
      || (restofurl === "pasajeros" )
      || (restofurl === "condiciones" )
      || (restofurl === "documentacion" )
      || (restofurl === "turista" )
      || (restofurl === "business" )
      )
  {
    result = {
      'pageArea': 'Estáticas',
      'pageCategory': 'Información',
      'pageContent': restofurl
    }
  }
  else if ((restofurl === "otros-telefonos" )
      || (restofurl === "oficinas" )
      || (restofurl === "contacto" )
      )
  {
    result = {
      'pageArea': 'Estáticas',
      'pageCategory': 'Soporte',
      'pageContent': restofurl
    }
  }
  else if (restofurl ==='home')
  {
    result = {
      'pageArea': 'Home',
      'pageCategory': 'Home',
      'pageContent': 'Home'
    }
  }
  else if (restofurl === 'ancillaries')
  {
    result = {
      'pageArea': 'Estáticas',
      'pageCategory': 'Servicios',
      'pageContent': restofurl
    }
  }
  else if (restofurl === 'app')
  {
    result = {
      'pageArea': 'Estáticas',
      'pageCategory': 'App',
      'pageContent': restofurl
    }
  }
  else if (restofurl === 'corporativo')
  {
    result = {
      'pageArea': 'Estáticas',
      'pageCategory': 'Corporativo',
      'pageContent': restofurl
    }
  }
  else if( (restofurl === 'suma')
		  	|| (restofurl === "fidelizacion" )) {
	var anchor = '';
	if(window.location.hash) {
		anchor = $(window.location.hash).attr('data-anchor');
	}
	if(anchor === '' || anchor === 'quienes-somos') {
	  result = {
	    'pageArea': 'SUMA-informacion',
	    'pageCategory': 'home'
	  }
	} else {
		if(anchor === 'nuestros-partners') {
		  updateGtm({
            'pageArea': 'SUMA-informacion',
            'pageCategory': 'colaboradores',
            'pageContent': 'home'
          });
		} else if(anchor === 'faq') {
			updateGtm({
	            'pageArea': 'SUMA-informacion',
	            'pageCategory': 'preguntas-frecuentes',
	            'pageContent': 'home'
	          });
		} else {
		  updateGtm({
            'pageArea': 'SUMA-informacion',
            'pageCategory': anchor
          });
		}
	}
  }
  else if(restofurl === 'preguntas_frecuentes') {
    result = {
      'pageArea': 'SUMA-informacion',
      'pageCategory': 'preguntas-frecuentes',
      'pageContent': 'home'
    }
  }
  else if(restofurl === 'amazon' ||
          restofurl === 'cepsa' ||
          restofurl === 'europcar' ||
          restofurl === 'halcon_viajes' ||
          restofurl === 'belive' ||
          restofurl === 'nh') {
    result = {
      'pageArea': 'SUMA-informacion',
      'pageCategory': 'colaboradores',
      'pageContent': 'noaereos-'+restofurl.replace('_','')
    }
  }
  else if(restofurl === 'aeroflot' ||
          restofurl === 'aerolineas_argentinas' ||
          restofurl === 'aeromexico' ||
          restofurl === 'airfrance' ||
          restofurl === 'alitalia'||
          restofurl === 'china_airlines' ||
          restofurl === 'china_eastern' ||
          restofurl === 'china_southern' ||
          restofurl === 'czech_airlines' ||
          restofurl === 'delta' ||
          restofurl === 'garuda_indonesia' ||
          restofurl === 'klm' ||
          restofurl === 'kenya_airways' ||
          restofurl === 'korean_air' ||
          restofurl === 'tarom' ||
          restofurl === 'vietnam_airlines' ||
          restofurl === 'xiamen_air' ||
          restofurl === 'saudi_arabian' ||
          restofurl === 'middle_east_air_liban') {
    result = {
      'pageArea': 'SUMA-informacion',
      'pageCategory': 'colaboradores',
      'pageContent': 'aerolineas-'+restofurl.replace('_','')
    }
  }
  else{
    result = {
      'pageArea': 'Estáticas',
      'pageCategory': 'Otros',
      'pageContent': restofurl
    }
  }

  return result;
};

window.getResultsViewName = function(viewName){
  var result = '';
  if (viewName === 'hour')
  {
    result = 'por horas';
  }else if (viewName === 'price'){
    result = 'por precio';
  }else{
    result = 'por matriz';
  }
  return result;
};

window.updateGtmLogin = function(){
  dataLayer.push({
'event' : 'FireSumaLogin',
'login-SUMA': 'usuario-logeado',
'puntos-SUMA': localStorage.ly_accumulatedMiles || '',
'id-SUMA': localStorage.ly_frequentFlyerIdentity || '',
'nivel-SUMA': localStorage.ly_loyaltyTierType || '',
'mercado'        : window.market || '',
'market'         : window.market || '',
'lang'           : window.langCode || '',
}); 
}

window.updateGtmLoginOut = function(){
  dataLayer.push({
'event' : 'FireSumaLogin',
'login-SUMA': 'usuario-deslogeado',
'puntos-SUMA': localStorage.ly_accumulatedMiles || '',
'id-SUMA': localStorage.ly_frequentFlyerIdentity || '',
'nivel-SUMA': localStorage.ly_loyaltyTierType || '',
'mercado'        : window.market || '',
'market'         : window.market || '',
'lang'           : window.langCode || '',
}); 
}



