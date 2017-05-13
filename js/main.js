$(function(){

	var zoomIntval = true;

	var page = null
	,	data = null
	,	ajax = null
	,	lstorage = null
	,	hist = null
	,	tagarea = null
	,	counter = null;

/* onLoad Event */
	$(window).on('load',function(){
		page = new PageManage();
		data = new DataManage();
		lstorage = new LocalStorageManage();
		hist = new HistoryManage();

		ajax = new AjaxManage();
		lstorage.setTagArrayFromPretag();
		tagarea = new TagareaManage();
		tagarea.buildTagarea();
		tagarea.buildTagareas();

		counter = new CounterManage();

		$('.loading').remove();
		$('.itemImage').fadeIn(300);
		$('#loadOverlay').delay(500).slideUp(1000, function(){ $(this).remove(); });
	});

/* slider_container */
	$('#slider-controler li').on('click', function(){
		$('#slider-controler li').removeClass('active');
		$(this).addClass('active');
	});

/* searchBlock */
	$('.searchIcon').on('click',function(){
		$(this).toggleClass('searchOn');
		if($(this).hasClass('searchOn')){
			$('.kwords_tagarea').addClass('show');
		} else {
			$('.kwords_tagarea').removeClass('show');
		}
	});

/* statusBlock */
	$('.statusIcon').on('click',function(){
		$(this).toggleClass('statusOn');
		if($(this).hasClass('statusOn')){
			$('.tags_tagarea').addClass('show');
		} else {
			$('.tags_tagarea').removeClass('show');
		}
	});

/* srtcutBlock */
	$('.srtcutIcon').on('click',function(){
		$(this).toggleClass('srtcutOn');
		if($('.srtcutIcon.srtcutOn').length == 1 && !!page.large_block_show()){
			$('.largeBlock').slideToggle('slow',function(){
				$(this).remove();
				$('.items.itemSrtcut').remove().prependTo('#recordList').fadeIn();
			});
		} else if($('.srtcutIcon.srtcutOn').length == 1 && !page.large_block_show()){
				$('.items.itemSrtcut').remove().prependTo('#recordList').fadeIn();
		} else if($('.srtcutIcon.srtcutOn').length != 1 && !!page.large_block_show()){
			$('.largeBlock').slideToggle('slow',function(){
				$(this).remove();
				$('.itemSrtcut').fadeOut();
			});
		} else if($('.srtcutIcon.srtcutOn').length != 1 && !page.large_block_show()){
				$('.itemSrtcut').fadeOut();
		}
	});

/* tagTable */
	$('.tagtableIcon').on('click',function(){
		$(this).toggleClass('tagtableOn');
		var slider_bg = $('#slider_background');
		var slider_ct = $('#slider_container');
		if(slider_bg.hasClass('open')){
			slider_bg.removeClass('open').addClass('close');
			slider_ct.removeClass('open').addClass('close');
		} else {
			slider_bg.removeClass('close').addClass('open');
			slider_ct.removeClass('close').addClass('open');
		}
	});

/* configBlock */
	$('.configIcon').on('click',function(){
		if(page.animating){
			console.log('animating...');
			return false;
		}
		$(this).toggleClass('configOn');
		if($('.configIcon.configOn').length == 1 && !!page.large_block_show()){
			var callback = function(){
				$(this).remove();
				$('.items.itemConfig').remove().prependTo('#recordList').fadeIn();
				var max_row = data.get_max_row();
				$('.itemConfigExec:contains(' + max_row + ')').addClass('itemConfigMaxrowsSelected');
				page.animating = false;
			};
			page.large_block_close(callback);
		} else if($('.configIcon.configOn').length == 1 && !page.large_block_show()){
				$('.items.itemConfig').remove().prependTo('#recordList').fadeIn();

				var max_row = data.get_max_row();
				$('.itemConfigExec:contains(' + max_row + ')').addClass('itemConfigMaxrowsSelected');
		} else if($('.configIcon.configOn').length != 1 && !!page.large_block_show()){
			var callback = function(){
				$(this).remove();
				$('.itemConfig').fadeOut();
				page.animating = false;
			};
			page.large_block_close(callback);
		} else if($('.configIcon.configOn').length != 1 && !page.large_block_show()){
				$('.itemConfig').fadeOut();
		}
	});

/* adsBlock */				
	$('.adsIcon').on('click',function(){
		alert('Under Constructing...');
	});

/* submitArea */
	var customClick = getCustomClick();
	$('.submitButton').on(customClick, function(){
		ajax.submitAction();
	}).on('counter', function(event, cnt){
		counter.eventCounter.call(this, event, cnt);
	});
/* itemBlock */
	$('#recordList').on('click','.itemConfigExec',function(){
		var _int = parseInt($(this).text());
		page.set_max_row(_int);
	}).on('click','.itemSrtcutReload .itemSrtcutExec',function(){
		/* shortcut reload */
		location.reload();
	}).on('click','.itemSrtcutInit .itemSrtcutExec',function(){
		/* shortcut initialize */
		ajax.initShortcutAction();
	}).on('click', '.items img', function(){
		var _icon = $(this).parents('div.items').find('.imageBlock');
		var _data = {};
		_data.title = _icon.attr('data-itemTitle');
		_data.url = _icon.attr('data-itemUrl');

		var _cover = renderCoverBlock(_data);
		$(this).parents('.items').prepend(_cover).children('.coverBlock').slideDown('slow',function(){
			$(this).css('overflow','visible');
		});
	}).on('click', '.coverBlock', function(){
		$(this).fadeOut('slow',function(){
			$(this).remove();
		});
	}).on('click', '.icon-zoom-in', function(){
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
							
						Intval = true;
					});
				}
		}).on('click', '.largeBlock', function(){
				$(this).slideToggle('slow',function(){ $(this).remove(); });
		});

