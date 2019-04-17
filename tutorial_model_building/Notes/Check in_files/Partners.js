Hydra.module.register('PartnersServices', function(Bus, Module, ErrorHandler, Api) {
   return {
      selector : '#content[data-partners]',
      element : undefined,
      virtualResource : undefined,
      events : {
         'partnersServices' : {
            'getPartners' : function(oNotify) {
               if (!oNotify.success) {oNotify.success = function(){};}
               if (!oNotify.failure) {oNotify.failure = function(){};}
               this.getPartners(oNotify.success, oNotify.failure);
            },
            'redeem' : function(oNotify) {
               if (!oNotify.success) {oNotify.success = function(){};}
               if (!oNotify.failure) {oNotify.failure = function(){};}
               this.redeem(oNotify.redemptionRequest, oNotify.success, oNotify.failure);
            },
            'getToken' : function(oNotify) {
               if (!oNotify.success) {oNotify.success = function(){};}
               if (!oNotify.failure) {oNotify.failure = function(){};}
               this.getToken(oNotify.success, oNotify.failure);
            },
            'updatePreferences' : function(oNotify) {
              if (!oNotify.success) {oNotify.success = function(){};}
                if (!oNotify.failure) {oNotify.failure = function(){};}
                this.updatePreferences(oNotify.success, oNotify.failure);
            },
            'getTransaction' : function(oNotify) {
                if (!oNotify.success) {oNotify.success = function(){};}
                if (!oNotify.failure) {oNotify.failure = function(){};}
                this.getTransaction(oNotify.partner, oNotify.productType, oNotify.success, oNotify.failure);
             },
         }
      },

      init : function() {
         this.element = $(this.selector);
         if(this.element.length > 0) {
            this.gettingVirtualResource = this.getVirtualResource(this.getFrequentFlyerIdentity());
         }
      },

      getPartners : function(success, failure) {
         var url = getServiceURL('partners.partners');
         url = url.replace('{frequentFlyerIdentity}', this.getFrequentFlyerIdentity());
         Bus.publish('ajax', 'getFromService', {
            path : url,
            success : function(data) {
               if (data.header.error) {
                  failure(data);
               } else {
                  success(data);
               }
            },
            failure : function(data) {
               failure(data);
            }
         });
      },

      getToken : function(success, failure) {
         var url = getServiceURL('partners.token');
         url = url.replace('{frequentFlyerIdentity}', this.getFrequentFlyerIdentity());
         Bus.publish('ajax', 'postToService', {
            path : url,
            success : function(tokenResponse) {
               if (tokenResponse.header.error) {
                  failure(tokenResponse);
               } else {
                  success(tokenResponse);
               }
            },
            failure : function(tokenResponse) {
               failure(tokenResponse);
            }
         });
      },

      redeem : function(redemptionRequest, success, failure) {
         var self = this;
         this.gettingVirtualResource.done(function(promiseData) {
            var url = getServiceURL('partners.redeem');
            url = url.replace('{frequentFlyerIdentity}', promiseData.frequentFlyerIdentity);
            url = url.replace('{virtualResourceId}', promiseData.virtualResourceId);

            Bus.publish('ajax', 'putToService', {
               data : redemptionRequest,
               path : url,
               success : function(response) {
                  if (response.header.error) {
                     failure(response);
                  } else {
                     success(response);
                     self.gettingVirtualResource = self.getVirtualResource(self.getFrequentFlyerIdentity());
                  }
               },
               failure : function() {
                  failure();
               }
            });
         }).fail(failure);
      },

      getVirtualResource : function(frequentFlyerIdentity) {
         var url = getServiceURL('partners.virtualResource');
         url = url.replace('{frequentFlyerIdentity}', frequentFlyerIdentity);

         var gettingVirtualResource = $.Deferred();
         Bus.publish('ajax', 'postToService', {
            path : url,
            success : function(response) {
               if (response.header.error) {
                  gettingVirtualResource.reject();
               } else {
                  gettingVirtualResource.resolve({virtualResourceId : response.body.data, frequentFlyerIdentity : frequentFlyerIdentity});
               }
            },
            failure : function() {
               gettingVirtualResource.reject();
            }
         });
         return gettingVirtualResource.promise();
      },
      
      updatePreferences : function(success, failure) {
        var url = getServiceURL('loyalty_info.update_preferences');
        url = url.replace('{userId}', this.getUserId());
        
        var preferences = {
        "appPreference": {
          "timelinePreference": {
          }
        },
        "cepsaPTV": "true" 
        };
        
        Bus.publish('ajax', 'putToService', {
          data : preferences,
          path : url,
          success : function(response) {
            if (response.header.error) {
              failure();
          } else {
            success();
                 }
              },
              failure : function() {
                failure();
            }
          });
      },
      
      getTransaction : function(partner, productType, success, failure) {
          var url = getServiceURL('partners.transaction');
          url = url.replace('{frequentFlyerIdentity}', this.getFrequentFlyerIdentity());
          url = url.replace('{partner}', partner);
          url = url.replace('{productType}', productType);
          Bus.publish('ajax', 'getFromService', {
             path : url,
             success : function(transactionResponse) {
                if (transactionResponse.header.error) {
                   failure(transactionResponse);
                } else {
                   success(transactionResponse);
                }
             },
             failure : function(transactionResponse) {
                failure(transactionResponse);
             }
          });
       },
      
      getFrequentFlyerIdentity : function() {
         return localStorage.ly_frequentFlyerIdentity;
      },
      
      getUserId : function() {
          return localStorage.ly_userId;
      }
   };
});