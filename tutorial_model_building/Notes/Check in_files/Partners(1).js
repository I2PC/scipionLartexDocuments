Hydra.module.register('PartnersController', function(Bus, Module, ErrorHandler, Api) {
	return {
		selector : 'div[data-partners]',
		partnersData : undefined,
		events : {
			'partnersController' : {
				'searchPartners' : function(oNotify) {
					if (!oNotify.success) {oNotify.success = function(){};}
					if (!oNotify.failure) {oNotify.failure = function(){};}
					this.searchPartners(oNotify.success, oNotify.failure);
				},
				'redeem' : function(oNotify) {
					if (!oNotify.success) {oNotify.success = function(){};}
					if (!oNotify.failure) {oNotify.failure = function(){};}
					this.redeem(oNotify.redemptionRequest, oNotify.success, oNotify.failure);
				},
				'updatePreferences' : function(oNotify) {
					if (!oNotify.success) {oNotify.success = function(){};}
					if (!oNotify.failure) {oNotify.failure = function(){};}
					this.updatePreferences(oNotify.success, oNotify.failure);
				},
				'getBeLiveUrl' : function(oNotify) {
					if (!oNotify.success) {oNotify.success = function(){};}
					if (!oNotify.failure) {oNotify.failure = function(){};}
					this.getBeLiveUrl(oNotify.baseUrl, oNotify.productType, oNotify.success, oNotify.failure);
				}
			}
		},
	
		init : function() {

			
		},
		
		searchPartners : function(success, failure) {
			var self = this;
			Bus.publish('partnersServices', 'getPartners', {
				success : function(data) {
					self.partnersData = data;
					success(self.buildContext(data));
				},
				failure : function(data) {
					failure(data);
				}
			});
		},
	
		buildContext : function(JSONData) {
			return {
				info : {
					noCepsaUser : !JSONData.body.data.cepsaData && !JSONData.body.data.cepsaUser,
					halfCepsaUser : JSONData.body.data.cepsaData && !JSONData.body.data.cepsaUser,
					fullCepsaUserNoPoints : JSONData.body.data.cepsaData && JSONData.body.data.cepsaUser && !this.hasEnoughCepsaPoints(_.findWhere(JSONData.body.data.partners, {id : 'CEPSA'}).productTypes[0].minValue),
					fullCepsaUserPoints : JSONData.body.data.cepsaData && JSONData.body.data.cepsaUser && this.hasEnoughCepsaPoints(_.findWhere(JSONData.body.data.partners, {id : 'CEPSA'}).productTypes[0].minValue)
				},
				amazon : this.buildAmazonContext(_.findWhere(JSONData.body.data.partners, {id : 'AMAZON'})),
				cepsa : this.buildCepsaContext(_.findWhere(JSONData.body.data.partners, {id : 'CEPSA'})),
				halcon : this.buildHalconContext(_.findWhere(JSONData.body.data.partners, {id : 'HALCON'})),
				belive : this.buildBeLiveContext(_.findWhere(JSONData.body.data.partners, {id : 'BELIVE'}))
				// skyteam : this.buildSkyteamContext(_.findWhere(JSONData.body.data.partners, {id : 'SKYTEAM'}))
			}
		},
	
		buildAmazonContext : function(amazonJSONData) {
			var JSONAmazon1 = _.findWhere(amazonJSONData.productTypes, {id : 'AMAZON1'});
			var amazon1 = {
					euros : JSONAmazon1.price,
					miles : JSONAmazon1.miles,
					disabled : this.isDisabled(JSONAmazon1.available, JSONAmazon1.miles, this.getLoyaltyUserMiles())
			};
			
			var JSONAmazon2 = _.findWhere(amazonJSONData.productTypes, {id : 'AMAZON2'});
			var amazon2 = {
					euros : JSONAmazon2.price,
					miles : JSONAmazon2.miles,
					disabled : this.isDisabled(JSONAmazon2.available, JSONAmazon2.miles, this.getLoyaltyUserMiles())
			};
			
			var JSONAmazon3 = _.findWhere(amazonJSONData.productTypes, {id : 'AMAZON3'});
			var amazon3 = {
				euros : JSONAmazon3.price,
				miles : JSONAmazon3.miles,
				disabled : this.isDisabled(JSONAmazon3.available, JSONAmazon3.miles, this.getLoyaltyUserMiles())
			};
	
			return {
				amazon1 : amazon1,
				amazon2 : amazon2,
				amazon3 : amazon3
			}
		},
	
		buildCepsaContext : function(cepsaJSONData) {
			return {
				minValue : cepsaJSONData.productTypes[0].minValue,
				maxValue : this.getLoyaltyUserMiles(),
				conversionFactor : cepsaJSONData.productTypes[0].factor
			}
		},
	
		// buildSkyteamContext : function(skyteamJSONData) {
		// 	return {
		// 	}
		// },

		buildHalconContext : function(halconJSONData) {
			var JSONHalcon1 = _.findWhere(halconJSONData.productTypes, {id : 'HALCON1'});
			var halcon1 = {
					euros : JSONHalcon1.price,
					miles : JSONHalcon1.miles,
					disabled : this.isDisabled(JSONHalcon1.available, JSONHalcon1.miles, this.getLoyaltyUserMiles())
			};
			
			var JSONHalcon2 = _.findWhere(halconJSONData.productTypes, {id : 'HALCON2'});
			var halcon2 = {
					euros : JSONHalcon2.price,
					miles : JSONHalcon2.miles,
					disabled : this.isDisabled(JSONHalcon2.available, JSONHalcon2.miles, this.getLoyaltyUserMiles())
			};
			
			var JSONHalcon3 = _.findWhere(halconJSONData.productTypes, {id : 'HALCON3'});
			var halcon3 = {
				euros : JSONHalcon3.price,
				miles : JSONHalcon3.miles,
				disabled : this.isDisabled(JSONHalcon3.available, JSONHalcon3.miles, this.getLoyaltyUserMiles())
			};
	
			return {
				halcon1 : halcon1,
				halcon2 : halcon2,
				halcon3 : halcon3
			}
		},
		
		buildBeLiveContext : function(beliveJSONData) {
			var self = this;
			var promotions = [];
			var destinations = [];

			beliveJSONData.destinations.forEach(function(element, index, array) {
				var seasons = [];
				for(var i = 0; i < element.seasons.length; i++) {
					var promotions = [];
					var season = {
						id: element.seasons[i].id,
						name: lang('partners.' + element.seasons[i].name) + ' (' + lang('partners.belive_season_from') + ' ' + element.seasons[i].startDate + ' ' + lang('partners.belive_season_to') + ' ' + element.seasons[i].endDate + ')',
						promotions: promotions
					}
					seasons.push(season);
				}
				var destination = {
					id: element.id,
					name: lang('partners.' + element.name),
					seasons: seasons
				};

				destinations.push(destination);
			});

			beliveJSONData.productTypes.forEach(function(element, index, array) {
				var promotion = {
					id: element.id,
					name: element.name,
					description: element.description,
					miles: element.miles,
					url: element.url.replace('{language}', langCode),
					order: element.order,
					destinationId: element.destination.id,
					seasonId: element.season.id,
					available: self.getLoyaltyUserMiles() >= element.miles
				}
				promotions.push(promotion);
			});

			promotions.forEach(function(element, index, array) {
				for(var i = 0; i < destinations.length; i++) {
					if(element.destinationId === destinations[i].id) {
						for(var j = 0; j < destinations[i].seasons.length; j++) {
							if(element.seasonId === destinations[i].seasons[j].id) {
								destinations[i].seasons[j].promotions.push(element);
							}
						}
					}
				}
			});

			return {
				destinations: destinations
			}
		},

		obtainToken : function() {
			var deferred = $.Deferred();
			Bus.publish('partnersServices', 'getToken', {
				success : function(tokenResponse) {
					deferred.resolve(tokenResponse.body.data);
	            },
	            failure : function(tokenResponse) {
	            	deferred.reject(tokenResponse);
	            }
	        });
			return deferred.promise();
		},
		
		redeem : function(redemptionRequest, success, failure) {
			var self = this;
			Bus.publish('partnersServices', 'redeem', {
				redemptionRequest : redemptionRequest,
				success : function(redemptionResponse) {
					success(self.buildRedeemSuccessContext(redemptionRequest, redemptionResponse));
				},
				failure : function(redemptionResponse) {
					failure(self.buildRedeemErrorContext(redemptionResponse));
				}
			});
		},
		
		buildRedeemSuccessContext : function(redemptionRequest, redemptionResponse) {
			var successContext = undefined;
			switch(redemptionRequest.partnerId) {
				case "AMAZON":
					successContext = {
						voucher : true,
						code : redemptionResponse.body.data.code
					};
					break;
				case "CEPSA":
					successContext = {
						cepsa : true,
						pending : redemptionResponse.header.code === 202
					};
					break;
				case "HALCON":
					successContext = {
						voucher : true,
						code : redemptionResponse.body.data.code
					};
					break;
				default:
					break;
			}
			return successContext;
		},
		
		buildRedeemErrorContext : function(redemptionResponse) {
			var errorContext = {
				error : true
			};
			if (redemptionResponse.header.code === 412) {
				errorContext.code412 = true;
			} else if(redemptionResponse.header.code === 409) {
				errorContext.code409 = true;
			}
			return errorContext;
		},
		
		updatePreferences : function(success, failure) {
			var self = this;
			Bus.publish('partnersServices', 'updatePreferences', {
				success : function(data) {
					success();
				},
				failure : function(data) {
					failure();
				}
			});
		},
		
		getBeLiveUrl : function(baseUrl, productType, success, failure) {
			var self = this;
			var obtainingToken = this.obtainToken();
			var obtainingTransaction = this.obtainTransaction('belive', productType);
			$.when(obtainingToken, obtainingTransaction)
			.done(function(token, transaction) {
				var beLiveUrl = baseUrl.concat('?txId=');
				beLiveUrl = beLiveUrl.concat(transaction);
				beLiveUrl = beLiveUrl.concat('&password=');
				beLiveUrl = beLiveUrl.concat(token);
				success(beLiveUrl);
			})
			.fail(function(tokenResponse, transactionResponse) {
				failure();
			});
		},

		obtainTransaction : function(partner, productType) {
			var deferred = $.Deferred();
			Bus.publish('partnersServices', 'getTransaction', {
				partner: partner,
				productType: productType,
				success : function(transactionResponse) {
					deferred.resolve(transactionResponse.body.data);
	            },
	            failure : function(transactionResponse) {
	            	deferred.reject(transactionResponse);
	            }
	        });
			return deferred.promise();
		},
	
		isAffordable : function(productMiles, userMiles) {
			return (userMiles >= productMiles);
		},
		
		isDisabled : function(available, productMiles, userMiles) {
			return !available || !this.isAffordable(productMiles, userMiles)
		},
		
		getLoyaltyUser : function() {
			return localStorage.ly_frequentFlyerIdentity;
		},
		
		getLoyaltyUserMiles : function() {
			return localStorage.ly_accumulatedMiles;
		},
		
		hasEnoughCepsaPoints : function(cepsaMinValue) {
			return this.getLoyaltyUserMiles() >= cepsaMinValue;
		}
	};
});