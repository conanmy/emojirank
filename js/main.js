var app = angular.module('Search', [])
app.controller('SearchController', function($scope, $http, $q) {
    $scope.committers = [];
    $scope.search = function(repos) {
        if (!repos) {
            alert('No repos entered.');
        }

        var request = function(url) {
            return $http({method: 'get', url: url});
        };

        var basicUrl = 'https://api.github.com/';

        request(
            basicUrl + 'repos/' + repos + '/pulls'
        ).then(function(res) {
            var pulls = res.data;
            $q.all(
                pulls.map(function(pull) {
                    return request(pull.review_comments_url);
                })
            ).then(function(responses) {
                var gatheredComments = [];
                responses.map(function(res) {
                    gatheredComments = gatheredComments.concat(res.data);
                });

                getCommitterAndEmojiurl(function(committerMap) {
                    gatheredComments
                        .filter(emojiCommentFilter)
                        .map(function(comment) {
                            if (committerMap[comment.user.id]) {
                                var commiter = committerMap[comment.user.id];
                                commiter.emojis
                                    = commiter.emojis.concat(comment.emojis);
                            }
                        });
                    var committerArray = [];
                    for (var key in committerMap) {
                        committerArray.push(committerMap[key]);
                    }
                    // add emoji details, count and url
                    // Todo: separate the map function out and test
                    committerArray.map(function(committer) {
                        var emojiDetail = committer.emojiDetail;
                        committer.emojis.map(function(emoji) {
                            if (emojiDetail[emoji] === undefined) {
                                emojiDetail[emoji] = 1;
                            } else {
                                emojiDetail[emoji]++;
                            }
                        });
                    });
                    committerArray.sort(function(a, b) {
                        return b.emojis.length - a.emojis.length;
                    });
                    $scope.committers = committerArray;
                });
            }, function() {
                alert('Error getting pulls');
            });
        });

        function getCommitterAndEmojiurl(callback) {
            $q.all([
                request(basicUrl + 'repos/' + repos + '/commits'),
                request(basicUrl + 'emojis')
            ]).then(function(responses){
                $scope.emojiurls = responses[1].data;

                var commits = responses[0].data;
                var committerMap = {};
                commits.map(function(commit) {
                    if (commit.committer
                        && committerMap[commit.committer.id] === undefined) {
                        committerMap[commit.committer.id] = {
                            id: commit.committer.id,
                            name: commit.committer.login,
                            emojis: [],
                            emojiDetail: {},
                            avatar_url: commit.committer.avatar_url
                        };
                    }
                });

                callback(committerMap);
            }, function() {
                alert('Error getting commits');
            });
        }

        function emojiCommentFilter(comment) {
            var regex = /(:(\w|\+|\-)+:)/g;
            var emojis = comment.body.match(regex);
            // Todo: recheck emoji with emojiurl map
            if (emojis !== null && emojis.length > 0) {
                console.log(comment.body + 'by ' + comment.user.id);
                emojis = emojis.map(function(emoji) {
                    return emoji.slice(1, emoji.length - 1);
                });
                comment.emojis = emojis;
                return true;
            }
        }
    };
});
