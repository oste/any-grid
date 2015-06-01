app.controller('HomeCtrl', function($scope, $http) {

});

app.controller('SliderCtrl', function($scope, $http, preloader) {
    var limit = 10;
    $scope.page = 1;

    var getOffset = function() {
        return ($scope.page * limit) - limit;
    };

    $scope.setData = function() {
        $http.get('https://trends.revcontent.com/api/v1/', {
                params: {
                    api_key: '3eeb00d786e9a77bbd630595ae0be7e9aa7aff3b',
                    pub_id: 945,
                    widget_id: 2034,
                    domain: 'powr.com',
                    sponsored_count: limit,
                    sponsored_offset: getOffset(),
                    internal_count: 0
                }
            }).success(function(data) {

                var imgs = [];
                data.forEach(function(content) {
                    imgs.push(content.image);
                });
                preloader.preloadImages(imgs).then(function(){
                    $scope.content = data;
                });
            });
    }

    $scope.setData();

    $scope.back = function() {
        $scope.page = Math.max(1, $scope.page - 1);
        $scope.setData();
    }

    $scope.forward = function() {
        $scope.page = $scope.page + 1;
        $scope.setData();
    }

});

app.controller('GridCtrl', function($scope, $http, $rootScope, preloader) {

    var limit = 30;
    $scope.page = 1;
    $scope.content = [];

    var getOffset = function() {
        return ($scope.page * limit) - limit;
    };

    $scope.getData = function(append) {
        return $http.get('https://trends.revcontent.com/api/v1/', {
                params: {
                    api_key: '3eeb00d786e9a77bbd630595ae0be7e9aa7aff3b',
                    pub_id: 945,
                    widget_id: 2034,
                    domain: 'powr.com',
                    sponsored_count: limit,
                    sponsored_offset: getOffset(),
                    internal_count: 0
                }
            });
    }

    $scope.getData().success(function(data) {
        process(data);
    });

    $rootScope.$on('iscroll.main', function(event) {
        if ($scope.loading) return;
        $scope.page++;
        $scope.loading = true;
        $scope.getData().success(function(data) {
            process(data);
        }).then(function() {
            $scope.loading = false;
        });
    });

    var process = function(data) {
        data.forEach(function(content) {
            preloader.preloadImages([content.image]).then(function(){
                $scope.content.push(content);
            });
        });
    }
});