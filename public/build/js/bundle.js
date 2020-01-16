!function(a){"function"==typeof define&&define.amd?define(["jquery"],a):"object"==typeof module&&module.exports?module.exports=function(b,c){return void 0===c&&(c="undefined"!=typeof window?require("jquery"):require("jquery")(b)),a(c),c}:a(jQuery)}(function(a){function d(c){var d=[];return this.filter("select").each(function(){var e=a(this),f=e.data("tokenize2"),g="object"==typeof c&&c;f||e.data("tokenize2",new b(this,g)),d.push(e.data("tokenize2"))}),d.length>1?d:d[0]}var b=function(c,d){this.control=!1,this.element=a(c),this.options=a.extend({},b.DEFAULTS,d),this.options.tabIndex=-1===this.options.tabIndex?0:this.options.tabIndex,this.options.sortable=1!==this.options.tokensMaxItems&&this.options.sortable,this.bind(),this.trigger("tokenize:load")},c={BACKSPACE:8,TAB:9,ENTER:13,ESCAPE:27,ARROW_UP:38,ARROW_DOWN:40,CTRL:17,MAJ:16};b.VERSION="0.5-beta",b.DEBOUNCE=null,b.DEFAULTS={tokensMaxItems:0,tokensAllowCustom:!1,dropdownMaxItems:10,searchMinLength:0,searchFromStart:!0,searchHighlight:!0,displayNoResultsMessage:!1,noResultsMessageText:'No results mached "%s"',delimiter:",",dataSource:"select",debounce:0,placeholder:!1,sortable:!1,zIndexMargin:500,tabIndex:0},b.prototype.trigger=function(a,b,c,d){this.element.trigger(a,b,c,d)},b.prototype.bind=function(){this.element.on("tokenize:load",{},a.proxy(function(){this.init()},this)).on("tokenize:clear",{},a.proxy(function(){this.clear()},this)).on("tokenize:remap",{},a.proxy(function(){this.remap()},this)).on("tokenize:select",{},a.proxy(function(a,b){this.focus(b)},this)).on("tokenize:deselect",{},a.proxy(function(){this.blur()},this)).on("tokenize:search",{},a.proxy(function(a,b){this.find(b)},this)).on("tokenize:paste",{},a.proxy(function(){this.paste()},this)).on("tokenize:dropdown:up",{},a.proxy(function(){this.dropdownSelectionMove(-1)},this)).on("tokenize:dropdown:down",{},a.proxy(function(){this.dropdownSelectionMove(1)},this)).on("tokenize:dropdown:clear",{},a.proxy(function(){this.dropdownClear()},this)).on("tokenize:dropdown:show",{},a.proxy(function(){this.dropdownShow()},this)).on("tokenize:dropdown:hide",{},a.proxy(function(){this.dropdownHide()},this)).on("tokenize:dropdown:fill",{},a.proxy(function(a,b){this.dropdownFill(b)},this)).on("tokenize:dropdown:itemAdd",{},a.proxy(function(a,b){this.dropdownAddItem(b)},this)).on("tokenize:keypress",{},a.proxy(function(a,b){this.keypress(b)},this)).on("tokenize:keydown",{},a.proxy(function(a,b){this.keydown(b)},this)).on("tokenize:keyup",{},a.proxy(function(a,b){this.keyup(b)},this)).on("tokenize:tokens:reorder",{},a.proxy(function(){this.reorder()},this)).on("tokenize:tokens:add",{},a.proxy(function(a,b,c,d){this.tokenAdd(b,c,d)},this)).on("tokenize:tokens:remove",{},a.proxy(function(a,b){this.tokenRemove(b)},this))},b.prototype.init=function(){this.id=this.guid(),this.element.hide(),this.element.attr("multiple")||console.error("Attribute multiple is missing, tokenize2 can be buggy !"),this.dropdown=void 0,this.searchContainer=a('<li class="token-search" />'),this.input=a('<input autocomplete="off" />').on("keydown",{},a.proxy(function(a){this.trigger("tokenize:keydown",[a])},this)).on("keypress",{},a.proxy(function(a){this.trigger("tokenize:keypress",[a])},this)).on("keyup",{},a.proxy(function(a){this.trigger("tokenize:keyup",[a])},this)).on("focus",{},a.proxy(function(){this.input.val().length>0&&this.trigger("tokenize:search",[this.input.val()])},this)).on("paste",{},a.proxy(function(){this.options.tokensAllowCustom&&setTimeout(a.proxy(function(){this.trigger("tokenize:paste")},this),10)},this)),this.tokensContainer=a('<ul class="tokens-container form-control" />').addClass(this.element.attr("data-class")).attr("tabindex",this.options.tabIndex).append(this.searchContainer.append(this.input)),!1!==this.options.placeholder&&(this.placeholder=a('<li class="placeholder" />').html(this.options.placeholder),this.tokensContainer.prepend(this.placeholder),this.element.on("tokenize:tokens:add tokenize:remap tokenize:select tokenize:deselect tokenize:tokens:remove",a.proxy(function(){this.container.hasClass("focus")||a("li.token",this.tokensContainer).length>0||this.input.val().length>0?this.placeholder.hide():this.placeholder.show()},this))),this.container=a('<div class="tokenize" />').attr("id",this.id),this.container.append(this.tokensContainer).insertAfter(this.element),this.container.focusin(a.proxy(function(b){this.trigger("tokenize:select",[a(b.target)[0]===this.tokensContainer[0]])},this)).focusout(a.proxy(function(){this.trigger("tokenize:deselect")},this)),1===this.options.tokensMaxItems&&this.container.addClass("single"),this.options.sortable&&(void 0!==a.ui?(this.container.addClass("sortable"),this.tokensContainer.sortable({items:"li.token",cursor:"move",placeholder:"token shadow",forcePlaceholderSize:!0,update:a.proxy(function(){this.trigger("tokenize:tokens:reorder")},this),start:a.proxy(function(){this.searchContainer.hide()},this),stop:a.proxy(function(){this.searchContainer.show()},this)})):(this.options.sortable=!1,console.error("jQuery UI is not loaded, sortable option has been disabled"))),this.element.on("tokenize:tokens:add tokenize:tokens:remove",a.proxy(function(){this.options.tokensMaxItems>0&&a("li.token",this.tokensContainer).length>=this.options.tokensMaxItems?this.searchContainer.hide():this.searchContainer.show()},this)).on("tokenize:keydown tokenize:keyup tokenize:loaded",a.proxy(function(){this.scaleInput()},this)),this.trigger("tokenize:remap"),this.trigger("tokenize:tokens:reorder"),this.trigger("tokenize:loaded")},b.prototype.reorder=function(){if(this.options.sortable){var b,c;a.each(this.tokensContainer.sortable("toArray",{attribute:"data-value"}),a.proxy(function(d,e){c=a('option[value="'+e+'"]',this.element),void 0===b?c.prependTo(this.element):b.after(c),b=c},this))}},b.prototype.paste=function(){var b=new RegExp(this.escapeRegex(Array.isArray(this.options.delimiter)?this.options.delimiter.join("|"):this.options.delimiter),"ig");b.test(this.input.val())&&a.each(this.input.val().split(b),a.proxy(function(a,b){this.trigger("tokenize:tokens:add",[b,null,!0])},this))},b.prototype.tokenAdd=function(b,c,d){if(b=this.escape(b),c=c||b,d=d||!1,this.resetInput(),void 0===b||""===b)return this.trigger("tokenize:tokens:error:empty"),this;if(this.options.tokensMaxItems>0&&a("li.token",this.tokensContainer).length>=this.options.tokensMaxItems)return this.trigger("tokenize:tokens:error:max"),this;if(a('li.token[data-value="'+b+'"]',this.tokensContainer).length>0)return this.trigger("tokenize:tokens:error:duplicate",[b,c]),this;if(a('option[value="'+b+'"]',this.element).length)a('option[value="'+b+'"]',this.element).attr("selected","selected").prop("selected",!0);else if(d)this.element.append(a("<option selected />").val(b).html(c));else{if(!this.options.tokensAllowCustom)return this.trigger("tokenize:tokens:error:notokensAllowCustom"),this;this.element.append(a('<option selected data-type="custom" />').val(b).html(c))}return a('<li class="token" />').attr("data-value",b).append("<span>"+c+"</span>").prepend(a('<a class="dismiss" />').on("mousedown touchstart",{},a.proxy(function(a){a.preventDefault(),this.trigger("tokenize:tokens:remove",[b])},this))).insertBefore(this.searchContainer),this.trigger("tokenize:dropdown:hide"),this},b.prototype.tokenRemove=function(b){var c=a('option[value="'+b+'"]',this.element);return"custom"===c.attr("data-type")?c.remove():c.removeAttr("selected").prop("selected",!1),a('li.token[data-value="'+b+'"]',this.tokensContainer).remove(),this.trigger("tokenize:tokens:reorder"),this},b.prototype.remap=function(){return a("option:selected",this.element).each(a.proxy(function(b,c){this.trigger("tokenize:tokens:add",[a(c).val(),a(c).html(),!1])},this)),this},b.prototype.focus=function(a){a&&this.input.focus(),this.container.addClass("focus")},b.prototype.blur=function(){this.isDropdownOpen()&&this.trigger("tokenize:dropdown:hide"),this.container.removeClass("focus"),this.resetPending(),this.tokensContainer.attr("tabindex")||this.tokensContainer.attr("tabindex",this.options.tabIndex)},b.prototype.keydown=function(b){if("keydown"===b.type)switch(b.keyCode){case c.BACKSPACE:if(this.input.val().length<1){if(b.preventDefault(),a("li.token.pending-delete",this.tokensContainer).length>0)this.trigger("tokenize:tokens:remove",[a("li.token.pending-delete",this.tokensContainer).first().attr("data-value")]);else{var d=a("li.token:last",this.tokensContainer);d.length>0&&(this.trigger("tokenize:tokens:markForDelete",[d.attr("data-value")]),d.addClass("pending-delete"))}this.trigger("tokenize:dropdown:hide")}break;case c.TAB:b.shiftKey?this.tokensContainer.removeAttr("tabindex"):this.pressedDelimiter(b);break;case c.ENTER:this.pressedDelimiter(b);break;case c.ESCAPE:this.resetPending();break;case c.ARROW_UP:b.preventDefault(),this.trigger("tokenize:dropdown:up");break;case c.ARROW_DOWN:b.preventDefault(),this.trigger("tokenize:dropdown:down");break;case c.CTRL:this.control=!0;break;default:this.resetPending()}else b.preventDefault()},b.prototype.keyup=function(a){if("keyup"===a.type)switch(a.keyCode){case c.TAB:case c.ENTER:case c.ESCAPE:case c.ARROW_UP:case c.ARROW_DOWN:case c.MAJ:break;case c.CTRL:this.control=!1;break;case c.BACKSPACE:default:this.input.val().length>0?this.trigger("tokenize:search",[this.input.val()]):this.trigger("tokenize:dropdown:hide")}else a.preventDefault()},b.prototype.keypress=function(a){if("keypress"===a.type){var b=!1;Array.isArray(this.options.delimiter)?this.options.delimiter.indexOf(String.fromCharCode(a.which))>=0&&(b=!0):String.fromCharCode(a.which)===this.options.delimiter&&(b=!0),b&&this.pressedDelimiter(a)}else a.preventDefault()},b.prototype.pressedDelimiter=function(b){this.resetPending(),this.isDropdownOpen()&&a("li.active",this.dropdown).length>0&&!1===this.control?(b.preventDefault(),a("li.active a",this.dropdown).trigger("mousedown")):this.input.val().length>0&&(b.preventDefault(),this.trigger("tokenize:tokens:add",[this.input.val()]))},b.prototype.find=function(a){if(a.length<this.options.searchMinLength)return this.trigger("tokenize:dropdown:hide"),!1;this.lastSearchTerms=a,"select"===this.options.dataSource?this.dataSourceLocal(a):"function"==typeof this.options.dataSource?this.options.dataSource(a,this):this.dataSourceRemote(a)},b.prototype.dataSourceRemote=function(b){this.debounce(a.proxy(function(){void 0!==this.xhr&&this.xhr.abort(),this.xhr=a.ajax(this.options.dataSource,{data:{search:b},dataType:"json",success:a.proxy(function(b){var c=[];a.each(b,function(a,b){c.push(b)}),this.trigger("tokenize:dropdown:fill",[c])},this)})},this),this.options.debounce)},b.prototype.dataSourceLocal=function(b){var c=this.transliteration(b),d=[],e=(this.options.searchFromStart?"^":"")+this.escapeRegex(c),f=new RegExp(e,"i"),g=this;a("option",this.element).not(":selected, :disabled").each(function(){f.test(g.transliteration(a(this).html()))&&d.push({value:a(this).attr("value"),text:a(this).html()})}),this.trigger("tokenize:dropdown:fill",[d])},b.prototype.debounce=function(b,c){var d=arguments,e=a.proxy(function(){b.apply(this,d),this.debounceTimeout=void 0},this);void 0!==this.debounceTimeout&&clearTimeout(this.debounceTimeout),this.debounceTimeout=setTimeout(e,c||0)},b.prototype.dropdownShow=function(){this.isDropdownOpen()||(a(".tokenize-dropdown").remove(),this.dropdown=a('<div class="tokenize-dropdown dropdown"><ul class="dropdown-menu" /></div>').attr("data-related",this.id),a("body").append(this.dropdown),this.dropdown.show(),this.dropdown.css("z-index",this.calculatezindex()+this.options.zIndexMargin),a(window).on("resize scroll",{},a.proxy(function(){this.dropdownMove()},this)).trigger("resize"),this.trigger("tokenize:dropdown:shown"))},b.prototype.calculatezindex=function(){var a=this.container,b=0;if(!isNaN(parseInt(a.css("z-index")))&&parseInt(a.css("z-index"))>0&&(b=parseInt(a.css("z-index"))),b<1)for(;a.length;)if(a=a.parent(),a.length>0){if(!isNaN(parseInt(a.css("z-index")))&&parseInt(a.css("z-index"))>0)return parseInt(a.css("z-index"));if(a.is("html"))break}return b},b.prototype.dropdownHide=function(){this.isDropdownOpen()&&(a(window).off("resize scroll"),this.dropdown.remove(),this.dropdown=void 0,this.trigger("tokenize:dropdown:hidden"))},b.prototype.dropdownClear=function(){this.dropdown.find(".dropdown-menu li").remove()},b.prototype.dropdownFill=function(b){b&&b.length>0?(this.trigger("tokenize:dropdown:show"),this.trigger("tokenize:dropdown:clear"),a.each(b,a.proxy(function(b,c){a("li.dropdown-item",this.dropdown).length<=this.options.dropdownMaxItems&&this.trigger("tokenize:dropdown:itemAdd",[c])},this)),a("li.active",this.dropdown).length<1&&a("li:first",this.dropdown).addClass("active"),a("li.dropdown-item",this.dropdown).length<1?this.trigger("tokenize:dropdown:hide"):this.trigger("tokenize:dropdown:filled")):this.options.displayNoResultsMessage?(this.trigger("tokenize:dropdown:show"),this.trigger("tokenize:dropdown:clear"),this.dropdown.find(".dropdown-menu").append(a('<li class="dropdown-item locked" />').html(this.options.noResultsMessageText.replace("%s",this.input.val())))):this.trigger("tokenize:dropdown:hide"),a(window).trigger("resize")},b.prototype.dropdownSelectionMove=function(b){if(a("li.active",this.dropdown).length>0)if(a("li.active",this.dropdown).is("li:"+(b>0?"last-child":"first-child")))a("li.active",this.dropdown).removeClass("active"),a("li:"+(b>0?"first-child":"last-child"),this.dropdown).addClass("active");else{var c=a("li.active",this.dropdown);c.removeClass("active"),b>0?c.next().addClass("active"):c.prev().addClass("active")}else a("li:first",this.dropdown).addClass("active")},b.prototype.dropdownAddItem=function(b){if(this.isDropdownOpen()){var c=a('<li class="dropdown-item" />').html(this.dropdownItemFormat(b)).on("mouseover",a.proxy(function(b){b.preventDefault(),b.target=this.fixTarget(b.target),a("li",this.dropdown).removeClass("active"),a(b.target).parent().addClass("active")},this)).on("mouseout",a.proxy(function(){a("li",this.dropdown).removeClass("active")},this)).on("mousedown touchstart",a.proxy(function(b){b.preventDefault(),b.target=this.fixTarget(b.target),this.trigger("tokenize:tokens:add",[a(b.target).attr("data-value"),a(b.target).attr("data-text"),!0])},this));a('li.token[data-value="'+c.find("a").attr("data-value")+'"]',this.tokensContainer).length<1&&(this.dropdown.find(".dropdown-menu").append(c),this.trigger("tokenize:dropdown:itemAdded",[b]))}},b.prototype.fixTarget=function(b){var c=a(b);if(!c.data("value")){var d=c.find("a");if(d.length)return d.get(0);var e=c.parents("[data-value]");if(e.length)return e.get(0)}return c.get(0)},b.prototype.dropdownItemFormat=function(b){if(b.hasOwnProperty("text")){var c="";if(this.options.searchHighlight){var d=new RegExp((this.options.searchFromStart?"^":"")+"("+this.escapeRegex(this.transliteration(this.lastSearchTerms))+")","gi");c=b.text.replace(d,'<span class="tokenize-highlight">$1</span>')}else c=b.text;return a("<a />").html(c).attr({"data-value":b.value,"data-text":b.text})}},b.prototype.dropdownMove=function(){var a=this.tokensContainer.offset(),b=this.tokensContainer.outerHeight(),c=this.tokensContainer.outerWidth();a.top+=b,this.dropdown.css({width:c}).offset(a)},b.prototype.isDropdownOpen=function(){return void 0!==this.dropdown},b.prototype.clear=function(){return a.each(a("li.token",this.tokensContainer),a.proxy(function(b,c){this.trigger("tokenize:tokens:remove",[a(c).attr("data-value")])},this)),this.trigger("tokenize:dropdown:hide"),this},b.prototype.resetPending=function(){var b=a("li.pending-delete:last",this.tokensContainer);b.length>0&&(this.trigger("tokenize:tokens:cancelDelete",[b.attr("data-value")]),b.removeClass("pending-delete"))},b.prototype.scaleInput=function(){this.ctx||(this.ctx=document.createElement("canvas").getContext("2d"));var a,b;this.ctx.font=this.input.css("font-style")+" "+this.input.css("font-variant")+" "+this.input.css("font-weight")+" "+Math.ceil(parseFloat(this.input.css("font-size")))+"px "+this.input.css("font-family"),a=Math.round(this.ctx.measureText(this.input.val()+"M").width)+Math.ceil(parseFloat(this.searchContainer.css("margin-left")))+Math.ceil(parseFloat(this.searchContainer.css("margin-right"))),b=this.tokensContainer.width()-(Math.ceil(parseFloat(this.tokensContainer.css("border-left-width")))+Math.ceil(parseFloat(this.tokensContainer.css("border-right-width"))+Math.ceil(parseFloat(this.tokensContainer.css("padding-left")))+Math.ceil(parseFloat(this.tokensContainer.css("padding-right"))))),a>=b&&(a=b),this.searchContainer.width(a),this.ctx.restore()},b.prototype.resetInput=function(){this.input.val(""),this.scaleInput()},b.prototype.escape=function(a){var b=document.createElement("div");return b.innerHTML=a,a=b.textContent||b.innerText||"",String(a).replace(/["]/g,function(){return'"'})},b.prototype.escapeRegex=function(a){return a.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g,"\\$&")},b.prototype.guid=function(){function a(){return Math.floor(65536*(1+Math.random())).toString(16).substring(1)}return a()+a()+"-"+a()+"-"+a()+"-"+a()+"-"+a()+a()+a()},b.prototype.toArray=function(){var b=[];return a("option:selected",this.element).each(function(){b.push(a(this).val())}),b},b.prototype.transliteration=function(a){var b={"Ⓐ":"A","Ａ":"A","À":"A","Á":"A","Â":"A","Ầ":"A","Ấ":"A","Ẫ":"A","Ẩ":"A","Ã":"A","Ā":"A","Ă":"A","Ằ":"A","Ắ":"A","Ẵ":"A","Ẳ":"A","Ȧ":"A","Ǡ":"A","Ä":"A","Ǟ":"A","Ả":"A","Å":"A","Ǻ":"A","Ǎ":"A","Ȁ":"A","Ȃ":"A","Ạ":"A","Ậ":"A","Ặ":"A","Ḁ":"A","Ą":"A","Ⱥ":"A","Ɐ":"A","Ꜳ":"AA","Æ":"AE","Ǽ":"AE","Ǣ":"AE","Ꜵ":"AO","Ꜷ":"AU","Ꜹ":"AV","Ꜻ":"AV","Ꜽ":"AY","Ⓑ":"B","Ｂ":"B","Ḃ":"B","Ḅ":"B","Ḇ":"B","Ƀ":"B","Ƃ":"B","Ɓ":"B","Ⓒ":"C","Ｃ":"C","Ć":"C","Ĉ":"C","Ċ":"C","Č":"C","Ç":"C","Ḉ":"C","Ƈ":"C","Ȼ":"C","Ꜿ":"C","Ⓓ":"D","Ｄ":"D","Ḋ":"D","Ď":"D","Ḍ":"D","Ḑ":"D","Ḓ":"D","Ḏ":"D","Đ":"D","Ƌ":"D","Ɗ":"D","Ɖ":"D","Ꝺ":"D","Ǳ":"DZ","Ǆ":"DZ","ǲ":"Dz","ǅ":"Dz","Ⓔ":"E","Ｅ":"E","È":"E","É":"E","Ê":"E","Ề":"E","Ế":"E","Ễ":"E","Ể":"E","Ẽ":"E","Ē":"E","Ḕ":"E","Ḗ":"E","Ĕ":"E","Ė":"E","Ë":"E","Ẻ":"E","Ě":"E","Ȅ":"E","Ȇ":"E","Ẹ":"E","Ệ":"E","Ȩ":"E","Ḝ":"E","Ę":"E","Ḙ":"E","Ḛ":"E","Ɛ":"E","Ǝ":"E","Ⓕ":"F","Ｆ":"F","Ḟ":"F","Ƒ":"F","Ꝼ":"F","Ⓖ":"G","Ｇ":"G","Ǵ":"G","Ĝ":"G","Ḡ":"G","Ğ":"G","Ġ":"G","Ǧ":"G","Ģ":"G","Ǥ":"G","Ɠ":"G","Ꞡ":"G","Ᵹ":"G","Ꝿ":"G","Ⓗ":"H","Ｈ":"H","Ĥ":"H","Ḣ":"H","Ḧ":"H","Ȟ":"H","Ḥ":"H","Ḩ":"H","Ḫ":"H","Ħ":"H","Ⱨ":"H","Ⱶ":"H","Ɥ":"H","Ⓘ":"I","Ｉ":"I","Ì":"I","Í":"I","Î":"I","Ĩ":"I","Ī":"I","Ĭ":"I","İ":"I","Ï":"I","Ḯ":"I","Ỉ":"I","Ǐ":"I","Ȉ":"I","Ȋ":"I","Ị":"I","Į":"I","Ḭ":"I","Ɨ":"I","Ⓙ":"J","Ｊ":"J","Ĵ":"J","Ɉ":"J","Ⓚ":"K","Ｋ":"K","Ḱ":"K","Ǩ":"K","Ḳ":"K","Ķ":"K","Ḵ":"K","Ƙ":"K","Ⱪ":"K","Ꝁ":"K","Ꝃ":"K","Ꝅ":"K","Ꞣ":"K","Ⓛ":"L","Ｌ":"L","Ŀ":"L","Ĺ":"L","Ľ":"L","Ḷ":"L","Ḹ":"L","Ļ":"L","Ḽ":"L","Ḻ":"L","Ł":"L","Ƚ":"L","Ɫ":"L","Ⱡ":"L","Ꝉ":"L","Ꝇ":"L","Ꞁ":"L","Ǉ":"LJ","ǈ":"Lj","Ⓜ":"M","Ｍ":"M","Ḿ":"M","Ṁ":"M","Ṃ":"M","Ɱ":"M","Ɯ":"M","Ⓝ":"N","Ｎ":"N","Ǹ":"N","Ń":"N","Ñ":"N","Ṅ":"N","Ň":"N","Ṇ":"N","Ņ":"N","Ṋ":"N","Ṉ":"N","Ƞ":"N","Ɲ":"N","Ꞑ":"N","Ꞥ":"N","Ǌ":"NJ","ǋ":"Nj","Ⓞ":"O","Ｏ":"O","Ò":"O","Ó":"O","Ô":"O","Ồ":"O","Ố":"O","Ỗ":"O","Ổ":"O","Õ":"O","Ṍ":"O","Ȭ":"O","Ṏ":"O","Ō":"O","Ṑ":"O","Ṓ":"O","Ŏ":"O","Ȯ":"O","Ȱ":"O","Ö":"O","Ȫ":"O","Ỏ":"O","Ő":"O","Ǒ":"O","Ȍ":"O","Ȏ":"O","Ơ":"O","Ờ":"O","Ớ":"O","Ỡ":"O","Ở":"O","Ợ":"O","Ọ":"O","Ộ":"O","Ǫ":"O","Ǭ":"O","Ø":"O","Ǿ":"O","Ɔ":"O","Ɵ":"O","Ꝋ":"O","Ꝍ":"O","Ƣ":"OI","Ꝏ":"OO","Ȣ":"OU","Ⓟ":"P","Ｐ":"P","Ṕ":"P","Ṗ":"P","Ƥ":"P","Ᵽ":"P","Ꝑ":"P","Ꝓ":"P","Ꝕ":"P","Ⓠ":"Q","Ｑ":"Q","Ꝗ":"Q","Ꝙ":"Q","Ɋ":"Q","Ⓡ":"R","Ｒ":"R","Ŕ":"R","Ṙ":"R","Ř":"R","Ȑ":"R","Ȓ":"R","Ṛ":"R","Ṝ":"R","Ŗ":"R","Ṟ":"R","Ɍ":"R","Ɽ":"R","Ꝛ":"R","Ꞧ":"R","Ꞃ":"R","Ⓢ":"S","Ｓ":"S","ẞ":"S","Ś":"S","Ṥ":"S","Ŝ":"S","Ṡ":"S","Š":"S","Ṧ":"S","Ṣ":"S","Ṩ":"S","Ș":"S","Ş":"S","Ȿ":"S","Ꞩ":"S","Ꞅ":"S","Ⓣ":"T","Ｔ":"T","Ṫ":"T","Ť":"T","Ṭ":"T","Ț":"T","Ţ":"T","Ṱ":"T","Ṯ":"T","Ŧ":"T","Ƭ":"T","Ʈ":"T","Ⱦ":"T","Ꞇ":"T","Ꜩ":"TZ","Ⓤ":"U","Ｕ":"U","Ù":"U","Ú":"U","Û":"U","Ũ":"U","Ṹ":"U","Ū":"U","Ṻ":"U","Ŭ":"U","Ü":"U","Ǜ":"U","Ǘ":"U","Ǖ":"U","Ǚ":"U","Ủ":"U","Ů":"U","Ű":"U","Ǔ":"U","Ȕ":"U","Ȗ":"U","Ư":"U","Ừ":"U","Ứ":"U","Ữ":"U","Ử":"U","Ự":"U","Ụ":"U","Ṳ":"U","Ų":"U","Ṷ":"U","Ṵ":"U","Ʉ":"U","Ⓥ":"V","Ｖ":"V","Ṽ":"V","Ṿ":"V","Ʋ":"V","Ꝟ":"V","Ʌ":"V","Ꝡ":"VY","Ⓦ":"W","Ｗ":"W","Ẁ":"W","Ẃ":"W","Ŵ":"W","Ẇ":"W","Ẅ":"W","Ẉ":"W","Ⱳ":"W","Ⓧ":"X","Ｘ":"X","Ẋ":"X","Ẍ":"X","Ⓨ":"Y","Ｙ":"Y","Ỳ":"Y","Ý":"Y","Ŷ":"Y","Ỹ":"Y","Ȳ":"Y","Ẏ":"Y","Ÿ":"Y","Ỷ":"Y","Ỵ":"Y","Ƴ":"Y","Ɏ":"Y","Ỿ":"Y","Ⓩ":"Z","Ｚ":"Z","Ź":"Z","Ẑ":"Z","Ż":"Z","Ž":"Z","Ẓ":"Z","Ẕ":"Z","Ƶ":"Z","Ȥ":"Z","Ɀ":"Z","Ⱬ":"Z","Ꝣ":"Z","ⓐ":"a","ａ":"a","ẚ":"a","à":"a","á":"a","â":"a","ầ":"a","ấ":"a","ẫ":"a","ẩ":"a","ã":"a","ā":"a","ă":"a","ằ":"a","ắ":"a","ẵ":"a","ẳ":"a","ȧ":"a","ǡ":"a","ä":"a","ǟ":"a","ả":"a","å":"a","ǻ":"a","ǎ":"a","ȁ":"a","ȃ":"a","ạ":"a","ậ":"a","ặ":"a","ḁ":"a","ą":"a","ⱥ":"a","ɐ":"a","ꜳ":"aa","æ":"ae","ǽ":"ae","ǣ":"ae","ꜵ":"ao","ꜷ":"au","ꜹ":"av","ꜻ":"av","ꜽ":"ay","ⓑ":"b","ｂ":"b","ḃ":"b","ḅ":"b","ḇ":"b","ƀ":"b","ƃ":"b","ɓ":"b","ⓒ":"c","ｃ":"c","ć":"c","ĉ":"c","ċ":"c","č":"c","ç":"c","ḉ":"c","ƈ":"c","ȼ":"c","ꜿ":"c","ↄ":"c","ⓓ":"d","ｄ":"d","ḋ":"d","ď":"d","ḍ":"d","ḑ":"d","ḓ":"d","ḏ":"d","đ":"d","ƌ":"d","ɖ":"d","ɗ":"d","ꝺ":"d","ǳ":"dz","ǆ":"dz","ⓔ":"e","ｅ":"e","è":"e","é":"e","ê":"e","ề":"e","ế":"e","ễ":"e","ể":"e","ẽ":"e","ē":"e","ḕ":"e","ḗ":"e","ĕ":"e","ė":"e","ë":"e","ẻ":"e","ě":"e","ȅ":"e","ȇ":"e","ẹ":"e","ệ":"e","ȩ":"e","ḝ":"e","ę":"e","ḙ":"e","ḛ":"e","ɇ":"e","ɛ":"e","ǝ":"e","ⓕ":"f","ｆ":"f","ḟ":"f","ƒ":"f","ꝼ":"f","ⓖ":"g","ｇ":"g","ǵ":"g","ĝ":"g","ḡ":"g","ğ":"g","ġ":"g","ǧ":"g","ģ":"g","ǥ":"g","ɠ":"g","ꞡ":"g","ᵹ":"g","ꝿ":"g","ⓗ":"h","ｈ":"h","ĥ":"h","ḣ":"h","ḧ":"h","ȟ":"h","ḥ":"h","ḩ":"h","ḫ":"h","ẖ":"h","ħ":"h","ⱨ":"h","ⱶ":"h","ɥ":"h","ƕ":"hv","ⓘ":"i","ｉ":"i","ì":"i","í":"i","î":"i","ĩ":"i","ī":"i","ĭ":"i","ï":"i","ḯ":"i","ỉ":"i","ǐ":"i","ȉ":"i","ȋ":"i","ị":"i","į":"i","ḭ":"i","ɨ":"i","ı":"i","ⓙ":"j","ｊ":"j","ĵ":"j","ǰ":"j","ɉ":"j","ⓚ":"k","ｋ":"k","ḱ":"k","ǩ":"k","ḳ":"k","ķ":"k","ḵ":"k","ƙ":"k","ⱪ":"k","ꝁ":"k","ꝃ":"k","ꝅ":"k","ꞣ":"k","ⓛ":"l","ｌ":"l","ŀ":"l","ĺ":"l","ľ":"l","ḷ":"l","ḹ":"l","ļ":"l","ḽ":"l","ḻ":"l","ſ":"l","ł":"l","ƚ":"l","ɫ":"l","ⱡ":"l","ꝉ":"l","ꞁ":"l","ꝇ":"l","ǉ":"lj","ⓜ":"m","ｍ":"m","ḿ":"m","ṁ":"m","ṃ":"m","ɱ":"m","ɯ":"m","ⓝ":"n","ｎ":"n","ǹ":"n","ń":"n","ñ":"n","ṅ":"n","ň":"n","ṇ":"n","ņ":"n","ṋ":"n","ṉ":"n","ƞ":"n","ɲ":"n","ŉ":"n","ꞑ":"n","ꞥ":"n","ǌ":"nj","ⓞ":"o","ｏ":"o","ò":"o","ó":"o","ô":"o","ồ":"o","ố":"o","ỗ":"o","ổ":"o","õ":"o","ṍ":"o","ȭ":"o","ṏ":"o","ō":"o","ṑ":"o","ṓ":"o","ŏ":"o","ȯ":"o","ȱ":"o","ö":"o","ȫ":"o","ỏ":"o","ő":"o","ǒ":"o","ȍ":"o","ȏ":"o","ơ":"o","ờ":"o","ớ":"o","ỡ":"o","ở":"o","ợ":"o","ọ":"o","ộ":"o","ǫ":"o","ǭ":"o","ø":"o","ǿ":"o","ɔ":"o","ꝋ":"o","ꝍ":"o","ɵ":"o","ƣ":"oi","ȣ":"ou","ꝏ":"oo","ⓟ":"p","ｐ":"p","ṕ":"p","ṗ":"p","ƥ":"p","ᵽ":"p","ꝑ":"p","ꝓ":"p","ꝕ":"p","ⓠ":"q","ｑ":"q","ɋ":"q","ꝗ":"q","ꝙ":"q","ⓡ":"r","ｒ":"r","ŕ":"r","ṙ":"r","ř":"r","ȑ":"r","ȓ":"r","ṛ":"r","ṝ":"r","ŗ":"r","ṟ":"r","ɍ":"r","ɽ":"r","ꝛ":"r","ꞧ":"r","ꞃ":"r","ⓢ":"s","ｓ":"s","ß":"s","ś":"s","ṥ":"s","ŝ":"s","ṡ":"s","š":"s","ṧ":"s","ṣ":"s","ṩ":"s","ș":"s","ş":"s","ȿ":"s","ꞩ":"s","ꞅ":"s","ẛ":"s","ⓣ":"t","ｔ":"t","ṫ":"t","ẗ":"t","ť":"t","ṭ":"t","ț":"t","ţ":"t","ṱ":"t","ṯ":"t","ŧ":"t","ƭ":"t","ʈ":"t","ⱦ":"t","ꞇ":"t","ꜩ":"tz","ⓤ":"u","ｕ":"u","ù":"u","ú":"u","û":"u","ũ":"u","ṹ":"u","ū":"u","ṻ":"u","ŭ":"u","ü":"u","ǜ":"u","ǘ":"u","ǖ":"u","ǚ":"u","ủ":"u","ů":"u","ű":"u","ǔ":"u","ȕ":"u","ȗ":"u","ư":"u","ừ":"u","ứ":"u","ữ":"u","ử":"u","ự":"u","ụ":"u","ṳ":"u","ų":"u","ṷ":"u","ṵ":"u","ʉ":"u","ⓥ":"v","ｖ":"v","ṽ":"v","ṿ":"v","ʋ":"v","ꝟ":"v","ʌ":"v","ꝡ":"vy","ⓦ":"w","ｗ":"w","ẁ":"w","ẃ":"w","ŵ":"w","ẇ":"w","ẅ":"w","ẘ":"w","ẉ":"w","ⱳ":"w","ⓧ":"x","ｘ":"x","ẋ":"x","ẍ":"x","ⓨ":"y","ｙ":"y","ỳ":"y","ý":"y","ŷ":"y","ỹ":"y","ȳ":"y","ẏ":"y","ÿ":"y","ỷ":"y","ẙ":"y","ỵ":"y","ƴ":"y","ɏ":"y","ỿ":"y","ⓩ":"z","ｚ":"z","ź":"z","ẑ":"z","ż":"z","ž":"z","ẓ":"z","ẕ":"z","ƶ":"z","ȥ":"z","ɀ":"z","ⱬ":"z","ꝣ":"z","Ά":"Α","Έ":"Ε","Ή":"Η","Ί":"Ι","Ϊ":"Ι","Ό":"Ο","Ύ":"Υ","Ϋ":"Υ","Ώ":"Ω","ά":"α","έ":"ε","ή":"η","ί":"ι","ϊ":"ι","ΐ":"ι","ό":"ο","ύ":"υ","ϋ":"υ","ΰ":"υ","ω":"ω","ς":"σ"},c=function(a){return b[a]||a};return a.replace(/[^\u0000-\u007E]/g,c)};var e=a.fn.tokenize2;a.fn.tokenize2=d,a.fn.tokenize2.Constructor=b,a.fn.tokenize2.noConflict=function(){return a.fn.tokenize2=e,this}});
var messengerTool = (function(window){
	//messenger local variables
	var msgrBody                        = $('body'),
	    msgrConversationId              = 0, //conversation id
	    msgrMsgOffset                   = 0, //message offset - starts 0 to retrieve data in the database
	    msgrTotalMsg                    = 0, //total number of conversation message retrieve
	    msgrTotalContactList            = 0, //total number of contacts retrieve
	    msgrTotalNotificationMsg        = 0, //total number of notification message
	    msgrDetectScroll                = true, //specify if detecting scroll is allowed in the chat container
	    msgrLastMsg                     = {}, //get the last message on the container to use as a marker when we scroll to get more message
	    msgrCurOffset                   = 0, //get the chat container offset so that we can position the chat container scroll correctly if we load more
	    msgrIsNewConvo                  = false, //use to detect if we create a new conversation
	    msgrSelectedContactId           = "", //newly selected contact id
	    msgrSelectedContactname         = "", //newly selected contact name
	    msgrIntervalName                = null, //store the interval name
	    msgrTimeInterval                = null, //specify the time interval of refreshing the chat, contacts and message notification
	    msgrFirstLoad                   = true, //detect for first load
        msgrContactFound                = false, //use to detect if we the selected is already in the contact
        tempConversationId              = 0, //store the conversation id temporarily
	    msgrContactsDefaultDisplayNo    = 10, //default number of contacts to display
        msgrLoadTheContact              = false, //used to detect when there is new message and need the contacts to load
	    msgrUserHasRights               = false; //check user rights

        /**
         * Get the user rights for messenger
         */
        getUserRights();

        //we need to position the scroll bar if the user close the messenger and open again from the user profile
        msgrBody.on('click', '#melis-messenger-tab', function() {
            //check if messenger already open
            if ( $('#id_melismessenger_tool').not(':visible') ) {
                setTimeout(function(){
                    if (getChatContainer().find('.media').length != 0) {
                        getChatContainer().scrollTop(getChatContainer()[0].scrollHeight);
                        msgrDetectScroll = true;
                    }
                }, 500);
            }
        });

        //send message
        msgrBody.on('submit','#sendMsgForm', function(e){
            $('#msgr_msg_id').val(msgrConversationId);

            var msg     = $('#msgr_msg_cont_message').val(),
                qString = $('#sendMsgForm').serialize();

                if ( msg != "" && msg != undefined ) {
                    saveMessage(qString);
                }

                e.preventDefault();
        });

        /**
         *Display conversation after the user select a contact
        */
        msgrBody.on('click' , '.selectContact', function(e) {
            var $this = $(this);

                //check if we select the same contact, so that we will not going to request again
                if ( msgrConversationId != $this.attr('data-convo-id') ) {
                    //set total number of message to 0
                    msgrTotalMsg = 0;
                    //specify if we allow to detect scroll
                    msgrDetectScroll = false;
                    //store the selected conversation id
                    msgrConversationId = $this.attr('data-convo-id');
                    //empty the container
                    emptyChatContainer();
                    //display select contact name
                    setConversationHeader(msgrConversationId);
                    //set msgrMsgOffset to 0 as starting point of query
                    msgrMsgOffset = 0;
                    //display conversation
                    getConversation(false, msgrConversationId);
                    //update the message status and refresh the message notification
                    $.post('/melis/MelisMessenger/MelisMessenger/updateMessageStatus', {"id": msgrConversationId}, function () {
                        getNewMessage(false);
                    });
                }

                e.preventDefault();
        });

        /**
         * Create a conversation after the user select a contact
         */
        msgrBody.on('click', '#compose-convo', function(e){
            //if user select a contact
            if ( msgrSelectedContactId != "" ) {
                /**
                 * we must loop through each contact
                 * to find if the user selected contact is already
                 * in the list
                 */
                $('#contact-list div.selectContact').each(function() {
                    var $this = $(this);

                        $('#contact-list div.selectContact').removeClass('active');
                        //get the contact id
                        var id = $this.attr('data-contact-id');
                        //check if contact already in the list
                        if ( msgrSelectedContactId == id ) {
                            msgrConversationId = $this.attr('data-convo-id');
                            //empty the container
                            emptyChatContainer();

                            //if the contact is not yet in the top, we must move it to the top of the list
                            $this.parent().prepend(this);
                            $this.show();

                            var contactName = $this.find('label.user-name').text();
                            //display the name
                            $('#convo-header').empty().append(
                                                        '<div id="convo-header-content">'+
                                                            '<div><label>'+translations.tr_melismessenger_tool_conversation_with+' <b>'+contactName+'</b></label></div>'+
                                                        '</div>'
                                                    );
                            msgrContactFound = true;
                            //set total number of message to 0
                            msgrTotalMsg = 0;
                            getConversation(false, msgrConversationId);
                            msgrSelectedContactname = "";
                            msgrSelectedContactId = 0;
                            return false;
                        }
                });

                //create new conversation with user selected contact
                if ( !msgrContactFound ) {
                    var html = "";
                        msgrBody.find('#show-empty-contact').remove();
                        msgrIsNewConvo = true;
                        //construct html data for the newly selected contact
                        html += "<div style='display: block' class='list-group-item active'>";
                        html +=	"<span id='remove-new-convo' class='float-right btn btn-sm'>x</span>"
                        html += "<span class='media'>";
                            html += "<span class='media-msgrBody media-msgrBody-inline'>";
                                html += "<label>"+translations.tr_melismessenger_tool_new_message+" <strong>"+msgrSelectedContactname+"</strong></label>";
                            html +="</span>";
                        html +="</span>";
                        html +="</a>";

                        //store the previous conversation id
                        tempConversationId = msgrConversationId;
                        //empty the container
                        emptyChatContainer();
                        //set conversation id to 0
                        msgrConversationId = 0;
                        //get the new selected contact name
                        setConversationHeader(0, msgrSelectedContactname);
                        //prepend the contact
                        getContactListContainer().prepend(html);
                        //disable the button create
                        $this.prop('disabled', true);
                }

                msgrContactFound = false;
            }

            e.preventDefault();
        });

        //remove newly created conversation and display the previous conversation
        msgrBody.on('click', '#remove-new-convo', function() {
            var $this = $(this);

                $this.parent().remove();
                $('#selectUsers').tokenize2().trigger('tokenize:clear');
                $('#compose-convo').prop('disabled', false);

                msgrIsNewConvo = false;
                msgrSelectedContactname = "";
                msgrSelectedContactId = 0;

                if ( tempConversationId != 0 ) {//display the previous conversation
                    msgrMsgOffset = 0;
                    msgrConversationId = tempConversationId;
                    getConversation(false, msgrConversationId);
                } else {
                    if ( msgrTotalContactList <= 0 ) {
                        $('#convo-header').empty();
                        getContactListContainer().html('<p id="show-empty-contact">' + translations.tr_melismessenger_tool_contact_is_empty + '</p>');
                    }
                    setConversationHeader(msgrConversationId, msgrSelectedContactname);
                }
        });

        //get the name and id of the selected contact
        msgrBody.on('tokenize:tokens:add','#selectUsers', function(e, value, text) {
            msgrSelectedContactname = text;
            msgrSelectedContactId = value;
        });

        //refresh chat box / conversation
        msgrBody.on('click', '.refresh-chat', function(e){
            //specify if we allow to detect scroll
            msgrDetectScroll = false;
            //set msgrMsgOffset to 0 as starting point of query
            msgrMsgOffset = 0;
            //reload conversation
            melisHelper.zoneReload("id_melismessenger_tool_content", "melismessenger_tool_content");
            e.preventDefault();
        });

        //refresh contacts
        msgrBody.on('click', '.refresh-contacts', function(e){
            //reload contact
            melisHelper.zoneReload("id_melismessenger_tool_contact", "melismessenger_tool_contact");
            e.preventDefault();
        });

        /**
         * Show previous messages when the user scroll up
         */
        msgrBody.on('chat-scroll','#chat-container', function(){
            var $this   = $(this),
                scroll  = $this.scrollTop();

                //remove the time interval if the user is scrolling to prevent from refeshing the conversation
                window.clearInterval(msgrIntervalName);
                //check if scroll is on top
                if ( scroll <= 0 && msgrDetectScroll ) {
                    /*
                    * check if total messages is greater than 10
                    * if less than 10, do not call ajax request anymore
                    */
                    if ( msgrTotalMsg > 10 ) {
                        if ( msgrTotalMsg > Number(msgrMsgOffset + 9) ) {
                            //check if our chat container is not empty
                            if ( getChatContainer().find('.media').length !== 0 ) {
                                //we must get the position of the first element in the container which is the last message that we prepend
                                msgrLastMsg = $('#chat-container .media:first');
                                //store the current offset
                                msgrCurOffset = msgrLastMsg.offset().top - getChatContainer().scrollTop();
                                msgrMsgOffset = Number(msgrMsgOffset + 9);
                                msgrTotalMsg = 0;
                                getConversation(false, msgrConversationId, "prepend", msgrMsgOffset);
                            }
                        } else {
                            //remove load-more-msg notification
                            getChatContainer().find('#load-more-msg').remove();
                            //show message notification if all messages is loaded already
                            getChatContainer().prepend('<div id="load-more-msg"><p>'+translations.tr_melismessenger_tool_no_more_msg_to_load+'</p></div>');
                        }
                    }
                }
                //if the user stop scrolling for over 2 seconds, we resume the interval
                clearTimeout($.data(this, 'timer'));
                
                $.data(this, 'timer', setTimeout(function() {
                    msgrIntervalName = window.setInterval(runMessengerInterval, msgrTimeInterval);
                }, 2000));
        });

        /**
         * Show more data in the contact list on scroll down
         */
        msgrBody.on('contact-scroll', '#contact-list', function(){
            var $this   = $(this),
                scroll  = $this.scrollTop();

                //check if scroll bar is in the bottom
                if ( scroll + $this.innerHeight() >= $this[0].scrollHeight ) {
                    //show additional contact list on scroll
                    var contact_size = $("#contact-list div.selectContact").size();

                        msgrContactsDefaultDisplayNo = (msgrContactsDefaultDisplayNo + 10 <= contact_size) ? msgrContactsDefaultDisplayNo + 10 : contact_size;
                        $('#contact-list div.selectContact:lt('+msgrContactsDefaultDisplayNo+')').show();
                }
        });

        //show the messenger tab when the header messenger icon is click
        msgrBody.on('click', '#id_melismessenger_tool_header_messages a.dropdown-toggle', function() {
            openMessengerTab();
            
            if ( $('#melis-messenger-messages li').hasClass('empty-notif-li') ) {
                if ( $(window).width() < 768 ) {
                    //toggle the menu on mobile
                    $("#id_meliscore_leftmenu").removeAttr('style');
                    $("#id_meliscore_footer").removeClass('slide-left');

                    $("#newplugin-cont").toggleClass("show-menu");
                    $body.removeClass('sidebar-mini');
                }
            }
        });

        /*
        * show the message when the user click the msg on the notification
        * and update the message status to read
        */
        msgrBody.on('click', '#melis-messenger-messages li', function(){
            msgrMsgOffset = 0;

            var $this           = $(this),
                _temp_convo_id  = $(this).attr('data-convo-id');

            openMessengerTab(_temp_convo_id);

            if( $(window).width() < 768 ) {
                //toggle the menu on mobile
                $("#id_meliscore_leftmenu").removeAttr('style');
                $("#id_meliscore_footer").removeClass('slide-left');

                $("#newplugin-cont").toggleClass("show-menu");
                $body.removeClass('sidebar-mini');
            }
        });

        /**
        * Function to display the contact
        */
        function getContactList() {
            $.get('/melis/MelisMessenger/MelisMessenger/getContactList', function(data){
                var html = "";
                if ( data.data.length > 0 ) {
                    //check for new message
                    if ( msgrTotalContactList != data.totalContact || msgrLoadTheContact ) {
                        getContactListContainer().empty();
                        //store total number of contact data
                        msgrTotalContactList = data.totalContact;
                        //process the data
                        $.each(data, function (key, val) {
                            for (var i = 0; i < val.length; i++) {
                                var name = (val[i]['contact_id'] != null) ? val[i].usrInfo[0]['name'] : "("+translations.tr_melismessenger_tool_user_is_deleted+")";
                                html = "<div class='list-group-item selectContact' data-contact-id=" + val[i]['contact_id'] + " data-convo-id=" + val[i]['msgr_msg_id'] + ">";
                                html += "<span class='media'>";
                                //check if conversation has many members
                                if (val[i].usrInfo.length > 1) {
                                    //loop to each user(preparation for group messages)
                                    for (var x = 0; x < val[i].usrInfo.length; x++) {
                                        html += "<div class='media-msgrBody media-msgrBody-inline clearfix'>";
                                        html += "<label class='user-name'>" + ((x == 0) ? '' : ', ') + (name) + "<i class='icon-flag text-primary icon-2x'></i></label>";
                                        html += "</div>";
                                    }
                                } else {
                                    html += "<img src=" + (val[i].usrInfo[0]['image']) + " alt='' width='35' class='thumb img-fluid rounded-circle float-left' />";
                                    html += "<div class='media-msgrBody media-msgrBody-inline clearfix'>";
                                    html += "<span class='" + ((val[i].usrInfo[0]['isOnline'] != 0 && val[i].usrInfo[0]['isOnline'] != null) ? 'text-success float-right' : 'text-danger float-right') + "'><i class='fa fa-fw fa-circle'></i></span>";
                                    html += "<label class='user-name'>" + (name) + "<i class='icon-flag text-primary icon-2x'></i></label>";
                                    html += "<div id='messenger-msg-cont'><span id='messenger-msg'><small>" + (val[i].usrInfo[0]['message']) + "</small></span></div>";
                                    html += "</div>";
                                }
                                html += "</span>";
                                html += "</div>";
                                getContactListContainer().append(html);
                            }
                        });
                        //show list of contact
                        $('#contact-list div.selectContact:lt(' + msgrContactsDefaultDisplayNo + ')').show();
                        setConversationHeader(msgrConversationId);
                        msgrLoadTheContact = false;
                    }
                }else{
                    getContactListContainer().html('<p id="show-empty-contact">'+translations.tr_melismessenger_tool_contact_is_empty+'</p>');
                }
            });
        }

        //get and display the conversation
        function getConversation(timeOut, msgrConversationId, type, offset){
            type 	= (type == undefined ? "append" : type);
            offset 	= (offset == undefined ? 0 : offset);

            if ( msgrConversationId != 0 ) {
                //get the messages
                $.get('/melis/MelisMessenger/MelisMessenger/getConversation/'+msgrConversationId,{'offset': offset}, function(data){
                    if ( data.data.length > 0 ) {
                        //check if there is new message
                        if ( msgrTotalMsg != data.total ) {
                            //empty the chat container if we append the data
                            if ( type == "append" ) {
                                emptyChatContainer();
                            }
                            //display data
                            displayConversation(data.data, data.user_id, type);
                            //store total number of message
                            msgrTotalMsg = data.total;
                            //position the scrollbar
                            if ( getChatContainer().find('.media').length != 0 ) {
                                if ( offset < 9 ) {
                                    if ( timeOut ) {
                                        //we must set a timeout to make sure that all the data are already displayed, before we check for the scroll position
                                        setTimeout(function () {
                                            getChatContainer().scrollTop(getChatContainer()[0].scrollHeight);
                                        }, 200);
                                    } else {
                                        getChatContainer().scrollTop(getChatContainer()[0].scrollHeight);
                                    }
                                    msgrDetectScroll = true;
                                } else {
                                    //re position the scroll bar
                                    getChatContainer().scrollTop(msgrLastMsg.offset().top - msgrCurOffset);
                                }
                            }
                            msgrLoadTheContact = true;
                            setConversationHeader(msgrConversationId);
                        }

                    }else{
                        getChatContainer().html('<div id="convo-msg"><label>'+translations.tr_melismessenger_tool_empty_conversation+'</label></div>');
                    }
                    //show the form
                    $('#chat-form').show();
                });
            }else{
                setConversationHeader(0, "");
            }
        }

        /**
         *  Get and display the conversation of the user and its selected contact
        */
        function displayConversation(data, id, type){
            id = (id == undefined ? null : id);

            var html = "";
                //process the data
                for ( var i = 0; i < data.length; i++ ) {
                    var image = data[i].usr_image;
                    //check if message came from the user
                    if ( data[i].msgr_msg_cont_sender_id == id || id == null ) { //display the contact message(s)
                        html =
                                '<div class="media innerAll contact-msg-block clearfix">'+
                                '	<img src="'+image+'" alt="" class="thumb img-fluid rounded-circle float-right" width="40">'+
                                '	<div class="media-msgrBody">'+
                                '		<small class="date"><cite>'+data[i].msgr_msg_cont_date+'</cite></small>'+
                                '		<div class="float-right chat-contact-msg my-msg">'+data[i].msgr_msg_cont_message+'</div>'+
                                '	</div>'+
                                '</div>'
                            ;
                    } else {//display the message of the current user
                        var name = (data[i].usr_firstname != null && data[i].usr_lastname != null) ? data[i].usr_firstname+" "+data[i].usr_lastname : "("+translations.tr_melismessenger_tool_user_is_deleted+")" ;
                            html =
                                    '<div class="media innerAll user-msg-block">'+
                                    '	<small class="chat-contact-name strong">'+name+'</small>'+
                                    '	<img src="'+image+'" alt="" class="thumb img-fluid rounded-circle float-left" width="40">'+
                                    '	<div class="media-msgrBody">'+
                                    '		<small class="date"><cite>'+data[i].msgr_msg_cont_date+'</cite></small>'+
                                    '	</div>'+
                                    '	<div class="chat-contact-msg">'+data[i].msgr_msg_cont_message+'</div>'+
                                    '</div>'
                                ;
                    }
                    //check wheather we append(put last) the result or prepend(put at the top) it
                    (type == "append") ? getChatContainer().append(html) : getChatContainer().prepend(html);
                }
        }

        /**
         * Function to send message
         * @param datas query string
         */
        function saveMessage(datas){
            if ( msgrIsNewConvo ) {
                var obj = {};
                //create a new conversation with the selected contact
                obj.mbrids = msgrSelectedContactId;
                $.post('/melis/MelisMessenger/MelisMessenger/createConversation',$.param(obj), function(data) {
                    if ( data.conversationId > 0 && data.conversationId != "" && data.conversationId != null ) {
                        //store the conversation id to use later
                        msgrConversationId = data.conversationId;

                        msgrSelectedContactname = "";
                        msgrSelectedContactId = 0;

                        //set the conversation
                        $('#msgr_msg_id').val(msgrConversationId);
                        //empty the container
                        emptyChatContainer();
                        //show the form
                        $('#chat-form').show();
                        //empty container
                        getContactListContainer().empty();
                        //execute the saving of conversation
                        executeSave($('#sendMsgForm').serialize());
                        $('#compose-convo').prop('disabled', false);
                        //load the contact
                        setTimeout(function(){
                            getContactList();
                        }, 500);
                    }
                });
            } else {
                if ( msgrConversationId != 0 ) {
                    executeSave(datas);
                }
            }

            //clear the field and enable the button create
            $('#selectUsers').tokenize2().trigger('tokenize:clear');
        }

        /**
         * Execute the saving of message
         */
        function executeSave(datas){
            $.post('/melis/MelisMessenger/MelisMessenger/saveMessage', datas, function(data) {
                if ( data.success) {
                    $('#sendMsgForm')[0].reset();
                    //check if conversation is empty
                    if( $('#chat-container > div.media').length <= 0 ) {
                        emptyChatContainer();
                    }

                    displayConversation(data.data, null, "append");
                }
            }).done(function() {
                //make the msgrIsNewConvo
                msgrIsNewConvo = false;
                //position the scrollbar
                getChatContainer().animate({
                    scrollTop: getChatContainer()[0].scrollHeight},
                1000);
            });
        }

        /**
         * Function to get new message to notify the user
         */
        function getNewMessage(showNoti){
            showNoti = (showNoti != undefined) ? showNoti : true;

            $.get('/melis/MelisMessenger/MelisMessenger/getNewMessage', function(data){
                var ctr         = 0, //count all message
                    tempData    = '';

                    if ( data.messages.length >  0 ) {
                        msgrBody.find("#melis-messenger-messages").removeClass("empty-notif");
                        msgrBody.find("#melis-messenger-messages").prev().find(".badge").removeClass("hidden");

                        $.each(data, function(index, element) {
                            $.each(element, function(index, msg){
                                tempData += '' +
                                    '<li id="'+(msg.msgr_msg_cont_id)+'" data-convo-id="'+(msg.msgr_msg_id)+'">' +
                                    '	<img src="'+(msg.usr_image)+'" alt="" width="45" class="thumb img-fluid rounded-circle float-left" />' +
                                    '    <span class="media-msgrBody media-msgrBody-inline">' +
                                    '        <span class="date-and-time"><small>'+(msg.msgr_msg_cont_date)+'</small></span><br/>'+
                                    '        <label class="user-name"><span>'+(msg.usr_firstname+" "+msg.usr_lastname)+'</span></label>' +
                                    '    </span> '+
                                    '	 <div id="messenger-msg-cont"><span id="messenger-msg"><small>'+(msg.msgr_msg_cont_message)+'</small></span></div>' +
                                    '</li>';
                                ctr++;
                            });
                        });
                        //check if there is new message
                        if(msgrTotalNotificationMsg != data.messages.length && data.messages.length > 0) {
                            //get total number of message
                            msgrTotalNotificationMsg = data.messages.length;
                            //open up the message notification area
                            if(!msgrFirstLoad && showNoti){
                                $("#melis-messenger-messages").slideToggle();
                                setTimeout(function () {
                                    //after 3 seconds, we hide the message notification area
                                    $("#melis-messenger-messages").removeAttr('style');
                                }, 3000);
                            }
                        }
                    } else {
                        msgrTotalNotificationMsg = 0;
                        tempData += ''+
                            '<li class="empty-notif-li">'+
                            '	<div class="media">'+
                            '   	 <span>'+translations.tr_melismessenger_tool_no_message_notification +'</span>'+
                            ' </div>'+
                            '</li>';
                        msgrBody.find("#melis-messenger-messages").addClass("empty-notif");
                        msgrBody.find("#melis-messenger-messages").prev().find(".badge").addClass("hidden");
                    }
                    msgrBody.find("#melis-messenger-messages").empty().append(tempData);
                    msgrBody.find("#id_melismessenger_tool_header_messages.dropdown.notification a span.badge").text(ctr);
            });
        }

        /**
         * Function to display the name of selected contact on the conversation content
         */
        function setConversationHeader(msgrConversationId, name){
            var name    = (name == undefined ? "" : name),
                msg     = "",
                flag    = false;

                if ( msgrConversationId != 0 && name == "" ) {
                    //loop through each contact to get the contact name
                    $('#contact-list .selectContact').each(function(){
                        $('#contact-list .selectContact').removeClass('active');
                        //get the conversation id
                        var $this   = $(this),
                            id      = $this.attr('data-convo-id');

                            //if the msgrConversationId is equal to the conversation id that we select, end the search and get the name
                            if ( msgrConversationId == id ) {
                                name = $this.find('label.user-name').text();
                                $this.addClass('active');
                                flag = true;
                                return false;
                            }
                    });
                    msg = translations.tr_melismessenger_tool_conversation_with+' <b>'+name+'</b>';
                } else {
                    flag = true;
                    if ( msgrConversationId == 0 && name == "" ) {
                        msg = translations.tr_melismessenger_tool_select_contact_todisplay_conversation;
                    } else {
                        msg = translations.tr_melismessenger_tool_conversation_with+' <b>'+name+'</b>';
                    }
                }
                
                if ( flag ) {
                    //display the name
                    $('#convo-header').empty().append(
                        '<div id="convo-header-content">' +
                        '   <div><label>' + msg + '</label></div>' +
                        '</div>'
                    );
                }
        }

        //function to initialize tokenize plugin
        function initTokenizePlugin(){
            //check if user has rights
            if ( msgrUserHasRights ) {
                $('#selectUsers').tokenize2({
                    searchHighlight: true,
                    placeholder: translations.tr_melismessenger_tool_select_contact,
                    displayNoResultsMessage: true,
                    tokensMaxItems: 1,
                    dropdownMaxItems: 5,
                });
            }
        }

        //trigger the scroll event
        function triggerChatScrollEvent(el) {
            el.on("scroll", function(){
                el.trigger("chat-scroll");
            });
        }

        function triggerContactScrollEvent(el){
            el.on("scroll", function(){
                el.trigger("contact-scroll");
            });
        }

        //empty the container
        function emptyChatContainer(){
            //empty container
            if ( msgrConversationId != 0 ) {
                getChatContainer().empty();
            }
        }

        function setMsgrTimeInterval(){
            $.get('/melis/MelisMessenger/MelisMessenger/getMsgTimeInterval', function(data) {
                getNewMessage();

                if ( data.interval != "" ) {
                    msgrTimeInterval = data.interval;
                } else {
                    msgrTimeInterval = Number(1000 * 60); //default time interval
                }

                //refresh conversation depending on the time interval
                msgrIntervalName = window.setInterval(runMessengerInterval, msgrTimeInterval);
            });
        }

        function runMessengerInterval(){
            //check if messenger tool is selected
            if ( $('#id_melismessenger_tool').is(':visible') ) {
                //set msg offset to 0
                msgrMsgOffset = 0;
                getConversation(false, msgrConversationId);
                getContactList();
            }
            getNewMessage();
        }
        
        //function to use on first load and reloading the conversation
        function loadMessages(){
            //check if user has rights
            if ( msgrUserHasRights ) {
                //set total number of message to 0
                msgrTotalMsg = 0;
                //set offset to zero
                msgrMsgOffset = 0;
                getConversation(false, msgrConversationId);
                triggerChatScrollEvent(getChatContainer());
            }
        }
        
        //function to use on first load and reloading the contact list
        function loadContact(){
            //check if user has rights
            if ( msgrUserHasRights ) {
                msgrTotalContactList = 0;
                getContactListContainer().empty();
                initTokenizePlugin();
                getContactList();
                triggerContactScrollEvent(getContactListContainer());
            }
        }

        //function to open the messenger tab
        function openMessengerTab(convoId){
            convoId = (convoId == undefined) ? 0 : convoId ;

            if ( $('#id_meliscore_user_profile').is(':visible') ) {
                getMessengerTabContent();
            } else {
                //open the user profile tab
                var isMessengerTabOpen  = false,
                    userName            = $("#user-name-link").html().trim();

                    melisHelper.tabOpen(userName, 'fa-user', 'id_meliscore_user_profile', 'meliscore_user_profile', null, null, function(){
                        getMessengerTabContent();
                        isMessengerTabOpen = true;
                    });

                    if ( !isMessengerTabOpen ) {
                        getMessengerTabContent();
                        isMessengerTabOpen = false;
                    }
            }

            if ( convoId != 0 ) {
                msgrTotalMsg = 0;
                //set conversation id
                msgrConversationId = convoId;
                //specify if we allow to detect scroll
                msgrDetectScroll = false;
                //empty the container
                emptyChatContainer();
                //display select contact name
                setConversationHeader(msgrConversationId);
                //display conversation
                getConversation(true, msgrConversationId);

                //update the message status and refresh the message notification
                $.post('/melis/MelisMessenger/MelisMessenger/updateMessageStatus', {"id": msgrConversationId}, function () {
                    getNewMessage();
                });
            }
        }

        //get messenger tab content
        function getMessengerTabContent(){
            //get the tabs
            var _parent = $('#id_meliscore_user_profile_tabs'),
                //remove the active class in li and set active for the messenger tab
                li      = _parent.find('.widget .widget-head ul li');

                $.each(li, function () {
                    var $this   = $(this),
                        a       = $this.find('a').attr('href');

                    $this.removeClass('active');

                    if ( a == "#id_melismessenger_tool" ) {
                        $this.addClass('active');
                    }
                });

            //make the content of the tab active, and deactivate the rest
            var cont = _parent.find('.user-profile-tab-content .tab-content div.tab-pane');

                $.each(cont, function () {
                    var $this   = $(this),
                        cont_id = $this.attr('id');

                        $this.removeClass('active');

                        if ( cont_id == "id_melismessenger_tool" ) {
                            $this.addClass('active');
                        }
                });
        }

        //get the chat container
        function getChatContainer(){
            return $('#chat-container');
        }

        //get the contact list container
        function getContactListContainer(){
            return $('#contact-list');
        }

        //get user rights
        function getUserRights(){
            $.get('/melis/MelisMessenger/MelisMessenger/getUserRightsForMessenger', function(data) {
                if ( data.isAccessible == true ) {
                    msgrUserHasRights = true;
                    //run the interval
                    //set the interval for checking of new message
                    setMsgrTimeInterval();
                    //detect if first load
                    setTimeout(function(){
                        //set the msgrFirstLoad to false after 3 seconds
                        msgrFirstLoad = false;
                    }, 3000);
                }
            });
        }

        return {
            // key - access name outside    // value - name of function above
            initTokenizePlugin			:	initTokenizePlugin,
            loadContact					:	loadContact,
            loadMessages				:	loadMessages
        };
})(window);