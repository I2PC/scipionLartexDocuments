Hydra.module.register('Partners', function(Bus, Module, ErrorHandler, Api) {
	return {
		selector : 'div[data-partners]',
		element : undefined,
		references : ['amazon', 'cepsa', 'europcar', 'halconviajes', 'ecuador', 'belive', 'nhhoteles','aireuropa','skyteam'],
		context : undefined,
		mainPageTemplate : undefined,
		confirmDialogTemplate : undefined,
		redeemResultTemplate : undefined,
		basicDialogTemplate : undefined,
		events : {
			'partnersView' : {
				'showPartner' : function(oNotify) {
					if (!oNotify.success) {oNotify.success = function(){};}
					if (!oNotify.failure) {oNotify.failure = function(){};}
					this.showPartner(oNotify.partner);
				}
			}
		},

		startLoading : function() {
			this.element.addClass('loading');
			this.element.addClass('start_loading');
			$(window).scrollTop(0);
		},

		stopLoading : function() {
			var self = this;
			this.element.addClass('loading_finished');
			setTimeout(function() {
				self.element.removeClass('loading start_loading loading_finished');
			}, 500);
		},
		
		searchPartners : function() {
			var deferred = $.Deferred();
			Bus.publish('partnersController', 'searchPartners', {
				success : function(data) {
					deferred.resolve(data);
				},
				failure : function(data) {
					deferred.reject(data);
				}
			});
			return deferred.promise();
		},

		searchTemplate : function(path) {
			var deferred = $.Deferred();
			Bus.publish('ajax', 'getTemplate', {
				path : path,
				success : function(template) {
					deferred.resolve(template);
				},
				failure : function(template) {
					deferred.reject(template);
				}
			});
			return deferred.promise();
		},

		init : function() {
			this.element = $(this.selector);
			
			if (this.element.length > 0) {
				
				var reference = this.calculateAndSetHash();

				this.startLoading();

				var self = this;
				var searchingPartners = this.searchPartners();
				var searchingMainPageTemplate = this.searchTemplate(AirEuropaConfig.templates.partners.partners);
				var searchingConfirmDialogTemplate = this.searchTemplate(AirEuropaConfig.templates.partners.confirm_redeem_dialog);
				var searchingRedeemResultTemplate = this.searchTemplate(AirEuropaConfig.templates.partners.confirm_redeem_success);
				var searchingBasicDialogTemplate = this.searchTemplate(AirEuropaConfig.templates.partners.basic_dialog);
				
				$.when(searchingPartners, searchingMainPageTemplate, searchingConfirmDialogTemplate, searchingRedeemResultTemplate, searchingBasicDialogTemplate)
				.done(function(mainPageContext, mainPageTemplate, confirmDialogTemplate, redeemResultTemplate, basicDialogTemplate) {
					self.context = mainPageContext;
					self.mainPageTemplate = mainPageTemplate;
					self.buildMainPage(mainPageTemplate, mainPageContext, reference);
					self.buildMessages();
					self.loadStyles();
					self.loadBehaviour();
					self.confirmDialogTemplate = confirmDialogTemplate;
					self.redeemResultTemplate = redeemResultTemplate;
					self.basicDialogTemplate = basicDialogTemplate;
				})
				.fail(function(mainPageContext, mainPageTemplate, confirmDialogTemplate, redeemResultTemplate, basicDialogTemplate) {
					var internalErrorTemplateHtml = lang('partners.service_down');
					self.element.find('.inner_block_content.partners_info').ui_dialog({
	                    title: lang('general.error_title'),
	                    error: true,
	                    subtitle: internalErrorTemplateHtml,
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
				})
				.always(function() {
					self.stopLoading();
				});
			}
		},
		
		refresh : function() {
			var self = this;
			var searchingPartners = this.searchPartners();
			
			var reference = this.calculateAndSetHash();
			
			searchingPartners
			.done(function(mainPageContext) {
				self.buildMainPage(self.mainPageTemplate, mainPageContext, reference);
				self.buildMessages();
				self.loadStyles();
				self.loadBehaviour();
			})
			.fail(function(mainPageContext) {
				var internalErrorTemplateHtml = lang('partners.service_down');
				self.element.find('.inner_block_content').append(internalErrorTemplateHtml);
			});
		},
		
		buildMainPage : function(template, context, reference) {
			var html = template(context);
			this.element.find('.partners_info').show();
			this.element.find('.inner_block_content_partners').html(html);
			this.hidePartners();
			this.showPartner(reference);
		},
		
		buildMessages : function() {
			var notHaveCepsaPointsElement = this.element.find('#partners .cepsa #not_have_cepsa_points'); 
			if(notHaveCepsaPointsElement.length > 0) {
				notHaveCepsaPointsElement.html(notHaveCepsaPointsElement.html().replace('{minCepsaMiles}', $('#partners .cepsa #not_have_cepsa_points').data('min')));				
			}
		},
		
		loadStyles : function() {
			Bus.publish('inner', 'custom_init');
			Bus.publish('loyalty', 'loaded');
		},
		
		loadBehaviour : function() {
			this.loadAmazonBehaviour();
			this.loadCepsaBehaviour();
			this.loadHalconBehaviour();
			this.loadEcuadorBehaviour();
			this.loadBeLiveBehaviour();
			this.loadSkyteamBehaviour();
		},
		
		loadAmazonBehaviour : function() {
			var self = this;
			this.element.find('#partners .amazon .miles_button a').on('click', function(event) {
				event.preventDefault();
				var redemptionRequest = {
						partnerId : $(event.target).parents('#partners .amazon .miles_button').data('partnerid'),
						productTypeId : $(event.target).parents('#partners .amazon .miles_button').data('producttypeid'),
						miles : $(event.target).parents('#partners .amazon .miles_button').data('miles'),
						amount : 1
				};
				var redemptionText = lang('partners.confirm_redeem_voucher_text')
				.replace('{miles}', formatCurrency($(event.target).parents('#partners .amazon .miles_button').data('miles')))
				.replace('{partner}', lang('partners.amazon_lowercase'))
				.replace('{price}', formatCurrency($(event.target).parents('#partners .amazon .miles_button').data('price')));
				
				var confirmDialogHtml = self.confirmDialogTemplate({content:redemptionText});
				self.loadConfirmDialogBehaviour(confirmDialogHtml, redemptionRequest);

			    /* Update Google Tag Manager */
			    updateGtm({
			    	'pageArea': 'SUMA-logeado',
			        'pageCategory': 'canjear-millas',
			        'pageContent': 'amazon_canjeo'
			    });

			});
		},
		
		loadCepsaBehaviour : function() {
			this.loadNoCepsaUserBehaviour();
			this.loadFullCepsaUserPointsBehaviour();
		},
		
		loadNoCepsaUserBehaviour : function() {
			var self = this;
			$('#partners .cepsa #no_cepsa_user_form').form({
				onSubmit : function() {
					if($('#partners .cepsa .field').hasClass('checked')) {
						var basicDialogHtml = self.basicDialogTemplate();
						self.loadBasicDialog(basicDialogHtml);
					}
				}
			});
		},
		
		loadFullCepsaUserPointsBehaviour : function() {
			var self = this;
			
			$('#partners .cepsa .slider_field').slider_field();
			$('#partners .cepsa .slider_field').slider_field('customInit').trigger('validate');
			$('#partners .cepsa .slider_range').slider('option', 'step', 1);
			$('#partners .cepsa .slider_range').slider('option', 'value', $('#partners .cepsa .slider_field').data('min'));
			
      $('#partners .cepsa #cepsa_form').submit(function(event) {				
      	event.preventDefault();
				var redemptionRequest = {
						partnerId : 'CEPSA',
						productTypeId : 'CEPSA_PRODUCT_TYPE',
						miles : 1,
						amount : $('#partners .cepsa .slider_range').slider('option', 'value')
				};
				var redemptionText = lang('partners.confirm_redeem_cepsa_text')
				.replace('{miles}', formatCurrency($('#partners .cepsa .slider_range').slider('option', 'value')))
				.replace('{points}', formatCurrency($('#partners .cepsa .slider_range').slider('option', 'value') * $('#partners .cepsa .slider_field').data('conversion-factor')));
				
				var confirmDialogHtml = self.confirmDialogTemplate({content:redemptionText});
				self.loadConfirmDialogBehaviour(confirmDialogHtml, redemptionRequest);
			});
		},
		
		loadHalconBehaviour : function() {
			var self = this;
			this.element.find('#partners .halconviajes .miles_button a').on('click', function(event) {
				event.preventDefault();
				var redemptionRequest = {
						partnerId : $(event.target).parents('#partners .halconviajes .miles_button').data('partnerid'),
						productTypeId : $(event.target).parents('#partners .halconviajes .miles_button').data('producttypeid'),
						miles : $(event.target).parents('#partners .halconviajes .miles_button').data('miles'),
						amount : 1
				};
				var redemptionText = lang('partners.confirm_redeem_voucher_text')
				.replace('{miles}', formatCurrency($(event.target).parents('#partners .halconviajes .miles_button').data('miles')))
				.replace('{partner}', lang('partners.halcon_lowercase'))
				.replace('{price}', formatCurrency($(event.target).parents('#partners .halconviajes .miles_button').data('price')));
				
				var confirmDialogHtml = self.confirmDialogTemplate({content:redemptionText});
				self.loadConfirmDialogBehaviour(confirmDialogHtml, redemptionRequest);
			});
		},

		loadEcuadorBehaviour : function() {
			var self = this;
			this.element.find('#partners .ecuador .miles_button a').on('click', function(event) {
				event.preventDefault();
				var redemptionRequest = {
						partnerId : $(event.target).parents('#partners .ecuador .miles_button').data('partnerid'),
						productTypeId : $(event.target).parents('#partners .ecuador .miles_button').data('producttypeid'),
						miles : $(event.target).parents('#partners .ecuador .miles_button').data('miles'),
						amount : 1
				};
				var redemptionText = lang('partners.confirm_redeem_voucher_text')
				.replace('{miles}', formatCurrency($(event.target).parents('#partners .ecuador .miles_button').data('miles')))
				.replace('{partner}', lang('partners.halcon_lowercase'))
				.replace('{price}', formatCurrency($(event.target).parents('#partners .ecuador .miles_button').data('price')));
				
				var confirmDialogHtml = self.confirmDialogTemplate({content:redemptionText});
				self.loadConfirmDialogBehaviour(confirmDialogHtml, redemptionRequest);
			});
		},

	    loadSkyteamBehaviour : function() {
	      var self = this;
	      this.element.find('#partners .skyteam .miles_button a').on('click', function(event) {
	        event.preventDefault();
	        var redemptionRequest = {
	            partnerId : $(event.target).parents('#partners .skyteam .miles_button').data('partnerid'),
	            productTypeId : $(event.target).parents('#partners .skyteam .miles_button').data('producttypeid'),
	            miles : $(event.target).parents('#partners .skyteam .miles_button').data('miles'),
	            amount : 1
	        };
	        var redemptionText = lang('partners.confirm_redeem_voucher_text')
	        .replace('{miles}', formatCurrency($(event.target).parents('#partners .skyteam .miles_button').data('miles')))
	        .replace('{partner}', lang('partners.halcon_lowercase'))
	        .replace('{price}', formatCurrency($(event.target).parents('#partners .skyteam .miles_button').data('price')));
	        
	        var confirmDialogHtml = self.confirmDialogTemplate({content:redemptionText});
	        self.loadConfirmDialogBehaviour(confirmDialogHtml, redemptionRequest);
	      });
	    },
			
		loadBeLiveBehaviour : function() {

			$('#partners .belive .change_miles_buttons').hide();

			var self = this;
			var $selectDestinations = $('#partners .belive .select_field #field_destination');
			var $selectSeasons = $('#partners .belive .select_field #field_season');

			var appendElements = function(element, index, array) {
				this.dropdown.append(new Option(element.name, element.id));
			};

			var appendElementsWithParent = function(element, index, array) {
				this.dropdown.append(new Option(element.name, this.parent + '_' + element.id));
			};

			var fillDestinationsDropdown = {
				appendElements : appendElements,
				dropdown : $selectDestinations
			};

			var fillSeasonsDropdown = {
				appendElements : appendElementsWithParent,
				dropdown : $selectSeasons,
				parent : undefined
			};

			var initilizeDropdown = function($dropdown) {
				$dropdown.empty();
				$dropdown.append(new Option('', '', true));
			};

			initilizeDropdown($selectDestinations);
			this.context.belive.destinations.forEach(fillDestinationsDropdown.appendElements, fillDestinationsDropdown);

			$('#partners .belive .select_field #field_destination').change(function() {
				$('#partners .belive .change_miles_buttons').hide();
				initilizeDropdown($selectSeasons);
				for(var i = 0; i < self.context.belive.destinations.length; i++) {
					if(self.context.belive.destinations[i].id == $(this).val()) {
						fillSeasonsDropdown.parent = $(this).val();
						self.context.belive.destinations[i].seasons.forEach(fillSeasonsDropdown.appendElements, fillSeasonsDropdown);
						break;
					}
				}
				$('#partners .belive .select_field.season select').change();
			});

			$('#partners .belive .select_field #field_season').change(function() {
				if($(this).val() != '') {
					var ids = $(this).val().split('_');
					var destinationId = ids[0];
					var seasonId = ids[1];
					for(var i = 0; i < self.context.belive.destinations.length; i++) {
						if(self.context.belive.destinations[i].id == destinationId) {
							for(var j = 0; j < self.context.belive.destinations[i].seasons.length; j++) {
								if(self.context.belive.destinations[i].seasons[j].id == seasonId) {
									self.initBeLivePromotions();
									self.context.belive.destinations[i].seasons[j].promotions.forEach(function(element, index, array) {
										var hotel = self.element.find('#partners .belive .hotel' + element.order);
										Bus.publish('partnersController', 'getBeLiveUrl', {
													baseUrl: element.url,
													productType: element.id,
													success: function(beLiveUrl) {
														hotelBeLivesUrl = beLiveUrl;
														hotel.find('a').attr({'href' : beLiveUrl});
													},
													failure: function() {
														var internalErrorTemplateHtml = lang('partners.service_down');
														self.element.find('#partners .belive .expanded_info').html(internalErrorTemplateHtml);
													}
												});

										if(hotel.length > 0) {	
											
											if(!element.available) {
												hotel.addClass('disabled');
												hotel.html('<span class="link_placeholder"><span><strong>{name}</strong><span>{description}</span><em>{miles} {unit_miles}</em></span></span>');
											} else {
												hotel.html('<a href="" target="_blank"><span><strong>{name}</strong><span>{description}</span><em>{miles} {unit_miles}</em></span></a>');
											}
											
											hotel.html(hotel.html().replace('{name}', lang('partners.' + element.name)));
											hotel.html(hotel.html().replace('{description}', lang('partners.' + element.description)));
											hotel.html(hotel.html().replace('{miles}', formatCurrency(element.miles)));
											hotel.html(hotel.html().replace('{unit_miles}', lang('my_miles.unit_miles')));
											
										}
									});

									self.checkBeLivePromotions();

									break;
								}
							}
						}
					}
					$('#partners .belive .change_miles_buttons').show();
				} else {
					$('#partners .belive .change_miles_buttons').hide();
				}
			});

			$('#partners .belive .select_field').select_field();
		},
		
		disableBeLivePromotion : function() {
			
		},

		initBeLivePromotions : function() {
			var hotel1 = this.element.find('#partners .belive .hotel1');
			hotel1.html('<a href="#" target="_blank"><span><strong>{name}</strong><span>{description}</span><em>{miles} {unit_miles}</em></span></a>');
			$('#partners .belive .hotel1').show();
			var hotel2 = this.element.find('#partners .belive .hotel2');
			hotel2.html('<a href="#" target="_blank"><span><strong>{name}</strong><span>{description}</span><em>{miles} {unit_miles}</em></span></a>');
			$('#partners .belive .hotel2').show();
			var hotel3 = this.element.find('#partners .belive .hotel3');
			hotel3.html('<a href="#" target="_blank"><span><strong>{name}</strong><span>{description}</span><em>{miles} {unit_miles}</em></span></a>');
			$('#partners .belive .hotel3').show();
		},

		checkBeLivePromotions : function() {
			var hotel1 = this.element.find('#partners .belive .hotel1');
			var hotel2 = this.element.find('#partners .belive .hotel2');
			var hotel3 = this.element.find('#partners .belive .hotel3');

			if (hotel1.html().indexOf("{name}") > -1) {
				$('#partners .belive .hotel1').hide();
			}

			if (hotel2.html().indexOf("{name}") > -1) {
				$('#partners .belive .hotel2').hide();
			}

			if (hotel3.html().indexOf("{name}") > -1) {
				$('#partners .belive .hotel3').hide();
			}
		},

		loadConfirmDialogBehaviour : function (confirmDialogHtml, redemptionRequest) {
			var self = this;
			$('#partners').ui_dialog({
				close : {
					behaviour : 'close',
					href : '#'
				},
				content : confirmDialogHtml,
				render : function($dialog) {
					var acceptLink = $dialog.find('.change a');
					
					acceptLink.on('click', function(event) {
						event.preventDefault();
						$dialog.find('.dialog_content').append('<span class="dialog_spinner"><span class="spinner"></span><strong class="spinner_text">' + lang('inner.loading') + '</strong></span>').addClass('spinner');
						self.redeem(redemptionRequest, $dialog);
					});

					/* Update Google Tag Manager */
					updateGtm({
						'pageArea': 'SUMA-logeado',
						'pageCategory': 'canjear-millas',
						'pageContent': (window.location.hash.replace('#/','')) + '_obtencion-codigo'
					});
				}
			});
		},
		
		redeem : function(redemptionRequest, $dialog) {
			var self = this;
			Bus.publish('partnersController', 'redeem', {
				redemptionRequest : redemptionRequest,
				success : function(redemptionResponse) {
					var redemResultTemplateSuccessHtml = self.redeemResultTemplate(redemptionResponse);
					$dialog.find('.dialog_content').html(redemResultTemplateSuccessHtml);
					Bus.publish('account', 'update_miles', {newMilesNumber: self.getLoyaltyUserMiles() - (redemptionRequest.miles * redemptionRequest.amount)});
					self.refresh();
				},
				failure : function(redemptionResponse) {
					var redemResultTemplateErrorHtml = self.redeemResultTemplate(redemptionResponse);
					$dialog.find('.dialog_content').addClass('error');
					$dialog.find('.dialog_content').html(redemResultTemplateErrorHtml);
					self.refresh();
				}
			});
		},
		
		loadBasicDialog : function(basicDialogHtml) {
			var self = this;
			$('#partners').ui_dialog({
				close : {
					behaviour : 'close',
					href : '#'
				},
				content : basicDialogHtml,
				render : function($dialog) {
					$dialog.find('.dialog_content').append('<span class="dialog_spinner"><span class="spinner"></span><strong class="spinner_text">' + lang('inner.loading') + '</strong></span>').addClass('spinner');
					self.updatePreferences($dialog);
				}
			});
		},
		
		updatePreferences : function($dialog) {
			var self = this;
			Bus.publish('partnersController', 'updatePreferences', {
				success : function(data) {
					var content = lang('partners.cepsa_preferences_updated');
					var basicDialogHtml = self.basicDialogTemplate({content:content});
					$dialog.find('.dialog_content').html(basicDialogHtml);
					self.refresh();
				},
				failure : function(data) {
					var content = lang('partners.cepsa_preferences_not_updated');
					var basicDialogHtml = self.basicDialogTemplate({content:content});
					$dialog.find('.dialog_content').html(basicDialogHtml);
					$dialog.find('.dialog_content').addClass('error');
				}
			});
		},
		
		getLoyaltyUserMiles : function() {
			return localStorage.ly_accumulatedMiles;
		},
		
		calculateAndSetHash : function() {
			var reference = window.location.hash.replace('#/', '');
			if(_.contains(this.references, reference)) {
				window.location.hash = '#/' + reference;

			} else {
				window.location.hash = '#/partners';

				updateGtm({
					'pageArea' : 'SUMA-logeado',
					'pageCategory' : 'canjear-millas',
					'pageContent' : 'home'
				});

			}
			return reference;
		},
		
		hidePartners : function() {
			this.element.find('.aireuropa').hide();
			this.element.find('.inner_content .inner_content_index .partner_aireuropa').removeClass('active');
			this.element.find('.amazon').hide();
			this.element.find('.inner_content .inner_content_index .partner_amazon').removeClass('active');
			this.element.find('.cepsa').hide();
			this.element.find('.inner_content .inner_content_index .partner_cepsa').removeClass('active');
			this.element.find('.europcar').hide();
			this.element.find('.inner_content .inner_content_index .partner_europcar').removeClass('active');
			this.element.find('.halconviajes').hide();
			this.element.find('.inner_content .inner_content_index .partner_halconviajes').removeClass('active');
			this.element.find('.ecuador').hide();
			this.element.find('.inner_content .inner_content_index .partner_ecuador').removeClass('active');
			this.element.find('.belive').hide();
			this.element.find('.inner_content .inner_content_index .partner_belive').removeClass('active');
			this.element.find('.nhhoteles').hide();
			this.element.find('.inner_content .inner_content_index .partner_nhhoteles').removeClass('active');
			this.element.find('.skyteam').hide();
			this.element.find('.inner_content .inner_content_index .partner_skyteam').removeClass('active');
		},

		fillEuropcarForm : function(token) {
			var formParams =
			'<input type="hidden" name="lang" value="{locale}"/>' +
			'<input type="hidden" name="ctr" value="{marketCode}"/>' +
			'<input type="hidden" name="partner" value="{partnerId}"/>' +
			'<input type="hidden" name="memberId" value="{frequentFlyerIdentity}"/>' +
			'<input type="hidden" name="passWord" type="password" value="{token}"/>'+
			'<input type="image" src="/airstatic/assets/graphic/common/icon_link_external.png" alt="Go!"></input>';

			formParams = formParams.replace('{locale}', AirEuropaConfig.ajax.defaultParams.locale);
			formParams = formParams.replace('{marketCode}', AirEuropaConfig.ajax.defaultParams.marketCode);
			formParams = formParams.replace('{partnerId}', 'AEA');
			formParams = formParams.replace('{frequentFlyerIdentity}', this.getLoyaltyUser());
			formParams = formParams.replace('{token}', token);
			$('#europcarForm').html(formParams);
			$('#europcarForm').attr('action', getServiceURL('partners.europcarFormUrl'));
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

		navigateToEuropcar : function(success, failure) {
			var self = this;
			var obtainingToken = this.obtainToken();
			$.when(obtainingToken)
			.done(function(token) {
				self.fillEuropcarForm(token);
			})
			.fail(function(tokenResponse) {
				failure();
			});
		},

		getLoyaltyUser : function() {
			return localStorage.ly_frequentFlyerIdentity;
		},	
		
		showPartner : function(partner) {
			if(this.context != undefined && _.contains(this.references, partner)) {
				this.startLoading();
				this.hidePartners();
				this.element.find('.partners_info').hide();
				this.element.find('.' + partner).show();
				this.element.find('.' + partner).addClass('expanded');
				this.element.find('.inner_content .inner_content_index .partner_' + partner).addClass('active');
				this.navigateToEuropcar();
				this.stopLoading();

				updateGtm({
					'pageArea' : 'SUMA-logeado',
					'pageCategory' : 'canjear-millas',
					'pageContent' : partner + '_info'
				});

			}
		}
	};
});
