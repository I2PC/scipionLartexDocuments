Hydra.module.register('Prerender', function(Bus, Module, ErrorHandler, Api) {
  return {

    events: {
      'prerender': {
        'restart': function (oNotify) {
          this.customInit();
        }
      }
    },

    init: function() {
      /* Start custom init */
      this.customInit();
    },

    customInit: function() {
      /* Add lines */
      this.addLines();
      /* Add auto_scroll rel behaviour */
      $('a[rel="auto_scroll"]').on('click', function(event){
        event.preventDefault();
        var $target = $($(this).attr('href'));

        if ($target.length == 1) {
          var position = $target.offset().top;
          Bus.publish('scroll', 'scrollTo', {
            position : position
          });
        }
      });

      /* Add target="_blank" to each external link */
      /* $('a[href^="http://"], a[href^="https://"]').attr('target', '_blank'); */

      /* Apply jquery placeholder */
      $('input, textarea').not('input[type=password]').placeholder();
      $('input[type=password]').placeholderIE();

      /* Apply first and last child hacks */
      this.fixIELastChild();

      /* Apply CSS3 columns fix */
      this.fixIECSS3Columns();

    },

    addLines: function() {
      $('.add_line').removeClass('add_line').append('<span class="line"></span>');
    },


    /**
     * List of selectors to apply first-child and last-child hacks
     */
    firstAndLastChildSelectors : [
      'nav ul li',
      '.flight',
      '.journey',
      '.col',
      '.section',
      '.action',
      '.flight_details'
      // '#footer .tags .tags_extended .more_tags_list .tags_group nav ul li',
      // '.graphic .fragments .flight',
      // '.checkin_journeys .journey',
      // '.boarding_card .boarding_card_content .boarding_card_bottom .boarding_card_details .col',
      // '.boarding_card.qr .boarding_card_content .boarding_card_bottom .boarding_card_details .col',
      // '.seats_map_overlay .seats_map_wrapper .seats_map .seats_table_wrapper .seats_table .column .seats_group .seat.exit',
      // '#subnav .panel .section',
      // '#subnav .panel .section .action',
      // '.routes_overlay .routes_lightbox .routes_content .routes_wrapper .routes_group nav ul li',
      // '.block.block_ancillaries .ancillaries_wrapper .slider .paginator ul li',
      // '.block.block_slider .paginator ul li',
      // '#footer .tags .tags_extended .more_tags_list .tags_group nav ul li',
      // '#checkout .process_wrapper_content .process_scroll .process_content .process_blocks .checkout_block .block_body .passenger .info',
      // '#checkout .process_wrapper_content .process_scroll .process_content .process_blocks .checkout_block.passengers .block_body .passenger',
      // '#checkout .process_wrapper_content .process_scroll .process_content .process_blocks .checkout_conditions .conditions',
      // '#checkin .process_wrapper_content .process_content .process_blocks .checkin_journeys .journey_wrapper .journey .flights .flight_details',
      // '#checkin .process_wrapper_content .process_content .process_blocks .checkin_journeys .journey_wrapper',
      // '#flight_info .flight_info .body .col',
      // '.standard_form .check_group .check_group_wrapper .group_body .info',
      // '.inner_content .inner_block',
      // '.inner_content .inner_block .inner_form form .extra .flights .flight',
      // '.inner_content .inner_block .inner_block_content .text_table .text_table_body .row',
      // '.inner_content .inner_block .inner_block_content .link',
      // '.inner_content .inner_block .inner_block_content .baggage_prices_table .baggage_price_wrapper .baggage_price .text .baggage_type .baggage_type_wrapper .text_extended_wrapper .text_extended ul li',
      // '.inner_content .inner_block.blue .cols.link_cols',
      // '.html .lightbox_content_wrapper .link',
      // '.html .lightbox_content_wrapper .download',
      // '.html .lightbox_content_wrapper .expandable',
      // '.html .lightbox_content_wrapper .expandable.expandable_small',
      // '.html .lightbox_content_wrapper .baggage_table .baggage_type .text .text_extended_wrapper .text_extended ul li',
      // '.html .lightbox_content_wrapper .baggage_prices_table .baggage_price_wrapper .baggage_price .text .baggage_type .baggage_type_wrapper .text_extended_wrapper .text_extended ul li',
      // '.html .lightbox_content_wrapper .cols',
      // '.html .lightbox_content_wrapper .text_table .text_table_body .row',
      // '.directory .section',
      // '#ds .ds_content .ds_info_wrapper .ds_info .ds_footer ul li'

    ],

    /**
     * Adds .first-child and .last-child classes to a selectors list
     * used to fix styles applied to the :first-child and :last-child
     * pseudo-selectors which are not supported on some old browsers
     */
    fixIELastChild : function(){

      if ($('html').hasClass('lt-ie9') == false) return;

      var metaSelector = '';
      var flag = false;

      $.each(this.firstAndLastChildSelectors, function(index, selector){
        if (flag) metaSelector += ', ';
        metaSelector += selector+':last-child'
        flag = true;
      });
      $(metaSelector).addClass('last-child');

    },

    fixIECSS3Columns : function() {

      if ($('html').hasClass('lt-ie10') == false) return;

      var selectorsToFix = [
        {
          selector : '.routes_content',
          columns : 4
        },
        {
          selector : '.more_tags_list',
          columns : 4
        },
        {
          selector : '.inner_content .inner_block .inner_block_content .text_table .text_table_body .info .info_extend .info_extend_text ul',
          columns : 3
        }
      ];

      $.each(selectorsToFix, function(index, item){
        $(item.selector).not('.fixed_columnize').columnize({ columns : item.columns });
        $(item.selector).addClass('fixed_columnize');
      });

    }

  };
});