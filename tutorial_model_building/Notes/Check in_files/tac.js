!function(e){e.hasOwnProperty("TravelAudienceConnect")||(e.TravelAudienceConnect="tac");var n=(e[e.TravelAudienceConnect]||{q:{}}).q,t=void 0,r=void 0,o=function(e){var n="https:"+e,t=document.createElement("script");t.type="text/javascript",t.async=!0,t.src=n;var r=document.getElementsByTagName("script")[0];return r.parentNode.insertBefore(t,r),n},i=function(e){for(var n=[],t=e.length,r=0;t>r;r++)n.push(e[r]);return n},a=function(e,n){var t=[];for(var r in n)void 0!==n[r]&&t.push(encodeURIComponent(r)+"="+encodeURIComponent(n[r]));var o="https://track.connect.travelaudience.com"+e+"?"+t.join("&");return(new Image).src=o,o},c=function(e,n,r,o,i){var a={code:t,amount:e,currency:n,pnr:r,attributed_to_tac:o,message:i},c={};for(var l in a)void 0!==a[l]&&(c[l]=a[l]);return c},l=function(e){var n=document.createElement("iframe"),t=[];for(var r in e)t.push(encodeURIComponent(r)+"="+encodeURIComponent(e[r]));var o={src:"https://static.connect.travelaudience.com/static/js/tracker/booking.html#"+t.join("&"),width:0,height:0,title:"Ad",marginwidth:0,marginheight:0,allowtransparency:"true",frameborder:0,scrolling:"no"};for(var r in o)n.setAttribute(r,o[r]);document.body.appendChild(n)},s=function(e){var n=e.split("|"),t=n.length;if(t>3){for(var r=n[t-3],o=n[t-2],i=n[t-1],a=[],c=0;t-3>c;c++){for(var l=[],s=n[c].split("-"),d=0;d<s.length;d++){var u=s[d].split(",");2==u.length?l.push({flightNumber:u[0],fareFamily:u[1]}):console.log("Invalid flight details: "+n[c])}l.length>0?a.push({segments:l}):console.log("No segments")}return{requestId:i,flights:a,price:parseFloat(r),currency:o,tansel:e}}},d=function(e){var n=e.split("|");return 6!=n.length||"V2"!=n[0]?(console.error("Cannot parse selection"),null):{requestId:n[4],price:parseFloat(n[2]),currency:n[3],tansel:e,merchant:n[5],flights:n[1].split("^").map(function(e){return{segments:e.split("-").map(function(e){var n=e.split(",");return 2===n.length?{flightNumber:n[0],fareFamily:n[1]}:(console.error("Invalid flight details:",e),null)})}})}},u=function(e){var n,t=window.atob(e);return n=t.startsWith("V2")?d(t):s(t)},f=function(e){return void 0!=e?(e=""+e,","==e.substring(e.length-3,e.length-2)?e.replace(/\./g,"").replace(",","."):e.replace(/,/g,"")):void 0},p=function(){var e=void 0,n=function(n){var t=n.match(/tansel=(.+?)(?:&|$)/);if(null!=t&&t.length>=2){var r=decodeURIComponent(t[1]);return e=r,r}return void 0};return location.search.indexOf("tansel")>0&&void 0!=n(location.search)||document.referrer.indexOf("tansel")>0&&void 0!=n(document.referrer),void 0!=e?u(e):void 0},g=function(){var e=void 0,n=function(n){var t=n.match(/preferred_landing_page=(.+?)(?:&|$)/);if(null!=t&&t.length>=2){var r=decodeURIComponent(t[1]);return e=r,r}return void 0};return location.search.indexOf("preferred_landing_page")>0&&void 0!=n(location.search)||document.referrer.indexOf("preferred_landing_page")>0&&void 0!=n(document.referrer),e},v={create:function(e){t=e,r=p(),preferred_landing_page=g()},quality:function(e,n,o){return e=f(e),a("/airline/quality.gif",{code:t,tansel:r.tansel,air_price:e,air_currency:n,message:o})},load:function(){return o("//static.connect.travelaudience.com/airline/js/"+t+".js")},booking:function(e,n,t,r,o){e=f(e),l(c(e,n,t,r,o))},booking_unconditional:function(e,n,t,r,o){return a("/dlv/booking.gif",c(e,n,t,r,o))},exception:function(e,n){var o=void 0,i=void 0;if(void 0!=e)try{o=""+e,e.hasOwnProperty("stack")&&(o+="\n"+e.stack)}catch(c){o="Unable to retrieve exception message"}return void 0!=r&&(i=r.tansel),a("/dlv/error.gif",{code:t,ex:o,tansel:i,message:n})},info:function(e){return a("/dlv/info.gif",{code:t,tansel:void 0!=r?r.tansel:void 0,message:e})},get_selection:function(){return r},set_selection:function(e){return r=u(e)},get_preferred_landing_page:function(){return preferred_landing_page}},h=function(e){if(e in v){var n=i(arguments);return n.shift(),v[e].apply(v,n)}};e[e.TravelAudienceConnect]=h,window.btoa&&window.atob||!function(){function e(e){this.message=e}var n="undefined"!=typeof exports?exports:this,t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";e.prototype=Error(),e.prototype.name="InvalidCharacterError",n.btoa||(n.btoa=function(n){for(var r,o,i=n+"",a=0,c=t,l="";i.charAt(0|a)||(c="=",a%1);l+=c.charAt(63&r>>8-a%1*8)){if(o=i.charCodeAt(a+=.75),o>255)throw new e("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");r=r<<8|o}return l}),n.atob||(n.atob=function(n){var r=(n+"").replace(/=+$/,"");if(r.length%4==1)throw new e("'atob' failed: The string to be decoded is not correctly encoded.");for(var o,i,a=0,c=0,l="";i=r.charAt(c++);~i&&(o=a%4?64*o+i:i,a++%4)?l+=String.fromCharCode(255&o>>(-2*a&6)):0)i=t.indexOf(i);return l})}(),function(e){"use strict";e.console=e.console||{};for(var n,t,r=e.console,o={},i=function(){},a="memory".split(","),c="assert,clear,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profiles,profileEnd,show,table,time,timeEnd,timeline,timelineEnd,timeStamp,trace,warn".split(",");n=a.pop();)r[n]||(r[n]=o);for(;t=c.pop();)r[t]||(r[t]=i)}("undefined"==typeof window?this:window),String.prototype.startsWith||(String.prototype.startsWith=function(e,n){return n=n||0,this.substr(n,e.length)===e});for(var m in n){var b=i(n[m]);h.apply(v,b)}}(window);