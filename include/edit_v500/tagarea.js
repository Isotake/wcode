/*!
 * tagarea.js - v1.00 (2014-08-31)
 *
 * @author Isotake
 * @url https://github.com/Isotake/opus_tagarea
 * @copyright 2014 Isotake
 * @licence MIT
 */
;(function ($){
	$.fn.extend({
		tagarea: function(options){
			if(!$(this).length) return false;
			if(!options) options = {};
			return new TagPlugin(this, options);
		}
	});

	function TagPlugin(this_wrapper, options){
	//	console.log(this_wrapper, options);

		this.tagwrapper = this_wrapper;
		this.tagwrapper_id = this.tagwrapper.attr('id'); //ex) 'country'
		this.tagwrapper_id_shp = '#' + this.tagwrapper.attr('id'); //ex) '#country'
		this.tagwrapper_class = 'tagboxarea'; //ex) 'tagboxarea'
		this.tagwrapper_class_dot = '.' + this.tagwrapper_class; //ex) '.tagboxarea'

		this.tagbox_id = this.tagwrapper_id + '_tagbox'; //ex) 'country_tagbox'
		this.tagbox_id_shp = '#' + this.tagbox_id; //ex) '#country_tagbox'
		this.tagbox_class = 'tagbox'; //ex) 'tagbox'
		this.tagbox_class_dot = '.' + this.tagbox_class; //ex) '.tagbox'

		this.tagbox_wrapper_class = this.tagbox_class + '_wrapper';
		this.tagbox_wrapper_class_dot = '.' + this.tagbox_wrapper_class;

		this.taginput_id = this.tagwrapper_id + '_taginput'; //ex) 'country_taginput'
		this.taginput_id_shp = '#' + this.taginput_id; //ex) '#country_taginput'
		this.taginput_class = 'taginput'; //ex) 'taginput'
		this.taginput_class_dot = '.' + this.taginput_class; //ex) '.taginput'

		this.taglistbox_id = this.tagwrapper_id + '_taglistbox'; //ex) 'country_taglistbox'
		this.taglistbox_id_shp = '#' + this.taglistbox_id; //ex) '#country_taglistbox'
		this.taglistbox_class = 'taglistbox'; //ex) 'taglistbox'
		this.taglistbox_class_dot = '.' + this.taglistbox_class; //ex) '.taglistbox'

		this.taglistbox_wrapper_class = this.taglistbox_class + '_wrapper';
		this.taglistbox_wrapper_class_dot = '.' + this.taglist_wrapper_class;

		this.pre_tag_class = 'pre-tag';
		this.pre_tag_class_dot = '.' + this.pre_tag_class;
		this.pre_list_class = 'pre-list';
		this.pre_list_class_dot = '.' + this.pre_list_class;
		this.tag_class = 'tag';
		this.tag_class_dot = '.' + this.tag_class;
		this.point_class = 'pointed';
		this.point_class_dot = '.' + this.point_class;
		this.cancel_tag = 'cancel_tag';
		this.cancel_tag_dot = '.' + this.cancel_tag;

		this.pre_tag = null;
		if($(this.tagwrapper_id_shp).find(this.pre_tag_class_dot).length){
			try {
				this.pre_tag = JSON.parse($(this.tagwrapper_id_shp).find(this.pre_tag_class_dot).text());
			} catch(e) {
				console.log('not correct JSON data...');
			}
		}

		this.pre_list = null;
		if($(this.tagwrapper_id_shp).find(this.pre_list_class_dot).length){
			try {
				this.pre_list = JSON.parse($(this.tagwrapper_id_shp).find(this.pre_list_class_dot).text());
			} catch(e) {
				console.log(this.tagwrapper_id_shp, 'not correct JSON data...');
			}
		}

		this.options = $.extend(true, {}, {
			taglist_url: null,
			placeholder_text: '> tag',
			placeholder_color: '#000',
			input_color: '#000',
			onAddTag: null,
			onRemoveTag: null,
			onChangeTag: null
		}, options);

		this.init();
	}

	TagPlugin.prototype.init = function(){
//		console.log(this.pre_tag, this.pre_list);

		var tagbox = this.renderTagbox();
		var taginput = this.renderTaginput();
		var taglistbox = this.renderTaglistbox();
		$(this.tagwrapper_id_shp).empty().append(tagbox).append(taginput).append(taglistbox);

		this.addListeners();

		$(this.taginput_id_shp).val($(this.taginput_id_shp).attr('data-placeholder'))
			.css('color', this.options.placeholder_color)
			.blur();

		if(this.options.taglist_url != undefined){
			var _taglistbox_id_shp = this.taglistbox_id_shp;
			var _tagbox_id_shp = this.tagbox_id_shp;
			var _pre_tag = this.pre_tag;
			var ajaxSetting = {
				url: this.options.taglist_url,
				cb_success: function(data){
//					console.log(data);
					var list = JSON.parse(data);
					$(_taglistbox_id_shp).trigger('listadd', [list]);
				},
				cb_complete: function(data){
					if(_pre_tag && _pre_tag.length){
						$(_tagbox_id_shp).trigger('tagadd', [_pre_tag]);
					}
				}
			};
			this.getRecords(ajaxSetting);
		} else if(this.pre_list && this.pre_list.length) {
			$(this.taglistbox_id_shp).trigger('listadd', [this.pre_list]);

			if(this.pre_tag && this.pre_tag.length){
				$(this.tagbox_id_shp).trigger('tagadd', [this.pre_tag]);
			}
		}
	};

	TagPlugin.prototype.addListeners = function(){
		var _this = this;

		$(this.taginput_id_shp).on('focus', function(e){
			if($(this).val() == $(this).attr('data-placeholder')){
				$(this).val('').css('color', _this.options.input_color);
			}
		}).on('blur', function(e){
			var val = $.trim($(this).val()),
				ph = $(this).attr('data-placeholder');
			if(!!val && val != ph){
				return true;
			} else {
				$(this).val(ph).css('color', _this.options.placeholder_color);
				return true;
			}
			return false;
		}).on('keyup', function(e){ //Enter Key Event
			if(e.which == 13){
				e.preventDefault();
				if(!$(_this.taglistbox_id_shp + ' ' + _this.tag_class_dot + _this.point_class_dot).length){
					var targetStr = $.trim($(this).val());
					var targetObj = setTargetObj(_this, targetStr, null, null);
				} else {
					var listObj = $(_this.taglistbox_id_shp + ' ' + _this.tag_class_dot + _this.point_class_dot);
					var targetObj = setTargetObj(_this, null, null, listObj);
				}
				var boxObj = targetObj.getBoxObj();
				if(boxObj){
					_this.remove(targetObj);
				} else {
					_this.add(targetObj);
				}

				$(_this.taginput_id_shp).val('').focus();
			} else if(e.which == 38){ //Up Key
				if($(_this.taglistbox_id_shp + ' ' + _this.tag_class_dot + _this.point_class_dot).length){
					$(_this.taglistbox_id_shp + ' ' + _this.tag_class_dot + _this.point_class_dot)
						.removeClass(_this.point_class)
						.prevAll(_this.taglistbox_id_shp + ' .tag:visible').first().addClass(_this.point_class);
				} else {
					$(_this.taglistbox_id_shp + ' ' + _this.tag_class_dot + ':visible').last().addClass(_this.point_class);
				}
			} else if(e.which == 40){ //Down Key
				if($(_this.taglistbox_id_shp + ' ' + _this.tag_class_dot + _this.point_class_dot).length){
					$(_this.taglistbox_id_shp + ' ' + _this.tag_class_dot + _this.point_class_dot)
						.removeClass(_this.point_class)
						.nextAll(_this.taglistbox_id_shp + ' .tag:visible').first().addClass(_this.point_class);
				} else {
					$(_this.taglistbox_id_shp + ' ' + _this.tag_class_dot + ':visible').first().addClass(_this.point_class);
				}
			} else {
				e.preventDefault();
				$(_this.taglistbox_id_shp + ' ' + _this.tag_class_dot + _this.point_class_dot).removeClass(_this.point_class);

				var targetWord = $.trim($(this).val());
				$(_this.taglistbox_id_shp).trigger('listfilter', targetWord);
/*
				$(_this.taglistbox_id_shp + ' ' + _this.tag_class_dot).each(function(){
					var _target = $(this);
					_target.show();
					var targetObj = setTargetObj(_this, null, null, _target);
					if(targetObj.getTargetStr().indexOf(targetWord) < 0) _target.hide();
				});
*/
			}
	//		return false;
		});

		$(this.tagbox_id_shp).on('click', this.cancel_tag_dot, function(e){
			e.preventDefault();
			var boxObj = $(this).parents(_this.tag_class_dot);
			var targetObj = setTargetObj(_this, null, boxObj, null);
			_this.remove(targetObj);
		}).on('tagadd', function(e, arr){
			for(var i=0; i<arr.length ; i++){
				var targetStr = $.trim(arr[i]);
				var targetObj = setTargetObj(_this, targetStr, null, null);
				_this.add(targetObj);
			}
		});

		$(this.taglistbox_id_shp).on('click', this.tag_class_dot, function(){
			var listObj = $(this);
			var targetObj = setTargetObj(_this, null, null, listObj);
			var boxObj = targetObj.getBoxObj();

			if($(_this.taginput_id_shp).val() != _this.options.placeholder_text){
				$(_this.taginput_id_shp).val('').focus().trigger('keyup');
			}

			if(boxObj){
				_this.remove(targetObj);
			} else {
				_this.add(targetObj);
			}
		}).on('listadd', function(e, arr){
			for(var i=0; i < arr.length ;i++){
				$(_this.taglistbox_id_shp).append($('<div>', {class: _this.tag_class}).text(arr[i]));
			}
		}).on('listfilter', function(e, arr){
			var searchword = arr;
//			var searchword = arr[0];
			$(_this.taglistbox_id_shp + ' ' + _this.tag_class_dot).each(function(){
				var _target = $(this);
				_target.show();
				var targetObj = setTargetObj(_this, null, null, _target);
				if(targetObj.getTargetStr().indexOf(searchword) < 0) _target.hide();
			});
		});
	};

	TagPlugin.prototype.renderTagbox = function(){
		var obj = $('<div>', {class: this.tagbox_wrapper_class}).append($('<div>', {id: this.tagbox_id, class: this.tagbox_class}));
		return obj;
	};

	TagPlugin.prototype.renderTaginput = function(){
		var obj = $('<input>', {id: this.taginput_id, class: this.taginput_class, 'data-placeholder': this.options.placeholder_text, 'autocomplete': 'off'});
		return obj;
	};

	TagPlugin.prototype.renderTaglistbox = function(){
		var obj = $('<div>', {class: this.taglistbox_wrapper_class}).append($('<div>', {id: this.taglistbox_id, class: this.taglistbox_class + ' clearfix'}));
		return obj;
	};

	TagPlugin.prototype.renderTag = function(str){
		var obj = $('<span>', {class: this.tag_class}).append(
	//		$('<span>', {text: str + '&nbsp;&nbsp;'}),
			$('<span>', {text: str}).append('&nbsp;&nbsp;'),
			$('<a>', {href: '#', class: this.cancel_tag, text: 'x'})
		);

		return obj;
	};

	TagPlugin.prototype.add = function(targetObj){
		var targetStr = targetObj.getTargetStr();
		if(!targetStr) return false;
		this.renderTag(targetStr).appendTo(this.tagbox_id_shp);

		$(this.taglistbox_id_shp).trigger('listfilter', '');

		var _this = this;
		if(this.options.onAddTag){
			this.options.onAddTag.call(this, _this, targetObj);
		}

		if(this.options.onChangeTag){
			this.options.onChangeTag.call(this, _this, targetObj);
		}

		return true;
	};

	TagPlugin.prototype.remove = function(targetObj){

		targetObj.getBoxObj().remove();

		$(this.taglistbox_id_shp).trigger('listfilter', '');

		var _this = this;
		if(this.options.onRemoveTag){
			this.options.onRemoveTag.call(this, _this, targetObj);
		}

		if(this.options.onChangeTag){
			this.options.onChangeTag.call(this, _this, targetObj);
		}

		return true;
	};

	TagPlugin.prototype.inTagbox = function(str){
		var rst = null;
		$(this.tagbox_id_shp).find(this.tag_class_dot).each(function(){
			var txt = $.trim($(this).text().replace('x', ''));
			if(txt == str){ rst = $(this); return false; }
		});

		return rst;
	};

	TagPlugin.prototype.inTaglistbox = function(str){
		var rst = null;
		$(this.taglistbox_id_shp).find(this.tag_class_dot).each(function(){
			var txt = $.trim($(this).text());
			if(txt == str){ rst = $(this); return false; }
		});

		return rst;
	};

	TagPlugin.prototype.getRecords = function(config){
		if(!config.url){ console.log('error - no url'); return false; }
		var _url = config.url;
		var _datatype = (config.datatype) ? config.datatype : 'JSON' ;
		var _data = (config.data) ? config.data : {} ;

		var _param = {};
		_param['beforesend'] = (config.cb_beforesend) ? config.cb_beforesend : function(data, status, xhr){} ;
		_param['error'] = (config.cb_error) ? config.cb_error : function(xhr, status, errorThrown){ console.log('error status - ' + status); } ;
		_param['success'] = (config.cb_success) ? config.cb_success : function(data, status, xhr){} ;
		_param['complete'] = (config.cb_complete) ? config.cb_complete : function(data, status, xhr){} ;

		requestByPost(_url, _data, _datatype, _param);

		function requestByPost(url, data, datatype, param){
			$.ajax({
				url: url,
				type: 'POST',
				data: data,
				datatype: datatype,
				beforeSend: param['beforesend'],
				error: param['error'],
				success: param['success'],
				complete: param['complete']
			});
		}
	};

	function setTargetObj(tagareaObj, targetStr, boxObj, listObj){
		return new TargetSet(tagareaObj, targetStr, boxObj, listObj);
	}

	function TargetSet(_tagarea, _target, _box, _list){
		this.tagareaObj = _tagarea;
		this.targetStr = _target;
		this.boxObj = _box;
		this.listObj = _list;
	}

	TargetSet.prototype.getTargetStr = function(){
		if(this.targetStr) return this.targetStr;
		if(this.boxObj) return $.trim(this.boxObj.text().replace('x', ''));
		if(this.listObj) return this.listObj.text();
		return false;
	};

	TargetSet.prototype.getBoxObj = function(){
		if(this.boxObj) return this.boxObj;
		if(this.targetStr) return this.tagareaObj.inTagbox(this.targetStr);
		if(this.listObj) return this.tagareaObj.inTagbox($.trim(this.listObj.text()));

		return false;
	};

	TargetSet.prototype.getListObj = function(){
		if(this.listObj) return this.listObj;
		if(this.targetStr){
			return this.tagareaObj.inTaglistbox(this.targetStr);
		}
		if(this.boxObj) return this.tagareaObj.inTaglistbox($.trim(this.boxObj.text().replace('x', '')));
		return false;
	};
}(jQuery));
