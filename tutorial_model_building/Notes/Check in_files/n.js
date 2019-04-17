/*!
 * y.v1.2.4-n.js
 * Copyright (c) 2016 Yieldr Labs B.V.
 */
!function(a,b){"use strict";function c(b,c,d){b.attachEvent?(b["e"+c+d]=d,b[c+d]=function(){b["e"+c+d](a.event)},b.attachEvent("on"+c,b[c+d])):b.addEventListener(c,d,!1)}function d(a,b,c){a.detachEvent?(a.detachEvent("on"+b,a[b+c]),a[b+c]=null):a.removeEventListener(b,c,!1)}function e(){return Math.floor(65536*(1+Math.random())).toString(16).substring(1)}function f(){return e()+e()+"-"+e()+"-"+e()+"-"+e()+"-"+e()+e()+e()}function g(a){for(var b={},c=0,d=a.length;d>c;c++)for(var e in a[c])a[c].hasOwnProperty(e)&&(b[e]=a[c][e]);return b}function h(a,b){for(var c in a)a.hasOwnProperty(c)&&b(c,a[c])}function i(a,b,c){var d={};return h(b,function(b,c){d[b]=k(a,c.split("."))}),c&&h(a,function(a,b){d[a]=b}),d}function j(a,b,c){if(c=c||{},b=b||"",a instanceof Function)j(a(),b,c);else if(a instanceof Array)for(var d=0,e=a.length;e>d;d++)j(a[d],b+"_"+d,c);else a instanceof Object?(b=b?b+"_":"",h(a,function(a,d){j(d,b+a,c)})):c[b]=a;return c}function k(a,b){if(a&&b.length>0){var c=b.shift();return k(a[c],b)}return a}function l(){return Math.floor((new Date).getTime()/1e3)}Array.prototype.indexOf||(Array.prototype.indexOf=function(a,b){var c;if(null==this)throw new TypeError('"this" is null or not defined');var d=Object(this),e=d.length>>>0;if(0===e)return-1;var f=+b||0;if(Math.abs(f)===1/0&&(f=0),f>=e)return-1;for(c=Math.max(f>=0?f:e-Math.abs(f),0);e>c;){if(c in d&&d[c]===a)return c;c++}return-1});var m=function(){function c(a){switch(a){case"html":return g;case"image":return d;case"script":return e;case"iframe":return f}return null}function d(a){var c=b.createElement("img");return c.width=0,c.height=0,c.border=0,c.style.display="none",c.style.visibility="hidden",c.src=a,c}function e(a){var c=b.createElement("script");return c.type="text/javascript",c.src=a,c.async=!0,c}function f(a){var c=b.createElement("iframe");return c.frameBorder=0,c.width=0,c.height=0,c.style.display="none",c.style.visibility="hidden",a&&(c.src=a),c}function g(c){var d=b.body.appendChild(f());return a.setTimeout(function(){var a=d.contentWindow.document;a.open(),a.write(c),a.close()},1),d}return{map:c,image:d,script:e,iframe:f,html:g}}(),n=function(){function a(a,c,d,e){var f=new Date;f.setDate(f.getDate()+d),b.cookie=a+"="+encodeURIComponent(c)+";expires="+f+";domain="+e+";path=/"}function c(a){var c="; "+b.cookie,d=c.split("; "+a+"=");return 2===d.length?decodeURIComponent(d.pop().split(";").shift()):""}return{get:c,set:a}}(),o=function(){function b(a,b){d.setItem(a,b)}function c(a){return d.getItem(a)}var d=a.sessionStorage||{getItem:function(){return""},setItem:function(){}};return{get:c,set:b}}(),p=function(){function a(a){return a.length>0&&-1===d.indexOf(a)&&d.push(a),e}function b(b,c){for(var d=b.split(c),f=0,g=d.length;g>f;f++)a(d[f]);return e}function c(a){return d.join(a)}var d=[],e={add:a,join:c,split:b};return e}(),q=function(){function a(a,b){var c=a.split("?");if(c.length>=2)for(var d=c[1].split("&"),e=0,f=d.length;f>e;e++){var g=d[e].split("=");2===g.length&&b(g[0],g[1])}}return{query:a}}(),r=function(){function a(a){var c=b(a);return-1!==f.indexOf(c)?"display":-1!==g.indexOf(c)?"search":"other"}function b(a){for(var b in e)if(-1!==a.search(b))return e[b];return c(a)}function c(a){return a.replace(/^https?\:\/\//,"").split(/[\/?#]/)[0]}function d(a){var c=b(a),d=null,e=function(b){var c=a.match(b);return c&&c.length>1?c[1]:null};switch(g.indexOf(c)){case 0:case 1:d=e(/q\=([\w\d-+_\%]*)/);break;case 2:d=e(/p\=([\w\d-+_\%]*)/)}return d}var e={"https?://(.*)criteo.([^/?]*)":"criteo","https?://(.*)doubleclick.([^/?]*)":"doubleclick","https?://(.*)turn.([^/?]*)":"turn","https?://(.*)adnxs.([^/?]*)":"appnexus","https?://(.*)rubiconproject.([^/?]*)":"rubicon","https?://(.*)254a.([^/?]*)":"yieldr","https?://(.*)google.([^/?]*)":"google","https?://(.*)bing.com":"bing","https?://(.*)yahoo.com":"yahoo"},f=["criteo","doubleclick","turn","appnexus","rubicon","yieldr"],g=["google","bing","yahoo"];return{name:b,type:a,clean:c,keywords:d}}(),s=a.YieldrTrackingObject||"y",t=a[s];t.stats=function(){function a(a,b){f[a]=b}function b(a){f[a]=f[a]||0,f[a]++}function c(a,b){f[a]?f[a].push(b):f[a]=[b]}function d(a){return f[a]}function e(){return f}var f={};return{get:d,set:a,incr:b,push:c,all:e}}(),t.callback=function(a){var c=[];if("success"===a.status){var d=b.getElementsByTagName("body")[0];t.stats.set("cases",a.data.cases||a.data.case_id),h(a.data,function(a,b){h(b,function(b,e){var f=m.map(a);f&&e&&(c.push(d.appendChild(f(e))),t.stats.push("piggybacks",e))})})}return t.stats.incr("callback"),c},t.fire=function(a){var c=[];h(a,function(a,b){void 0!==b&&c.push(encodeURIComponent(a)+"="+encodeURIComponent(b))});var d=b.createElement("script");d.src=b.location.protocol+"//"+t.domain+"/pixel?"+c.join("&");var e=b.getElementsByTagName("script")[0];return e.parentNode.insertBefore(d,e),t.stats.set("parameters",a),t.stats.incr("fire"),d},t.dl=function(a,b,c){b||(b={});var d=j(i(a,b,c));t.data=g([t.data,d])},t.ab=function(a){a||(a={a:.5,b:.5});var c=b.location.hostname,d=n.get("_yldr_ab",c);if(void 0===a[d]){var e=0;h(a,function(a,b){e+=b});var f=Math.random()*e,i=0;h(a,function(a,b){f>=i&&i+b>=f&&(d=a),i+=b}),n.set("_yldr_ab",d,30,c)}return t.data=g([t.data,{ab:d}]),d},t.track=function(){var a=b.location,c=a.hostname,d=a.pathname,e=a.hash,h=a.href,i=b.referrer||"NO_REFERRER",j=[r.name(i),r.type(i)];"search"===j[1]&&j.push(r.keywords(i));var k=p.split(n.get("_yldr_history"),"|").add(j[0]).join("|");n.set("_yldr_history",k,30,c);var m=o.get("_yldr_session"),s=o.get("_yldr_session_ts")||l(),u=1+ +o.get("_yldr_session_fq")||1,v=+n.get("_yldr_session_nr")||1,w=1+ +n.get("_yldr_user_fq")||1;m?(o.set("_yldr_session_fq",u),j[0]=o.get("_yldr_traffic_src"),j[1]=o.get("_yldr_traffic_type")):(m=f(),w>1&&v++,o.set("_yldr_session",m),o.set("_yldr_session_fq",u),o.set("_yldr_session_ts",s),o.set("_yldr_traffic_src",j[0]),o.set("_yldr_traffic_type",j[1]));var x=Math.log(u)/Math.log(l()-s),y=1-v/w;n.set("_yldr_user_fq",w,30,c),n.set("_yldr_session_nr",v,30,c);var z={},A={};q.query(h,function(a,b){0===a.indexOf("utm_")?A[a]=b:z["q_"+a]=b});var B=g([t.data,z,A,{sessid:m,uer:y.toFixed(2),ser:x.toFixed(2),ufq:w,sfq:u,referrer:escape(c+d+e),path:escape(d),prev:r.clean(i),traffic_source:j[0],traffic_type:j[1],traffic_keywords:j[2],traffic_history:k}]);return t.stats.incr("track.count"),t.fire(B)},t.init=function(){var b={_elem:function(){},_dl:t.dl,_ab:t.ab};t.data._ab||t.ab();for(var e in b)void 0!==t.data[e]&&(b[e].apply(null,t.data[e]),delete t.data[e]);return c(a,"message",function f(a){"Do you haz teh cases?"===a.data&&(t.stats.set("y",!0),t.stats.set("version",t.version),t.stats.set("domain",t.domain),t.stats.set("alias",s),d(a.target,a.type,f),a.source.postMessage(t.stats.all(),a.origin))}),t.track()},t.version="1.2.4-n",t.domain=t.domain||"n.254a.com",a.ydResponse=t.callback,t.init()}(window,window.document);