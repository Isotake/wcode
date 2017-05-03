$(function(){

$.wcode = {};
var zoomIntval = true;

var page = null
,	data = null
,	lstorage = null
,	hist = null
,	tagarea = null;

/* Function Ajax v1.01 */

var objFuncAjax = {
	requestByPost : function (_url,_data,_callback,_complete){
//		console.log(arguments);
		$.ajax({
			url	: _url,
			type	: "POST",
			data	: _data,
			dataType: "json",
			error	: function(xhr, status, errorThrown){ alert(status); },
			success	: _callback,
			complete: _complete	
		});
	},
	getRecords : function (_config){
		var _url = (_config.url) ? _config.url : '../search.php';

		if(!_config.mode){ console.log('error - config.mode');return false; }
		if(!_config.kwords){ _config.kwords = $.wcode.getTagsFromTagbox('kwords').join(' '); }
//		if(!_config.kwords){ _config.kwords = $.wcode.getFromBox('kwords').join(' '); }
		if(!_config.tagOnArray) _config.tagOnArray = lstorage.getTagFlipArray('tagOn');
		if(!_config.tagOffArray) _config.tagOffArray = lstorage.getTagFlipArray('tagOff');
//		if(!_config.tagOnArray) _config.tagOnArray = getTagFlipArray('tagOn');
//		if(!_config.tagOffArray) _config.tagOffArray = getTagFlipArray('tagOff');
		if(!_config.flgTag) _config.flgTag = 0;
		if(!_config.offset) _config.offset = $.wcode.getOffset();
		if(!_config.maxrow) _config.maxrow = data.get_max_row();
		if(!_config.item_num) _config.item_num = data.get_item_num();
		var _data = {
				'searchMode': _config.mode,
				'kwords': _config.kwords,
				'tagOnArray': _config.tagOnArray,
				'tagOffArray': _config.tagOffArray,
				'flgTag': _config.flgTag,
				'offset': _config.offset,
				'maxrow': _config.maxrow,
				'item_num': _config.item_num
		};
//		console.log(_data);
		var _success = (_config.cb_success) ? _config.cb_success : function(data, status, xhr){};
		var _complete = (_config.cb_complete) ? _config.cb_complete : function(data, status, xhr){};
		objFuncAjax.requestByPost(_url,_data,_success,_complete);	
	},
	getRecordsOnlyCounts : function(){
		var _config = {
			mode: 'count',
			tagOnArray: $.wcode.getTagsFromTagbox('tagon'),
			tagOffArray: $.wcode.getTagsFromTagbox('tagoff'),
//			tagOnArray: $.wcode.getFromBox('tagEqual'),
//			tagOffArray: $.wcode.getFromBox('tagNot'),
			cb_success: function(data){
				$('.submitArea .counter').trigger('counter', data.listCount);
			}
		};
		objFuncAjax.getRecords(_config);
	}
};

$.wcode.getRecords = objFuncAjax.getRecords;
$.wcode.getCounts = objFuncAjax.getRecordsOnlyCounts;

/* onLoad Event */
		$(window).on('load',function(){
			page = new PageManage();
			data = new DataManage();
			lstorage = new LocalStorageManage();
			hist = new HistoryManage();
			tagarea = new TagareaManage();
			$.wcode.getTagsFromTagbox = tagarea.getTagsFromTagbox;

			lstorage.setTagArrayFromTaglist();
			var _config = {
				mode: 'search',

				cb_success: function(data, status, xhr){
					$('.loading').remove();
					$('.itemImage').fadeIn(300);
					$('#loadOverlay').delay(500).slideUp(1000, function(){ $(this).remove(); });

					$.wcode.areaSubmit();
/*
					$.wcode.emptyBox('tagEqual');
					$.wcode.emptyBox('tagNot');

					$('#itemStatusKwords').wcodeTagInput();
					$('#itemStatusTagOn').wcodeTagInput({
						autocomplete_url: './search_onload.php',
						onAddTag: true,
						onRemoveTag: true
					});
					$('#itemStatusTagOff').wcodeTagInput({
						autocomplete_url: './search_onload.php',
						onAddTag: true,
						onRemoveTag: true
					});

//					$('#tagListBox').on('click', '.tagItem', $.wcodeTagListEvent);
//					$('#tagListBox').on('click', '.tagItem', function(){ console.log($.wcodeTagListEvent); });
					$('#tagListBox').on('click', '.tagItem', ObjTagListBox.event);
*/
tagarea.buildTagarea();
tagarea.buildTagareas(data.tag);

					$('.debugArea').empty().append(data.debug_output);
				},
				cb_complete: function(){
//					console.log('complete');
					eventClickImage();
					eventClickZoom();
					eventCoverClose();
					eventItemSrtcutReload();
					eventItemSrtcutInit();
					eventItemConfigMaxrows();
				}
			};

//			if(!!location.search) pushHistory(null, null, location.origin + location.pathname);
			$.wcode.getRecords(_config);
		});

/* page management */
function PageManage(){
	this.count_area = 'countArea';
	this.count_area_class = '.'+this.count_area;
	this.item_total = 'totalCount';
	this.item_total_class = '.'+this.item_total;
	this.item_from = 'item_num_from';
	this.item_from_class = '.'+this.item_from;
	this.item_to = 'item_num_to';
	this.item_to_class = '.'+this.item_to;

	this.prev_area = 'itemPrevArea';
	this.prev_area_class = '.'+this.prev_area;
	this.item_card = 'itemCard';
	this.item_card_class = '.'+this.item_card;
	this.item_count_area = 'itemCountArea';
	this.item_count_area_class = '.'+this.item_count_area;
	this.next_area = 'itemNextArea';
	this.next_area_class = '.'+this.next_area;
	this.down_circle_id = '#downCircleIcon';
}
PageManage.prototype.item_num_controll = function(num_from, num_to){
	if(num_from > 0){
		this.prevarea_show();
	} else {
		this.prevarea_hide();
	}

	var _total = data.get_item_total();
	if(num_to < _total){
		this.nextarea_show();
	} else {
		this.nextarea_hide();
	}

	data.set_item_from(num_from);
	data.set_item_to(num_to);
};
PageManage.prototype.prevarea_show = function(){
	$(this.prev_area_class).removeClass('hidden');
};
PageManage.prototype.prevarea_hide = function(){
	$(this.prev_area_class).addClass('hidden');
};
PageManage.prototype.nextarea_show = function(){
	$(this.next_area_class).removeClass('hidden');
};
PageManage.prototype.nextarea_hide = function(){
	$(this.next_area_class).addClass('hidden');
};

/* data management */
function DataManage(){
}
DataManage.prototype.get_max_row = function(){
	return $(page.down_circle_id).attr('data-maxrows');
};
DataManage.prototype.set_max_row = function(val){
	$(page.down_circle_id).attr('data-maxrows', val);
};
DataManage.prototype.get_item_total = function(){
	return parseInt($(page.item_total_class).text());
};
DataManage.prototype.set_item_total = function(val){
	$(page.item_total_class).text(val);
};
DataManage.prototype.get_item_from = function(){
	return parseInt($(page.count_area_class + ' ' + page.item_from_class).text());
};
DataManage.prototype.set_item_from = function(val){
	$(page.item_from_class).text(val);
};
DataManage.prototype.get_item_to = function(){
	return parseInt($(page.count_area_class + ' ' + page.item_to_class).text());
};
DataManage.prototype.set_item_to = function(val){
	$(page.item_to_class).text(val);
};
DataManage.prototype.get_item_num = function(){
	return $(page.item_card_class).length;
};

/* tagarea management */
function TagareaManage(){
}
TagareaManage.prototype.buildTagarea = function(){
	var tagobj_kwords = $('#kwords').tagarea({
		placeholder_color: '#bcbcbc',
		input_color: '#bcbcbc',
		onAddTag: function(target_str){
			console.log('#kwords - add');
		},
		onRemoveTag: function(target_str){
			console.log('#kwords - remove');
		},
		onChangeTag: function(target_str){
			console.log('#kwords - change');
			$('#' + this.tagbox_id).trigger('click');
		}
	});

	$('#kwords_taginput').on('click', function(e){
		e.stopPropagation();
	});
	$('#kwords_tagbox').on('click', function(){
		$('#kwords_taginput').appendTo($(this)).focus();
	});
	$('#kwords_tagbox').trigger('click');

};
TagareaManage.prototype.buildTagareas = function(tag_data){
	var tag_json = this.convRawTagDataToJson(tag_data);
	$('#tagoff').append($('<div>').addClass('pre-list').text(tag_json));
	var tagobj_on = $('#tagon').tagarea({
		select_class: 'tagon_selected',
		placeholder_color: '#bcbcbc',
		input_color: '#bcbcbc',
		onAddTag: function(target_str){
			console.log('#tagon - add');
			var off_target = tagobj_off.setTarget(target_str);
			if(off_target.getBoxObj()){
				tagobj_off.removeTag(off_target);
			}
			if(off_target.getListObj()){
				off_target.getListObj().removeClass('tagNeutral').addClass('tagOn');
			}

		},
		onRemoveTag: function(target_str){
			console.log('#tagon - remove');
		},
		onChangeTag: function(target_str){
			console.log('#tagon - change');
			$('#' + this.tagbox_id).trigger('click');
		}
	});
	var tagobj_off = $('#tagoff').tagarea({
		select_class: 'tagoff_selected',
		placeholder_color: '#bcbcbc',
		input_color: '#bcbcbc',
		onAddTag: function(target_str){
			console.log('#tagoff - add');
			var off_target = this.setTarget(target_str);
			if(off_target.getListObj()){
				off_target.getListObj().removeClass('tagOn').addClass('tagOff');
			}
		},
		onRemoveTag: function(target_str){
			console.log('#tagoff - remove');
			var off_target = this.setTarget(target_str);
			if(off_target.getListObj()){
				off_target.getListObj().removeClass('tagOff').addClass('tagNeutral');
			}
		},
		onChangeTag: function(target_str){
			console.log('#tagoff - change');
			$('#' + this.tagbox_id).trigger('click');
		}
	});

	tagobj_on.addToList = function(){};
	tagobj_off.addToList = function(){};
	tagobj_off.inList = function(str){
		var rst = null;
		$('#'+this.taglistbox_id).find('.'+this.tag_class).each(function(){
			var txt = $.trim($(this).find('.tagListId').text());
			if(txt == str){ rst = $(this); return false; }
		});
		return rst;
	};

	var ls_tagcond = {};
//	var ls_tagcond = {'JavaScript': 'tagOn', 'design:datepicker': 'tagOff'};
	for(var key in ls_tagcond){
		var _class = ls_tagcond[key];
		if(_class == 'tagOff'){
			$('#'+tagobj_on.taglistbox_id).trigger('listadd', [[key]]);
		}
	}

	$('#'+tagobj_off.taglistbox_id + ' .tag').each(function(itr){
		var tag_obj = {};

		var tag_fullname = $(this).text();
		var tag_splited = tag_fullname.split(':');
		if(!tag_splited[1]){
			var tag_1st = tag_splited[0];
			var tag_2nd = null;
			var tag_name = tag_1st;
			var tag_idname = tag_1st + '-';
		} else {
			var tag_1st = tag_splited[0];
			var tag_2nd = tag_splited[1];
			var tag_name = tag_2nd;
			var tag_idname = tag_1st + '-' + tag_2nd;
//			var tag_idname = tag_1st + '-' + tag_2nd.split(' ').join('-');
		}
		if(ls_tagcond[tag_fullname]){
			var tag_class = ls_tagcond[tag_fullname];
		} else {
			var tag_class = 'tagNeutral';
		}
//		console.log(tag_fullname, tag_name, tag_idname, tag_class);

		$(this).empty().attr({'id': tag_idname}).addClass(tag_class).append($('<span>').text(tag_name)).append($('<div>').addClass('tagListId').text(tag_fullname)).append($('<div>').addClass('tagListColor'));
	});

	$('#tagon_taglistbox').off('click');
	$('#tagoff_taglistbox').off('click').on('click', '.tag', function(e){
		var $self = $(this);
		var tag_fullname = $self.find('.tagListId').text();
		var on_target = tagobj_on.setTarget(tag_fullname);
		var off_target = tagobj_off.setTarget(tag_fullname);

		if($self.hasClass('tagOn')){
			tagobj_on.removeTag(on_target);
			tagobj_off.addTag(off_target);
		} else if ($self.hasClass('tagOff')){
			tagobj_off.removeTag(off_target);
		} else if ($self.hasClass('tagNeutral')){
			tagobj_on.addTag(on_target);
		} else {
			console.log('something wrong...');
		}
	});

	tagobj_on.taglistbox_id = tagobj_off.taglistbox_id;

	$('#tagon_taginput').on('click', function(e){
		e.stopPropagation();
	});
	$('#tagoff_taginput').on('click', function(e){
		e.stopPropagation();
	});
	$('#tagon_tagbox').on('click', function(){
		$('#tagon_taginput').appendTo($(this)).focus();
	});
	$('#tagoff_tagbox').on('click', function(){
		$('#tagoff_taginput').appendTo($(this)).focus();
	});
	$('#tagon_tagbox').trigger('click');
	$('#tagoff_tagbox').trigger('click');

};
TagareaManage.prototype.rebuildTagareas = function(tag_data){
	$('#tagon').empty();
	$('#tagoff').empty();
	this.buildTagareas(tag_data);
};
TagareaManage.prototype.getTagsFromTagbox= function(tagbox_name){
/* todo */
	var box_id = '';
	if(tagbox_name == 'kwords'){
		box_id = 'kwords_tagbox';
	} else if(tagbox_name == 'tagon'){
		box_id = 'tagon_tagbox';
	} else if(tagbox_name == 'tagoff'){
		box_id = 'tagoff_tagbox';
	} else {
		console.log('something wrong...');
	}

	var _arr = [];
	$('#' + box_id).find('.tag_name').each(function(){
		var _name = $.trim($(this).text());
		_arr.push(_name);
	});
	return _arr;
};
TagareaManage.prototype.convRawTagDataToJson = function(raw_data){
	if(Array.isArray(raw_data)){
		try {
			return JSON.stringify(raw_data);
		} catch(e){
			console.log('something wrong with raw_data...');
			return JSON.stringify([]);
		}
	}
	console.log('something wrong with raw_data...');
	return JSON.stringify([]);
};
TagareaManage.prototype.func = function(){
};

/* itemBlock */
		function renderRecords(data){
			var _li = '';

			_li+= '<div class="items itemCard" style="display: none;">';
			_li+= '<div class="imageBlock" data-itemRid="' + data['rid'] + '" data-itemTitle="' + data['title'] + '" data-itemDesc="' + data['desc'] + '" data-itemUrl="' + data['url']+'" data-photoUrl="' + data['photo_url']+'" data-thumbUrl="' + data['thumb_url']+'" data-itemTag="' + data['taglist']+'">';
			_li+= '<img class="loading" src="./css/images/gif-load.gif" />';
			_li+= '</div>';
			_li+= '<div class="taglistBlock">';

			var _arr = data['taglist'].split(',');
			for(var m=0;m<_arr.length;m++){
				var _str = _arr[m];
				if($('#tagAllList li.tagHidden:contains('+ _str +')').length == 0) _li+= '<div class="tagItemBlock">' + _str + '</div>';
			}

			_li+= '</div>';
			_li+= '</div>';

			return _li;
		}

		function makeItemBlock(_data){
			var _mode = _data.mode;
			var _acceptData = _data.record;
			var first_card = $('.itemCard:first');
			for(var i=0;i<_acceptData.length;i++){
				var _data = _acceptData[i];
				var _li = renderRecords(_data);
				var _thumburl = _data.thumb_url;

				if(_mode == 'prevto'){
					var _len = _acceptData.length;
					$(_li).insertBefore(first_card).delay((_len - i)*300).fadeIn(600, function(_thumburl){
						var _this = $(this);
							_rid = $(this).find('.imageBlock').attr('data-itemRid'),
							_thumb = $(this).find('.imageBlock').attr('data-thumbUrl');
						var _img = '<img class="itemImage" src="' + _thumb + '" />';
						$(_img).load(function(){
							_this.find('.loading').remove();
							$(this).appendTo(_this.find('.imageBlock')).fadeIn(3000);
						});
					});
				} else {
					$(_li).appendTo("#recordList").delay(i*300).fadeIn(600, function(_thumburl){
						var _this = $(this);
							_rid = $(this).find('.imageBlock').attr('data-itemRid'),
							_thumb = $(this).find('.imageBlock').attr('data-thumbUrl');
						var _img = '<img class="itemImage" src="' + _thumb + '" />';
						$(_img).load(function(){
							_this.find('.loading').remove();
							$(this).appendTo(_this.find('.imageBlock')).fadeIn(3000);
						});
					});
				}
			}
		}

/* itemCoverBlock */
		function renderCoverBlock(data){
			var _html = '';
			_html+= '<div class="coverBlock">';
			_html+= '<div class="coverBlockTitle">' + data.title + '</div>';
			_html+= '<div class="coverBlockIcons">';
			_html+= '<a href="' + data.url + '" target="_brank">' + '<div class="coverBlockLink"><i class="icon-link-ext"></i></div></a>';
			_html+= '<div class="coverBlockZoom"><i class="icon-zoom-in"></i></div>';
			_html+= '</div>';
			_html+= '</div>';
			_html+= '';
			return _html;
		}

		function eventClickImage(){
			$('#recordList').on('click', '.items img', function(){
//				console.log('eventClickImage');

				var _icon = $(this).parents('div.items').find('.imageBlock');
				var _data = {};
				_data.title = _icon.attr('data-itemTitle');
				_data.url = _icon.attr('data-itemUrl');

				var _cover = renderCoverBlock(_data);
				$(this).parents('.items').prepend(_cover).children('.coverBlock').slideDown('slow',function(){
					$(this).css('overflow','visible');
				});
			});
		}

		function eventCoverClose(){
			$('#recordList').on('click', '.coverBlock', function(){ $(this).fadeOut('slow',function(){ $(this).remove(); }); });
		}

/* itemZoomBlock */
		function renderZoomBlock(_data){
			var _arr = _data.taglist.split(',');

			var _html = '';
			_html+= '<div class="largeBlock">';
			_html+= '<div class="largeBlockBalloon"></div>';
			_html+= '<div style="float: left;width: 470px;">' + _data.title + '<br /><br />';
			_html+= _data.desc + '</div>';
			_html+= '<div style="float: left;margin: 0 0 20px 20px;width: 220px;text-align: right;">';
			for(var i=0; i<_arr.length; i++){
				_html+= '<span class="tagLargeBlock">' + _arr[i] + '</span><br />';
			}
			_html+= '</div>';
			_html+= '<div class="largeBlockImage"><img class="loading" src="./css/images/gif-load.gif" /></div>';
			_html+= '</div>';
			return _html;
		}

		function eventClickZoom(){
//			console.log('eventClickZoom');
			$('#recordList').on('click', '.icon-zoom-in', function(){
//				console.log('icon-zoom-in');
				if(zoomIntval){
					Intval = false;

					largeBlockToggle();

					var _icon = $(this).parents('div.items').find('.imageBlock');
					var _data = {};
						_data.rid = _icon.attr('data-itemRid');
						_data.title = _icon.attr('data-itemTitle');
						_data.desc = _icon.attr('data-itemDesc');
						_data.taglist = _icon.attr('data-itemTag');
						_data.photo_url = _icon.attr('data-photoUrl');
					var zoomblock = renderZoomBlock(_data);

					var thisblock = _icon.parents('div.items');
// visibleのitemsブロックの数
// itemSearchブロックがvisibleのときは-1
					if($('div.items.itemSearch:visible').length == 1){
						var pos = (thisblock.prevAll('.items:visible').length -1) % 3;
					} else {
						var pos = (thisblock.prevAll('.items:visible').length ) % 3;
					}
					var _left = '0';
					if(pos == 0){
						var _left = '20px';
						if(thisblock.nextAll().length == 1){ var pre = thisblock.next(); }
						 else if(thisblock.nextAll().length == 0){ var pre = thisblock; }
						 else { var pre = thisblock.next().next(); }
					} else if(pos == 1) {
						var _left = '270px';
						if(thisblock.nextAll().length == 0){ var pre = thisblock; }
						 else { var pre = thisblock.next(); }
					} else if(pos == 2){
						var _left = '520px';
						var pre = thisblock;
					}
					pre.after(zoomblock).next().delay(1000).slideToggle('slow',function(){
						$(this).css('overflow','visible');
						$('.largeBlockBalloon').css('left', _left).animate({'top': '-20px'});

// largeBlockImageの画像の表示 読み込んでからサイズを取得する
						var _img = document.createElement('img');
						$(_img).css('display','none').attr('src', _data.photo_url);
//						$(_img).css('display','none').attr('src', '//takehaya.jp/wcode253/modules/wcode/images/rid' + _data.rid + '.jpg');
//						$(_img).css('display','none').attr('src', './images/rid' + _data.rid + '.jpg');
						$(_img).on('load', function(){
							var _w = $(_img).width(),
							    _h = $(_img).height();
							if(_w/_h <= 1.6){ $(_img).width('710'); } else { $(_img).height('710'); }
							$(_img).fadeIn();
						});
						$('.largeBlockImage').html(_img);
							
						eventZoomClose();
						Intval = true;
					});
//					console.log(pos);
				}
			});
			
		}

		function eventZoomClose(){
			$('.largeBlock').on('click',function(){
				$(this).slideToggle('slow',function(){ $(this).remove(); });
			});
		}

		var objItemBlock = {
			getOffset: function(){
				return parseInt($('.countArea .item_num_from').text());
			}
		};
		$.wcode.getOffset = objItemBlock.getOffset;

/* itemPrevArea */
		$('#upCircleIcon').on('click', function(){
			if(!$(this).hasClass('inactive')){
				$(this).addClass('inactive');
				var _config = {
					mode: 'prevto',
					cb_success: function(data, status, xhr){
						makeItemBlock(data);
						page.item_num_controll(data.item_num_from, data.item_num_to);
//						$('.item_num_from').text(data.item_num_from);
//						$('.item_num_to').text(data.item_num_to);
						$('.debugArea').empty().append(data.debug_output);
					},
					cb_complete: function(){
						$('#upCircleIcon').removeClass('inactive');
						hist.push();
					}
				};
				$.wcode.getRecords(_config);
			}
		});

/* itemNextArea */
		$('#downCircleIcon').on('click', function(){
			if(!$(this).hasClass('inactive')){
				$(this).addClass('inactive');
				var _config = {
					mode: 'nextto',
					cb_success: function(data, status, xhr){
						makeItemBlock(data);
						page.item_num_controll(data.item_num_from, data.item_num_to);
//						$('.item_num_from').text(data.item_num_from);
//						$('.item_num_to').text(data.item_num_to);
						$('.debugArea').empty().append(data.debug_output);
					},
					cb_complete: function(){
						$('#downCircleIcon').removeClass('inactive');
						hist.push();
					}
				};
				$.wcode.getRecords(_config);
			}
		});

/* Submit Button Area v1.00 */

var objSubmitArea = {
	init : function(){
//		console.log(this);
		var customClick = getCustomClick();
		$('.submitButton').on(customClick, objSubmitArea.eventClick);
		$('.submitArea .counter').on('counter', objSubmitArea.eventCounter);
	},
	eventClick : function(){
		if(!$(this).hasClass('inactive')){
			$(this).addClass('inactive');
			setTagArrayOnSubmit();
			var _config = {
				mode: 'search',
				cb_success: function(data, status, xhr){
//					console.log(data);
					$.wcode.emptyBox('tagEqual');
					$.wcode.emptyBox('tagNot');
					$('#tagListBox').empty().wcodeTagListBox(data.tag);
					$('.submitArea .counter').trigger('counter', data.listCount);

					$('#recordList div[class="items"]').remove();
					makeItemBlock(data);

					$('.totalCount').text(data.listCount);
					$('.item_num_from').text(data.item_num_from);
					$('.item_num_to').text(data.item_num_to);
					$('.debugArea').empty().append(data.debug_output);
				},
				cb_complete: function(){
					hist.push();
				}
				
			};
			$.wcode.getRecords(_config);
		}
	},
	eventCounter : function(e, v){
		console.log(v);
		var _val = parseInt(v);
		$(this).find('.cur').addClass('active');
		$(this).find('.next').text(_val).addClass('active');

		setTimeout(function(){
			$('.submitButton').find('.cur').remove();
			$('.submitButton').find('.next').removeClass('next active').addClass('cur');
			$('<span>').addClass('next').appendTo($('.submitButton .counter'));
			if(_val < 1){
				$('.submitButton').addClass('inactive');
				$('.submitButton span[class^="icon-"]').removeClass('icon-ok').addClass('icon-cancel');
			} else if(_val > 0) {
				$('.submitButton').removeClass('inactive');
				$('.submitButton span[class^="icon-"]').removeClass('icon-cancel').addClass('icon-ok');
			}
		}, 500);
	}
};

$.wcode.areaSubmit = objSubmitArea.init;

/* Taginput Plugin v1.00 */
/*
var objTagInput = {
	init : function(settings){
		var _id = $(this).attr('id'),
			input_holder = '#' + _id,
			input_wrapper = '#' + _id + '_addTag',
			fake_input = '#' + _id + '_tag',
			settings = $.extend({
				defaultText: '',
				placeholderColor: '#bcbcbc',
				onAddTag: function(){ console.log('onAddTag'); },
				onRemoveTag: function(){ console.log('onRemoveTag'); },
				onChangeTag: function(){ console.log('onChangeTag'); }
			}, settings);

	// Initialize
		var _arr = $(this).text().split(',');
		$(this).empty();

		var _html = '<div id="' + _id + '_addTag">';
		_html+= '<input id="' + _id + '_tag" value="" data-default="' + settings.defaultText + '" /></div><div class="tags_clear"></div>';
		$(_html).appendTo(this);

		if(_arr.length > 0){
			for(var i=0;i<_arr.length;i++){
				$(this).wcodeTagAdd(_arr[i], {focus: true, onAddTag: settings.onAddTag, onRemoveTag: settings.onRemoveTag});
			}
		}

		if (settings.autocomplete_url != undefined) {
			autocomplete_options = {source: settings.autocomplete_url};
			for (attrname in settings.autocomplete) { 
				autocomplete_options[attrname] = settings.autocomplete[attrname]; 
			}
	
			$(fake_input).autocomplete(settings.autocomplete_url, settings.autocomplete);
			$(fake_input).bind('result', function(event,data,formatted) {
				if (data) {
					$(input_holder).wcodeTagAdd(data[0], {focus:true, onAddTag: settings.onAddTag, onRemoveTag: settings.onRemoveTag});
					$.wcode.getCounts();
				}
			});
		}

		$(fake_input).val($(fake_input).attr('data-default'));
//		$(fake_input).css('color', settings.placeholderColor);

		$(fake_input).blur();

		$(this).on('click', function(e){
			$(fake_input).focus();
		});

		$(fake_input).on('focus', function(e){
			if($(this).val() == $(this).attr('data-default')) $(this).val('');
//			$(this).css('color', '#000');
		});

		$(fake_input).on('blur', function(e){
			var v = $(this).val(),
				d = $(this).attr('data-default');

			if(v != '' && v != d){
				$(input_holder).wcodeTagAdd(v, {focus: true, onAddTag: settings.onAddTag, onRemoveTag: settings.onRemoveTag});
				$.wcode.getCounts();
			} else {
				$(this).val(d);
//				$(this).val(d).css('color', '#666');
			}

			return false;
		});

//	Enter Key Event
		$(fake_input).on('keypress', function(e){
			if(e.which == 13){
				e.preventDefault();
				var v = $(this).val();
				$(input_holder).wcodeTagAdd(v, {focus: true, onAddTag: settings.onAddTag, onRemoveTag: settings.onRemoveTag});
				$.wcode.getCounts();
			}
		});

// BS Key Event
		$(fake_input).on('keydown', function(e){
			if(e.keyCode == 8 && $(this).val() == ''){
				e.preventDefault();
				var obj = $(input_holder).find('span.tagStatusArea:last'),
//bug fix 
//					str = $.trim(obj.text().replace('x', ''));
					str = $.trim(obj.find('span').text());
				obj.children('a').wcodeTagRemove(escape(str), {focus: true, onRemoveTag: settings.onRemoveTag});
				$.wcode.getCounts();
				$(this).trigger('focus');
			}
		});
	},
	add : function(value, options){
		options = $.extend({
			focus: false,
			onAddTag: function(){},
			onRemoveTag: function(){},
			onChangeTag: function(){}
			}, options);
		var _id = $(this).attr('id'),
		    fake_input = '#' + _id + '_tag';

		value = $.trim(value);if(value == ''){ return false; }
		if($('#itemStatusTagOn').wcodeTagExist(value)){
			$('#itemStatusTagOn .tagStatusArea span:contains(' + value + ')').wcodeTagRemove(value, {focus: true});
		}
		if($('#itemStatusTagOff').wcodeTagExist(value)){
			$('#itemStatusTagOff .tagStatusArea span:contains(' + value + ')').wcodeTagRemove(value, {focus: true});
		}

		$('<span>').addClass('tagStatusArea').append(
				$('<span>').text(value).append('&nbsp;&nbsp;'),
				$('<a>', {href: '#', title: 'Removing tag', text: 'x'}).on('click', function(){
						$(this).wcodeTagRemove(escape(value), {onRemoveTag: options.onRemoveTag});
						$.wcode.getCounts();
					})
			).insertBefore(fake_input);

		$(fake_input).val('');
		if(options.focus){ $(fake_input).focus(); } else { $(fake_input).blur(); }

		if(options.onAddTag){
//			options.onAddTag.call(this, _id, value);
			var _idname = '',
				_new = '',
				_arr = value.split(':');
			if(_arr[1]){
				_idname = _arr[0] + '-' + _arr[1].split(' ').join('-');
			} else {
				_idname = _arr[0] + '-';
			}
			if(_id == 'itemStatusTagOn'){ _new = 'tagOn'; } else if(_id == 'itemStatusTagOff'){ _new = 'tagOff'; }
			$('#' + _idname).wcodeTagCondChange(_new);
		}

		if(options.onChangeTag){
			options.onChangeTag.call(this, _id, value);
		}
	},
	remove : function(value, options){
		options = $.extend({
			focus: false,
			onRemoveTag: function(){},
			onChangeTag: function(){}
			}, options);
		var _id = $(this).attr('id');
		value = unescape(value);
		$(this).parent('span').remove();

		if(options.onRemoveTag){
//			options.onRemoveTag.call(this, _id, value);
			var _idname = '',
				_new = 'tagNeutral',
				_arr = value.split(':');
			if(_arr[1]){
				_idname = _arr[0] + '-' + _arr[1].split(' ').join('-');
			} else {
				_idname = _arr[0] + '-';
			}
			$('#' + _idname).wcodeTagCondChange(_new);
		}

		if(options.onChangeTag){
			options.onChangeTag.call(this, _id, value);
		}

		return false;
	},
	exist : function(value){
		var tagslist = new Array();
		$(this).find('.tagStatusArea').each(function(){
//bug fix 
//			tagslist.push($.trim($(this).text().replace('x', '')));
			tagslist.push($.trim($(this).find('span').text()));
		});

		return ($.inArray(value, tagslist) >= 0);
	},
	funcGetTags : function(_str){
		var _a = '', _b = '';
		switch(_str){
			case 'kwords': _a = '#itemStatusKwords'; _b = '.tagStatusArea'; break;
			case 'tagEqual': _a = '#itemStatusTagOn'; _b = '.tagStatusArea'; break;
			case 'tagNot': _a = '#itemStatusTagOff'; _b = '.tagStatusArea'; break;
		}
		var _target = _a,
			_class = _b;

		var _arr = new Array();
		$(_target).find(_class).each(function(){
//bug fix
//			_arr.push($.trim($(this).text().replace('x', '')));
			_arr.push($.trim($(this).find('span').text()));
		});
		return _arr;
	},
	funcEmptyBox : function(_str){
		var _a = '', _b = '';
		switch(_str){
			case 'kwords': _a = '#itemStatusKwords'; _b = '.tagStatusArea'; break;
			case 'tagEqual': _a = '#itemStatusTagOn'; _b = '.tagStatusArea'; break;
			case 'tagNot': _a = '#itemStatusTagOff'; _b = '.tagStatusArea'; break;
		}
		var _target = _a,
			_class = _b;

		$(_target).find(_class).remove();
	}
};

$.wcode.getFromBox = objTagInput.funcGetTags;
$.wcode.emptyBox = objTagInput.funcEmptyBox;

$.fn.wcodeTagInput = objTagInput.init;
$.fn.wcodeTagAdd = objTagInput.add;
$.fn.wcodeTagRemove = objTagInput.remove;
$.fn.wcodeTagExist= objTagInput.exist;
*/
/* Taglist Box Plugin v1.00 */
/*
var ObjTagListBox = {
	init: function(_data){
		var	_tagCondObj = getTagArray('tagCond'),
			_tagHiddenObj = getTagArray('tagHidden');
//{'JavaScript': 'tagOn', 'design:datepicker': 'tagOff'}
		var _obj = {};
		for(var i=0;i<_data.length;i++){
			var _str = _data[i];
			if(_str.indexOf(':') > -1){
				var _arr = _str.split(':');
				if(!_obj[_arr[0]]){ _obj[_arr[0]] = [_arr[1]]; } else { _obj[_arr[0]].push(_arr[1]); }
			} else {
				if(!_obj[_str]){ _obj[_str] = [_str]; } else { _obj[_str].push(_str); }
			}
		}

		for(var key in _tagCondObj){
			var _str = key;
			if(_tagCondObj[_str] == 'tagOff' && _str.indexOf(':') > -1){
				var _arr = _str.split(':');
				if(!_obj[_arr[0]]){ _obj[_arr[0]] = [_arr[1]]; } else { _obj[_arr[0]].push(_arr[1]); }
			} else if(_tagCondObj[_str] == 'tagOff' && _str.indexOf(':') == -1) {
				if(!_obj[_str]){ _obj[_str] = [_str]; } else { _obj[_str].push(_str); }
			}
		}

		var _box = '#tagListBox';

		var i=0;
		for(var key in _obj){
			i++;
			var _idname = key;
			var _tagname = key;

			var _arr = _obj[key];
			for(var m=0;m<_arr.length;m++){
				i++;
				var _li = '';
				var _tagname = _arr[m];
				var _keyname = (key == _tagname) ? _tagname : key + ':' + _tagname ;
				var _idname = (key == _tagname) ? _tagname + '-' : key + '-' + _tagname.split(' ').join('-') ;
				var _classname = "tagNeutral";

				var _tagfull = '<div class="tagListId">' + _keyname + '</div>';
				if(_tagCondObj[_keyname] == 'tagOn' && _tagHiddenObj[_keyname] != 'tagHidden'){
					_classname = 'tagOn';
					_li+= '<li id="' + _idname + '" class="tagItem ' + _classname + '">' + '<span>' + _tagname + '</span>' + _tagfull + '<div class="tagListColor"></div></li>';
					$('#itemStatusTagOn').wcodeTagAdd(_keyname, {focus: true});
					$(_box).append($(_li).delay(i*100).fadeIn(300));
				} else if(_tagCondObj[_keyname] == 'tagOff' && _tagHiddenObj[_keyname] != 'tagHidden'){
					_classname = 'tagOff';
					_li+= '<li id="' + _idname + '" class="tagItem ' + _classname + '">' + '<span>' + _tagname + '</span>' + _tagfull + '<div class="tagListColor"></div></li>';
					$('#itemStatusTagOff').wcodeTagAdd(_keyname, {focus: true});
					$(_box).append($(_li).delay(i*100).fadeIn(300));
				} else if(!_tagCondObj[_keyname] && _tagHiddenObj[_keyname] != 'tagHidden'){
					_classname = 'tagNeutral';
					_li+= '<li id="' + _idname + '" class="tagItem ' + _classname + '">' + '<span>' + _tagname + '</span>' + _tagfull + '<div class="tagListColor"></div></li>';
					$(_box).append($(_li).delay(i*100).fadeIn(300));
				}
			}
		}
*/
		/* !important, not touchstart for mobile */
/*
		$(_box).off().on('click', '.tagItem', ObjTagListBox.event);
	},
	event : function(e){
		var _target = $(e.target).closest('.tagItem'),
			_classname = $(_target).attr('class'),
			_keyname = $(_target).find('.tagListId').text();

		if(_classname == 'tagItem tagOn'){
			$('#itemStatusTagOn .tagStatusArea span:contains(' + _keyname + ')').wcodeTagRemove(_keyname, {focus: true});
			$('#itemStatusTagOff').wcodeTagAdd(_keyname, {focus: true});
		} else if(_classname == 'tagItem tagOff'){
			$('#itemStatusTagOff .tagStatusArea span:contains(' + _keyname + ')').wcodeTagRemove(_keyname, {focus: true});
		} else if(_classname == 'tagItem tagNeutral'){
			$('#itemStatusTagOff .tagStatusArea span:contains(' + _keyname + ')').wcodeTagRemove(_keyname, {focus: true});
			$('#itemStatusTagOn').wcodeTagAdd(_keyname, {focus: true});
		}
		$.wcode.getCounts();
	},
	change: function(_new){
		if(_new == 'tagOn'){
			$(this).removeClass('tagOff').removeClass('tagNeutral').addClass('tagOn');
		} else if(_new == 'tagOff'){
			$(this).removeClass('tagOn').removeClass('tagNeutral').addClass('tagOff');
		} else if(_new == 'tagNeutral'){
			$(this).removeClass('tagOn').removeClass('tagOff').addClass('tagNeutral');
		}
	}
};

$.fn.wcodeTagListBox = ObjTagListBox.init;
$.fn.wcodeTagListEvent = ObjTagListBox.event;
$.fn.wcodeTagCondChange = ObjTagListBox.change;
*/
/* searchBlock */
		$('.searchIcon').on('click',function(){
			$(this).toggleClass('searchOn');
			if($(this).hasClass('searchOn')){
				$('.kwords_tagarea').slideDown();
			} else {
				$('.kwords_tagarea').slideUp();
			}
		});

/* statusBlock */
		$('.statusIcon').on('click',function(){
			$(this).toggleClass('statusOn');
			if($(this).hasClass('statusOn')){
				$('.tags_tagarea h4').show();
				$('.tags_tagarea .tagbox_wrapper').slideDown(1500);
//				$('#tagon .tagbox_wrapper').slideDown(1500);
			} else {
				$('.tags_tagarea h4').hide();
				$('.tags_tagarea .tagbox_wrapper').slideUp(1500);
//				$('#tagon .tagbox_wrapper').slideUp(1500);
			}
		});

/* srtcutBlock */
		$('.srtcutIcon').on('click',function(){
			$(this).toggleClass('srtcutOn');
			if($('.srtcutIcon.srtcutOn').length == 1 && !!largeBlockBool()){
				$('.largeBlock').slideToggle('slow',function(){
					$(this).remove();
					$('.items.itemSrtcut').remove().prependTo('#recordList').fadeIn();
				});
			} else if($('.srtcutIcon.srtcutOn').length == 1 && !largeBlockBool()){
					$('.items.itemSrtcut').remove().prependTo('#recordList').fadeIn();
			} else if($('.srtcutIcon.srtcutOn').length != 1 && !!largeBlockBool()){
				$('.largeBlock').slideToggle('slow',function(){
					$(this).remove();
					$('.itemSrtcut').fadeOut();
				});
			} else if($('.srtcutIcon.srtcutOn').length != 1 && !largeBlockBool()){
					$('.itemSrtcut').fadeOut();
			}
		});

		function eventItemSrtcutReload(){
			$('#recordList').on('click','.itemSrtcutReload .itemSrtcutExec',function(){
				location.reload();
			});
		}

		function eventItemSrtcutInit(){
			$('#recordList').on('click','.itemSrtcutInit .itemSrtcutExec',function(){
				$('#searchtext').val('');

				lstorage.deleteTagArray('tagCond');
				lstorage.deleteTagArray('tagHidden');

				$('.itemConfigMaxrows').wcodeChangeMaxRows(10);

				var _config = {
					mode: 'search',
					cb_success: function(data, status, xhr){
//						console.log(data);
						$.wcode.emptyBox('tagEqual');
						$.wcode.emptyBox('tagNot');
						$('#tagListBox').empty().wcodeTagListBox(data.tag);
						$('.submitArea .counter').trigger('counter', data.listCount);

						$('#recordList div[class="items"]').remove();
						makeItemBlock(data);

						$('.totalCount').text(data.listCount);
//						$('.curCount').text($('div[class="items"]').length);
						$('.item_num_from').text(data.item_num_from);
						$('.item_num_to').text(data.item_num_to);
						$('.debugArea').empty().append(data.debug_output);
				},
				cb_complete: function(){
					hist.push();
					}
				};
				$.wcode.getRecords(_config);
			});
		}

/* tagTable */
		$('.tagtableIcon').on('click',function(){
			alert('Under Constructing...');
		});

/* configBlock */
		$('.configIcon').on('click',function(){
			$(this).toggleClass('configOn');
			if($('.configIcon.configOn').length == 1 && !!largeBlockBool()){
				$('.largeBlock').slideToggle('slow',function(){
					$(this).remove();
					$('.items.itemConfig').remove().prependTo('#recordList').fadeIn();

					var max_row = data.get_max_row();
					$('.itemConfigExec:contains(' + max_row + ')').addClass('itemConfigMaxrowsSelected');
				});
			} else if($('.configIcon.configOn').length == 1 && !largeBlockBool()){
					$('.items.itemConfig').remove().prependTo('#recordList').fadeIn();

					var max_row = data.get_max_row();
					$('.itemConfigExec:contains(' + max_row + ')').addClass('itemConfigMaxrowsSelected');
			} else if($('.configIcon.configOn').length != 1 && !!largeBlockBool()){
				$('.largeBlock').slideToggle('slow',function(){
					$(this).remove();
					$('.itemConfig').fadeOut();
				});
			} else if($('.configIcon.configOn').length != 1 && !largeBlockBool()){
					$('.itemConfig').fadeOut();
			}
		});

		function eventItemConfigMaxrows(){
			$('#recordList').on('click','.itemConfigExec',function(){
				var _int = parseInt($(this).text());
				data.set_max_row(_int);
				$('.itemConfigExec.itemConfigMaxrowsSelected').removeClass('itemConfigMaxrowsSelected');
				$(this).addClass('itemConfigMaxrowsSelected');

			});
		}

		var objConfigMaxRows = {
			change : function(val){
				var _val = parseInt(val);
				data.set_max_row(val);
				$('.itemConfigExec.itemConfigMaxrowsSelected').removeClass('itemConfigMaxrowsSelected');
				$('.itemConfigExec:contains(' + _val + ')').addClass('itemConfigMaxrowsSelected');
			}
		};

		$.fn.wcodeChangeMaxRows = objConfigMaxRows.change;

/* adsBlock */				
		$('.adsIcon').on('click',function(){
			alert('Under Constructing...');
/*
			$(this).toggleClass('adsOn');
			if($('.adsIcon.adsOn').length == 1 && !!largeBlockBool()){
				if($('#iframe_loading_indicater').length < 1){
					$('.largeBlock').slideToggle('slow',function(){
						$(this).remove();
						$('head').append('<script type="text/javascript" src="https://gumroad.com/js/gumroad.js"></script>');
						$('.items.itemGlobe').remove().insertAfter('#recordList .items.itemSearch').fadeIn(400, function(){ Gumroad.init(); });
					});
				} else {
					$('.largeBlock').slideToggle('slow',function(){
						$('.items.itemGlobe').remove().insertAfter('#recordList .items.itemSearch').fadeIn();
					});
				}
			} else if($('.adsIcon.adsOn').length == 1 && !largeBlockBool()){
				if($('#iframe_loading_indicater').length < 1){
					$('head').append('<script type="text/javascript" src="https://gumroad.com/js/gumroad.js"></script>');
					$('.items.itemGlobe').remove().insertAfter('#recordList .items.itemSearch').fadeIn(400, function(){ Gumroad.init(); });
				} else {
					$('.items.itemGlobe').remove().insertAfter('#recordList .items.itemSearch').fadeIn();
				}
			} else if($('.adsIcon.adsOn').length != 1 && !!largeBlockBool()){
				$('.largeBlock').slideToggle('slow',function(){
					$(this).remove();
					$('.itemGlobe').fadeOut();
				});
			} else if($('.adsIcon.adsOn').length != 1 && !largeBlockBool()){
					$('.itemGlobe').fadeOut();
			}
*/
		});

/* localStorage mangament */
function LocalStorageManage(){
}

LocalStorageManage.prototype.setTagArrayFromTaglist = function(){
	var _tagCondObj = {}, _tagHiddenObj = {};

	$('#tagoff_taglistbox .tagOn').each(function(){ var _txt = $(this).find('.tagListId').text(); _tagCondObj[_txt] = 'tagOn'; });
	$('#tagoff_taglistbox .tagOff').each(function(){ var _txt = $(this).find('.tagListId').text(); _tagCondObj[_txt] = 'tagOff'; });

	lstorage.setLocalStorage('wcode_tagCond', _tagCondObj);
}
LocalStorageManage.prototype.func = function(){
//todo tagEqual and so on
	var _tagCondObj = {}, _tagHiddenObj = {};

	var _arr = $.wcode.getTagsFromTagbox('tagEqual');
	for(var i=0; i < _arr.length ;i++){
		_tagCondObj[_arr[i]] = 'tagOn';
	}

	var _arr = $.wcode.getTagsFromTagbox('tagNot');
	for(var i=0; i < _arr.length ;i++){
		_tagCondObj[_arr[i]] = 'tagOff';
	}

	lstorage.setLocalStorage('wcode_tagCond', _tagCondObj);
	lstorage.setLocalStorage('wcode_tagHidden', _tagHiddenObj);
}
LocalStorageManage.prototype.setLocalStorage = function(_key, _obj){
	localStorage.setItem(_key, JSON.stringify(_obj));
}

LocalStorageManage.prototype.getTagFlipArray = function(_class){
	var _arr = [];
	if(_class == "tagOn" || _class == "tagOff"){
		var _obj = this.getTagArray('tagCond');
		for(var key in _obj){
			if(_obj[key] == _class) _arr.push(key);
		}
	}
	return _arr;
}
LocalStorageManage.prototype.getTagArray = function(_str){
	var _key = 'wcode_' + _str;
	return this.getLocalStorage(_key);
}
LocalStorageManage.prototype.getLocalStorage = function(_key){
	return JSON.parse(localStorage.getItem(_key)) || {} ;
}

LocalStorageManage.prototype.deleteTagArray = function(_str){
	var _key = 'wcode_' + _str;
	this.deleteLocalStorage(_key);
}
LocalStorageManage.prototype.deleteLocalStorage = function(_key){
	delete localStorage[_key];
}
LocalStorageManage.prototype.func = function(){
}

/* history management */
function HistoryManage(){
}
HistoryManage.prototype.push = function(){
	var param = null;

	var _tagon = lstorage.getTagFlipArray('tagOn').join(',');
	var _tagoff = lstorage.getTagFlipArray('tagOff').join(',');
//	var _tagon = getTagFlipArray('tagOn').join(',');
//	var _tagoff = getTagFlipArray('tagOff').join(',');
	var _kword = $.wcode.getTagsFromTagbox('kwords').join(',');
//	var _kword = $.wcode.getFromBox('kwords').join(',');
	var _offset = data.get_item_from();
	var _maxrow = data.get_max_row();
	var _item_num = data.get_item_num();

	var _arr = [];
	if(!!_tagon) _arr.push('tagon='+_tagon);
	if(!!_tagoff) _arr.push('tagoff='+_tagoff);
	if(!!_kword) _arr.push('kword='+_kword);
	if(!!_offset || _offset === 0) _arr.push('offset='+_offset);
	if(!!_maxrow) _arr.push('maxrow='+_maxrow);
	if(!!_item_num) _arr.push('item_num='+_item_num);

	if(_arr.length) var param = location.origin + '?' + _arr.join('&');
	this.state(null, null, param);
};
HistoryManage.prototype.state = function(state, title, param){
	history.pushState(state, title, param);
};

}); //document.ready

