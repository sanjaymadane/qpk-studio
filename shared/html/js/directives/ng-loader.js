'use strict';

app.directive('loading', function () {
      return {
        restrict: 'E',
        replace:true,
        template: '<div class="full-page-loader"><img src="resources/img/gif/q_loader.gif" width="20" height="20" /> Loading </div>',
        link: function (scope, element, attr) {
          scope.$watch('loading', function (val) {
              if (val)
                  $(element).show();
              else
                  $(element).hide();
          });
        }
      }
});