/* itemPrevArea */
		$('#upCircleIcon').on('click', function(){
			ajax.prevAction();
		});

/* itemNextArea */
		$('#downCircleIcon').on('click', function(){
			ajax.nextAction();
		});

/* ajax management */
	function AjaxManage(){
	}
	AjaxManage.prototype.requestByPost = function(_url, _data, _callback, _complete){
		$.ajax({
			url: _url
		,	type: 'post'
		,	data: _data
		,	dataType: 'json'
		,	error	: function(xhr, status, errorThrown){ alert(status); }
		,	success	: _callback
		,	complete: _complete	
		});
	}
	AjaxManage.prototype.getRecords = function(_config){
		var _url = (_config.url) ? _config.url : './search.php';

		if(!_config.mode){ console.log('error - config.mode');return false; }
		if(!_config.kwords){ _config.kwords = tagarea.getTagsFromTagbox('kwords').join(' '); }
		if(!_config.tagOnArray) _config.tagOnArray = lstorage.getTagFlipArray('tagOn');
		if(!_config.tagOffArray) _config.tagOffArray = lstorage.getTagFlipArray('tagOff');
		if(!_config.flgTag) _config.flgTag = 0;
		if(!_config.offset) _config.offset = data.get_item_from;
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
		var _success = (_config.cb_success) ? _config.cb_success : function(data, status, xhr){};
		var _complete = (_config.cb_complete) ? _config.cb_complete : function(data, status, xhr){};
		ajax.requestByPost(_url, _data, _success, _complete);
	};
	AjaxManage.prototype.getOnlyCounts = function(){
		var _config = {
			mode: 'count',
			tagOnArray: tagarea.getTagsFromTagbox('tagon'),
			tagOffArray: tagarea.getTagsFromTagbox('tagoff'),
			cb_success: function(data){
				$('.submitButton').trigger('counter', data.listCount);
			}
		};
		ajax.getRecords(_config);
	};
	AjaxManage.prototype.submitAction = function(){
		if(!$(this).hasClass('inactive')){
			$(this).addClass('inactive');
			lstorage.setTagArrayOnSubmit();
			var _config = {
				mode: 'search',
				cb_success: function(data, status, xhr){
					tagarea.rebuildTagareas.call(tagarea, data.tag);
					$('.submitButton').trigger('counter', data.listCount);

					$('#recordList div[class="items itemCard"]').remove();
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
			ajax.getRecords(_config);
		}
	};
	AjaxManage.prototype.prevAction = function(){
		if(!$(this).hasClass('inactive')){
			$(this).addClass('inactive');
			var _config = {
				mode: 'prevto',
				cb_success: function(data, status, xhr){
					makeItemBlock(data);
					page.item_num_controll(data.item_num_from, data.item_num_to);
					$('.debugArea').empty().append(data.debug_output);
				},
				cb_complete: function(){
					$('#upCircleIcon').removeClass('inactive');
					hist.push();
				}
			};
			ajax.getRecords(_config);
		}
	};
	AjaxManage.prototype.nextAction = function(){
		if(!$(this).hasClass('inactive')){
			$(this).addClass('inactive');
			var _config = {
				mode: 'nextto',
				cb_success: function(data, status, xhr){
					makeItemBlock(data);
					page.item_num_controll(data.item_num_from, data.item_num_to);
					$('.debugArea').empty().append(data.debug_output);
				},
				cb_complete: function(){
					$('#downCircleIcon').removeClass('inactive');
					hist.push();
				}
			};
			ajax.getRecords(_config);
		}
	};
	AjaxManage.prototype.initShortcutAction = function(){
		lstorage.deleteTagArray('tagCond');
		page.set_max_row(10);

		var _config = {
			mode: 'search',
			cb_success: function(data, status, xhr){
				tagarea.rebuildTagareas.call(tagarea, data.tag);
				$('.submitButton').trigger('counter', data.listCount);

				$('#recordList div[class="items itemCard"]').remove();
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
		ajax.getRecords(_config);
	};

/* page management */
	function PageManage(){
		this.animating = false;

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
	PageManage.prototype.set_max_row = function(val){
		var _val = parseInt(val);
		data.set_max_row(val);
		$('.itemConfigExec.itemConfigMaxrowsSelected').removeClass('itemConfigMaxrowsSelected');
		$('.itemConfigExec:contains(' + _val + ')').addClass('itemConfigMaxrowsSelected');
	};
	PageManage.prototype.large_block_show = function(){
		if($('.largeBlock').length > 0){ return true; } else { return false; }
	};
	PageManage.prototype.large_block_close = function(cb){
		page.animating = true;
		var callback = (cb) ? cb : function(){ $(this).remove();page.animating = false; } ;
		$('.largeBlock').slideUp('slow',callback);
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
				ajax.getOnlyCounts();
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
	TagareaManage.prototype.rebuildTagareas = function(tag_data){
		$('#tagon').empty();
		$('#tagoff').empty();
		var tag_json = this.convRawTagDataToJson(tag_data);
		$('#tagoff').append($('<div>').addClass('pre-list').text(tag_json));
		this.buildTagareas();
	};
	TagareaManage.prototype.buildTagareas = function(){
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
				ajax.getOnlyCounts();
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

				var on_target = tagobj_on.setTarget(target_str);
				if(on_target.getBoxObj()){
					tagobj_on.removeTag(on_target);
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
				ajax.getOnlyCounts();
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

		$('#tagon').prepend($('<h4>').text('AND-Search Tags'));
		$('#tagoff').prepend($('<h4>').text('NOT-Search Tags'));

		var ls_tagcond = lstorage.getTagArray('tagCond');
		for(var key in ls_tagcond){
			var _class = ls_tagcond[key];
			if(_class == 'tagOff'){
				$('#'+tagobj_off.taglistbox_id).trigger('listadd', [[key]]);
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

			$(this).empty().attr({'id': tag_idname}).addClass(tag_class).append($('<span>').text(tag_name)).append($('<div>').addClass('tagListId').text(tag_fullname)).append($('<div>').addClass('tagListColor'));
		});

		for(var key in ls_tagcond){
			var class_name = ls_tagcond[key];
			if(class_name == 'tagOn'){
				var on_target = tagobj_on.setTarget(key);
				tagobj_on.addTag(on_target);
			} else if(class_name == 'tagOff'){
				var off_target = tagobj_off.setTarget(key);
				tagobj_off.addTag(off_target);
			}
		}

		$('#tagon_taglistbox').off('click');
		$('#tagoff_taglistbox').off('click').on('click', '.tag', function(e){
			var $self = $(this);
			var tag_fullname = $self.find('.tagListId').text();
			var on_target = tagobj_on.setTarget(tag_fullname);
			var off_target = tagobj_off.setTarget(tag_fullname);

			if($self.hasClass('tagOn')){
//				tagobj_on.removeTag(on_target);
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
	TagareaManage.prototype.getTagsFromTagbox= function(tagbox_name){
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

/* counter management */
	function CounterManage(){
	}
	CounterManage.prototype.eventCounter = function(e, v){
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

/* localStorage mangament */
	function LocalStorageManage(){
	}

	LocalStorageManage.prototype.setTagArrayFromPretag = function(){
		var _obj = {};
		var pretag_tagon = JSON.parse($('#tagon .pre-tag').text());
		for(var i=0; i<pretag_tagon.length ;i++){
			_obj[pretag_tagon[i]] = 'tagOn';
		}
		var pretag_tagoff = JSON.parse($('#tagoff .pre-tag').text());
		for(var i=0; i<pretag_tagoff.length ;i++){
			_obj[pretag_tagoff[i]] = 'tagOff';
		}
		lstorage.setLocalStorage('wcode_tagCond', _obj);
	};
	LocalStorageManage.prototype.setTagArrayOnSubmit = function(){
		var _tagCondObj = {};

		var _arr = tagarea.getTagsFromTagbox('tagon');
		for(var i=0; i < _arr.length ;i++){
			_tagCondObj[_arr[i]] = 'tagOn';
		}

		var _arr = tagarea.getTagsFromTagbox('tagoff');
		for(var i=0; i < _arr.length ;i++){
			_tagCondObj[_arr[i]] = 'tagOff';
		}

		lstorage.setLocalStorage('wcode_tagCond', _tagCondObj);
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
		var _kword = tagarea.getTagsFromTagbox('kwords').join(',');
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
	function getCustomClick(){
		var hasTouch = 'ontouchstart' in window;
		return (hasTouch) ? 'touchstart' : 'click' ;
	}
/* wcode Functions */
	function largeBlockToggle(){
		if($('.largeBlock').length > 0) $('.largeBlock').slideToggle('slow', function(){ $(this).remove(); });
	}
