app.controller('HomeCtrl', function($scope, $http) {
    $scope.class = 'home';
});

app.controller('SliderCtrl', function($scope, $rootScope, $http, preloader, grid, $timeout) {
    $scope.page = 1;
    var limit;

    $timeout(function() { // wait for directive to digest
        limit = grid.getPerRow() * 2;
        $scope.setData();

        var resizeTimeout;
        grid.get().on('resized', function() {
            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }
            function delay() {
                var newLimit = grid.getPerRow() * 2;
                if (newLimit != limit) {
                    limit = newLimit;
                    $scope.setData();
                }
                delete resizeTimeout;
            }
            resizeTimeout = setTimeout(delay, 300);
        });
    });

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

    $scope.back = function() {
        $scope.page = Math.max(1, $scope.page - 1);
        $scope.setData();
    }

    $scope.forward = function() {
        $scope.page = $scope.page + 1;
        $scope.setData();
    }
});

app.controller('GridCtrl', function($scope, $http, $rootScope, preloader, grid, $timeout) {
    $scope.page = 1;
    var limit;

    $scope.content = [];

    $timeout(function() { // wait for directive to digest
        limit = grid.getPerRow() * 12; // 12 rows
        $scope.getData().success(function(data) {
            process(data);
        });
    });

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