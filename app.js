var app = angular.module('app', ['customDirectiveModule', 'customServiceModule']);
app.controller('MentionController', ['members', 'ModalService', function(members, ModalService) {
  var vm = this;
  vm.members = members;
  vm.selected = vm.members[0];
  vm.select = function(member) {
    ModalService.close(member);
  };
  vm.prev = function() {
    vm.selected = vm.members[vm.members.indexOf(vm.selected) - 1] || vm.members[0];
  };
  vm.next = function() {
    vm.selected = vm.members[vm.members.indexOf(vm.selected) + 1] || vm.members.slice(0).pop();
  };
}]);
app.controller("EditorController", ["ModalService", function(ModalService) {
  var vm = this;
  vm.onMentionStart = function(options) {
    console.log(JSON.stringify(options));
    var key = options.key;
    if (key === '@' || (key.length > 1 && key.length == key.trim().length)) {
      var showModal = function(key) {
        var members = [{
          name: "-1",
          id: 1
        }, {
          name: "-2",
          id: 2
        }, {
          name: "-3",
          id: 3
        }];
        members.forEach(function(item) {
          item.name = key.slice(1) + item.name;
        });
        ModalService.show({
          template: '<div class="mention-list" style="background: yellow" on-arrow-up="vm.prev()" on-select-confirm="vm.select(vm.selected)" on-arrow-down="vm.next()"><div ng-repeat="x in vm.members" on-mouse-down="vm.select(x)" ng-class="{selected: x===vm.selected}"><div><img style="width: 30px; height: 30px;" ng-src="{{x.avatar}}"><span> {{x.name}}</span></div></div></div>',
          controller: 'MentionController',
          controllerAs: 'vm',
          style: {
            left: options.left,
            top: options.top
          },
          locals: {
            members: members
          }
        }).then(function(member) {
          member && options.onMemberSelected(member)
        });
      };
      if (true) {
        showModal(key);
      } else {
        $http.post(AppConfig.api.webGroupUsers, {
          gId: vm.selected.id
        }).then(function(response) {
          vm.selected.members = response.data.map(function(item) {
            return Mapper.internalEmployee(item);
          });
          showModal(key);
        });
      }
    } else {
      ModalService.close();
    }
  }
}]);