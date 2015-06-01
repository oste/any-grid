app.config(['$stateProvider', '$locationProvider', '$urlMatcherFactoryProvider', function($stateProvider, $locationProvider, $urlMatcherFactoryProvider) {

    $urlMatcherFactoryProvider.strictMode(false)

    $locationProvider.html5Mode({
        enabled: true
    });

    $stateProvider
        .state('home', {
            url: "/",
            views: {
                main: {
                    controller: 'HomeCtrl',
                    templateUrl: "home.html",
                }
            }
        })
        .state('slider', {
            url: "/slider",
            views: {
                main: {
                    controller: 'SliderCtrl',
                    templateUrl: "slider.html",
                }
            }
        })
        .state('masonry', {
            url: "/masonry",
            views: {
                main: {
                    controller: 'GridCtrl',
                    templateUrl: "masonry.html",
                }
            }
        })
        .state('flush', {
            url: "/flush",
            views: {
                main: {
                    controller: 'GridCtrl',
                    templateUrl: "flush.html",
                }
            }
        })
}]);