describe('SearchController', function() {
    beforeEach(module('Search'));

    var $controller;

    beforeEach(inject(function(_$controller_){
        // The injector unwraps the underscores (_) from around the parameter names when matching
        $controller = _$controller_;
    }));

    describe('$scope.emojiCommentFilter', function() {
        it('check if the body of the comment has an emoji', function() {
            var $scope = {};
            var controller = $controller('SearchController', { $scope: $scope });
            expect($scope.emojiCommentFilter({body:'give me five :+1:'})).toEqual(true);
            expect($scope.emojiCommentFilter({body:'give me five'})).toEqual(false);
        });
    });

    describe('$scope.getCommitterMapFromCommits', function() {
        it('get committer map form the commits', function() {
            var $scope = {};
            var controller = $controller('SearchController', { $scope: $scope });
            expect($scope.getCommitterMapFromCommits([{
                committer: {
                    id: '89',
                    login: 'conanmy',
                    avatar_url: 'onlineurl-xxx'
                }
            }])).toEqual({
                89: {
                    id: '89',
                    name: 'conanmy',
                    emojis: [],
                    emojiDetail: {},
                    avatar_url: 'onlineurl-xxx'
                }
            });
        });
    });
});