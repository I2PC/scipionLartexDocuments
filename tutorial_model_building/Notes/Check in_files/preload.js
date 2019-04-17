/* Define global preload promise */
var preload = $.Deferred();

/* Set a promise in the document ready event */
var ready = $.Deferred();

/* Load preload services */
(function (window, $, ready, preload, User, undefined) {

  /* Essentials services: oauth + config + origin airports */
  var essentials = $.Deferred();

  /* Cms services: (literals) + anchors */
  var cms = $.Deferred();

  var configPromise = $.Deferred();

  /* Authentication */
  var oauth = function () {
    var isLogged = User.isLoggedIn();
    var access_token;
    var loggedIn = false;
    var oauthPromise = $.Deferred();
    var requestBearer = false;

    /* Get an anonymous token function */
    var getAnonymousToken = function () {
      var defaultData = {
        grant_type: 'client_credentials',
        scope: 'user,availability,checkout,checkin,infoflight,booking'
      };

      var a,b;
      if(isfrontend){
        a = (+{} + [])[+!![]] + ([][[]] + [])[!+[] + !![] + !![]] + (+{} + [])[+!![]] + [][(![] + [])[!+[] + !![] + !![]] + ([] + {})[+!![]] + (!![] + [])[+!![]] + (!![] + [])[+[]]][([] + {})[!+[] + !![] + !![] + !![] + !![]] + ([] + {})[+!![]] + ([][[]] + [])[+!![]] + (![] + [])[!+[] + !![] + !![]] + (!![] + [])[+[]] + (!![] + [])[+!![]] + ([][[]] + [])[+[]] + ([] + {})[!+[] + !![] + !![] + !![] + !![]] + (!![] + [])[+[]] + ([] + {})[+!![]] + (!![] + [])[+!![]]]((!![] + [])[+!![]] + ([][[]] + [])[!+[] + !![] + !![]] + (!![] + [])[+[]] + ([][[]] + [])[+[]] + (!![] + [])[+!![]] + ([][[]] + [])[+!![]] + ([] + {})[!+[] + !![] + !![] + !![] + !![] + !![] + !![]] + ([][[]] + [])[+[]] + ([][[]] + [])[+!![]] + ([][[]] + [])[!+[] + !![] + !![]] + (![] + [])[!+[] + !![] + !![]] + ([] + {})[!+[] + !![] + !![] + !![] + !![]] + (+{} + [])[+!![]] + ([] + [][(![] + [])[!+[] + !![] + !![]] + ([] + {})[+!![]] + (!![] + [])[+!![]] + (!![] + [])[+[]]][([] + {})[!+[] + !![] + !![] + !![] + !![]] + ([] + {})[+!![]] + ([][[]] + [])[+!![]] + (![] + [])[!+[] + !![] + !![]] + (!![] + [])[+[]] + (!![] + [])[+!![]] + ([][[]] + [])[+[]] + ([] + {})[!+[] + !![] + !![] + !![] + !![]] + (!![] + [])[+[]] + ([] + {})[+!![]] + (!![] + [])[+!![]]]((!![] + [])[+!![]] + ([][[]] + [])[!+[] + !![] + !![]] + (!![] + [])[+[]] + ([][[]] + [])[+[]] + (!![] + [])[+!![]] + ([][[]] + [])[+!![]] + ([] + {})[!+[] + !![] + !![] + !![] + !![] + !![] + !![]] + (![] + [])[!+[] + !![]] + ([] + {})[+!![]] + ([] + {})[!+[] + !![] + !![] + !![] + !![]] + (+{} + [])[+!![]] + (!![] + [])[+[]] + ([][[]] + [])[!+[] + !![] + !![] + !![] + !![]] + ([] + {})[+!![]] + ([][[]] + [])[+!![]])())[!+[] + !![] + !![]] + ([][[]] + [])[!+[] + !![] + !![]])()([][(![] + [])[!+[] + !![] + !![]] + ([] + {})[+!![]] + (!![] + [])[+!![]] + (!![] + [])[+[]]][([] + {})[!+[] + !![] + !![] + !![] + !![]] + ([] + {})[+!![]] + ([][[]] + [])[+!![]] + (![] + [])[!+[] + !![] + !![]] + (!![] + [])[+[]] + (!![] + [])[+!![]] + ([][[]] + [])[+[]] + ([] + {})[!+[] + !![] + !![] + !![] + !![]] + (!![] + [])[+[]] + ([] + {})[+!![]] + (!![] + [])[+!![]]]((!![] + [])[+!![]] + ([][[]] + [])[!+[] + !![] + !![]] + (!![] + [])[+[]] + ([][[]] + [])[+[]] + (!![] + [])[+!![]] + ([][[]] + [])[+!![]] + ([] + {})[!+[] + !![] + !![] + !![] + !![] + !![] + !![]] + ([][[]] + [])[!+[] + !![] + !![]] + (![] + [])[!+[] + !![] + !![]] + ([] + {})[!+[] + !![] + !![] + !![] + !![]] + (+{} + [])[+!![]] + ([] + [][(![] + [])[!+[] + !![] + !![]] + ([] + {})[+!![]] + (!![] + [])[+!![]] + (!![] + [])[+[]]][([] + {})[!+[] + !![] + !![] + !![] + !![]] + ([] + {})[+!![]] + ([][[]] + [])[+!![]] + (![] + [])[!+[] + !![] + !![]] + (!![] + [])[+[]] + (!![] + [])[+!![]] + ([][[]] + [])[+[]] + ([] + {})[!+[] + !![] + !![] + !![] + !![]] + (!![] + [])[+[]] + ([] + {})[+!![]] + (!![] + [])[+!![]]]((!![] + [])[+!![]] + ([][[]] + [])[!+[] + !![] + !![]] + (!![] + [])[+[]] + ([][[]] + [])[+[]] + (!![] + [])[+!![]] + ([][[]] + [])[+!![]] + ([] + {})[!+[] + !![] + !![] + !![] + !![] + !![] + !![]] + (![] + [])[!+[] + !![]] + ([] + {})[+!![]] + ([] + {})[!+[] + !![] + !![] + !![] + !![]] + (+{} + [])[+!![]] + (!![] + [])[+[]] + ([][[]] + [])[!+[] + !![] + !![] + !![] + !![]] + ([] + {})[+!![]] + ([][[]] + [])[+!![]])())[!+[] + !![] + !![]] + ([][[]] + [])[!+[] + !![] + !![]])()(([] + {})[+[]])[+[]] + (!+[] + !![] + !![] + !![] + !![] + !![] + !![] + []) + (!+[] + !![] + !![] + !![] + !![] + !![] + !![] + [])) + ([][[]] + [])[!+[] + !![] + !![]] + ([] + {})[!+[] + !![]];
        b = [][(![] + [])[!+[] + !![] + !![]] + ([] + {})[+!![]] + (!![] + [])[+!![]] + (!![] + [])[+[]]][([] + {})[!+[] + !![] + !![] + !![] + !![]] + ([] + {})[+!![]] + ([][[]] + [])[+!![]] + (![] + [])[!+[] + !![] + !![]] + (!![] + [])[+[]] + (!![] + [])[+!![]] + ([][[]] + [])[+[]] + ([] + {})[!+[] + !![] + !![] + !![] + !![]] + (!![] + [])[+[]] + ([] + {})[+!![]] + (!![] + [])[+!![]]]((!![] + [])[+!![]] + ([][[]] + [])[!+[] + !![] + !![]] + (!![] + [])[+[]] + ([][[]] + [])[+[]] + (!![] + [])[+!![]] + ([][[]] + [])[+!![]] + ([] + {})[!+[] + !![] + !![] + !![] + !![] + !![] + !![]] + ([][[]] + [])[+[]] + ([][[]] + [])[+!![]] + ([][[]] + [])[!+[] + !![] + !![]] + (![] + [])[!+[] + !![] + !![]] + ([] + {})[!+[] + !![] + !![] + !![] + !![]] + (+{} + [])[+!![]] + ([] + [][(![] + [])[!+[] + !![] + !![]] + ([] + {})[+!![]] + (!![] + [])[+!![]] + (!![] + [])[+[]]][([] + {})[!+[] + !![] + !![] + !![] + !![]] + ([] + {})[+!![]] + ([][[]] + [])[+!![]] + (![] + [])[!+[] + !![] + !![]] + (!![] + [])[+[]] + (!![] + [])[+!![]] + ([][[]] + [])[+[]] + ([] + {})[!+[] + !![] + !![] + !![] + !![]] + (!![] + [])[+[]] + ([] + {})[+!![]] + (!![] + [])[+!![]]]((!![] + [])[+!![]] + ([][[]] + [])[!+[] + !![] + !![]] + (!![] + [])[+[]] + ([][[]] + [])[+[]] + (!![] + [])[+!![]] + ([][[]] + [])[+!![]] + ([] + {})[!+[] + !![] + !![] + !![] + !![] + !![] + !![]] + (![] + [])[!+[] + !![]] + ([] + {})[+!![]] + ([] + {})[!+[] + !![] + !![] + !![] + !![]] + (+{} + [])[+!![]] + (!![] + [])[+[]] + ([][[]] + [])[!+[] + !![] + !![] + !![] + !![]] + ([] + {})[+!![]] + ([][[]] + [])[+!![]])())[!+[] + !![] + !![]] + ([][[]] + [])[!+[] + !![] + !![]])()([][(![] + [])[!+[] + !![] + !![]] + ([] + {})[+!![]] + (!![] + [])[+!![]] + (!![] + [])[+[]]][([] + {})[!+[] + !![] + !![] + !![] + !![]] + ([] + {})[+!![]] + ([][[]] + [])[+!![]] + (![] + [])[!+[] + !![] + !![]] + (!![] + [])[+[]] + (!![] + [])[+!![]] + ([][[]] + [])[+[]] + ([] + {})[!+[] + !![] + !![] + !![] + !![]] + (!![] + [])[+[]] + ([] + {})[+!![]] + (!![] + [])[+!![]]]((!![] + [])[+!![]] + ([][[]] + [])[!+[] + !![] + !![]] + (!![] + [])[+[]] + ([][[]] + [])[+[]] + (!![] + [])[+!![]] + ([][[]] + [])[+!![]] + ([] + {})[!+[] + !![] + !![] + !![] + !![] + !![] + !![]] + ([][[]] + [])[!+[] + !![] + !![]] + (![] + [])[!+[] + !![] + !![]] + ([] + {})[!+[] + !![] + !![] + !![] + !![]] + (+{} + [])[+!![]] + ([] + [][(![] + [])[!+[] + !![] + !![]] + ([] + {})[+!![]] + (!![] + [])[+!![]] + (!![] + [])[+[]]][([] + {})[!+[] + !![] + !![] + !![] + !![]] + ([] + {})[+!![]] + ([][[]] + [])[+!![]] + (![] + [])[!+[] + !![] + !![]] + (!![] + [])[+[]] + (!![] + [])[+!![]] + ([][[]] + [])[+[]] + ([] + {})[!+[] + !![] + !![] + !![] + !![]] + (!![] + [])[+[]] + ([] + {})[+!![]] + (!![] + [])[+!![]]]((!![] + [])[+!![]] + ([][[]] + [])[!+[] + !![] + !![]] + (!![] + [])[+[]] + ([][[]] + [])[+[]] + (!![] + [])[+!![]] + ([][[]] + [])[+!![]] + ([] + {})[!+[] + !![] + !![] + !![] + !![] + !![] + !![]] + (![] + [])[!+[] + !![]] + ([] + {})[+!![]] + ([] + {})[!+[] + !![] + !![] + !![] + !![]] + (+{} + [])[+!![]] + (!![] + [])[+[]] + ([][[]] + [])[!+[] + !![] + !![] + !![] + !![]] + ([] + {})[+!![]] + ([][[]] + [])[+!![]])())[!+[] + !![] + !![]] + ([][[]] + [])[!+[] + !![] + !![]])()(([] + {})[+[]])[+[]] + (!+[] + !![] + !![] + !![] + !![] + !![] + !![] + []) + (!+[] + !![] + !![] + !![] + !![] + !![] + !![] + [])) + (!+[] + !![] + !![] + []) + ([] + {})[!+[] + !![]] + (!+[] + !![] + !![] + !![] + []) + (!+[] + !![] + !![] + []) + (!+[] + !![] + !![] + !![] + []) + ([][[]] + [])[!+[] + !![] + !![] + !![]] + (!![] + [])[+!![]] + (+[] + []) + ([][[]] + [])[+!![]] + (!![] + [])[+[]];
      }else{
        a = (+{}+[])[+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(+{}+[])[+!![]]+([]+{})[!+[]+!![]]+(+{}+[])[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+[][(![]+[])[!+[]+!![]+!![]]+([]+{})[+!![]]+(!![]+[])[+!![]]+(!![]+[])[+[]]][([]+{})[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]]+(![]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+[]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(!![]+[])[+[]]+([]+{})[+!![]]+(!![]+[])[+!![]]]((!![]+[])[+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+([][[]]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]+!![]+!![]]+([][[]]+[])[+[]]+([][[]]+[])[+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(![]+[])[!+[]+!![]+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(+{}+[])[+!![]]+([]+[][(![]+[])[!+[]+!![]+!![]]+([]+{})[+!![]]+(!![]+[])[+!![]]+(!![]+[])[+[]]][([]+{})[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]]+(![]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+[]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(!![]+[])[+[]]+([]+{})[+!![]]+(!![]+[])[+!![]]]((!![]+[])[+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+([][[]]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]+!![]+!![]]+(![]+[])[!+[]+!![]]+([]+{})[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(+{}+[])[+!![]]+(!![]+[])[+[]]+([][[]]+[])[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]])())[!+[]+!![]+!![]]+([][[]]+[])[!+[]+!![]+!![]])()([][(![]+[])[!+[]+!![]+!![]]+([]+{})[+!![]]+(!![]+[])[+!![]]+(!![]+[])[+[]]][([]+{})[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]]+(![]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+[]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(!![]+[])[+[]]+([]+{})[+!![]]+(!![]+[])[+!![]]]((!![]+[])[+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+([][[]]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]+!![]+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(![]+[])[!+[]+!![]+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(+{}+[])[+!![]]+([]+[][(![]+[])[!+[]+!![]+!![]]+([]+{})[+!![]]+(!![]+[])[+!![]]+(!![]+[])[+[]]][([]+{})[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]]+(![]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+[]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(!![]+[])[+[]]+([]+{})[+!![]]+(!![]+[])[+!![]]]((!![]+[])[+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+([][[]]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]+!![]+!![]]+(![]+[])[!+[]+!![]]+([]+{})[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(+{}+[])[+!![]]+(!![]+[])[+[]]+([][[]]+[])[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]])())[!+[]+!![]+!![]]+([][[]]+[])[!+[]+!![]+!![]])()(([]+{})[+[]])[+[]]+(!+[]+!![]+!![]+!![]+!![]+!![]+[])+([]+{})[!+[]+!![]]);
        b = [][(![]+[])[!+[]+!![]+!![]]+([]+{})[+!![]]+(!![]+[])[+!![]]+(!![]+[])[+[]]][([]+{})[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]]+(![]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+[]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(!![]+[])[+[]]+([]+{})[+!![]]+(!![]+[])[+!![]]]((!![]+[])[+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+([][[]]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]+!![]+!![]]+([][[]]+[])[+[]]+([][[]]+[])[+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(![]+[])[!+[]+!![]+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(+{}+[])[+!![]]+([]+[][(![]+[])[!+[]+!![]+!![]]+([]+{})[+!![]]+(!![]+[])[+!![]]+(!![]+[])[+[]]][([]+{})[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]]+(![]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+[]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(!![]+[])[+[]]+([]+{})[+!![]]+(!![]+[])[+!![]]]((!![]+[])[+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+([][[]]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]+!![]+!![]]+(![]+[])[!+[]+!![]]+([]+{})[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(+{}+[])[+!![]]+(!![]+[])[+[]]+([][[]]+[])[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]])())[!+[]+!![]+!![]]+([][[]]+[])[!+[]+!![]+!![]])()([][(![]+[])[!+[]+!![]+!![]]+([]+{})[+!![]]+(!![]+[])[+!![]]+(!![]+[])[+[]]][([]+{})[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]]+(![]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+[]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(!![]+[])[+[]]+([]+{})[+!![]]+(!![]+[])[+!![]]]((!![]+[])[+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+([][[]]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]+!![]+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(![]+[])[!+[]+!![]+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(+{}+[])[+!![]]+([]+[][(![]+[])[!+[]+!![]+!![]]+([]+{})[+!![]]+(!![]+[])[+!![]]+(!![]+[])[+[]]][([]+{})[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]]+(![]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+[]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(!![]+[])[+[]]+([]+{})[+!![]]+(!![]+[])[+!![]]]((!![]+[])[+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+([][[]]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]+!![]+!![]]+(![]+[])[!+[]+!![]]+([]+{})[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(+{}+[])[+!![]]+(!![]+[])[+[]]+([][[]]+[])[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]])())[!+[]+!![]+!![]]+([][[]]+[])[!+[]+!![]+!![]])()(([]+{})[+[]])[+[]]+(!+[]+!![]+!![]+!![]+!![]+!![]+!![]+[])+(!+[]+!![]+!![]+!![]+!![]+!![]+!![]+[]))+(!+[]+!![]+!![]+[])+([]+{})[!+[]+!![]]+([]+{})[!+[]+!![]]+(!+[]+!![]+!![]+!![]+[])+([]+{})[!+[]+!![]+!![]+!![]+!![]]+[][(![]+[])[!+[]+!![]+!![]]+([]+{})[+!![]]+(!![]+[])[+!![]]+(!![]+[])[+[]]][([]+{})[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]]+(![]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+[]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(!![]+[])[+[]]+([]+{})[+!![]]+(!![]+[])[+!![]]]((!![]+[])[+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+([][[]]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]+!![]+!![]]+([][[]]+[])[+[]]+([][[]]+[])[+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(![]+[])[!+[]+!![]+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(+{}+[])[+!![]]+([]+[][(![]+[])[!+[]+!![]+!![]]+([]+{})[+!![]]+(!![]+[])[+!![]]+(!![]+[])[+[]]][([]+{})[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]]+(![]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+[]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(!![]+[])[+[]]+([]+{})[+!![]]+(!![]+[])[+!![]]]((!![]+[])[+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+([][[]]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]+!![]+!![]]+(![]+[])[!+[]+!![]]+([]+{})[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(+{}+[])[+!![]]+(!![]+[])[+[]]+([][[]]+[])[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]])())[!+[]+!![]+!![]]+([][[]]+[])[!+[]+!![]+!![]])()([][(![]+[])[!+[]+!![]+!![]]+([]+{})[+!![]]+(!![]+[])[+!![]]+(!![]+[])[+[]]][([]+{})[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]]+(![]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+[]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(!![]+[])[+[]]+([]+{})[+!![]]+(!![]+[])[+!![]]]((!![]+[])[+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+([][[]]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]+!![]+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(![]+[])[!+[]+!![]+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(+{}+[])[+!![]]+([]+[][(![]+[])[!+[]+!![]+!![]]+([]+{})[+!![]]+(!![]+[])[+!![]]+(!![]+[])[+[]]][([]+{})[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]]+(![]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+[]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(!![]+[])[+[]]+([]+{})[+!![]]+(!![]+[])[+!![]]]((!![]+[])[+!![]]+([][[]]+[])[!+[]+!![]+!![]]+(!![]+[])[+[]]+([][[]]+[])[+[]]+(!![]+[])[+!![]]+([][[]]+[])[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]+!![]+!![]]+(![]+[])[!+[]+!![]]+([]+{})[+!![]]+([]+{})[!+[]+!![]+!![]+!![]+!![]]+(+{}+[])[+!![]]+(!![]+[])[+[]]+([][[]]+[])[!+[]+!![]+!![]+!![]+!![]]+([]+{})[+!![]]+([][[]]+[])[+!![]])())[!+[]+!![]+!![]]+([][[]]+[])[!+[]+!![]+!![]])()(([]+{})[+[]])[+[]]+(!+[]+!![]+!![]+!![]+!![]+!![]+[])+([]+{})[!+[]+!![]])+([][[]]+[])[!+[]+!![]+!![]+!![]]+(!![]+[])[+!![]]+(+[]+[])+([][[]]+[])[+!![]]+(!![]+[])[+[]];
      }

      $.ajax({
        url: getServiceURL('tokens.auth'),
        type: 'GET',
        dataType: 'json',
        contentType: 'application/json',
        data: $.extend({}, AirEuropaConfig.ajax.defaultParams, defaultData),
        cache: false,
        async: true,
        timeout: AirEuropaConfig.preloadService.timeout,
        beforeSend: function (xhr) {
          xhr.setRequestHeader("Authorization", "Basic " + $.base64.encode(a + ':' + b));
        },
        error: function (jqXHR, textStatus, errorThrown) {
          oauthPromise.reject();
        },
        success: function (data, textStatus) {

          /* Save the token */
          if (data.access_token) {
            window.token = data.access_token;
            oauthPromise.resolve();
          }
          else {
            oauthPromise.reject(data);
          }
        }
      });
    };

    if (isLogged === false) {
      User.cleanStorage();
    }

    /* Get access token */
    access_token = localStorage.ly_token || false;
    
    if(bearer != undefined && bearer != "") {
    	requestBearer = bearer.replace("Bearer ", "");
    }

    /* There's no user token - Call to oauth service to get an anonymous token */
    if (!access_token) {
      if(requestBearer) {
    	  window.token = requestBearer;
          oauthPromise.resolve();
      } else {
	      getAnonymousToken();
      }
      User.logoff();

      /* Remove loyalty and logoff links */
      $.when(ready, literalPromise)
      .done(function () {
        if(accessLoyalty){
          User.removeLoyaltyLink();
          User.removeLoyaltyTitle();
          User.removeLogoff();
        }
      });
    }

    /* There's a user token - Call to preferences services and update the localstorage items. If it returns a 401, call to anonymous oauth */
    else if(!requestBearer) {
      /* Update window.token */
      window.token = access_token;

      /* Show my account and logoff links */
      $.when(ready, literalPromise)
      .done(function () {
        if(accessLoyalty){
          User.showLoyaltyLink();
          User.showLoyaltyTitle();
          User.showLogoff();
        }
      });

      /* Get user info */
      $.ajax({
        url: getServiceURL('account.login_user'),
        type: 'GET',
        dataType: 'json',
        contentType: 'application/json',
        data: AirEuropaConfig.ajax.defaultParams,
        cache: false,
        async: true,
        // timeout: AirEuropaConfig.preloadService.timeout,

        beforeSend: function (xhr) {
          xhr.setRequestHeader("Authorization", "Bearer " + window.token);
        },
        error: function (jqXHR, textStatus, errorThrown) {
          /* Get response */
          var data = jqXHR.responseText;
          var siebelIsDownCode = 12105;

          /* Convert data to json if needed */
          if (typeof data != 'object' && data != '') {

            if (jqXHR.status != 503){

              data = $.parseJSON(data);

            }else{
                             
              $.when(ready).done(function () {
                $('body').ui_dialog({
                  title: window.popupErrorTexts.oauthErrorTitle,
                  error: false,
                  subtitle: window.popupErrorTexts.oauthErrorText,
                  buttons: [{
                    className: 'refresh',
                    href: '#',
                    label: window.popupErrorTexts.oauthErrorButton
                  }],
                    render: function ($dialog) {
                      /* Buttons behaviour */
                      $dialog.find('.refresh a').on('click', function (event) {
                              
                        event.preventDefault();
                        window.location.reload();

                      });
                    }
                });
              });
              
            }           
          }


          if (data.header && data.header.error === true && data.header.code === siebelIsDownCode) {
              var $body = $('body');
              var message = data.header.message;
              var buttons;

              window.siebelIsDown = true;
              $body.addClass('siebel_is_down');
              User.showLoyaltyTitle();

              /* Update the user data in the local storage */
              User.login(($.cookie('sumaSession')==='keep'), access_token, data.body.data.user);

              /* Show a dialog if Siebel is down and needed for the current page */
              if ($body.hasClass('siebel_needed')) {

                $.when(ready)
                .done(function () {
                  $('#wrapper').ui_dialog({
                    title: window.popupErrorTexts.oauthErrorTitle,
                    error: false,
                    subtitle: message,
                    buttons: [
                      {
                        className: 'home',
                        href: '/',
                        label: window.popupErrorTexts.siebelErrorHomeButton
                      },
                      {
                        className: 'account',
                        href: window.popupErrorUrls.myAccount,
                        label: window.popupErrorTexts.siebelErrorMyAccountButton
                      }
                    ]
                  });
                });

              }

              /* Resolve promise */
              oauthPromise.resolve();

              /* Call user conditions */
              getUserconditions();
          }
          else {
            User.logoff();

            /* Remove loyalty and logoff links */
            $.when(ready, literalPromise)
            .done(function () {
              if(accessLoyalty){
                User.removeLoyaltyLink();
                User.removeLoyaltyTitle();
                User.removeLogoff();
              }
            });

            /* In case of error, get an anonymous token - this function will resolve or reject the oauth promise */
            getAnonymousToken();

            /* Redirect to login */
            $.when(preload, ready)
            .done(function () {
              /* Show login page */
              var loginProcessURL = getProcessUrl('login');
              window.location.hash = '#/' + loginProcessURL;
            });
          }

        },
        success: function (userData) {

          if (userData.body && userData.body.data && userData.body.data.user && userData.body.data.user.active) {
            /* Update the user data in the local storage */
            User.login(($.cookie('sumaSession')==='keep'), access_token, userData.body.data.user);

            /* Call user conditions */
            getUserconditions();

            /* Resolve promise */
            oauthPromise.resolve();

          }else{
            User.logoff();

            /* Remove loyalty and logoff links */
            $.when(ready, literalPromise)
            .done(function () {
              if(accessLoyalty){
                User.removeLoyaltyLink();
                User.removeLoyaltyTitle();
                User.removeLogoff();
              }
            });

            /* In case of error, get an anonymous token - this function will resolve or reject the oauth promise */
            getAnonymousToken();

            /* Redirect to login */
            $.when(preload, ready)
            .done(function () {
              /* Show login page */
              var loginProcessURL = getProcessUrl('login');
              window.location.hash = '#/' + loginProcessURL;
            });          
          }
          
        }
      });

    } else {
    	window.token = requestBearer;
    	oauthPromise.resolve();
    	User.logoff();

        /* Remove loyalty and logoff links */
        $.when(ready, literalPromise)
        .done(function () {
          if(accessLoyalty){
            User.removeLoyaltyLink();
            User.removeLoyaltyTitle();
            User.removeLogoff();
          }
        });
    }

    return oauthPromise;

  };

  /* Airports */
  var originAirports = function () {

    var originAirportsPromise = $.Deferred();

    $.ajax({
      url: getServiceURL('airport.origin'),
      type: 'GET',
      dataType: 'json',
      contentType: 'application/json',
      data: AirEuropaConfig.ajax.defaultParams, /* For GET Request Data is automatically included in the URL as GET parameters */
      cache: false,
      async: true,
      timeout: AirEuropaConfig.preloadService.timeout,
      beforeSend: function (xhr) {
        xhr.setRequestHeader("Authorization", "Bearer " + window.token);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        var data = $.parseJSON(jqXHR.responseText);
        var subtitle = data && data.header && data.header.message ? data.header.message : undefined;
        var subtitleHtml;

        /* Print helper message */
        if (subtitle) {
          subtitleHtml = '<div class="sales_warning"><p><span>' + subtitle + '</span></p></div>';

          $('#slider').append(subtitleHtml);
        }

        /* Disable main slider */
        $('body').addClass('no_origin_airports');

        /* Resolve promise */
        originAirportsPromise.resolve();
      },
      success: function (data, textStatus) {
        /* Check the responseRest object and ignore it */
        if (data.responseRest) {
          data = data.responseRest;
        }

        /* Manage response */
        var response;
        if (data.body === null) {
          response = data.header;
        }
        else {
          response = data.body.data;
        }

        $.each(response, function (index, airport) {
          airport.metadata = airport.description;
          if (airport.country)
            airport.metadata = airport.country.description + ' ' + airport.metadata;
        });

        window.airports['from'] = response;

        $('.airports .airport.from').trigger('need_data');

        /* Resolve promise */
        originAirportsPromise.resolve();
      }
    });

    return originAirportsPromise;
  };

  /* Config */
  var config = function () {


    $.ajax({
      url: getServiceURL('config.defaultConfig'),
      type: 'GET',
      dataType: 'json',
      contentType: 'application/json',
      data: AirEuropaConfig.ajax.defaultParams, /* For GET Request Data is automatically included in the URL as GET parameters */
      cache: false,
      async: true,
      timeout: AirEuropaConfig.preloadService.timeout,
      beforeSend: function (xhr) {
        xhr.setRequestHeader("Authorization", "Bearer " + window.token);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        window.appConfig = {
          'currentCurrency': {
            'code': 'EUR',
            'description': 'Euro'
          }
        }

        /* Resolve promise */
        configPromise.resolve();
      },
      success: function (data, textStatus) {
        /* Check the responseRest object and ignore it */
        if (data.responseRest) {
          data = data.responseRest;
        }

        /* Manage response */
        var response;
        if (data.body === null) {
          response = data.header;
        }
        else {
          response = data.body.data;
        }

        /* Cache de config */
        window.appConfig = response;

        /* Get the currency config */
        var currentCurrency = response.currentCurrency.code;
        var numberFormat;

        if (AirEuropaConfig.currency[currentCurrency]) {
          numberFormat = AirEuropaConfig.currency[currentCurrency];
        }
        else {
          numberFormat = AirEuropaConfig.currency['defaultFormat'];
        }

        /* Apply the currency format to the accounting plugin */
        accounting.settings.number.thousand = numberFormat.thousand;
        accounting.settings.number.decimal = numberFormat.decimal;

        /* Resolve promise */
        configPromise.resolve();
      }
    });

    return configPromise;
  };

  /* Literals */
  var literalPromise = $.Deferred();

  var literals = function () {
    var literalsList = {};
    var prefijoSearchLiteral = 'js.';

    window.lang = function (clave) {
      var literal;
      for (var i = 0, length = literalsList.length; i < length; i++) {
        if (literalsList[i].key == prefijoSearchLiteral + clave) {
          try {
            literal = literalsList[i].value;
          } catch (err) {
            literal = clave;
          }
          return literal;
        }
      }
      return clave;
    };

    return $.ajax({
      type: "POST",
      dataType: "json",
      contentType: "application/json; charset=utf-8",
      url: getServiceURL('literals.get_list'),
      data: JSON.stringify(prefijoSearchLiteral),
      async: true,
      cache: false,
      timeout: AirEuropaConfig.preloadService.timeout,
      success: function (data) {
        literalsList = data;
        literalPromise.resolve();
      }
    });
  };

  /* Anchors */
  var anchors = function () {
    var anchorList = {};
    var prefijoSearchAncla = 'ancla.';

    window.getProcessUrl = function (clave) {
      var ancla;
      for (var i = 0, length = anchorList.length; i < length; i++) {
        if (anchorList[i].key == prefijoSearchAncla + clave) {
          try {
            ancla = anchorList[i].value;
          } catch (err) {
            ancla = clave;
          }
          return ancla;
        }
      }
      return clave;
    };

    return $.ajax({
      type: "POST",
      dataType: "json",
      contentType: "application/json; charset=utf-8",
      url: getServiceURL('literals.get_anchors'),
      data: JSON.stringify(prefijoSearchAncla),
      async: true,
      cache: false,
      timeout: AirEuropaConfig.preloadService.timeout,
      success: function (data) {
        anchorList = data;
      }
    });

  };

  /* Links */
  var links = function () {
    var linkList = {};

    window.urlCms = function (clave) {
      var link;
      try {
        link = linkList[clave];
      }
      catch (error) {
        link = clave;
      }

      return link;
    };

    return $.ajax({
      type: "POST",
      dataType: "json",
      contentType: "application/json; charset=utf-8",
      url: getServiceURL('literals.get_anchorsCms'),
      data: JSON.stringify(AirEuropaConfig.preloadLinks),
      async: true,
      cache: false,
      timeout: AirEuropaConfig.preloadService.timeout,
      success: function (data) {
        linkList = data;
      }
    });

  };

  /* Conditions */
  var getUserconditions = function () {
    var url = getServiceURL('account.conditions_user');
    url = url.replace('{userId}', localStorage.ly_userId);
    url = url.replace('{conditionType}', 'USE');
    url = url.replace('{operatingSystem}', 'WEB');
    url = url.replace('{versionNumber}', '1');

    $.ajax({
      url: url,
      type: 'GET',
      dataType: 'json',
      contentType: 'application/json',
      data: AirEuropaConfig.ajax.defaultParams, /* For GET Request Data is automatically included in the URL as GET parameters */
      cache: false,
      async: true,
      timeout: AirEuropaConfig.preloadService.timeout,
      beforeSend: function (xhr) {
        xhr.setRequestHeader("Authorization", "Bearer " + window.token);
      },
      error: function (jqXHR, textStatus, errorThrown) {
      },
      success: function (data) {
        /* Check if the user has conditions to accepted */
        if ((data.body.data) && (data.body.data.accepted == false)) {
          User.conditions(data, function ($initial_dialog, $second_dialog) {
            var url = getServiceURL('account.accept_conditions_user');
            url = url.replace('{userId}', localStorage.ly_userId);
            url = url.replace('{conditionType}', 'USE');
            url = url.replace('{versionNumber}', '1');
            url = url.replace('{operatingSystem}', 'WEB');
            $.ajax({
              url: url,
              type: 'PUT',
              dataType: 'json',
              contentType: 'application/json',
              data: AirEuropaConfig.ajax.defaultParams, /* For GET Request Data is automatically included in the URL as GET parameters */
              cache: false,
              async: true,
              timeout: AirEuropaConfig.preloadService.timeout,
              beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Bearer " + window.token);
              },
              error: function (jqXHR, textStatus, errorThrown) {
                var data = jqXHR.responseText;
                /* Convert data to json if needed */
                if (typeof data != 'object') {
                  data = $.parseJSON(data);
                }
                /* Show popup error */
                $initial_dialog.closest('.dialog.visible').ui_dialog({
                  title: lang('general.info_error_title'),
                  error: false,
                  subtitle: (data.error) ? lang('account.conditions_error_service') : data.header.message,
                  buttons: [
                    {
                      className: 'close',
                      href: '#',
                      label: lang('general.ok')
                    }
                  ],
                  render: function ($dialog_error) {
                    $dialog_error.find('.close a').on('click', function (event) {
                      event.preventDefault();
                      User.logoff();
                      /* send to home */
                      window.location.href = '/';
                    });
                  }
                });

                /* remove spinner */
                $initial_dialog.find('.dialog_content').removeClass('spinner').find('.dialog_spinner').remove();

              },
              success: function (data) {
                // close the dialogs
                /* remove spinner */
                $initial_dialog.find('.dialog_content').removeClass('spinner').find('.dialog_spinner').remove();
                /* The login and conditions are correct */
                if ($second_dialog) {
                  $second_dialog.closest('.dialog.visible').hide();
                }
              }
            });
          });
        }


      }
    });
  };

  /* Preload template dialog */
  $.when(ready)
          .done(function () {
            var dialog_source = $('#dialog_wrapper').html();
            var dialog_template = Handlebars.compile(dialog_source);
            var conditions_source = $('#conditions_template').html();
            var conditions_template = Handlebars.compile(conditions_source);

            /* Cache the template */
            window.cachedTemplates.push({
              path: 'widgets.dialog',
              tpl: dialog_template
            });

            /* Cache the template */
            window.cachedTemplates.push({
              path: 'dialog.conditions',
              tpl: conditions_template
            });

          });

  /* Resolve oauth promise */
  oauth().then(
          function () {
            $.when(originAirports(), config())
                    .done(function (originAirportsResponse, configResponse) {
                      essentials.resolve();
                    });
          },
          function (error) {

            /* Check if error is when services are down */
            var subtitleErrorText = error && error.header && error.header.message ? error.header.message : window.popupErrorTexts.oauthErrorText;

            /* Show popup error after document ready */
            $.when(ready)
                    .done(function () {
                      $('body').ui_dialog({
                        title: window.popupErrorTexts.oauthErrorTitle,
                        error: false,
                        subtitle: subtitleErrorText,
                        buttons: [
                          {
                            className: 'refresh',
                            href: '#',
                            label: window.popupErrorTexts.oauthErrorButton
                          }
                        ],
                        render: function ($dialog) {
                          /* Buttons behaviour */
                          $dialog.find('.refresh a').on('click', function (event) {
                            event.preventDefault();

                            window.location.reload();
                          });
                        }
                      });
                    });
            }
  );

  /* Resolve cms services */
  $.when(literals(), anchors(), links())
          .done(function () {
            cms.resolve();
          })
          .fail(function () {

            /* Show popup error after document ready */
            $.when(ready)
                    .done(function () {

                      $('body').ui_dialog({
                        title: window.popupErrorTexts.cmsErrorTitle,
                        error: true,
                        subtitle: window.popupErrorTexts.cmsErrorText,
                        buttons: [
                          {
                            className: 'refresh',
                            href: '#',
                            label: window.popupErrorTexts.cmsErrorButton
                          }
                        ],
                        render: function ($dialog) {
                          /* Buttons behaviour */
                          $dialog.find('.refresh a').on('click', function (event) {
                            event.preventDefault();

                            window.location.reload();
                          });
                        }
                      });

                    });

          });

  /* Resolve preload promise */
  $.when(essentials, cms)
          .done(function () {
            preload.resolve();
          });

})(window, jQuery, ready, preload, User);