/* General Function v1.10 */

/* general Functions */
/*
	function flipArray(_baseArr){
		var _obj = {};
		for(var i=0;i<_baseArr.length;i++){
			_obj[_baseArr[i]] = i+1;
		}
		return _obj;
	}
*/
	function getCustomClick(){
		var hasTouch = 'ontouchstart' in window;
		return (hasTouch) ? 'touchstart' : 'click' ;
	}

/* localStorage Functions */
/*
	function setLocalStorage(_key,_obj){
		localStorage.setItem(_key, JSON.stringify(_obj));
	}

	function getLocalStorage(_key){
		return JSON.parse(localStorage.getItem(_key)) || {} ;
	}

	function deleteLocalStorage(_key){
		delete localStorage[_key];
	}
*/
/* wcode Functions */
	function largeBlockToggle(){
		if($('.largeBlock').length > 0) $('.largeBlock').slideToggle('slow', function(){ $(this).remove(); });
	}
	function largeBlockBool(){
		if($('.largeBlock').length > 0){ return true; } else { return false; }
	}

/* tag Functions */
/*
	function setTagArrayFromTagAllList(){ // FromTagTable
		var _tagCondObj = {}, _tagHiddenObj = {};

		$('#tagTable .tagOn').each(function(){ var _txt = $(this).find('.tagListId').text(); _tagCondObj[_txt] = 'tagOn'; });
		$('#tagTable .tagOff').each(function(){ var _txt = $(this).find('.tagListId').text(); _tagCondObj[_txt] = 'tagOff'; });
		$('#tagTable .tagHidden').each(function(){ var _txt = $(this).find('.tagListId').text(); _tagHiddenObj[_txt] = 'tagHidden'; });

		setLocalStorage('wcode_tagCond', _tagCondObj);
		setLocalStorage('wcode_tagHidden', _tagHiddenObj);
	}

	function setTagArrayFromTaglist(){
		var _tagCondObj = {}, _tagHiddenObj = {};

		$('#tagListBox .tagOn').each(function(){ var _txt = $(this).find('.tagListId').text(); _tagCondObj[_txt] = 'tagOn'; });
		$('#tagListBox .tagOff').each(function(){ var _txt = $(this).find('.tagListId').text(); _tagCondObj[_txt] = 'tagOff'; });
		$('#tagListBox .tagHidden').each(function(){ var _txt = $(this).find('.tagListId').text(); _tagHiddenObj[_txt] = 'tagHidden'; });

		lstorage.setLocalStorage('wcode_tagCond', _tagCondObj);
		lstorage.setLocalStorage('wcode_tagHidden', _tagHiddenObj);
	}

	function setTagArrayOnSubmit(){
		var _tagCondObj = {}, _tagHiddenObj = {};

		var _arr = $.wcode.getTagsFromTagbox('tagEqual');
//		var _arr = $.wcode.getFromBox('tagEqual');
		for(var i=0; i < _arr.length ;i++){
			_tagCondObj[_arr[i]] = 'tagOn';
		}

		var _arr = $.wcode.getTagsFromTagbox('tagNot');
//		var _arr = $.wcode.getFromBox('tagNot');
		for(var i=0; i < _arr.length ;i++){
			_tagCondObj[_arr[i]] = 'tagOff';
		}

		lstorage.setLocalStorage('wcode_tagCond', _tagCondObj);
		lstorage.setLocalStorage('wcode_tagHidden', _tagHiddenObj);
	}

	function setTag(_tag, _class){
		if(_class == 'tagOn' || _class == 'tagOff'){
			var _obj = getLocalStorage('wcode_tagCond');
			_obj[_tag] = _class;
			setLocalStorage('wcode_tagCond', _obj);
		} else if(_class == 'tagNeutral'){
			var _obj = getLocalStorage('wcode_tagCond');
			delete _obj[_tag];
			setLocalStorage('wcode_tagCond', _obj);
		} else if(_class == 'tagHidden'){
			var _obj = getLocalStorage('wcode_tagHidden');
			_obj[_tag] = _class;
			setLocalStorage('wcode_tagHidden', _obj);
		}
	}

	function getTagArray(_str){
		var _key = 'wcode_' + _str;
		return getLocalStorage(_key);
	}

	function getTagFlipArray(_class){
		var _arr = [];
		if(_class == "tagOn" || _class == "tagOff"){
			var _obj = getTagArray('tagCond');
			for(var key in _obj){
				if(_obj[key] == _class) _arr.push(key);
			}
		}
		return _arr;
	}

	function deleteTagArray(_str){
		var _key = 'wcode_' + _str;
		deleteLocalStorage(_key);
	}
*/
