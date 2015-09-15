/**
 * Created by Dell on 2015/9/15.
 */

angular.module('chatApp')
    .controller('c2', function ($scope) {
        $scope.customer = {};
        $scope.createCustomer = function () {
            alert($scope.customer.name)
        }

    })