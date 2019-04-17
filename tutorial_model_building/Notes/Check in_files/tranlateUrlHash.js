$(function() {
	
	//obtenemos la url
	var pathname = window.location.pathname;
	var hash = window.location.hash;
	
	if(hash != ''){
		var alias = pathname + hash;
		//buscamos la traduccion
		var translate = '';
		$.ajax({
			type : "POST",
			dataType : "json",
			url : portalhref + "/rest/hashTranlate",
			data : JSON.stringify(alias),
			contentType : "application/json; charset=utf-8",
			async : false,
			cache : false,
			success : function(data) {
				translate = data;
				
				if(translate != ''){
					//Modificamos la url
					var ancla = '#'+translate
					window.location.hash = ancla;
					//posicinamos en el ancla correspondiente
					var position = $(ancla).position();
					window.scrollTo(position);
				}
				
			}
		});
		
		
	}
});

function translateCmsUrl(idInput) {
	
	var input = $('#'+idInput.replace(/\//g,"\\/"));
	
	var old_traducion= input.attr('name');
	var pagenameTranlate = input.attr('pagenameTranlate');
	var traducion = (input.val()).replace(/\s+/g, '');
	traducion = limpiar(traducion);
	var regla_old;
	var regla_new;
	
	if(typeof pagenameTranlate !== 'undefined'){
		regla_old ="/"+pagenameTranlate+"#"+old_traducion;
		regla_new ="/"+pagenameTranlate+"#"+traducion;
	}else{
		regla_old ="/"+old_traducion;
		regla_new ="/"+traducion;
	}
	
	var msg = 'ATENCION: Se van a modificar la url "' + regla_old + '" por la url ="' + regla_new + '". ¿Desea ejecutar esta acción?';
	if (confirm(msg)){
	
		var object = {regla_old:regla_old,regla_new:regla_new};
		
		//"regla_old":"/pt/voos/condiciones",
		//"regla_new":"/pt/voos/condicoes"
		$.ajax({
			type : "POST",
			dataType : "json",
			contentType : "application/json; charset=utf-8",
			url : portalhref + "/rest/secure/admin/ruleTranslate",
			data : JSON.stringify(object),
			async : false,
			cache : false,
			success : function(data) {
				var respuesta = data[0];
				if(respuesta == 'OK'){
					alert(data[0]+ ": "+data[1] +" Recargamos página");
					activacionTranlateCms();
				}else{
					alert(data[0]+ ": "+data[1]);
				}
			}
		});
	}
}

function createCmsUrl(idInput) {

	var input = $('#' + idInput.replace(/\//g,"\\/"));
	
	var pagenameTranlate = input.attr('pagenameTranlate');
	var traducion = (input.val()).replace(/\s+/g, '');
	traducion = limpiar(traducion);
	var translate;
	if(typeof pagenameTranlate !== 'undefined')
		translate = pagenameTranlate + traducion;
	else
		translate = traducion;
	
	var msg = 'ATENCION: Se va a crear la url "' + translate
			+ '". ¿Desea ejecutar esta acción?';
	if (confirm(msg)) {
		if (traducion != "") {
			var estatic = input.attr('estatica');
			var niveles = input.attr('niveles');

			var fija;
			if(typeof niveles !== 'undefined')
				fija = niveles + estatic;
			else
				fija = "/" + estatic;

			var object = {
				idioma : langCode,
				producto : productName,
				estatica : {
					part_fija : fija,
					part_translate : translate
				}
			};

			$.ajax({
				type : "POST",
				dataType : "json",
				contentType : "application/json; charset=utf-8",
				url : portalhref + "/rest/secure/admin/createRule",
				data : JSON.stringify(object),
				async : false,
				cache : false,
				success : function(data) {
					alert(data + " Recargamos página");
					activacionTranlateCms();
				}
			});
		} else {
			alert("ERROR: La traducción esta vacia");
		}
	}

}

function activacionTranlateCms(claveString, valorString) {
	var object = {clave:claveString, valor:valorString};
	$.ajax({
		type : "POST",
		dataType : "json",
		url : portalhref + "/rest/secure/admin/activacionTranlateCms",
		contentType : "application/json; charset=utf-8",
		data : JSON.stringify(object),
		async : false,
		cache : false,
		success : function(data) {
			location.reload();
		}
	});
}

function validarn(e) { 
    tecla = (document.all) ? e.keyCode : e.which; 
    if (tecla==8) return true; 
	if (tecla==9) return true; 
	if (tecla==11) return true; 
    patron =/[a-zA-Z0-9\/_-]/; 
 
    te = String.fromCharCode(tecla); 
    return patron.test(te); 
} 
 
function limpiar(texto){
    var text = texto.toLowerCase(); // a minusculas
    text = text.replace(/[áàäâå]/, 'a');
    text = text.replace(/[éèëê]/, 'e');
    text = text.replace(/[íìïî]/, 'i');
    text = text.replace(/[óòöô]/, 'o');
    text = text.replace(/[úùüû]/, 'u');
    text = text.replace(/[ýÿ]/, 'y');
    text = text.replace(/[ñ]/, 'n');
    return text
}
