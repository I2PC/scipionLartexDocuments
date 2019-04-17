Hydra.module.register('Ajax', function (Bus, Module, ErrorHandler, Api) {
  return {
    events: {
      'ajax': {
        'getJSON': function (oNotify) {
          /* Check arguments */
          if (!oNotify.params)
            oNotify.params = null;
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };

          /* Call the function just if there's a path */
          if (oNotify.path) {
            this.getJSON(oNotify.path, oNotify.params, oNotify.success, oNotify.failure);
          }
        },
        'getTemplate': function (oNotify) {
          if (!oNotify.data)
            oNotify.data = undefined;
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };

          if (oNotify.path) {
            this.getTemplate(oNotify.path, oNotify.data, oNotify.success, oNotify.failure);
          }
        },
        'postJson': function (oNotify) {
          if (!oNotify.data)
            oNotify.data = {};
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };

          var async = true;
          if( typeof oNotify.async !== 'undefined'){
            async = oNotify.async
          }

          if (oNotify.path) {
            this.postJson(oNotify.path, oNotify.data, oNotify.success, oNotify.failure, async);
          }
        },
        'getFromService': function (oNotify) {
          /* Check arguments */
          if (!oNotify.params)
            oNotify.params = null;
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };

          /* Call the function just if there's a path */
          if (oNotify.path) {
            this.getFromService(oNotify.path, oNotify.params, oNotify.success, oNotify.failure);
          }
        },
        'postToService': function (oNotify) {
          if (!oNotify.data)
            oNotify.data = {};
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };

          if (oNotify.path) {
            this.postToService(oNotify.path, oNotify.data, oNotify.success, oNotify.failure);
          }
        },
        'putToService': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };

          if (oNotify.path) {
            this.putToService(oNotify.path, oNotify.data, oNotify.success, oNotify.failure);
          }
        },
        'deleteFromService': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };

          var async = true;
          if( typeof oNotify.async !== 'undefined'){
            async = oNotify.async
          }

          if (oNotify.path) {
            this.deleteFromService(oNotify.path, oNotify.success, oNotify.failure, async);
          }
        },
        'getImage': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };

          if (oNotify.path) {
            this.getImage(oNotify.path, oNotify.success, oNotify.failure);
          }
        },
        'downloadFromService': function (oNotify) {
          if (!oNotify.success)
            oNotify.success = function () {
            };
          if (!oNotify.failure)
            oNotify.failure = function () {
            };

          if (oNotify.path) {
            this.downloadFromService(oNotify.path, oNotify.success, oNotify.failure, oNotify.headerAccept, oNotify.responseType);
          }
        }
      }
    },

    init: function() {},

    eval5003Error: function(jqxhr) {
      var data = jqxhr.responseText;
      if (typeof data != 'object' && data != '') {
        try {
          data = $.parseJSON(data);
        }
        catch(e) {
          data = {};
        }
      }

      /* Error 503 Service Temporarily Unavailable */
      if (data.header && data.header.code === 5003) {
        /* Kill process */
        Bus.publish('process', 'kill');

        var isDialogVisible = $('.dialog.visible:not(.no_bg)').length > 0;
        if (!isDialogVisible) {
          /* Show dialog */
          $('body').ui_dialog({
            title: lang('general.info_error_title'),
            error: false,
            dialogClass: 'dialog_service_error',
            subtitle: data.header.message,
            close: {
              behaviour: 'close',
              href: '#'
            },
            buttons: [
              {
                className: 'close',
                href: '#',
                label: lang('general.ok')
              }
            ]
          });
        }

        return true;
      }

      return false;
    },

    evalJsonFormat: function(data, status) {
      /* Try to eval the json, if there's an error means the response body is not a json
      so it's a server error or a void response which we also have to control in case
      of being a 200 status */
      try {
        data = $.parseJSON(data);
      }
      catch(e) {

        /* Process some service responses which aren't json but have a 200 header,
        which means it's not an error but a success response */
        if (status === 200) {
          data = true;
        }

        /* Non json responses with a non 200 code, it must be a server error so we
        mock an objet response */
        else {
          data = {
            header: {
              message: lang('general.error_title'),
              error: true,
              bodyType: "EmptyContent"
            }
          };
        }
      }

      /* Eval the access denied error which has a different structure and build a common
      error data object */
      if (data.error && data.error === "access_denied") {
        data = {
          header: {
            message: data.error_description,
            error: true,
            bodyType: "EmptyContent"
          }
        };
      }
      
      return data;
    },

    getJSON: function (path, params, success, failure, async) {
      var self = this;
      var petitionParams = $.extend({}, AirEuropaConfig.ajax.defaultParams, params);

      $.ajax({
        url: path,
        type: 'GET',
        dataType: 'json',
        contentType: 'application/json',
        data: petitionParams, /* For GET Request Data is automatically included in the URL as GET parameters */
        cache: false,
        async: async,
        beforeSend: function (xhr) {
          xhr.setRequestHeader("Authorization", "Bearer " + window.token);
        },
        error: function (jqXHR, textStatus, errorThrown) {
          //console.log("Error getJSON");
          // console.log(textStatus);
          // console.log(errorThrown);
          // console.log(jqXHR.responseText);
          // console.log(jqXHR.getResponseHeader('Content-Type'));
          /* Get response */
          var data = jqXHR.responseText;
          var status = jqXHR.status;

          if (self.eval5003Error(jqXHR)) {
            return;
          }

          data = self.evalJsonFormat(data, status);

          /* Check the responseRest object and ignore it */
          if (data.responseRest) {
            data = data.responseRest;
          }

          failure(data);
        },
        success: function (data, textStatus) {
          /* Check the responseRest object and ignore it */
          if (data && data.responseRest) {
            data = data.responseRest;
          }

          /* Manage response */
          var response;

          /* Services without body and header */
          if (!data) {
            response = null;
          }
          else if (data.body === undefined) {
            response = data;
          }

          /* Services with body and header */
          else {
            /* If body doesn't come -probably an error- return header */
            if (data && data.body === null) {
              response = data.header;
            }
            /* Return the body */
            else {
              response = data.body.data;
            }
          }

          success(response, textStatus);
        }
      });
    },

    getTemplate: function (path, data, success, failure) {
      var template, html;

      /* Assign template */
      template = window.getTemplate(path);

      /* Return template from cache if it's defined */
      if (template) {
        /* If the data object is setted, execute the success with the rendered html: template + data */
        if (typeof data != "undefined") {
          html = template(data);
          if (success)
            success(html);
        }
        /* If the data object isn't setted, exexute the success just with the template in order to render it later */
        else {
          if (success) {
            success(template);
          }
        }
      }
      /* Ask for the template */
      else {
        $.ajax({
          url: path,
          type: 'GET',
          cache: true,
          success: function (source) {

            /* Compile the template */
            template = Handlebars.compile(source);

            /* Cache the template */
            window.cachedTemplates.push({
              path: path,
              tpl: template
            });

            /* If the data object is setted, execute the success with the rendered html: template + data */
            if (typeof data != "undefined") {
              html = template(data);
              if (success)
                success(html);
            }
            /* If the data object isn't setted, exexute the success just with the template in order to render it later */
            else {
              if (success)
                success(template);
            }
          }
        });
      }


    },

    postJson: function (path, data, success, failure) {
      var self = this;

      $.ajax({
        url: path,
        type: 'POST',
        dataType: 'json',
        data: $.toJSON(data),
        contentType: 'application/json',
        cache: false,
        error: function () {
          failure();
        },
        success: function (data, textStatus) {
          if (data.status == "ok") {
            success(data);
          }
          else {
            failure(data);
          }
        }
      });
    },

    getFromService: function (path, params, success, failure) {
      var self = this;
      var petitionParams = $.extend({}, AirEuropaConfig.ajax.defaultParams, params);

      $.ajax({
        url: path,
        type: 'GET',
        dataType: 'json',
        contentType: 'application/json',
        data: petitionParams, /* For GET Request Data is automatically included in the URL as GET parameters */
        cache: false,
        beforeSend: function (xhr) {
          xhr.setRequestHeader("Authorization", "Bearer " + window.token);
        },
        error: function (jqXHR, textStatus, errorThrown) {
          /* Get response */
          var data = jqXHR.responseText;
          var status = jqXHR.status;

          if (self.eval5003Error(jqXHR)) {
            return;
          }

          data = self.evalJsonFormat(data, status);

          /* Check the responseRest object and ignore it */
          if (data.responseRest) {
            data = data.responseRest;
          }

          success(data);
        },
        success: function (data) {
          /* Check the responseRest object and ignore it */
          if (typeof data !== 'undefined') {
            if (data.responseRest) {
              data = data.responseRest;
            }
          }

          success(data);
        }
      });
    },

    postToService: function (path, data, success, failure) {
      var self = this;
      var petitionParams = AirEuropaConfig.ajax.defaultParams;

      /* Convert petition params in url params */
      var urlParams = "";
      for (var key in petitionParams) {
        if (urlParams != "") {
          urlParams += "&";
        }
        urlParams += key + "=" + petitionParams[key];
      }

      /* Figure if the petition is under a proxy to change the union symbol */
      var union = '?';
      if (path.indexOf('?') > 0) {
        union = '&';
      }

      $.ajax({
        url: path + union + urlParams,
        type: 'POST',
        dataType: 'json',
        data: $.toJSON(data),
        contentType: 'application/json',
        cache: false,
        beforeSend: function (xhr) {
          xhr.setRequestHeader("Authorization", "Bearer " + window.token);
        },
        error: function (jqXHR, textStatus, errorThrown) {
          /* Get response */
          var data = jqXHR.responseText;
          var status = jqXHR.status;

          if (self.eval5003Error(jqXHR)) {
            return;
          }

          data = self.evalJsonFormat(data, status);

          success(data);
        },
        success: function (data, textStatus) {
          success(data);
        }
      });
    },

    putToService: function (path, data, success, failure) {
      var self = this;
      var petitionParams = AirEuropaConfig.ajax.defaultParams;

      /* Convert petition params in url params */
      var urlParams = "";
      for (var key in petitionParams) {
        if (urlParams != "") {
          urlParams += "&";
        }
        urlParams += key + "=" + petitionParams[key];
      }

      /* Figure if the petition is under a proxy to change the union symbol */
      var union = '?';
      if (path.indexOf('?') > 0) {
        union = '&';
      }

      $.ajax({
        url: path + union + urlParams,
        type: 'PUT',
        // type: 'GET',
        dataType: 'json',
        data: $.toJSON(data),
        contentType: 'application/json',
        cache: false,
        beforeSend: function (xhr) {
          xhr.setRequestHeader("Authorization", "Bearer " + window.token);
        },
        error: function (jqXHR, textStatus, errorThrown) {
          /* Get response */
          var data = jqXHR.responseText;
          var status = jqXHR.status;

          if (self.eval5003Error(jqXHR)) {
            return;
          }

          data = self.evalJsonFormat(data, status);

          success(data, jqXHR);
        },
        success: function (data, textStatus, jqXHR) {
          success(data, jqXHR);
        }
      });
    },

    deleteFromService: function (path, success, failure, async) {
      var self = this;

      $.ajax({
        url: path,
        type: 'DELETE',
        // type: 'GET',
        dataType: 'json',
        async: async,
        contentType: 'application/json',
        cache: false,
        beforeSend: function (xhr) {
          xhr.setRequestHeader("Authorization", "Bearer " + window.token);
        },
        error: function (jqXHR, textStatus, errorThrown) {
          /* Get response */
          var data = jqXHR.responseText;
          var status = jqXHR.status;

          if (self.eval5003Error(jqXHR)) {
            return;
          }

          data = self.evalJsonFormat(data, status);

          success(data);
        },
        success: function (data, textStatus) {
          success(data);
        }
      });
    },

    getImage: function (path, success, failure) {
      var self = this;

      $.ajax({
        url: path,
        type: 'GET',
        // dataType: 'text',
        // contentType: 'image/png',
        cache: false,
        beforeSend: function (xhr) {
          xhr.setRequestHeader("Authorization", "Bearer " + window.token);
        },
        error: function (jqXHR, textStatus, errorThrown) {
          /* Get response */
          var data = jqXHR.responseText;

          success(data);
        },
        success: function (data, textStatus) {
          success(data);
        }
      });
    },

    downloadFromService: function (path, success, failure, headerAccept, responseType) {
      var HttpCodes = {
        SUCCESS: 200,
        NOT_FOUND: 404
      };
      var http = new XMLHttpRequest();
      http.open('GET', path, true);
      http.responseType = 'blob';
      http.setRequestHeader('Authorization', 'Bearer ' + window.token);
      if (typeof headerAccept !== 'undefined'){
        http.setRequestHeader('Accept', headerAccept);
      }

      http.onreadystatechange = function () {
        if (http.readyState === http.DONE) {
          if (http.status === HttpCodes.SUCCESS) {
            if (typeof Blob !== 'undefined') {
              var httpResponseType = (typeof responseType !== 'undefined') ? responseType : http.response.type;
              var blob = new Blob([http.response], {type: httpResponseType});
              var URL = window.URL || window.webkitURL;
              if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                window.navigator.msSaveOrOpenBlob(blob);
              } else {
                var downloadUrl = URL.createObjectURL(blob);
                window.location = downloadUrl;
              }
              success();
            } else {
              failure();
            }
          }
        }
      };
      http.send();
    }

  };
});