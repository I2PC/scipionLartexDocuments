Hydra.module.register('H72FormServices', function(Bus, Module, ErrorHandler, Api) {
   return {
      h72Lists: ['countries'],
      h72ListsCache: {},
      cachedSessionId: undefined,

      events: {
         'services': {

            'getH72BookingData': function(oNotify) {
               if (!oNotify.success)
                  oNotify.success = function() {};
               if (!oNotify.failure)
                  oNotify.failure = function() {};

               if (oNotify.data.locator) {
                  this.getBookingData(oNotify.success, oNotify.failure, oNotify.data);
               } else {
                  oNotify.failure();
               }
            },

            'getH72PaymentMethods': function(oNotify) {
               if (!oNotify.success)
                  oNotify.success = function() {};
               if (!oNotify.failure)
                  oNotify.failure = function() {};

               if (oNotify.data.bookingId) {
                  this.getPaymentMethods(oNotify.success, oNotify.failure, oNotify.data);
               } else {
                  oNotify.failure();
               }
            },

            'getH72Itemization': function(oNotify) {
               if (!oNotify.success) oNotify.success = function() {};
               if (!oNotify.failure) oNotify.failure = function() {};

               if (oNotify.sessionId && oNotify.stepType) {
                  this.getItemization(oNotify.success, oNotify.failure, oNotify.sessionId, oNotify.stepType);
               } else {
                  oNotify.failure();
               }
            },

            /* Passengers screen */

            'getH72PaymentLists': function(oNotify) {
               if (!oNotify.success) oNotify.success = function() {};
               if (!oNotify.failure) oNotify.failure = function() {};

               this.getH72PaymentLists(oNotify.success, oNotify.failure, oNotify.sessionId, oNotify.preconditionDocsType);
            },

            'getH72FrequentFlyerCheck': function(oNotify) {
               if (!oNotify.success) oNotify.success = function() {};
               if (!oNotify.failure) oNotify.failure = function() {};

               if (oNotify.data && oNotify.data.frequentFlyerIdentity) {
                  this.getFrequentFlyerCheck(oNotify.success, oNotify.failure, oNotify.data);
               } else {
                  oNotify.failure();
               }
            },

            'postH72Passengers': function(oNotify) {
               if (!oNotify.success) oNotify.success = function() {};
               if (!oNotify.failure) oNotify.failure = function() {};

               if (oNotify.sessionId) {
                  this.postPassengers(oNotify.success, oNotify.failure, oNotify.sessionId, oNotify.checkoutSession);
               } else {
                  oNotify.failure();
               }
            },

            /* Extras screen */

            'getH72Ancillaries': function(oNotify) {
               if (!oNotify.data) oNotify.data = {};
               if (!oNotify.success) oNotify.success = function() {};
               if (!oNotify.failure) oNotify.failure = function() {};

               if (oNotify.sessionId) {
                  this.getAncillaries(oNotify.success, oNotify.failure, oNotify.sessionId);
               } else {
                  oNotify.failure();
               }
            },

            'postH72Ancillaries': function(oNotify) {
               if (!oNotify.success) oNotify.success = function() {};
               if (!oNotify.failure) oNotify.failure = function() {};

               if (oNotify.sessionId) {
                  this.postAncillaries(oNotify.success, oNotify.failure, oNotify.sessionId, oNotify.postObject);
               } else {
                  oNotify.failure();
               }
            },

            // 'getPaymentMethods': function(oNotify) {
            //    if (!oNotify.success) oNotify.success = function() {};
            //    if (!oNotify.failure) oNotify.failure = function() {};

            //    this.getPaymentMethods(oNotify.success, oNotify.failure, oNotify.sessionId);
            // },

            /* Payment screen */

            'postH72CreditCardCheck': function(oNotify) {
               if (!oNotify.success) oNotify.success = function() {};
               if (!oNotify.failure) oNotify.failure = function() {};

               if (oNotify.data) {
                  this.postCreditCardCheck(oNotify.success, oNotify.failure, oNotify.data);
               } else {
                  oNotify.failure();
               }
            },

            'postH72MyAeLogin': function(oNotify) {
               if (!oNotify.success) oNotify.success = function() {};
               if (!oNotify.failure) oNotify.failure = function() {};

               if (oNotify.sessionId) {
                  this.postMyAeLogin(oNotify.success, oNotify.failure, oNotify.sessionId, oNotify.credentials);
               } else {
                  oNotify.failure();
               }
            },

            'getH72PromotionCode': function(oNotify) {
               if (!oNotify.success) oNotify.success = function() {};
               if (!oNotify.failure) oNotify.failure = function() {};

               if (oNotify.sessionId) {
                  this.getPromotionCode(oNotify.success, oNotify.failure, oNotify.sessionId, oNotify.promoCode, oNotify.paymentMethodType);
               } else {
                  oNotify.failure();
               }
            },

            'postH72PaymentData': function(oNotify) {
               if (!oNotify.success) oNotify.success = function() {};
               if (!oNotify.failure) oNotify.failure = function() {};

               if (oNotify.sessionId) {
                  this.postPaymentData(oNotify.success, oNotify.failure, oNotify.checkoutSession);
               } else {
                  oNotify.failure();
               }
            },

            'putH72PaymentWithSara': function(oNotify) {
               if (!oNotify.success) oNotify.success = function() {};
               if (!oNotify.failure) oNotify.failure = function() {};

               if (oNotify.checkoutSession) {
                  this.putPaymentWithSara(oNotify.success, oNotify.failure, oNotify.checkoutSession);
               } else {
                  oNotify.failure();
               }
            },

            /* Finish screen */

            'postH72Payment': function(oNotify) {
               if (!oNotify.success) oNotify.success = function() {};
               if (!oNotify.failure) oNotify.failure = function() {};

              //  console.log('oNotify', oNotify)

               this.postPayment(oNotify.success, oNotify.failure, oNotify.checkoutSession, oNotify.paymentInfo);

               // if (oNotify.sessionId) {
               //   this.postPayment(oNotify.success, oNotify.failure, oNotify.sessionId, oNotify.checkoutSession);
               // }
               // else {
               //   oNotify.failure();
               // }
            },

            /* Call me back screen */
            'postH72CallMeBack': function(oNotify) {
               if (!oNotify.success) oNotify.success = function() {};
               if (!oNotify.failure) oNotify.failure = function() {};

               if (oNotify.sessionId && oNotify.contactInfo) {
                  this.postCallMeBack(oNotify.success, oNotify.failure, oNotify.sessionId, oNotify.contactInfo);
               } else {
                  oNotify.failure();
               }
            },

            /* Call me back screen */
            'setH72HotelNights': function(oNotify) {
               if (!oNotify.success) oNotify.success = function() {};
               if (!oNotify.failure) oNotify.failure = function() {};

               if (oNotify.bookingId && oNotify.nightsHotels) {
                  this.setHotelNights(oNotify.success, oNotify.failure, oNotify.bookingId, oNotify.nightsHotels);
               } else {
                  oNotify.failure();
               }
            },
            'getH72EuropCarAutos': function(oNotify) {
               if (!oNotify.success) oNotify.success = function() {};
               if (!oNotify.failure) oNotify.failure = function() {};

               if (oNotify.sessionId) {
                  this.getEuropCarAutos(oNotify.success, oNotify.failure, oNotify.sessionId);
               }
            },
            'getH72PreferenceAirport': function(oNotify) {
               if (!oNotify.success)
                  oNotify.success = function() {};
               if (!oNotify.failure)
                  oNotify.failure = function() {};
               this.getPreferenceAirport(oNotify.success, oNotify.failure);
            }

         }
      },

      init: function() {},

      getBookingData: function(success, failure, data) {
         var url = getServiceURL('h72_payment.booking');
         url = url.replace('{locator}', data.locator);
         url = url.replace('{surname}', data.surname);

         Bus.publish('ajax', 'getFromService', {
            path: url,
            success: function(dataBooking) {
              // console.log('dataBooking', dataBooking)

               if (dataBooking.header.error) {
                  success(dataBooking);
               } else {

                  var url = getServiceURL('h72_payment.payment');
                  url = url.replace('{bookingId}', dataBooking.body.data.booking.bookingId);

                  Bus.publish('ajax', 'getFromService', {
                     path: url,
                     success: function(dataPayment) {
                        dataBooking.body.data.paymentMethods = dataPayment.body.data.paymentMethods;                    
                        success(dataBooking);
                     }
                  });

               }

            }
         });
      },

      getPaymentMethods: function(success, failure, data) {
         /* Get service URL */
         var url = getServiceURL('h72_payment.payment');

         /* Replace URL parameters with values */
         url = url.replace('{bookingId}', data.bookingId);

         // console.log(url);

         Bus.publish('ajax', 'getFromService', {
            path: url,
            success: function(data) {
               success(data);
            }
         });
      },

      getItemization: function(success, failure, sessionId, stepType) {
         Bus.publish('ajax', 'getFromService', {
            path: getServiceURL('checkout.itemization').replace('{sessionId}', sessionId).replace('{stepType}', stepType),
            success: function(data) {
               success(data);
            }
         });
      },

      /* Passengers screen */

      getH72PaymentLists: function(success, failure, sessionId, preconditionDocsType) {
         var self = this;
         var servicesLength = this.h72Lists.length;
         var servicesLoaded = 0;

         if (this.h72ListsCache.countries &&
            sessionId == self.cachedSessionId
         ) {
            //console.log("No llamamos a municipios porque ya los tenemos")
            success(this.h72ListsCache);
         } else {
            //console.log("Llamamos a toda la lista de servicios");
            $.each(this.h72Lists, function(index, list) {

               var path = getServiceURL('checkout.' + list).replace('{sessionId}', sessionId).replace('{preconditionDocsType}', preconditionDocsType);
               Bus.publish('ajax', 'getJSON', {
                  path: path,
                  success: function(data) {
                     /* Cache the data */

                     self.h72ListsCache[list] = data;

                     /* Control when all services are loaded */
                     servicesLoaded += 1;

                     if (servicesLoaded == servicesLength) {
                        success(self.h72ListsCache);
                     }
                  }
               });

            });
         }

         self.cachedSessionId = sessionId;
      },

      getFrequentFlyerCheck: function(success, failure, data) {
         /* Get service URL */
         var url = getServiceURL('checkout.frequent_flyer_check');

         /* Replace URL parameters with values */
         url = url.replace('{surname}', data.surname);
         url = url.replace('{frequentFlyerProgram}', data.frequentFlyerProgram);
         url = url.replace('{frequentFlyerIdentity}', data.frequentFlyerIdentity);

         Bus.publish('ajax', 'getFromService', {
            path: url,
            success: function(data) {
               success(data);
            }
         });
      },

      postPassengers: function(success, failure, sessionId, checkoutSession) {
         var postObject = this.createPassengerPostObject(checkoutSession);

         Bus.publish('ajax', 'postToService', {
            data: postObject,
            path: getServiceURL('checkout.add_passengers').replace('{sessionId}', sessionId),
            success: function(data) {
               success(data);
            }
         });
      },

      createPassengerPostObject: function(checkoutSession) {
         var services = this.h72ListsCache;

         var passengerObject = {
            adultPassengers: [],
            childPassengers: [],
            infantPassengers: []
         };

         for (var index in checkoutSession.passengers) {

            with(checkoutSession.passengers[index]) {

               var passenger = {
                  name: info.name,
                  surname: info.surname_1,
                  surname2: info.surname_2,
                  email: info.email,
                  telephone: info.phone_prefix + info.phone,
                  birthday: info.birthdate,
                  resident: false,
                  residentTown: null,
                  telematicComprobation: false,
                  largeFamily: false,
                  largeFamilyCommunity: null,
                  largeFamilyTypeSubvention: null,
                  largeFamilyIdentity: null,
                  frequentFlyer: false,
                  frequentFlyerIdentity: null,
                  frequentFlyerType: null,
                  user: false,
                  country: null,
                  sate: info.sate == '1' ? true : false,
                  sateDocumentNumber: info.sate == '1' ? info.sate_document_number.length > 0 ? info.sate_document_number : null : null,
                  identificationDocument: {}
               };

               // transformamos el honorific del formulario al código addressAs del servicio:
               // sr   -> 0
               // sra  -> 1
               // srta -> 2
               if (info.honorific == 'sr') {
                  passenger.addressAs = 0;
               } else if (info.honorific == 'sra') {
                  passenger.addressAs = 1;
               } else if (info.honorific == 'srta') {
                  passenger.addressAs = 2;
               }

               // informacion de residente
               if (info.resident_discount == "1") {
                  passenger.resident = true;
                  passenger.residentTown = info.resident_discount_city;

                  // Always to true
                  passenger.telematicComprobation = true;

                  // if (info.residence_check == "1") {
                  //  passenger.telematicComprobation = true;
                  // }
               }

               // informacion de pasajero frecuente
               if (info.frequent_flyer == "1") {
                  passenger.frequentFlyer = true;
                  passenger.frequentFlyerIdentity = info.frequent_flyer_number;
                  passenger.frequentFlyerType = info.frequent_flyer_type;
               }

               // informacion de familia numerosa
               if (info.large_family == "1") {
                  passenger.largeFamily = true;
                  passenger.largeFamilyCommunity = info.large_family_region;
                  passenger.largeFamilyTypeSubvention = info.large_family_type;
                  passenger.largeFamilyIdentity = info.large_family_number;
               }

               // obtenemos la información del país de la lista de servicios
               for (i = 0; i < services.countries.length; i++) {
                  if (info.nationality == services.countries[i].code) {
                     passenger.country = services.countries[i];
                     break;
                  }
               }

               // obtenemos la información del documento de identidad de la lista de servicios
               var identificationDocument = {};
               identificationDocument.identity = info.document_number.toUpperCase(); /* Set to upper case, because the service need it in upper case */
               identificationDocument.expiration = info.document_expiration;

               identificationDocument.documentType = null;
               for (i = 0; i < services.document_type.length; i++) {
                  if (info.document_type == services.document_type[i].code) {
                     identificationDocument.documentType = services.document_type[i];
                     break;
                  }
               }

               identificationDocument.expeditionCountry = null;
               for (i = 0; i < services.countries.length; i++) {
                  if (info.document_country == services.countries[i].code) {
                     identificationDocument.expeditionCountry = services.countries[i];
                     break;
                  }
               }

               passenger.identificationDocument = identificationDocument;

               // añadimos el pasajero según su tipo
               if (type == "adult") {
                  passengerObject.adultPassengers.push(passenger);
               } else if (type == "kid") {
                  passengerObject.childPassengers.push(passenger);
               } else if (type == "baby") {
                  passenger.adultAssociatedIndex = parseInt(info.adult_with);
                  //passenger.adultAssociatedIndex = parseInt(info.adult_with.substr(6)) + 1;
                  passengerObject.infantPassengers.push(passenger);
               }

            }

         }

         // console.log(passengerObject);
         // console.log(JSON.stringify(passengerObject));

         return passengerObject;
      },

      /* Extras screen */

      getAncillaries: function(success, failure, sessionId) {
         Bus.publish('ajax', 'getJSON', {
            path: getServiceURL('checkout.ancillaries').replace('{sessionId}', sessionId),
            success: function(data) {
               success(data);
            }
         });
      },

      postAncillaries: function(success, failure, sessionId, postObject) {
         Bus.publish('ajax', 'postToService', {
            path: getServiceURL('checkout.post_ancillaries').replace('{sessionId}', sessionId),
            data: postObject,
            /* The object is already formatted by checkout view */
            success: function(data) {
               success(data);
            }
         });

      },

      // getPaymentMethods: function(success, failure, sessionId) {
      //    Bus.publish('ajax', 'getFromService', {
      //       path: getServiceURL('checkout.payment_methods').replace('{sessionId}', sessionId),
      //       success: function(data) {
      //          success(data);
      //       }
      //    });
      // },

      /* Payment screen */

      postCreditCardCheck: function(success, failure, cardObject) {
         Bus.publish('ajax', 'postToService', {
            path: getServiceURL('checkout.credit_card_check'),
            data: cardObject,
            success: function(data) {
               success(data);
            }
         });
      },

      postMyAeLogin: function(success, failure, sessionId, credentials) {
         Bus.publish('ajax', 'postToService', {
            path: getServiceURL('checkout.login_myae').replace('{sessionId}', sessionId),
            data: {
               email: credentials.email,
               password: credentials.password
            },
            success: function(data) {
               success(data);
            }
         });
      },

      getPromotionCode: function(success, failure, sessionId, promoCode, paymentMethodType) {
         Bus.publish('ajax', 'getFromService', {
            path: getServiceURL('checkout.promo_code').replace('{sessionId}', sessionId).replace('{promoCode}', promoCode).replace('{paymentMethodType}', paymentMethodType),
            success: function(data) {
               success(data);
            }
         });
      },
      getEuropCarAutos: function(success, failure, sessionId) {
         Bus.publish('ajax', 'getFromService', {
            path: getServiceURL('checkout.banner_europcar').replace('{sessionId}', sessionId),
            success: function(data) {
               success(data);
            }
         });
      },
      getPreferenceAirport: function(success, failure) {
         var self = this;

         Bus.publish('ajax', 'getFromService', {
            path: getServiceURL('checkout.preference_airport'),
            success: function(data) {
               var airports = (data && data.body && data.body.data) ? data.body.data : [];
               var orderedAirports = self.orderAirportsByZone(airports);
               success(orderedAirports);
            }
         });
      },

      //    postPaymentData: function(success, failure, sessionId, checkoutSession) {
      //      var postObject = this.createPaymentDataPostObject(checkoutSession);
      //
      //      Bus.publish('ajax', 'postToService', {
      //        data: postObject,
      //        path: getServiceURL('checkout.post_payment').replace('{sessionId}', sessionId),
      //        success: function(data) {
      //          success(data);
      //        }
      //      });
      //    },

      //    createPaymentDataPostObject: function(checkoutSession) {
      //      var services = this.h72ListsCache;
      //      var paymentDataObject = {
      //        personContactInformation: {
      //          email: null,
      //          telephone: ''
      //        }
      //      };
      //
      //      //console.log(checkoutSession);
      //
      //      if (checkoutSession.payment.credit_card == 1) {
      //
      //        // Pago con tarjeta de crédito/débito
      //        paymentDataObject.paymentType = "CREDITCARD";
      //        paymentDataObject.number = checkoutSession.payment.credit_card_number;
      //        paymentDataObject.personContactInformation.email = checkoutSession.payment.credit_card_mail;
      //
      //        // buyerDocumentation
      //        paymentDataObject.buyerDocumentation = {
      //          "documentType": checkoutSession.payment.credit_card_document_type,
      //          "identity": checkoutSession.payment.credit_card_document_number
      //        };
      //
      //        // Company name
      //        paymentDataObject.codeAirEuropaEnterprise = checkoutSession.payment.credit_card_company_name;
      //
      //        // invoiceCountry
      //        for (i = 0; i < services.countries.length; i++) {
      //          if (checkoutSession.payment.credit_card_country == services.countries[i].code) {
      //            paymentDataObject.invoiceCountry = services.countries[i];
      //            break;
      //          }
      //        }
      //
      //        // creditCardCodeType
      //        var index_card = 1;
      //        for (i = 0; i < checkoutSession.methods.length; i++) {
      //          if (paymentDataObject.paymentType == checkoutSession.methods[i].type) {
      //            index_card = i;
      //            break;
      //          }
      //        }
      //
      //        for (i = 0; i < checkoutSession.methods[index_card].creditCards.length; i++) {
      //          if (checkoutSession.payment.credit_card_type == checkoutSession.methods[index_card].creditCards[i].identity) {
      //            paymentDataObject.creditCardCodeType = checkoutSession.methods[index_card].creditCards[i];
      //            break;
      //          }
      //        }
      //
      //        // holder
      //        var cardHolder = checkoutSession.payment.credit_card_holder;
      //        var cardName = checkoutSession.payment.credit_card_name;
      //
      //        if (cardHolder == "other") {
      //          paymentDataObject.holder = cardName;
      //        } else {
      //          for (var index in checkoutSession.passengers) {
      //            if (index == cardHolder) {
      //              paymentDataObject.holder = checkoutSession.passengers[index].info.name + ' ' + checkoutSession.passengers[index].info.surname_1 + ' ' + checkoutSession.passengers[index].info.surname_2;
      //              break;
      //            }
      //          }
      //        }
      //
      //      } else if (checkoutSession.payment.ae_card == 1) {
      //
      //        // Pago con tarjeta de crédito AirEuropa
      //
      //        paymentDataObject.paymentType = "AIREUROPA_CREDITCARD";
      //        paymentDataObject.number = checkoutSession.payment.ae_card_number;
      //        paymentDataObject.personContactInformation.email = checkoutSession.payment.ae_card_mail;
      //
      //        // buyerDocumentation
      //        paymentDataObject.buyerDocumentation = {
      //          "documentType": checkoutSession.payment.ae_card_document_type,
      //          "identity": checkoutSession.payment.ae_card_document_number
      //        };
      //
      //        // invoiceCountry
      //        for (i = 0; i < services.countries.length; i++) {
      //          if (checkoutSession.payment.ae_card_country == services.countries[i].code) {
      //            paymentDataObject.invoiceCountry = services.countries[i];
      //            break;
      //          }
      //        }
      //
      //        // holder
      //        var cardHolder = checkoutSession.payment.ae_credit_card_holder;
      //        var cardName = checkoutSession.payment.ae_card_name;
      //
      //        if (cardHolder == "other") {
      //          paymentDataObject.holder = cardName;
      //        } else {
      //          for (var index in checkoutSession.passengers) {
      //            if (index == cardHolder) {
      //              paymentDataObject.holder = checkoutSession.passengers[index].info.name + ' ' + checkoutSession.passengers[index].info.surname_1 + ' ' + checkoutSession.passengers[index].info.surname_2;
      //              break;
      //            }
      //          }
      //        }
      //
      //      } else if (checkoutSession.payment.myae == 1) {
      //
      //        // Pago con MyAirEuropa
      //
      //        paymentDataObject.paymentType = "MYAIREUROPA";
      //        paymentDataObject.number = checkoutSession.payment.myae_card_number;
      //        paymentDataObject.percentagePoints = checkoutSession.payment.myae_percentage_points;
      //        paymentDataObject.personContactInformation.email = checkoutSession.payment.myae_card_mail;
      //        paymentDataObject.creditCardCodeType = null;
      //
      //        // buyerDocumentation
      //        paymentDataObject.buyerDocumentation = {
      //          "documentType": checkoutSession.payment.myae_card_document_type,
      //          "identity": checkoutSession.payment.myae_card_document_number
      //        };
      //
      //        // invoiceCountry
      //        for (i = 0; i < services.countries.length; i++) {
      //          if (checkoutSession.payment.myae_card_country == services.countries[i].code) {
      //            paymentDataObject.invoiceCountry = services.countries[i];
      //            break;
      //          }
      //        }
      //
      //        // holder
      //        var cardHolder = checkoutSession.payment.myae_card_holder;
      //        var cardName = checkoutSession.payment.myae_card_name;
      //
      //        if (cardHolder == "other") {
      //          paymentDataObject.holder = cardName;
      //        } else {
      //          for (var index in checkoutSession.passengers) {
      //            if (index == cardHolder) {
      //              paymentDataObject.holder = checkoutSession.passengers[index].info.name + ' ' + checkoutSession.passengers[index].info.surname_1 + ' ' + checkoutSession.passengers[index].info.surname_2;
      //              break;
      //            }
      //          }
      //        }
      //
      //      } else if (checkoutSession.payment.reserve == 1) {
      //
      //        // Pago por transferencia/oficina/reserva
      //
      //        paymentDataObject.paymentType = "TRANSFER";
      //        paymentDataObject.personContactInformation.email = checkoutSession.passengers[0].info.email;
      //
      //        // Company name
      //        paymentDataObject.codeAirEuropaEnterprise = checkoutSession.payment.transfer_company_name;
      //
      //      } else if (checkoutSession.payment.promotion == 1) {
      //
      //
      //        //  Pago con código promocional
      //
      //        paymentDataObject.paymentType = "PROMOTION";
      //        paymentDataObject.creditCardCodeType = "";
      //        paymentDataObject.number = checkoutSession.payment.promotion_card_number;
      //        paymentDataObject.promotionCode = checkoutSession.payment.promotion_code;
      //        paymentDataObject.personContactInformation.email = checkoutSession.payment.promotion_card_mail; //checkoutSession.passengers[0].info.email;
      //
      //        // buyerDocumentation
      //        paymentDataObject.buyerDocumentation = {
      //          "documentType": checkoutSession.payment.promotion_card_document_type,
      //          "identity": checkoutSession.payment.promotion_card_document_number
      //        };
      //
      //        // invoiceCountry
      //        for (i = 0; i < services.countries.length; i++) {
      //          if (checkoutSession.payment.promotion_card_country == services.countries[i].code) {
      //            paymentDataObject.invoiceCountry = services.countries[i];
      //            break;
      //          }
      //        }
      //
      //        // creditCardCodeType
      //        var index_card = 1;
      //        for (i = 0; i < checkoutSession.methods.length; i++) {
      //          if (paymentDataObject.paymentType == checkoutSession.methods[i].type) {
      //            index_card = i;
      //            break;
      //          }
      //        }
      //
      //        for (i = 0; i < checkoutSession.methods[index_card].creditCards.length; i++) {
      //          if (checkoutSession.payment.promotion_card_type == checkoutSession.methods[index_card].creditCards[i].identity) {
      //            paymentDataObject.creditCardCodeType = checkoutSession.methods[index_card].creditCards[i];
      //            break;
      //          }
      //        }
      //
      //        // holder
      //        var cardHolder = checkoutSession.payment.promotion_card_holder;
      //        var cardName = checkoutSession.payment.promotion_card_name;
      //
      //        if (cardHolder == "other") {
      //          paymentDataObject.holder = cardName;
      //        } else {
      //          for (var index in checkoutSession.passengers) {
      //            if (index == cardHolder) {
      //              paymentDataObject.holder = checkoutSession.passengers[index].info.name + ' ' + checkoutSession.passengers[index].info.surname_1 + ' ' + checkoutSession.passengers[index].info.surname_2;
      //              break;
      //            }
      //          }
      //        }
      //
      //      } else if (checkoutSession.payment.paypal == 1) {
      //
      //        /* Paypal */
      //        paymentDataObject.paymentType = "PAYPAL";
      //
      //        // Email
      //        paymentDataObject.personContactInformation.email = checkoutSession.payment.paypal_mail;
      //
      //        // Documentation
      //        paymentDataObject.buyerDocumentation = {
      //          documentType: checkoutSession.payment.paypal_document_type,
      //          identity: checkoutSession.payment.paypal_document_number
      //        };
      //
      //        // Invoice country
      //        for (i = 0; i < services.countries.length; i++) {
      //          if (checkoutSession.payment.paypal_country == services.countries[i].code) {
      //            paymentDataObject.invoiceCountry = services.countries[i];
      //            break;
      //          }
      //        }
      //
      //        // Holder
      //        var cardHolder = checkoutSession.payment.paypal_holder;
      //        var cardName = checkoutSession.payment.paypal_name;
      //
      //        if (cardHolder == "other") {
      //          paymentDataObject.holder = cardName;
      //        } else {
      //          for (var index in checkoutSession.passengers) {
      //            if (index == cardHolder) {
      //              paymentDataObject.holder = checkoutSession.passengers[index].info.name + ' ' + checkoutSession.passengers[index].info.surname_1 + ' ' + checkoutSession.passengers[index].info.surname_2;
      //              break;
      //            }
      //          }
      //        }
      //
      //      }
      //
      //      // console.log(paymentDataObject);
      //      //console.log(JSON.stringify(paymentDataObject));
      //
      //      return paymentDataObject;
      //
      //    },

      /* Finish screen */

      //EPA

      postPayment: function(success, failure, session, paymentInfo) {
        // console.log('session', session)
        // console.log('paymentInfo', paymentInfo)
         
        // var postObject = this.createPaymentDataFinalizePostObject(session);
        // console.log('postObject', postObject);
         
         var url = getServiceURL('h72_payment.finalize');
         url = url.replace('{bookingId}', session.bookingId);
        
        // console.log('url', url)
        
         Bus.publish('ajax', 'postToService', {
            data: paymentInfo,
            path: url,
            success: function(data) {
            //    console.log('data', data);
               success(data);
            }
         });
      },

      createPaymentDataFinalizePostObject: function(checkoutSession) {
         var services = this.h72ListsCache;
         var paymentDataFinalizeObject = {};

        //  console.log('checkoutSession', checkoutSession)

         if (checkoutSession.payment.credit_card == 1) {

            //Check if is promotion payment
            if (checkoutSession.payment.promotion_credit_code != '' && checkoutSession.payment.promotion_credit_valid == 'true') {
               paymentDataFinalizeObject.paymentType = "PROMOTION";
               paymentDataFinalizeObject.promotionCode = checkoutSession.payment.promotion_credit_code;

               checkoutSession.payment.credit_card = 0;
               checkoutSession.payment.promotion = 1;

            } else {
               paymentDataFinalizeObject.paymentType = "CREDITCARD";
            }

            if (checkoutSession.payment.credit_card_hashId) {
               paymentDataFinalizeObject.cvv = checkoutSession.payment.credit_card_cvv;
               paymentDataFinalizeObject.hashId = checkoutSession.payment.credit_card_hashId;

               //email
               paymentDataFinalizeObject.personContactInformation = {
                  "email": checkoutSession.payment.credit_card_mail
               };

               paymentDataFinalizeObject.buyerDocumentation = {
                  "documentType": checkoutSession.payment.credit_card_document_type,
                  "identity": checkoutSession.payment.credit_card_document_number
               };

               // invoiceCountry
               for (i = 0; i < services.countries.length; i++) {
                  if (checkoutSession.payment.credit_card_country == services.countries[i].code) {
                     paymentDataFinalizeObject.invoiceCountry = services.countries[i];
                     break;
                  }
               }

            } else {

               // Pago con tarjeta de crédito/débito
               paymentDataFinalizeObject.number = checkoutSession.payment.credit_card_number;
               paymentDataFinalizeObject.expiration = this.transformExpirationDate(checkoutSession.payment.credit_card_expiration);
               paymentDataFinalizeObject.cvv = checkoutSession.payment.credit_card_cvv;

               //email
               paymentDataFinalizeObject.personContactInformation = {
                  "email": checkoutSession.payment.credit_card_mail
               };
               // buyerDocumentation
               paymentDataFinalizeObject.buyerDocumentation = {
                  "documentType": checkoutSession.payment.credit_card_document_type,
                  "identity": checkoutSession.payment.credit_card_document_number
               };

               // Company name
               paymentDataFinalizeObject.codeAirEuropaEnterprise = checkoutSession.payment.credit_card_company_name;

               // invoiceCountry
               for (i = 0; i < services.countries.length; i++) {
                  if (checkoutSession.payment.credit_card_country == services.countries[i].code) {
                     paymentDataFinalizeObject.invoiceCountry = services.countries[i];
                     break;
                  }
               }

               // creditCardCodeType
               var index_card = 1;
               for (i = 0; i < checkoutSession.methods.length; i++) {
                  if (paymentDataFinalizeObject.paymentType == checkoutSession.methods[i].type) {
                     index_card = i;
                     break;
                  }
               }

               for (i = 0; i < checkoutSession.methods[index_card].creditCards.length; i++) {
                  if (checkoutSession.payment.credit_card_type == checkoutSession.methods[index_card].creditCards[i].identity) {
                     paymentDataFinalizeObject.creditCardCodeType = checkoutSession.methods[index_card].creditCards[i];
                     break;
                  }
               }

               // holder
               var cardHolder = checkoutSession.payment.credit_card_holder;
               var cardName = checkoutSession.payment.credit_card_name;

               if (cardHolder == "other") {
                  paymentDataFinalizeObject.holder = cardName;
               } else {
                  for (var index in checkoutSession.passengers) {
                     if (index == cardHolder) {
                        paymentDataFinalizeObject.holder = checkoutSession.passengers[index].info.name + ' ' + checkoutSession.passengers[index].info.surname_1 + ' ' + checkoutSession.passengers[index].info.surname_2;
                        break;
                     }
                  }
               }
            }

         } else if (checkoutSession.payment.ae_card == 1) {

            // Pago con tarjeta de crédito AirEuropa
            paymentDataFinalizeObject.paymentType = "AIREUROPA_CREDITCARD";

            if (checkoutSession.payment.ae_card_hashId) {
               paymentDataFinalizeObject.hashId = checkoutSession.payment.ae_card_hashId;
               paymentDataFinalizeObject.invoiceCountry = {
                  code: checkoutSession.payment.ae_card_country
               };
               paymentDataFinalizeObject.buyerDocumentation = {
                  "documentType": checkoutSession.payment.ae_card_document_type,
                  "identity": checkoutSession.payment.ae_card_document_number
               };
            } else {
               paymentDataFinalizeObject.number = checkoutSession.payment.ae_card_number;
               //paymentDataFinalizeObject.personContactInformation.email = checkoutSession.payment.ae_card_mail;
               paymentDataFinalizeObject.expiration = this.transformExpirationDate(checkoutSession.payment.ae_card_expiration);
               paymentDataFinalizeObject.cvv = checkoutSession.payment.ae_card_cvv;

               //email
               paymentDataFinalizeObject.personContactInformation = {
                  email: checkoutSession.payment.ae_card_mail
               };

               // buyerDocumentation
               paymentDataFinalizeObject.buyerDocumentation = {
                  "documentType": checkoutSession.payment.ae_card_document_type,
                  "identity": checkoutSession.payment.ae_card_document_number
               };

               // invoiceCountry
               for (i = 0; i < services.countries.length; i++) {
                  if (checkoutSession.payment.ae_card_country == services.countries[i].code) {
                     paymentDataFinalizeObject.invoiceCountry = services.countries[i];
                     break;
                  }
               }

               // holder
               var cardHolder = checkoutSession.payment.ae_credit_card_holder;
               var cardName = checkoutSession.payment.ae_card_name;

               if (cardHolder == "other") {
                  paymentDataFinalizeObject.holder = cardName;
               } else {
                  for (var index in checkoutSession.passengers) {
                     if (index == cardHolder) {
                        paymentDataFinalizeObject.holder = checkoutSession.passengers[index].info.name + ' ' + checkoutSession.passengers[index].info.surname_1 + ' ' + checkoutSession.passengers[index].info.surname_2;
                        break;
                     }
                  }
               }

            }

         } else if (checkoutSession.payment.myae == 1) {

            // Pago con MyAirEuropa
            paymentDataFinalizeObject.paymentType = "MYAIREUROPA";
            paymentDataFinalizeObject.number = checkoutSession.payment.myae_card_number;
            paymentDataFinalizeObject.percentagePoints = checkoutSession.payment.myae_percentage_points;
            // paymentDataFinalizeObject.personContactInformation.email = checkoutSession.payment.myae_card_mail;
            paymentDataFinalizeObject.expiration = this.transformExpirationDate(checkoutSession.payment.myae_card_expiration);
            paymentDataFinalizeObject.cvv = parseInt(checkoutSession.payment.myae_card_cvv);
            paymentDataFinalizeObject.creditCardCodeType = null;

            // email
            paymentDataFinalizeObject.personContactInformation = {
               email: checkoutSession.payment.myae_card_mail
            };

            // buyerDocumentation
            paymentDataFinalizeObject.buyerDocumentation = {
               "documentType": checkoutSession.payment.myae_card_document_type,
               "identity": checkoutSession.payment.myae_card_document_number
            };

            // invoiceCountry
            for (i = 0; i < services.countries.length; i++) {
               if (checkoutSession.payment.myae_card_country == services.countries[i].code) {
                  paymentDataFinalizeObject.invoiceCountry = services.countries[i];
                  break;
               }
            }

            // holder
            var cardHolder = checkoutSession.payment.myae_card_holder;
            var cardName = checkoutSession.payment.myae_card_name;

            if (cardHolder == "other") {
               paymentDataFinalizeObject.holder = cardName;
            } else {
               for (var index in checkoutSession.passengers) {
                  if (index == cardHolder) {
                     paymentDataFinalizeObject.holder = checkoutSession.passengers[index].info.name + ' ' + checkoutSession.passengers[index].info.surname_1 + ' ' + checkoutSession.passengers[index].info.surname_2;
                     break;
                  }
               }
            }

         } else if (checkoutSession.payment.reserve == 1) {

            // Pago por transferencia/oficina/reserva
            paymentDataFinalizeObject.paymentType = "TRANSFER";

            //email
            paymentDataFinalizeObject.personContactInformation = {
               email: checkoutSession.passengers[0].info.email
            };
            // paymentDataFinalizeObject.personContactInformation.email = checkoutSession.passengers[0].info.email;

            // Company name
            paymentDataFinalizeObject.codeAirEuropaEnterprise = checkoutSession.payment.transfer_company_name;

         } else if (checkoutSession.payment.promotion == 1) {

            // Pago con código promocional
            paymentDataFinalizeObject.paymentType = "PROMOTION";
            paymentDataFinalizeObject.promotionCode = checkoutSession.payment.promotion_code;
            paymentDataFinalizeObject.cvv = checkoutSession.payment.promotion_card_cvv;
            paymentDataFinalizeObject.personContactInformation = {
               email: checkoutSession.payment.promotion_card_mail
            };

            if (checkoutSession.payment.promotion_card_hashId) {
               paymentDataFinalizeObject.hashId = checkoutSession.payment.promotion_card_hashId;
               paymentDataFinalizeObject.invoiceCountry = {
                  code: checkoutSession.payment.promotion_card_country
               };
               paymentDataFinalizeObject.buyerDocumentation = {
                  "documentType": checkoutSession.payment.promotion_card_document_type,
                  "identity": checkoutSession.payment.promotion_card_document_number
               };
            } else {
               paymentDataFinalizeObject.creditCardCodeType = "";
               paymentDataFinalizeObject.number = checkoutSession.payment.promotion_card_number;
               paymentDataFinalizeObject.expiration = this.transformExpirationDate(checkoutSession.payment.promotion_card_expiration);

               // buyerDocumentation
               paymentDataFinalizeObject.buyerDocumentation = {
                  "documentType": checkoutSession.payment.promotion_card_document_type,
                  "identity": checkoutSession.payment.promotion_card_document_number
               };

               // invoiceCountry
               for (i = 0; i < services.countries.length; i++) {
                  if (checkoutSession.payment.promotion_card_country == services.countries[i].code) {
                     paymentDataFinalizeObject.invoiceCountry = services.countries[i];
                     break;
                  }
               }

               // creditCardCodeType
               var index_card = 1;
               for (i = 0; i < checkoutSession.methods.length; i++) {
                  if (paymentDataFinalizeObject.paymentType == checkoutSession.methods[i].type) {
                     index_card = i;
                     break;
                  }
               }

               for (i = 0; i < checkoutSession.methods[index_card].creditCards.length; i++) {
                  if (checkoutSession.payment.promotion_card_type == checkoutSession.methods[index_card].creditCards[i].identity) {
                     paymentDataFinalizeObject.creditCardCodeType = checkoutSession.methods[index_card].creditCards[i];
                     break;
                  }
               }

               // holder
               var cardHolder = checkoutSession.payment.promotion_card_holder;
               var cardName = checkoutSession.payment.promotion_card_name;

               if (cardHolder == "other") {
                  paymentDataFinalizeObject.holder = cardName;
               } else {
                  for (var index in checkoutSession.passengers) {
                     if (index == cardHolder) {
                        paymentDataFinalizeObject.holder = checkoutSession.passengers[index].info.name + ' ' + checkoutSession.passengers[index].info.surname_1 + ' ' + checkoutSession.passengers[index].info.surname_2;
                        break;
                     }
                  }
               }

            }

         } else if (checkoutSession.payment.paypal == 1) {

            if (checkoutSession.payment.promotion_paypal_code != '' && checkoutSession.payment.code_promotion_valid == 'true') {
               /* Paypal Promo */
               paymentDataFinalizeObject.paymentType = "PROMOPAYPAL";

               checkoutSession.payment.promotion_paypal = 1;
               checkoutSession.payment.paypal = 0;
               //Promotion code
               paymentDataFinalizeObject.promotionCode = checkoutSession.payment.promotion_paypal_code;

               // Email
               paymentDataFinalizeObject.personContactInformation = {
                  email: checkoutSession.payment.paypal_promo_mail
               };

               // Documentation
               paymentDataFinalizeObject.buyerDocumentation = {
                  documentType: checkoutSession.payment.paypal_promo_document_type,
                  identity: checkoutSession.payment.paypal_promo_document_number
               };

               // Invoice country
               for (i = 0; i < services.countries.length; i++) {
                  if (checkoutSession.payment.paypal_promo_country == services.countries[i].code) {
                     paymentDataFinalizeObject.invoiceCountry = services.countries[i];
                     break;
                  }
               }

               // Holder
               var cardHolder = checkoutSession.payment.paypal_promo_holder;
               var cardName = checkoutSession.payment.paypal_promo_name;

               if (cardHolder == "other") {
                  paymentDataFinalizeObject.holder = cardName;
               } else {
                  for (var index in checkoutSession.passengers) {
                     if (index == cardHolder) {
                        paymentDataFinalizeObject.holder = checkoutSession.passengers[index].info.name + ' ' + checkoutSession.passengers[index].info.surname_1 + ' ' + checkoutSession.passengers[index].info.surname_2;
                        break;
                     }
                  }
               }

            } else {
               /* Paypal */
               paymentDataFinalizeObject.paymentType = "PAYPAL";

               // Email
               paymentDataFinalizeObject.personContactInformation = {
                  email: checkoutSession.payment.paypal_mail
               };

               // Documentation
               paymentDataFinalizeObject.buyerDocumentation = {
                  documentType: checkoutSession.payment.paypal_document_type,
                  identity: checkoutSession.payment.paypal_document_number
               };

               // Invoice country
               for (i = 0; i < services.countries.length; i++) {
                  if (checkoutSession.payment.paypal_country == services.countries[i].code) {
                     paymentDataFinalizeObject.invoiceCountry = services.countries[i];
                     break;
                  }
               }

               // Holder
               var cardHolder = checkoutSession.payment.paypal_holder;
               var cardName = checkoutSession.payment.paypal_name;

               if (cardHolder == "other") {
                  paymentDataFinalizeObject.holder = cardName;
               } else {
                  for (var index in checkoutSession.passengers) {
                     if (index == cardHolder) {
                        paymentDataFinalizeObject.holder = checkoutSession.passengers[index].info.name + ' ' + checkoutSession.passengers[index].info.surname_1 + ' ' + checkoutSession.passengers[index].info.surname_2;
                        break;
                     }
                  }
               }

            }

         } else if (checkoutSession.payment.mymiles == 1) {

            paymentDataFinalizeObject.paymentType = "MILES";
            paymentDataFinalizeObject.miles = checkoutSession.payment.mymiles_percentage_points;
            paymentDataFinalizeObject.cvv = parseInt(checkoutSession.payment.mymiles_card_cvv);

            // Pago con Millas
            if (checkoutSession.payment.mymiles_credit_card_hashId) {
               paymentDataFinalizeObject.hashId = checkoutSession.payment.mymiles_credit_card_hashId;
               paymentDataFinalizeObject.invoiceCountry = {
                  code: checkoutSession.payment.mymiles_card_country
               };
               paymentDataFinalizeObject.buyerDocumentation = {
                  "documentType": checkoutSession.payment.mymiles_card_document_type,
                  "identity": checkoutSession.payment.mymiles_card_document_number
               };
            } else {
               paymentDataFinalizeObject.creditCardCodeType = "";
               paymentDataFinalizeObject.number = checkoutSession.payment.mymiles_card_number;
               paymentDataFinalizeObject.expiration = this.transformExpirationDate(checkoutSession.payment.mymiles_card_expiration);

               // buyerDocumentation
               paymentDataFinalizeObject.buyerDocumentation = {
                  "documentType": checkoutSession.payment.mymiles_card_document_type,
                  "identity": checkoutSession.payment.mymiles_card_document_number
               };

               // invoiceCountry
               for (i = 0; i < services.countries.length; i++) {
                  if (checkoutSession.payment.mymiles_card_country == services.countries[i].code) {
                     paymentDataFinalizeObject.invoiceCountry = {};
                     paymentDataFinalizeObject.invoiceCountry.code = services.countries[i].code;
                     break;
                  }
               }

               // creditCardCodeType
               var index_card = 1;
               for (i = 0; i < checkoutSession.methods.length; i++) {
                  if (paymentDataFinalizeObject.paymentType == checkoutSession.methods[i].type) {
                     index_card = i;
                     break;
                  }
               }

               for (i = 0; i < checkoutSession.methods[index_card].creditCards.length; i++) {
                  if (checkoutSession.payment.mymiles_card_type == checkoutSession.methods[index_card].creditCards[i].identity) {
                     paymentDataFinalizeObject.creditCardCodeType = {};
                     paymentDataFinalizeObject.creditCardCodeType.identity = checkoutSession.methods[index_card].creditCards[i].identity;
                     break;
                  }
               }

               // holder
               var cardHolder = checkoutSession.payment.mymiles_card_holder;
               var cardName = checkoutSession.payment.mymiles_card_name;

               if (cardHolder == "other") {
                  paymentDataFinalizeObject.holder = cardName;
               } else {
                  for (var index in checkoutSession.passengers) {
                     if (index == cardHolder) {
                        paymentDataFinalizeObject.holder = checkoutSession.passengers[index].info.name + ' ' + checkoutSession.passengers[index].info.surname_1 + ' ' + checkoutSession.passengers[index].info.surname_2;
                        break;
                     }
                  }
               }
            }
         } else if (checkoutSession.payment.promotion_paypal == 1) {

            if (checkoutSession.payment.promotion_paypal_code != '' && checkoutSession.payment.code_promotion_valid == 'true') {
               /* Paypal Promo */
               paymentDataFinalizeObject.paymentType = "PROMOPAYPAL";
               //Promotion code
               paymentDataFinalizeObject.promotionCode = checkoutSession.payment.promotion_paypal_code;

            } else {
               /* Paypal */
               paymentDataFinalizeObject.paymentType = "PAYPAL";

               checkoutSession.payment.promotion_paypal = 0;
               checkoutSession.payment.paypal = 1;
            }

            // Email
            paymentDataFinalizeObject.personContactInformation = {
               email: checkoutSession.payment.paypal_promo_mail
            };

            // Documentation
            paymentDataFinalizeObject.buyerDocumentation = {
               documentType: checkoutSession.payment.paypal_promo_document_type,
               identity: checkoutSession.payment.paypal_promo_document_number
            };

            // Invoice country
            for (i = 0; i < services.countries.length; i++) {
               if (checkoutSession.payment.paypal_promo_country == services.countries[i].code) {
                  paymentDataFinalizeObject.invoiceCountry = services.countries[i];
                  break;
               }
            }

            // Holder
            var cardHolder = checkoutSession.payment.paypal_promo_holder;
            var cardName = checkoutSession.payment.paypal_promo_name;

            if (cardHolder == "other") {
               paymentDataFinalizeObject.holder = cardName;
            } else {
               for (var index in checkoutSession.passengers) {
                  if (index == cardHolder) {
                     paymentDataFinalizeObject.holder = checkoutSession.passengers[index].info.name + ' ' + checkoutSession.passengers[index].info.surname_1 + ' ' + checkoutSession.passengers[index].info.surname_2;
                     break;
                  }
               }
            }
         }

         paymentDataFinalizeObject.newsletter = checkoutSession.sendComunication;

         return paymentDataFinalizeObject;

      },

      putPaymentWithSara: function(success, failure, checkoutSession) {
         var passengers = [];

         if (checkoutSession.saraData.saraPassengers) {
            $.each(checkoutSession.saraData.saraPassengers, function(indexPassenger, passenger) {
               passenger.number = parseInt(passenger.number);

               passengers.push(passenger);
            });
         }

         var postObject = {
            passengers: passengers,
            paymentInformation: this.createPaymentPostObject(checkoutSession)
         };

         //console.log("Lo que mandamos en el SARA");
         //console.log(postObject);

         var url = getServiceURL('h72_payment.finalize');
         url = url.replace('{bookingId}', checkoutSession.bookingId);

         Bus.publish('ajax', 'putToService', {
            data: postObject,
            path: url,
            success: function(data) {
               success(data);
            }
         });
      },

      createPaymentPostObject: function(checkoutSession) {
         var services = this.h72ListsCache;
         var paymentObject = {};

         //console.log(checkoutSession);

         if (checkoutSession.payment.credit_card == 1) {

            if (checkoutSession.payment.credit_card_hashId) {
               paymentObject.paymentType = "CREDITCARD";
               paymentObject.cvv = checkoutSession.payment.credit_card_cvv;
               paymentObject.hashId = checkoutSession.payment.credit_card_hashId;

               // invoiceCountry
               for (i = 0; i < services.countries.length; i++) {
                  if (checkoutSession.payment.credit_card_country == services.countries[i].code) {
                     paymentObject.invoiceCountry = services.countries[i];
                     break;
                  }
               }

            } else {

               // Pago con tarjeta de crédito/débito

               paymentObject.paymentType = "CREDITCARD";
               paymentObject.number = checkoutSession.payment.credit_card_number;
               paymentObject.expiration = this.transformExpirationDate(checkoutSession.payment.credit_card_expiration);
               paymentObject.cvv = checkoutSession.payment.credit_card_cvv;
               // paymentObject.alias = "";

               // invoiceCountry
               for (i = 0; i < services.countries.length; i++) {
                  if (checkoutSession.payment.credit_card_country == services.countries[i].code) {
                     paymentObject.invoiceCountry = services.countries[i];
                     break;
                  }
               }

               // creditCardCodeType
               var index_card = 1;
               for (i = 0; i < checkoutSession.methods.length; i++) {
                  if (paymentObject.paymentType == checkoutSession.methods[i].type) {
                     index_card = i;
                     break;
                  }
               }

               for (i = 0; i < checkoutSession.methods[index_card].creditCards.length; i++) {
                  if (checkoutSession.payment.credit_card_type == checkoutSession.methods[index_card].creditCards[i].identity) {
                     paymentObject.creditCardCodeType = checkoutSession.methods[index_card].creditCards[i];
                     break;
                  }
               }

               // holder
               var cardHolder = checkoutSession.payment.credit_card_holder;
               var cardName = checkoutSession.payment.credit_card_name;

               //console.log(cardHolder)

               if (cardHolder == "other") {
                  paymentObject.holder = cardName;
               } else {
                  for (var index in checkoutSession.passengers) {
                     if (index == cardHolder) {
                        paymentObject.holder = checkoutSession.passengers[index].name + ' ' + checkoutSession.passengers[index].surname_1 + ' ' + checkoutSession.passengers[index].surname_2;
                        break;
                     }
                  }
               }
            }

         } else if (checkoutSession.payment.ae_card == 1) {

            // Pago con tarjeta de crédito AirEuropa

            paymentObject.paymentType = "AIREUROPA_CREDITCARD";
            paymentObject.number = checkoutSession.payment.ae_card_number;
            paymentObject.expiration = this.transformExpirationDate(checkoutSession.payment.ae_card_expiration);
            paymentObject.cvv = checkoutSession.payment.ae_card_cvv;

            // invoiceCountry
            for (i = 0; i < services.countries.length; i++) {
               if (checkoutSession.payment.ae_card_country == services.countries[i].code) {
                  paymentObject.invoiceCountry = services.countries[i];
                  break;
               }
            }

            var cardHolder = checkoutSession.payment.ae_credit_card_holder;
            var cardName = checkoutSession.payment.ae_card_name;

            // holder
            if (cardHolder == "other") {
               paymentObject.holder = cardName;
            } else {
               for (var index in checkoutSession.passengers) {
                  if (index == cardHolder) {
                     paymentObject.holder = checkoutSession.passengers[index].info.name + ' ' + checkoutSession.passengers[index].info.surname_1 + ' ' + checkoutSession.passengers[index].info.surname_2;
                     break;
                  }
               }
            }

         } else if (checkoutSession.payment.myae == 1) {

            // Pago con MyAirEuropa

            paymentObject.paymentType = "MYAIREUROPA";
            paymentObject.number = checkoutSession.payment.myae_card_number;
            paymentObject.expiration = this.transformExpirationDate(checkoutSession.payment.myae_card_expiration);
            paymentObject.cvv = parseInt(checkoutSession.payment.myae_card_cvv);
            paymentObject.creditCardCodeType = null;

            // invoiceCountry
            for (i = 0; i < services.countries.length; i++) {
               if (checkoutSession.payment.myae_card_country == services.countries[i].code) {
                  paymentObject.invoiceCountry = services.countries[i];
                  break;
               }
            }

            // holder
            var cardHolder = checkoutSession.payment.myae_card_holder;
            var cardName = checkoutSession.payment.myae_card_name;

            if (cardHolder == "other") {
               paymentObject.holder = cardName;
            } else {
               for (var index in checkoutSession.passengers) {
                  if (index == cardHolder) {
                     paymentObject.holder = checkoutSession.passengers[index].info.name + ' ' + checkoutSession.passengers[index].info.surname_1 + ' ' + checkoutSession.passengers[index].info.surname_2;
                     break;
                  }
               }
            }

         } else if (checkoutSession.payment.reserve == 1) {

            // Pago por transferencia/oficina/reserva
            paymentObject.paymentType = "TRANSFER";

         } else if (checkoutSession.payment.promotion == 1) {

            // Pago con código promocional

            paymentObject.paymentType = "PROMOTION";
            paymentObject.creditCardCodeType = "";
            paymentObject.number = checkoutSession.payment.promotion_card_number;
            paymentObject.promotionCode = checkoutSession.payment.promotion_code;
            paymentObject.expiration = this.transformExpirationDate(checkoutSession.payment.promotion_card_expiration);
            //paymentObject.expiration = checkoutSession.payment.promotion_card_expiration;
            paymentObject.cvv = checkoutSession.payment.promotion_card_cvv;

            // invoiceCountry
            for (i = 0; i < services.countries.length; i++) {
               if (checkoutSession.payment.promotion_card_country == services.countries[i].code) {
                  paymentObject.invoiceCountry = services.countries[i];
                  break;
               }
            }

            // creditCardCodeType
            var index_card = 1;
            for (i = 0; i < checkoutSession.methods.length; i++) {
               if (paymentObject.paymentType == checkoutSession.methods[i].type) {
                  index_card = i;
                  break;
               }
            }

            for (i = 0; i < checkoutSession.methods[index_card].creditCards.length; i++) {
               if (checkoutSession.payment.promotion_card_type == checkoutSession.methods[index_card].creditCards[i].identity) {
                  paymentObject.creditCardCodeType = checkoutSession.methods[index_card].creditCards[i];
                  break;
               }
            }

            // holder
            var cardHolder = checkoutSession.payment.promotion_card_holder;
            var cardName = checkoutSession.payment.promotion_card_name;

            if (cardHolder == "other") {
               paymentObject.holder = cardName;
            } else {
               for (var index in checkoutSession.passengers) {
                  if (index == cardHolder) {
                     paymentObject.holder = checkoutSession.passengers[index].info.name + ' ' + checkoutSession.passengers[index].info.surname_1 + ' ' + checkoutSession.passengers[index].info.surname_2;
                     break;
                  }
               }
            }

         } else if (checkoutSession.payment.paypal == 1) {
            paymentObject.paymentType = "PAYPAL";
         } else if (checkoutSession.payment.promotion_paypal == 1) {
            paymentObject.paymentType = "PROMOPAYPAL";
         } else if (checkoutSession.payment.mymiles == 1) {

            // Pago con Millas

            paymentObject.paymentType = "MILES";
            paymentObject.creditCardCodeType = "";
            paymentObject.number = checkoutSession.payment.mymiles_card_number;
            paymentObject.expiration = this.transformExpirationDate(checkoutSession.payment.mymiles_card_expiration);
            paymentObject.cvv = parseInt(checkoutSession.payment.mymiles_card_cvv);

            // creditCardCodeType
            var index_card = 1;
            for (i = 0; i < checkoutSession.methods.length; i++) {
               if (paymentObject.paymentType == checkoutSession.methods[i].type) {
                  index_card = i;
                  break;
               }
            }

            for (i = 0; i < checkoutSession.methods[index_card].creditCards.length; i++) {
               if (checkoutSession.payment.mymiles_card_type == checkoutSession.methods[index_card].creditCards[i].identity) {
                  paymentObject.creditCardCodeType = {};
                  paymentObject.creditCardCodeType.identity = checkoutSession.methods[index_card].creditCards[i].identity;
                  break;
               }
            }

            // invoiceCountry
            for (i = 0; i < services.countries.length; i++) {
               if (checkoutSession.payment.mymiles_card_country == services.countries[i].code) {
                  paymentObject.invoiceCountry = {};
                  paymentObject.invoiceCountry.code = services.countries[i].code;
                  break;
               }
            }

            // holder
            var cardHolder = checkoutSession.payment.mymiles_card_holder;
            var cardName = checkoutSession.payment.mymiles_card_name;

            if (cardHolder == "other") {
               paymentObject.holder = cardName;
            } else {
               for (var index in checkoutSession.passengers) {
                  if (index == cardHolder) {
                     paymentObject.holder = checkoutSession.passengers[index].info.name + ' ' + checkoutSession.passengers[index].info.surname_1 + ' ' + checkoutSession.passengers[index].info.surname_2;
                     break;
                  }
               }
            }

         }

         // console.log(paymentObject);
         //console.log(JSON.stringify(paymentObject));

         return paymentObject;

      },

      /* Aux function to transform expiration dates */

      transformExpirationDate: function(date) {
         var newDate = "20" + date.substr(3) + "-" + date.substr(0, 2) + "-01";

         return newDate;
      },

      /* Call me back screen */

      postCallMeBack: function(success, failure, sessionId, contactInfo) {
         /* Create post object to send it to server */
         var postObject = {
            email: contactInfo.field_cmb_email,
            name: contactInfo.field_cmb_name,
            telephoneNumber: contactInfo.field_cmb_phone_prefix + contactInfo.field_cmb_phone
         };

         Bus.publish('ajax', 'postToService', {
            data: postObject,
            path: getServiceURL('checkout.callmeback').replace('{sessionId}', sessionId).replace('{currencyCode}', window.appConfig.currentCurrency.code),
            success: function(data) {
               success(data);
            }
         });
      },

      /* Insert hotel nights in USA promotion */
      setHotelNights: function(success, failure, bookingId, nightsHotels) {
         Bus.publish('ajax', 'getFromService', {
            path: getServiceURL('checkout.hotel_nights').replace('{bookingId}', bookingId).replace('{nightsHotels}', nightsHotels),
            success: function(data) {
               success(data);
            }
         });
      },

      /* Order preference Airports by Zone */
      orderAirportsByZone: function(airports) {
         var results = new Array();
         var airportsPerZone = {};
         var orderedAirportsPerZone = {};

         /* Order the airports per zone */
         $.each(airports, function(index, airport) {
            if (airport.zone) { /* If the airport is classified by zone */
               if (airportsPerZone[airport.zone] == undefined) {
                  airportsPerZone[airport.zone] = [];
               }

               airportsPerZone[airport.zone].push({
                  description: airport.description,
                  code: airport.code,
                  resident: airport.resident,
                  zone: airport.zone
               });
            } else { /* If it doesn't have, save it in a generic category */
               if (airportsPerZone['generic'] == undefined) {
                  airportsPerZone['generic'] = [];
               }

               airportsPerZone['generic'].push({
                  description: airport.description,
                  code: airport.code,
                  resident: airport.resident,
                  zone: airport.zone
               });

            }
         });

         /* Order the zones like in the config */
         if (AirEuropaConfig.zonesAvailable != undefined) {
            $.each(AirEuropaConfig.zonesAvailable, function(index, zone) {

               /* If the zone has some results, save it on the new array */
               if (airportsPerZone[zone]) {
                  orderedAirportsPerZone[zone] = airportsPerZone[zone];
               }
            });
         }

         /* Append at the end the generic category if it's needed */
         if (airportsPerZone['generic']) {
            orderedAirportsPerZone['generic'] = airportsPerZone['generic'];
         }

         /* Create the array to loop through Handlebars */
         $.each(orderedAirportsPerZone, function(index, zone) {

            results.push({
               code: index,
               name: (index != 'generic') ? lang('zones.' + index) : undefined,
               airports: zone
            });
         });

         return results;
      }
   };
});
