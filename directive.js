(function() {

	String.format = function() {
		var s = arguments[0];
		for (var i = 0; i < arguments.length - 1; i++) {
			var reg = new RegExp("\\{" + i + "\\}", "gm");
			s = s.replace(reg, arguments[i + 1]);
		}

		return s;
	};
	var directiveMoudle = angular.module('customDirectiveModule', []);
	directiveMoudle.directive('focus', ['$parse', '$timeout', function($parse, $timeout) {
		return {
			link: function(scope, element, attrs) {
				$(element).focus();
			}
		}
	}]).directive('onSelectConfirm', ['$parse', '$timeout', function($parse, $timeout) {
		return {
			link: function(scope, element, attrs) {
				var onSelectConfirm = $parse(attrs.onSelectConfirm);
				$(document).on('keydown', function(e) {
					if (e.keyCode === 13) {
						if ($(element).is(':visible')) {
							$timeout(function() {
								onSelectConfirm(scope);
							});
							e.preventDefault();
						}
					}
					return true;
				});
			}
		}
	}]).directive('onMouseDown', ['$parse', function($parse) {
		return {
			link: function(scope, element, attrs) {
				var onMouseDownHandler = $parse(attrs.onMouseDown);
				element.on('mousedown', function(e) {
					onMouseDownHandler(scope);
					e.preventDefault();
					return true;
				});
			}
		}
	}]).directive('onArrowUp', ['$parse', '$timeout', function($parse, $timeout) {
		return {
			link: function(scope, element, attrs) {
				var onArrowUpHandler = $parse(attrs.onArrowUp);
				$(document).on('keyup', function(e) {
					if (e.keyCode === 38) {
						if ($(element).is(':visible')) {
							$timeout(function() {
								onArrowUpHandler(scope);
							})

						}
					}
					return true;
				});
			}
		}
	}]).directive('onArrowDown', ['$parse', '$timeout', function($parse, $timeout) {
		return {
			link: function(scope, element, attrs) {
				var onArrowDown = $parse(attrs.onArrowDown);
				$(document).on('keyup', function(e) {
					if (e.keyCode === 40) {
						if ($(element).is(':visible')) {
							$timeout(function() {
								onArrowDown(scope);
							})
						}
					}
					return true;
				});
			}
		}
	}]).directive('onMentionStart', ['$parse', function($parse) {
		return {
			restrict: "A",
			link: function(scope, element, attrs) {
				var onMentionStartHandler = $parse(attrs.onMentionStart);
				$(element).on('keydown', function(e) {
					//get the caret
					var sel = document.getSelection();
					var anchor_node = sel.anchorNode;

					// delete the mention block
					if (e.keyCode === 8) {
						var sel = document.getSelection();
						var anchor_node = sel.anchorNode;
						if ($(anchor_node).parent()[0].className === 'mention_complete') {
							$(anchor_node).parent().remove();
							e.preventDefault();
						}
						return true;
					}

					//detect @ key down
					if (e.keyCode === 50) {
						function insertMention(src, editor) {
							var sel = document.getSelection();
							var range = sel.getRangeAt(0);
							var nnode = document.createElement("span");
							nnode.innerHTML = '<span contenteditable="true" class="mention_start">@</span>';
							range.insertNode(nnode);
							range.setStartAfter(nnode);
							range.setEndAfter(nnode);
							sel.removeAllRanges();
							sel.addRange(range);
						}

						insertMention(null, scope.editor);
						e.preventDefault();
						return true;
					}
					// detect arrow up and down keys
					if (e.keyCode === 38 || e.keyCode === 40) {
						// if the caret in the mention_start
						if ($(anchor_node).parent()[0].className === 'mention_start') {
							e.preventDefault();
						}
						return true;
					}
					return true;
				});

				$(element).on('keyup', function(e) {
					var sel = document.getSelection();
					var anchor_node = sel.anchorNode;
					// detect arrow up and down keys
					if (e.keyCode === 38 || e.keyCode === 40) {
						// if the caret in the mention_start
						if ($(anchor_node).parent()[0].className === 'mention_start') {
							e.preventDefault();
						}
						return true;
					}
					if ($(anchor_node).parent()[0].className === 'mention_start') {
						var left = $(anchor_node).parent().offset().left + $(anchor_node).parent().width();
						var top = $(anchor_node).parent().offset().top;
						onMentionStartHandler(scope, {
							options: {
								key: $(anchor_node).text(),
								left: left,
								top: top,
								onMemberSelected: function(member) {
									if (member) {
										var sel = document.getSelection();
										var anchor_node = sel.anchorNode;
										var parentSpan = $(anchor_node).parent().parent();
										if (($(anchor_node).parent()[0].className = 'mention_start')) {
											parentSpan.remove();
										}
										var range = sel.getRangeAt(0);
										var nnode = document.createElement("span");
										nnode.innerHTML = String.format('<span contenteditable="true"  mention-id="{1}" mention-name="{2}"  class="mention_complete">@{0}</span><span class="mention_space">&nbsp;</span>', member.name, member.id, member.name);
										range.insertNode(nnode);
										range.setStartAfter(nnode);
										range.setEndAfter(nnode);
										sel.removeAllRanges();
										sel.addRange(range);
									}
								}
							}
						});
					} else {
						// not start with @, call with handler with key='';						
						onMentionStartHandler(scope, {
							options: {
								key: ''
							}
						});
					}
					return true;
				});
			}
		}
	}]);
})();