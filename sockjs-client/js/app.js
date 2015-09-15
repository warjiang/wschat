/**
 * Created by Dell on 2015/9/14.
 */
var app = angular.module('chatApp', [
    'mobile-angular-ui', //'ui.router', 'oc.lazyLoad'
    'ngRoute',
    'mobile-angular-ui.gestures'
])

    .config(function($routeProvider) {

        $routeProvider.when('/home', {templateUrl:'templates/home.html',  reloadOnSearch: false})
        $routeProvider.otherwise({templateUrl:'templates/home.html'});

        //test demo
        $routeProvider.when('/',              {templateUrl: 'templates/home.html', reloadOnSearch: false});
        $routeProvider.when('/scroll',        {templateUrl: 'templates/demo/scroll.html', reloadOnSearch: false});
        $routeProvider.when('/toggle',        {templateUrl: 'templates/demo/toggle.html', reloadOnSearch: false});
        $routeProvider.when('/tabs',          {templateUrl: 'templates/demo/tabs.html', reloadOnSearch: false});
        $routeProvider.when('/accordion',     {templateUrl: 'templates/demo/accordion.html', reloadOnSearch: false});
        $routeProvider.when('/overlay',       {templateUrl: 'templates/demo/overlay.html', reloadOnSearch: false});
        $routeProvider.when('/forms',         {templateUrl: 'templates/demo/forms.html', reloadOnSearch: false});
        $routeProvider.when('/dropdown',      {templateUrl: 'templates/demo/dropdown.html', reloadOnSearch: false});
        $routeProvider.when('/touch',         {templateUrl: 'templates/demo/touch.html', reloadOnSearch: false});
        $routeProvider.when('/swipe',         {templateUrl: 'templates/demo/swipe.html', reloadOnSearch: false});
        $routeProvider.when('/drag',          {templateUrl: 'templates/demo/drag.html', reloadOnSearch: false});
        $routeProvider.when('/drag2',         {templateUrl: 'templates/demo/drag2.html', reloadOnSearch: false});
        $routeProvider.when('/carousel',      {templateUrl: 'templates/demo/carousel.html', reloadOnSearch: false});

    });


//
// `$drag` example: drag to dismiss
//
app.directive('dragToDismiss', function($drag, $parse, $timeout){
    return {
        restrict: 'A',
        compile: function(elem, attrs) {
            var dismissFn = $parse(attrs.dragToDismiss);
            return function(scope, elem){
                var dismiss = false;

                $drag.bind(elem, {
                    transform: $drag.TRANSLATE_RIGHT,
                    move: function(drag) {
                        if( drag.distanceX >= drag.rect.width / 4) {
                            dismiss = true;
                            elem.addClass('dismiss');
                        } else {
                            dismiss = false;
                            elem.removeClass('dismiss');
                        }
                    },
                    cancel: function(){
                        elem.removeClass('dismiss');
                    },
                    end: function(drag) {
                        if (dismiss) {
                            elem.addClass('dismitted');
                            $timeout(function() {
                                scope.$apply(function() {
                                    dismissFn(scope);
                                });
                            }, 300);
                        } else {
                            drag.reset();
                        }
                    }
                });
            };
        }
    };
});

//
// Another `$drag` usage example: this is how you could create
// a touch enabled "deck of cards" carousel. See `carousel.html` for markup.
//
app.directive('carousel', function(){
    return {
        restrict: 'C',
        scope: {},
        controller: function() {
            this.itemCount = 0;
            this.activeItem = null;

            this.addItem = function(){
                var newId = this.itemCount++;
                this.activeItem = this.itemCount === 1 ? newId : this.activeItem;
                return newId;
            };

            this.next = function(){
                this.activeItem = this.activeItem || 0;
                this.activeItem = this.activeItem === this.itemCount - 1 ? 0 : this.activeItem + 1;
            };

            this.prev = function(){
                this.activeItem = this.activeItem || 0;
                this.activeItem = this.activeItem === 0 ? this.itemCount - 1 : this.activeItem - 1;
            };
        }
    };
});

app.directive('carouselItem', function($drag) {
    return {
        restrict: 'C',
        require: '^carousel',
        scope: {},
        transclude: true,
        template: '<div class="item"><div ng-transclude></div></div>',
        link: function(scope, elem, attrs, carousel) {
            scope.carousel = carousel;
            var id = carousel.addItem();

            var zIndex = function(){
                var res = 0;
                if (id === carousel.activeItem){
                    res = 2000;
                } else if (carousel.activeItem < id) {
                    res = 2000 - (id - carousel.activeItem);
                } else {
                    res = 2000 - (carousel.itemCount - 1 - carousel.activeItem + id);
                }
                return res;
            };

            scope.$watch(function(){
                return carousel.activeItem;
            }, function(){
                elem[0].style.zIndex = zIndex();
            });

            $drag.bind(elem, {
                //
                // This is an example of custom transform function
                //
                transform: function(element, transform, touch) {
                    //
                    // use translate both as basis for the new transform:
                    //
                    var t = $drag.TRANSLATE_BOTH(element, transform, touch);

                    //
                    // Add rotation:
                    //
                    var Dx    = touch.distanceX,
                        t0    = touch.startTransform,
                        sign  = Dx < 0 ? -1 : 1,
                        angle = sign * Math.min( ( Math.abs(Dx) / 700 ) * 30 , 30 );

                    t.rotateZ = angle + (Math.round(t0.rotateZ));

                    return t;
                },
                move: function(drag){
                    if(Math.abs(drag.distanceX) >= drag.rect.width / 4) {
                        elem.addClass('dismiss');
                    } else {
                        elem.removeClass('dismiss');
                    }
                },
                cancel: function(){
                    elem.removeClass('dismiss');
                },
                end: function(drag) {
                    elem.removeClass('dismiss');
                    if(Math.abs(drag.distanceX) >= drag.rect.width / 4) {
                        scope.$apply(function() {
                            carousel.next();
                        });
                    }
                    drag.reset();
                }
            });
        }
    };
});

app.directive('dragMe', ['$drag', function($drag){
    return {
        controller: function($scope, $element) {
            $drag.bind($element,
                {
                    //
                    // Here you can see how to limit movement
                    // to an element
                    //
                    transform: $drag.TRANSLATE_INSIDE($element.parent()),
                    end: function(drag) {
                        // go back to initial position
                        drag.reset();
                    }
                },
                { // release touch when movement is outside bounduaries
                    sensitiveArea: $element.parent()
                }
            );
        }
    };
}]);