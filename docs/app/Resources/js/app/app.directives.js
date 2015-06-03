app.directive('grid', ['$timeout', 'grid', function ($timeout, grid) {
  return {
    restrict: "A",
    scope: {
        masonry: '=',
        perRow: '='
    },
    link: function(scope, element, attrs) {
        var options = {
            masonry: scope.masonry
        };

        if (scope.perRow)
            options.perRow = scope.perRow;

        grid.create(element[0], options);
    }
  };
}]);

app.directive('gridItem', ['$timeout', 'grid', function($timeout, grid) {
    return {
        restrict: "A",
        scope: {
            relayout: '='
        },
        link: function(scope, elm){
            // this is not always needed - normally any-grid.js would know about the element
            elm[0].style.width = grid.get().columnWidth + 'px';
            elm[0].style.visibility = 'hidden';
            $timeout(function() {
                if (scope.relayout) {
                    grid.get().reloadItems();
                    grid.get().layout();
                } else {
                    grid.get().appended(elm);
                }

            }).then(function() {
                elm[0].style.visibility = 'visible';
            });
        }
    }
}]);

app.directive('infiniteScroll', ['$timeout', '$rootScope', function ($timeout, $rootScope) {
    return {
        restrict: "A",
        scope: {
            infiniteScroll: '='
        },
        link: function(scope, element, attrs) {

            var container = angular.element(element[0]);

            container.on('scroll', function() {
                $timeout(function() {
                    if(element[0].offsetHeight + element[0].scrollTop == element[0].scrollHeight) {
                        var namespace = scope.infiniteScroll ? '.' + scope.infiniteScroll : '';
                        $rootScope.$emit('iscroll' + namespace);
                    }
                });
            });
        }
    }
}]);

