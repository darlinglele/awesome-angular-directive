(function() {

  'use strict';

  var module = angular.module('customServiceModule', []).factory('ModalService', ['$animate', '$document', '$compile', '$controller', '$http', '$rootScope', '$q', '$templateRequest', '$timeout', function($animate, $document, $compile, $controller, $http, $rootScope, $q, $templateRequest, $timeout) {
    function getTemplate(template, templateUrl) {
      var deferred = $q.defer();
      if (template) {
        deferred.resolve(template);
      } else if (templateUrl) {
        $templateRequest(templateUrl, true).then(function(template) {
          deferred.resolve(template);
        }, function(error) {
          deferred.reject(error);
        });
      } else {
        deferred.reject("No template or templateUrl has been specified.");
      }
      return deferred.promise;
    };

    function appendChild(parent, child) {
      var children = parent.children();
      if (children.length > 0) {
        return $animate.enter(child, parent, children[children.length - 1]);
      }
      return $animate.enter(child, parent);
    };

    function ModalService() {
      var self = this;
      var deferred;
      var modalElement;
      self.show = function(options) {
        modalElement && modalElement.remove();
        //  Validate the input parameters.
        var controllerName = options.controller;
        if (!controllerName) {
          deferred = $q.defer();
          deferred.reject("No controller has been specified.");
          return deferred.promise;
        }

        var body = angular.element($document[0].body);
        getTemplate(options.template, options.templateUrl).then(function(template) {
          template = '<div style="position:absolute;">' + template + '</div>';
          var modalScope = (options.scope || $rootScope).$new();
          modalScope[options.controllerAs] = $controller(options.controller, options.locals);
          var linkFn = $compile(template);
          modalElement = linkFn(modalScope);

          //  Finally, append the modal to the dom.
          if (options.appendElement) {
            // append to custom append element
            appendChild(options.appendElement, modalElement);
          } else {
            // append to body when no custom append element is specified
            appendChild(body, modalElement);
          }
          $(modalElement).hide();
          $timeout(function() {
            var height = $(modalElement).height();
            var top = options.style.top - height > 0 ? options.style.top - height : options.style.top;
            $(modalElement).css({
              top: top,
              left: options.style.left
            });
            $(modalElement).show();
          })
        });

        deferred = $q.defer();
        return deferred.promise;
      };

      self.close = function(data) {
        modalElement && modalElement.remove();
        return deferred && deferred.resolve(data);
      }
      self.cancel = function() {
        return deferred.reject();
      }
    }

    return new ModalService();
  }]);
})();