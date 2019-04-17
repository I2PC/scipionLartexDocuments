Hydra.module.register('WidgetsManager', function(Bus, Module, ErrorHandler, Api) {
  return {

    events: {
      'widgets': {
        'restart': function(oNotify) {
          this.startWidgets();
        }
      }
    },

    init: function() {
      this.startWidgets();
      Bus.publish('prerender', 'restart');
    },

    startWidgets: function() {
      /* Get info widget, a short from to get flight info */
      $('.ui_get_info').get_info();

      /* Promo slider inside a .block element */
      $('.ui_promo_slider').promo_slider();

      /* Ancillaries slider inside a .block element */
      $('.ui_ancillaries_slider').ancillaries_slider();

      /* Footer contact */
      $('.footer_contact .newsletter .text_field input').on('keyup', function() {
        $('.footer_contact .newsletter .checkbox').addClass('visible');
      });

      $('.footer_contact .newsletter form').form({
        triggerValidate: false,
        onError: function(form) {
          /* Set error class to the form */
          form.element.addClass('error');

          /* Show the legal terms field if it's invisible */
          $('.footer_contact .newsletter .checkbox').addClass('visible');
        },
        onSubmit: function(form) {

          if (!form.element.hasClass('success') && !form.element.hasClass('progress')) {
            /* Get the form values */
            var email = form.element.find('#field_newsletter_email').val();
            var conditions = form.element.find('#field_newsletter_conditions').is(':checked');

            /* Post the subscription */
            var url = getPostURL('newsletter');

            /* Add progress message */

            var progressMessage = form.element.attr('data-progress-message');
            form.element.prepend('<div class="progress_message"><p><span>' + progressMessage + '</span></p></div>');
            form.element.addClass('progress');

            setTimeout(function(){
              Bus.publish('ajax', 'postJson', {
                path: url,
                data: {email: email, conditions: conditions},
                success: function() {
                  /* Add success message */
                  var successMessage = form.element.attr('data-success-message');
                  form.element.prepend('<div class="success_message"><p><span>' + successMessage + '</span></p></div>');

                  /* Add success class */
                  form.element.addClass('success');
                  form.element.removeClass('progress');

                  /* Reset the form */
                  form.element.removeClass('error ready');
                  form.element.find('#field_newsletter_email').val('');
                  form.element.find('#field_newsletter_conditions').closest('.field').find('label').trigger('click');
                },
                failure: function() {

                  form.element.removeClass('progress');
                  form.element.find('.progress_message').remove();

                  /* Session error */
                  $('#wrapper').ui_dialog({
                    title: lang('general.error_title'),
                    error: true,
                    subtitle: lang('general.error_message'),
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
              });
            }, 1000);

          }
        }
      });

      /* Coverage shadowbox */
      $('body').on('click', 'a[rel=coverage]', function(event) {
        event.preventDefault();

        var $this = $(this);
        var href = $this.attr('href');
        var content = $(href).clone().show().html();

        Shadowbox.open({
          content:    content,
          player:     "html",
          title:      "",
          height:     400,
          width:      600
        });
      });

    }

  };
});