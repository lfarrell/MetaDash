"use strict";

angular.module('metadataViewerApp').controller('mainController', ['$scope', function($scope) {
    $scope.header = 'MetaDash';
}]);

angular.module('metadataViewerApp').controller('dplaController', ['$scope', 'LoadService', function($scope, LoadService) {
    $scope.header = 'DPLA';
    $scope.search = '';

    $scope.apiSearch = function() {
        LoadService.canvasFormat($scope);

        var val = LoadService.queryFormat($scope.search);
        LoadService.file_load("dpla.php?q=" + val, $scope);
    };

    LoadService.chartChange($scope);
}]);

angular.module('metadataViewerApp').controller('digitalNzController', ['$scope', 'LoadService', function($scope, LoadService) {
    $scope.header = 'Digital New Zealand';
    $scope.search = '';

    $scope.apiSearch = function() {
        LoadService.canvasFormat($scope);

        var val = LoadService.queryFormat($scope.search);
        LoadService.file_load("digital_nz.php?q=" + val, $scope);
    };
}]);


angular.module('metadataViewerApp').controller('europeanaController', ['$scope', 'LoadService', function($scope, LoadService) {
    $scope.header = 'Europeana';
    $scope.search = '';

    $scope.apiSearch = function() {
        LoadService.canvasFormat($scope);

        var val = LoadService.queryFormat($scope.search);
        LoadService.file_load("europeana.php?q=" + val, $scope);
    };
}]);