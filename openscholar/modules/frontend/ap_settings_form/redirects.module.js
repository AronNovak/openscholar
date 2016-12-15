(function () {

  var m = angular.module('redirectForm', ['DependencyManager']);

  m.config(['DependenciesProvider', function ($depProvider) {
    $depProvider.AddDependency('formElement', 'redirectForm');
  }]);

  m.directive('redirects', ['$http', function($http) {
    return {
      template: '<p>URL redirects allow you to send users from a non-existing path on your site, to any other URL. You might want to use this to create a short link, or to transition users from an old URL that no longer exists to the new URL. Each site may only have a limited number of URL redirects.</p>' +
      '<ul class="redirect-list">' +
        '<li class="redirect-item" ng-repeat="r in redirects">' +
          '<span class="redirect-path">{{r.path}}</span> --> <span class="redirect-target">{{r.target}}</span> <a class="redirect-delete" ng-click="deleteRedirect(r.id)">delete</a>' +
        '</li>' +
      '</ul>' +
      '<a class="redirect-add" ng-show="showAddLink()" ng-click="toggleAddForm()">+ Add new redirect</a>' +
      '<div class="redirect-add-form" ng-show="showAddForm()">' +
        '<label for="redirect-path">From:</label> <input type="text" id="redirect-path" class="redirect-new-element" ng-model="newRedirectPath" placeholder="Local path"><br />' +
        '<label for="redirect-target">To: </label> <input type="text" id="redirect-target" class="redirect-new-element" ng-model="newRedirectTarget" placeholder="Target URL (i.e. http://www.google.com)"><br />' +
        '<button type="button" value="Add Redirect" ng-click="addRedirect()">Add Redirect</button>' +
      '</div>',
      scope: {
        value: '=',
        element: '='
      },
      link: function (scope, elem, attr) {
        var showAddLink = false;
        scope.showAddLink = function() {
          return showAddLink;
        }

        var showAddForm = false;
        scope.showAddForm = function () {
          return showAddForm;
        }

        scope.toggleAddForm = function () {
          showAddForm = !showAddForm;
        }

        var cp_redirect_max = 15;
        scope.$watch('redirects', function (val) {
          var count = val.length || 0;
          if (count < cp_redirect_max) {
            showAddLink = true;
          }
          else {
            showAddLink = false;
          }
        })
        scope.redirects = scope.element.value;

        var restApi = Drupal.settings.paths.api + '/redirect/';
        var http_config = {
          params: {}
        };

        if (typeof Drupal.settings.spaces != 'undefined' && Drupal.settings.spaces.id) {
          http_config.params.vsite = Drupal.settings.spaces.id;
        }

        scope.newRedirectPath = '';
        scope.newRedirectTarget = '';
        scope.addRedirect = function () {
          var vals = {
            path: scope.newRedirectPath,
            target: scope.newRedirectTarget
          };

          $http.post(restApi, vals, http_config).then(function (r) {
            scope.redirects.push(r.data)
          },
          function (e) {

          });
        }

        scope.deleteRedirect = function (id) {
          var k = 0;
          $http.delete(restApi+'/'+id, http_config).then(function (r) {
              for (var i = 0; i < scope.redirects.length; i++) {
                if (scope.redirects[i].id == id) {
                  scope.redirects.splice(id, 1);
                  break;
                }
              }
          },
          function (e) {

          });

          for (var i = 0; i<scope.redirects.length; i++) {
            if (scope.redirects[i].id == id) {
              k = 0;
              break;
            }
          }
        }
      }
    };
  }]);
})();