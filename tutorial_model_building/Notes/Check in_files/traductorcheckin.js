function setLang(lang){
	currentlang = lang;	
	switch (lang){				
		case 'es': case 'ES':

			$('#WPHdescripcion').html("Online Check-In for this route is temporarily disabled.  Boarding Passes must be obtained at the airport<div class='separator'></div>Check-In online para esta ruta temporalmente deshabilitado.  Debe obtener las tarjetas de embarque  en el aeropuerto");

		break;
		case 'en': case 'EN':	

			$('#WPHdescripcion').html("Online Check-In for this route is temporarily disabled.  Boarding Passes must be obtained at the airport<div class='separator'></div>Check-In online para esta ruta temporalmente deshabilitado.  Debe obtener las tarjetas de embarque  en el aeropuerto");

		break;

		case 'fr': case 'FR':	

			$('#WPHdescripcion').html("Online Check-In for this route is temporarily disabled.  Boarding Passes must be obtained at the airport<div class='separator'></div>Check-In online para esta ruta temporalmente deshabilitado.  Debe obtener las tarjetas de embarque  en el aeropuerto");

		break;
		case 'it': case 'IT':	

			$('#WPHdescripcion').html("Online Check-In for this route is temporarily disabled.  Boarding Passes must be obtained at the airport<div class='separator'></div>Check-In online para esta ruta temporalmente deshabilitado.  Debe obtener las tarjetas de embarque  en el aeropuerto");
		break;
		case 'de': case 'DE':	

			$('#WPHdescripcion').html("Online Check-In for this route is temporarily disabled.  Boarding Passes must be obtained at the airport<div class='separator'></div>Check-In online para esta ruta temporalmente deshabilitado.  Debe obtener las tarjetas de embarque  en el aeropuerto");
		break;	
		case 'nl': case 'NL':	

			
			$('#WPHdescripcion').html("Online Check-In for this route is temporarily disabled.  Boarding Passes must be obtained at the airport<div class='separator'></div>Check-In online para esta ruta temporalmente deshabilitado.  Debe obtener las tarjetas de embarque  en el aeropuerto");
		break;	
		case 'pt': case 'PT':	

			
			$('#WPHdescripcion').html("Online Check-In for this route is temporarily disabled.  Boarding Passes must be obtained at the airport<div class='separator'></div>Check-In online para esta ruta temporalmente deshabilitado.  Debe obtener las tarjetas de embarque  en el aeropuerto");
		break;		
		default:	
			
			$('#WPHdescripcion').html("Online Check-In for this route is temporarily disabled.  Boarding Passes must be obtained at the airport<div class='separator'></div>Check-In online para esta ruta temporalmente deshabilitado.  Debe obtener las tarjetas de embarque  en el aeropuerto");		break;
		
	}
}





function closepromopopup(){
	  var e = { event: "wphEvt_closepromopopup", data: ''};
	  if (parent && parent.postMessage && document.referrer!='') parent.postMessage(JSON.stringify(e), document.referrer);
}	

function shakeInput() {
   var l = 10;  
   for( var i = 0; i < 10; i++ )   
 	$( "#getit" ).animate( { 
     'margin-left': "+=" + ( l = -l ) + 'px',
     'margin-right': "-=" + l + 'px'
  }, 50);  

 }



 function setBackgroundImg(){
	currentBackImg = Math.floor(Math.random()*4)+1;
	switch (currentBackImg){		
	  		case 1:
			$('#promoimgslider')
			        .fadeOut(100, function() {
			           $('#promoimgslider').attr("src",window.location.protocol+'//llamamegratis.es/aireuropa/img/fly.png');
			        })
			        .fadeIn(100);
	  			//$('#promoimgslider').attr("src",window.location.protocol+'//llamamegratis.es/aireuropa/img/fly.png');
	  		break;
	  		case 2:
	  		$('#promoimgslider')
			        .fadeOut(100, function() {
			           $('#promoimgslider').attr("src",window.location.protocol+'//llamamegratis.es/aireuropa/img/maletas.png');
			        })
			        .fadeIn(100);
	  			//$('#promoimgslider').attr("src",window.location.protocol+'//llamamegratis.es/aireuropa/img/maletas.png');

			break;
			case 3:
			$('#promoimgslider')
			        .fadeOut(100, function() {
			           $('#promoimgslider').attr("src",window.location.protocol+'//llamamegratis.es/aireuropa/img/asientos.png');
			        })
			        .fadeIn(100);

				//$('#promoimgslider').attr("src",window.location.protocol+'//llamamegratis.es/aireuropa/img/asientos.png');
			break;			
	}

	
}/*

BLACKFRIDAY25CJ
                25%,     
               Todas las rutas
               Para volar del 15ene al 15jun

•         BLACKFRIDAY40CJ
               40%
               Para volar de cualquier origen a MVD/MIA/GRU/SSA (Montevideo, Miami, Sao Paulo y Salvador de Bahía)
               Para volar entre el 15ene-15mar y entre el 10abr-15jun

•         BLACKFRIDAY50CJ
               50%
               Para volar de cualquier origen a FRA/BRU/TLV (Frankfurt, Bruselas y Tel Aviv)
               Para volar entre  5ene-15mar y entre 10abr-15jun*/

var i = 0; var path = new Array(); 

// LIST OF IMAGES 
path[0] = "fly.png"; 
path[1] = "skyline.png"; 
path[2] = "maletas.png"; 
path[3] = "ruta.png"; 
path[4] = "cola.png"; 
path[5] = "coru.png"; 


function swapImage() { document.promoimgslider.src = window.location.protocol+'//llamamegratis.es/aireuropa/img/' + path[i]; 
if(i < path.length - 1) i++; 
else i = 0; setTimeout("swapImage()",5000); 
} 

function showTooltip() {
	/*setTimeout(function(){$('.inlineTooltip').trigger('mouseover');}, 20000);
	setTimeout(function(){$('.inlineTooltip').trigger('mouseout');},  25000);
	setTimeout("showTooltip()",60000);*/
}

//window.onload=swapImage;

/*$(document).ready(function(){
	setInterval(function(){ setBackgroundImg(); }, 5000);
	
});*/