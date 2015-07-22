/*!
 * Angular Material Design
 * https://github.com/angular/material
 * @license MIT
 * v0.10.1-rc3
 */
(function( window, angular, undefined ){
"use strict";

/*
 * @ngdoc module
 * @name material.components.backdrop
 * @description Backdrop
 */

/**
 * @ngdoc directive
 * @name mdBackdrop
 * @module material.components.backdrop
 *
 * @restrict E
 *
 * @description
 * `<md-backdrop>` is a backdrop element used by other components, such as dialog and bottom sheet.
 * Apply class `opaque` to make the backdrop use the theme backdrop color.
 *
 */

angular
  .module('material.components.backdrop', ['material.core'])
  .directive('mdBackdrop', ["$mdTheming", "$animate", "$rootElement", "$window", "$log", "$$rAF", function BackdropDirective($mdTheming, $animate, $rootElement, $window, $log, $$rAF) {

    return {
        restrict: 'E',
        link: postLink
      };

    function postLink(scope, element, attrs) {
      // backdrop may be outside the $rootElement, tell ngAnimate to animate regardless
      if( $animate.pin ) $animate.pin(element,$rootElement);

      $$rAF(function(){
        // Often $animate.enter() is used to append the backDrop element
        // so let's wait until $animate is done...

        var parent = element.parent()[0];
        if ( parent ) {
          var position = $window.getComputedStyle(parent).getPropertyValue('position');
          if (position == 'static') {
            // backdrop uses position:absolute and will not work properly with parent position:static (default)
            var positionError = "<md-backdrop> may not work properly in a scrolled, static-positioned parent container.";
            $log.warn( positionError );
          }
        }

        $mdTheming.inherit(element, element.parent());
      });

    };
  }]);

})(window, window.angular);