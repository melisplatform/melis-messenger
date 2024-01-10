!function(e){"function"==typeof define&&define.amd?define(["jquery"],e):"object"==typeof module&&module.exports?module.exports=function(t,i){return void 0===i&&(i="undefined"!=typeof window?require("jquery"):require("jquery")(t)),e(i),i}:e(jQuery)}((function(e){var t=function(i,s){this.control=!1,this.element=e(i),this.options=e.extend({},t.DEFAULTS,s),this.options.tabIndex=-1===this.options.tabIndex?0:this.options.tabIndex,this.options.sortable=1!==this.options.tokensMaxItems&&this.options.sortable,this.bind(),this.trigger("tokenize:load")},i=8,s=9,o=13,n=27,r=38,a=40,l=17,d=16;t.VERSION="0.5-beta",t.DEBOUNCE=null,t.DEFAULTS={tokensMaxItems:0,tokensAllowCustom:!1,dropdownMaxItems:10,searchMinLength:0,searchFromStart:!0,searchHighlight:!0,displayNoResultsMessage:!1,noResultsMessageText:'No results mached "%s"',delimiter:",",dataSource:"select",debounce:0,placeholder:!1,sortable:!1,zIndexMargin:500,tabIndex:0},t.prototype.trigger=function(e,t,i,s){this.element.trigger(e,t,i,s)},t.prototype.bind=function(){this.element.on("tokenize:load",{},e.proxy((function(){this.init()}),this)).on("tokenize:clear",{},e.proxy((function(){this.clear()}),this)).on("tokenize:remap",{},e.proxy((function(){this.remap()}),this)).on("tokenize:select",{},e.proxy((function(e,t){this.focus(t)}),this)).on("tokenize:deselect",{},e.proxy((function(){this.blur()}),this)).on("tokenize:search",{},e.proxy((function(e,t){this.find(t)}),this)).on("tokenize:paste",{},e.proxy((function(){this.paste()}),this)).on("tokenize:dropdown:up",{},e.proxy((function(){this.dropdownSelectionMove(-1)}),this)).on("tokenize:dropdown:down",{},e.proxy((function(){this.dropdownSelectionMove(1)}),this)).on("tokenize:dropdown:clear",{},e.proxy((function(){this.dropdownClear()}),this)).on("tokenize:dropdown:show",{},e.proxy((function(){this.dropdownShow()}),this)).on("tokenize:dropdown:hide",{},e.proxy((function(){this.dropdownHide()}),this)).on("tokenize:dropdown:fill",{},e.proxy((function(e,t){this.dropdownFill(t)}),this)).on("tokenize:dropdown:itemAdd",{},e.proxy((function(e,t){this.dropdownAddItem(t)}),this)).on("tokenize:keypress",{},e.proxy((function(e,t){this.keypress(t)}),this)).on("tokenize:keydown",{},e.proxy((function(e,t){this.keydown(t)}),this)).on("tokenize:keyup",{},e.proxy((function(e,t){this.keyup(t)}),this)).on("tokenize:tokens:reorder",{},e.proxy((function(){this.reorder()}),this)).on("tokenize:tokens:add",{},e.proxy((function(e,t,i,s){this.tokenAdd(t,i,s)}),this)).on("tokenize:tokens:remove",{},e.proxy((function(e,t){this.tokenRemove(t)}),this))},t.prototype.init=function(){this.id=this.guid(),this.element.hide(),this.element.attr("multiple")||console.error("Attribute multiple is missing, tokenize2 can be buggy !"),this.dropdown=void 0,this.searchContainer=e('<li class="token-search" />'),this.input=e('<input autocomplete="off" />').on("keydown",{},e.proxy((function(e){this.trigger("tokenize:keydown",[e])}),this)).on("keypress",{},e.proxy((function(e){this.trigger("tokenize:keypress",[e])}),this)).on("keyup",{},e.proxy((function(e){this.trigger("tokenize:keyup",[e])}),this)).on("focus",{},e.proxy((function(){this.input.val().length>0&&this.trigger("tokenize:search",[this.input.val()])}),this)).on("paste",{},e.proxy((function(){this.options.tokensAllowCustom&&setTimeout(e.proxy((function(){this.trigger("tokenize:paste")}),this),10)}),this)),this.tokensContainer=e('<ul class="tokens-container form-control" />').addClass(this.element.attr("data-class")).attr("tabindex",this.options.tabIndex).append(this.searchContainer.append(this.input)),!1!==this.options.placeholder&&(this.placeholder=e('<li class="placeholder" />').html(this.options.placeholder),this.tokensContainer.prepend(this.placeholder),this.element.on("tokenize:tokens:add tokenize:remap tokenize:select tokenize:deselect tokenize:tokens:remove",e.proxy((function(){this.container.hasClass("focus")||e("li.token",this.tokensContainer).length>0||this.input.val().length>0?this.placeholder.hide():this.placeholder.show()}),this))),this.container=e('<div class="tokenize" />').attr("id",this.id),this.container.append(this.tokensContainer).insertAfter(this.element),this.container.focusin(e.proxy((function(t){this.trigger("tokenize:select",[e(t.target)[0]===this.tokensContainer[0]])}),this)).focusout(e.proxy((function(){this.trigger("tokenize:deselect")}),this)),1===this.options.tokensMaxItems&&this.container.addClass("single"),this.options.sortable&&(void 0!==e.ui?(this.container.addClass("sortable"),this.tokensContainer.sortable({items:"li.token",cursor:"move",placeholder:"token shadow",forcePlaceholderSize:!0,update:e.proxy((function(){this.trigger("tokenize:tokens:reorder")}),this),start:e.proxy((function(){this.searchContainer.hide()}),this),stop:e.proxy((function(){this.searchContainer.show()}),this)})):(this.options.sortable=!1,console.error("jQuery UI is not loaded, sortable option has been disabled"))),this.element.on("tokenize:tokens:add tokenize:tokens:remove",e.proxy((function(){this.options.tokensMaxItems>0&&e("li.token",this.tokensContainer).length>=this.options.tokensMaxItems?this.searchContainer.hide():this.searchContainer.show()}),this)).on("tokenize:keydown tokenize:keyup tokenize:loaded",e.proxy((function(){this.scaleInput()}),this)),this.trigger("tokenize:remap"),this.trigger("tokenize:tokens:reorder"),this.trigger("tokenize:loaded")},t.prototype.reorder=function(){var t,i;this.options.sortable&&e.each(this.tokensContainer.sortable("toArray",{attribute:"data-value"}),e.proxy((function(s,o){i=e('option[value="'+o+'"]',this.element),void 0===t?i.prependTo(this.element):t.after(i),t=i}),this))},t.prototype.paste=function(){var t=new RegExp(this.escapeRegex(Array.isArray(this.options.delimiter)?this.options.delimiter.join("|"):this.options.delimiter),"ig");t.test(this.input.val())&&e.each(this.input.val().split(t),e.proxy((function(e,t){this.trigger("tokenize:tokens:add",[t,null,!0])}),this))},t.prototype.tokenAdd=function(t,i,s){if(t=this.escape(t),i=i||t,s=s||!1,this.resetInput(),void 0===t||""===t)return this.trigger("tokenize:tokens:error:empty"),this;if(this.options.tokensMaxItems>0&&e("li.token",this.tokensContainer).length>=this.options.tokensMaxItems)return this.trigger("tokenize:tokens:error:max"),this;if(e('li.token[data-value="'+t+'"]',this.tokensContainer).length>0)return this.trigger("tokenize:tokens:error:duplicate",[t,i]),this;if(e('option[value="'+t+'"]',this.element).length)e('option[value="'+t+'"]',this.element).attr("selected","selected").prop("selected",!0);else if(s)this.element.append(e("<option selected />").val(t).html(i));else{if(!this.options.tokensAllowCustom)return this.trigger("tokenize:tokens:error:notokensAllowCustom"),this;this.element.append(e('<option selected data-type="custom" />').val(t).html(i))}return e('<li class="token" />').attr("data-value",t).append("<span>"+i+"</span>").prepend(e('<a class="dismiss" />').on("mousedown touchstart",{},e.proxy((function(e){e.preventDefault(),this.trigger("tokenize:tokens:remove",[t])}),this))).insertBefore(this.searchContainer),this.trigger("tokenize:dropdown:hide"),this},t.prototype.tokenRemove=function(t){var i=e('option[value="'+t+'"]',this.element);return"custom"===i.attr("data-type")?i.remove():i.removeAttr("selected").prop("selected",!1),e('li.token[data-value="'+t+'"]',this.tokensContainer).remove(),this.trigger("tokenize:tokens:reorder"),this},t.prototype.remap=function(){return e("option:selected",this.element).each(e.proxy((function(t,i){this.trigger("tokenize:tokens:add",[e(i).val(),e(i).html(),!1])}),this)),this},t.prototype.focus=function(e){e&&this.input.focus(),this.container.addClass("focus")},t.prototype.blur=function(){this.isDropdownOpen()&&this.trigger("tokenize:dropdown:hide"),this.container.removeClass("focus"),this.resetPending(),this.tokensContainer.attr("tabindex")||this.tokensContainer.attr("tabindex",this.options.tabIndex)},t.prototype.keydown=function(t){if("keydown"===t.type)switch(t.keyCode){case i:if(this.input.val().length<1){if(t.preventDefault(),e("li.token.pending-delete",this.tokensContainer).length>0)this.trigger("tokenize:tokens:remove",[e("li.token.pending-delete",this.tokensContainer).first().attr("data-value")]);else{var d=e("li.token:last",this.tokensContainer);d.length>0&&(this.trigger("tokenize:tokens:markForDelete",[d.attr("data-value")]),d.addClass("pending-delete"))}this.trigger("tokenize:dropdown:hide")}break;case s:t.shiftKey?this.tokensContainer.removeAttr("tabindex"):this.pressedDelimiter(t);break;case o:this.pressedDelimiter(t);break;case n:this.resetPending();break;case r:t.preventDefault(),this.trigger("tokenize:dropdown:up");break;case a:t.preventDefault(),this.trigger("tokenize:dropdown:down");break;case l:this.control=!0;break;default:this.resetPending()}else t.preventDefault()},t.prototype.keyup=function(e){if("keyup"===e.type)switch(e.keyCode){case s:case o:case n:case r:case a:case d:break;case l:this.control=!1;break;default:this.input.val().length>0?this.trigger("tokenize:search",[this.input.val()]):this.trigger("tokenize:dropdown:hide")}else e.preventDefault()},t.prototype.keypress=function(e){if("keypress"===e.type){var t=!1;Array.isArray(this.options.delimiter)?this.options.delimiter.indexOf(String.fromCharCode(e.which))>=0&&(t=!0):String.fromCharCode(e.which)===this.options.delimiter&&(t=!0),t&&this.pressedDelimiter(e)}else e.preventDefault()},t.prototype.pressedDelimiter=function(t){this.resetPending(),this.isDropdownOpen()&&e("li.active",this.dropdown).length>0&&!1===this.control?(t.preventDefault(),e("li.active a",this.dropdown).trigger("mousedown")):this.input.val().length>0&&(t.preventDefault(),this.trigger("tokenize:tokens:add",[this.input.val()]))},t.prototype.find=function(e){if(e.length<this.options.searchMinLength)return this.trigger("tokenize:dropdown:hide"),!1;this.lastSearchTerms=e,"select"===this.options.dataSource?this.dataSourceLocal(e):"function"==typeof this.options.dataSource?this.options.dataSource(e,this):this.dataSourceRemote(e)},t.prototype.dataSourceRemote=function(t){this.debounce(e.proxy((function(){void 0!==this.xhr&&this.xhr.abort(),this.xhr=e.ajax(this.options.dataSource,{data:{search:t},dataType:"json",success:e.proxy((function(t){var i=[];e.each(t,(function(e,t){i.push(t)})),this.trigger("tokenize:dropdown:fill",[i])}),this)})}),this),this.options.debounce)},t.prototype.dataSourceLocal=function(t){var i=this.transliteration(t),s=[],o=(this.options.searchFromStart?"^":"")+this.escapeRegex(i),n=new RegExp(o,"i"),r=this;e("option",this.element).not(":selected, :disabled").each((function(){n.test(r.transliteration(e(this).html()))&&s.push({value:e(this).attr("value"),text:e(this).html()})})),this.trigger("tokenize:dropdown:fill",[s])},t.prototype.debounce=function(t,i){var s=arguments,o=e.proxy((function(){t.apply(this,s),this.debounceTimeout=void 0}),this);void 0!==this.debounceTimeout&&clearTimeout(this.debounceTimeout),this.debounceTimeout=setTimeout(o,i||0)},t.prototype.dropdownShow=function(){this.isDropdownOpen()||(e(".tokenize-dropdown").remove(),this.dropdown=e('<div class="tokenize-dropdown dropdown"><ul class="dropdown-menu" /></div>').attr("data-related",this.id),e("body").append(this.dropdown),this.dropdown.show(),this.dropdown.css("z-index",this.calculatezindex()+this.options.zIndexMargin),e(window).on("resize scroll",{},e.proxy((function(){this.dropdownMove()}),this)).trigger("resize"),this.trigger("tokenize:dropdown:shown"))},t.prototype.calculatezindex=function(){var e=this.container,t=0;if(!isNaN(parseInt(e.css("z-index")))&&parseInt(e.css("z-index"))>0&&(t=parseInt(e.css("z-index"))),t<1)for(;e.length;)if((e=e.parent()).length>0){if(!isNaN(parseInt(e.css("z-index")))&&parseInt(e.css("z-index"))>0)return parseInt(e.css("z-index"));if(e.is("html"))break}return t},t.prototype.dropdownHide=function(){this.isDropdownOpen()&&(e(window).off("resize scroll"),this.dropdown.remove(),this.dropdown=void 0,this.trigger("tokenize:dropdown:hidden"))},t.prototype.dropdownClear=function(){this.dropdown.find(".dropdown-menu li").remove()},t.prototype.dropdownFill=function(t){t&&t.length>0?(this.trigger("tokenize:dropdown:show"),this.trigger("tokenize:dropdown:clear"),e.each(t,e.proxy((function(t,i){e("li.dropdown-item",this.dropdown).length<=this.options.dropdownMaxItems&&this.trigger("tokenize:dropdown:itemAdd",[i])}),this)),e("li.active",this.dropdown).length<1&&e("li:first",this.dropdown).addClass("active"),e("li.dropdown-item",this.dropdown).length<1?this.trigger("tokenize:dropdown:hide"):this.trigger("tokenize:dropdown:filled")):this.options.displayNoResultsMessage?(this.trigger("tokenize:dropdown:show"),this.trigger("tokenize:dropdown:clear"),this.dropdown.find(".dropdown-menu").append(e('<li class="dropdown-item locked" />').html(this.options.noResultsMessageText.replace("%s",this.input.val())))):this.trigger("tokenize:dropdown:hide"),e(window).trigger("resize")},t.prototype.dropdownSelectionMove=function(t){if(e("li.active",this.dropdown).length>0)if(e("li.active",this.dropdown).is("li:"+(t>0?"last-child":"first-child")))e("li.active",this.dropdown).removeClass("active"),e("li:"+(t>0?"first-child":"last-child"),this.dropdown).addClass("active");else{var i=e("li.active",this.dropdown);i.removeClass("active"),t>0?i.next().addClass("active"):i.prev().addClass("active")}else e("li:first",this.dropdown).addClass("active")},t.prototype.dropdownAddItem=function(t){if(this.isDropdownOpen()){var i=e('<li class="dropdown-item" />').html(this.dropdownItemFormat(t)).on("mouseover",e.proxy((function(t){t.preventDefault(),t.target=this.fixTarget(t.target),e("li",this.dropdown).removeClass("active"),e(t.target).parent().addClass("active")}),this)).on("mouseout",e.proxy((function(){e("li",this.dropdown).removeClass("active")}),this)).on("mousedown touchstart",e.proxy((function(t){t.preventDefault(),t.target=this.fixTarget(t.target),this.trigger("tokenize:tokens:add",[e(t.target).attr("data-value"),e(t.target).attr("data-text"),!0])}),this));e('li.token[data-value="'+i.find("a").attr("data-value")+'"]',this.tokensContainer).length<1&&(this.dropdown.find(".dropdown-menu").append(i),this.trigger("tokenize:dropdown:itemAdded",[t]))}},t.prototype.fixTarget=function(t){var i=e(t);if(!i.data("value")){var s=i.find("a");if(s.length)return s.get(0);var o=i.parents("[data-value]");if(o.length)return o.get(0)}return i.get(0)},t.prototype.dropdownItemFormat=function(t){if(t.hasOwnProperty("text")){var i="";if(this.options.searchHighlight){var s=new RegExp((this.options.searchFromStart?"^":"")+"("+this.escapeRegex(this.transliteration(this.lastSearchTerms))+")","gi");i=t.text.replace(s,'<span class="tokenize-highlight">$1</span>')}else i=t.text;return e("<a />").html(i).attr({"data-value":t.value,"data-text":t.text})}},t.prototype.dropdownMove=function(){var e=this.tokensContainer.offset(),t=this.tokensContainer.outerHeight(),i=this.tokensContainer.outerWidth();e.top+=t,this.dropdown.css({width:i}).offset(e)},t.prototype.isDropdownOpen=function(){return void 0!==this.dropdown},t.prototype.clear=function(){return e.each(e("li.token",this.tokensContainer),e.proxy((function(t,i){this.trigger("tokenize:tokens:remove",[e(i).attr("data-value")])}),this)),this.trigger("tokenize:dropdown:hide"),this},t.prototype.resetPending=function(){var t=e("li.pending-delete:last",this.tokensContainer);t.length>0&&(this.trigger("tokenize:tokens:cancelDelete",[t.attr("data-value")]),t.removeClass("pending-delete"))},t.prototype.scaleInput=function(){var e,t;this.ctx||(this.ctx=document.createElement("canvas").getContext("2d")),this.ctx.font=this.input.css("font-style")+" "+this.input.css("font-variant")+" "+this.input.css("font-weight")+" "+Math.ceil(parseFloat(this.input.css("font-size")))+"px "+this.input.css("font-family"),(e=Math.round(this.ctx.measureText(this.input.val()+"M").width)+Math.ceil(parseFloat(this.searchContainer.css("margin-left")))+Math.ceil(parseFloat(this.searchContainer.css("margin-right"))))>=(t=this.tokensContainer.width()-(Math.ceil(parseFloat(this.tokensContainer.css("border-left-width")))+Math.ceil(parseFloat(this.tokensContainer.css("border-right-width"))+Math.ceil(parseFloat(this.tokensContainer.css("padding-left")))+Math.ceil(parseFloat(this.tokensContainer.css("padding-right"))))))&&(e=t),this.searchContainer.width(e),this.ctx.restore()},t.prototype.resetInput=function(){this.input.val(""),this.scaleInput()},t.prototype.escape=function(e){var t=document.createElement("div");return t.innerHTML=e,e=t.textContent||t.innerText||"",String(e).replace(/["]/g,(function(){return'"'}))},t.prototype.escapeRegex=function(e){return e.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g,"\\$&")},t.prototype.guid=function(){function e(){return Math.floor(65536*(1+Math.random())).toString(16).substring(1)}return e()+e()+"-"+e()+"-"+e()+"-"+e()+"-"+e()+e()+e()},t.prototype.toArray=function(){var t=[];return e("option:selected",this.element).each((function(){t.push(e(this).val())})),t},t.prototype.transliteration=function(e){var t={"Ⓐ":"A","Ａ":"A","À":"A","Á":"A","Â":"A","Ầ":"A","Ấ":"A","Ẫ":"A","Ẩ":"A","Ã":"A","Ā":"A","Ă":"A","Ằ":"A","Ắ":"A","Ẵ":"A","Ẳ":"A","Ȧ":"A","Ǡ":"A","Ä":"A","Ǟ":"A","Ả":"A","Å":"A","Ǻ":"A","Ǎ":"A","Ȁ":"A","Ȃ":"A","Ạ":"A","Ậ":"A","Ặ":"A","Ḁ":"A","Ą":"A","Ⱥ":"A","Ɐ":"A","Ꜳ":"AA","Æ":"AE","Ǽ":"AE","Ǣ":"AE","Ꜵ":"AO","Ꜷ":"AU","Ꜹ":"AV","Ꜻ":"AV","Ꜽ":"AY","Ⓑ":"B","Ｂ":"B","Ḃ":"B","Ḅ":"B","Ḇ":"B","Ƀ":"B","Ƃ":"B","Ɓ":"B","Ⓒ":"C","Ｃ":"C","Ć":"C","Ĉ":"C","Ċ":"C","Č":"C","Ç":"C","Ḉ":"C","Ƈ":"C","Ȼ":"C","Ꜿ":"C","Ⓓ":"D","Ｄ":"D","Ḋ":"D","Ď":"D","Ḍ":"D","Ḑ":"D","Ḓ":"D","Ḏ":"D","Đ":"D","Ƌ":"D","Ɗ":"D","Ɖ":"D","Ꝺ":"D","Ǳ":"DZ","Ǆ":"DZ","ǲ":"Dz","ǅ":"Dz","Ⓔ":"E","Ｅ":"E","È":"E","É":"E","Ê":"E","Ề":"E","Ế":"E","Ễ":"E","Ể":"E","Ẽ":"E","Ē":"E","Ḕ":"E","Ḗ":"E","Ĕ":"E","Ė":"E","Ë":"E","Ẻ":"E","Ě":"E","Ȅ":"E","Ȇ":"E","Ẹ":"E","Ệ":"E","Ȩ":"E","Ḝ":"E","Ę":"E","Ḙ":"E","Ḛ":"E","Ɛ":"E","Ǝ":"E","Ⓕ":"F","Ｆ":"F","Ḟ":"F","Ƒ":"F","Ꝼ":"F","Ⓖ":"G","Ｇ":"G","Ǵ":"G","Ĝ":"G","Ḡ":"G","Ğ":"G","Ġ":"G","Ǧ":"G","Ģ":"G","Ǥ":"G","Ɠ":"G","Ꞡ":"G","Ᵹ":"G","Ꝿ":"G","Ⓗ":"H","Ｈ":"H","Ĥ":"H","Ḣ":"H","Ḧ":"H","Ȟ":"H","Ḥ":"H","Ḩ":"H","Ḫ":"H","Ħ":"H","Ⱨ":"H","Ⱶ":"H","Ɥ":"H","Ⓘ":"I","Ｉ":"I","Ì":"I","Í":"I","Î":"I","Ĩ":"I","Ī":"I","Ĭ":"I","İ":"I","Ï":"I","Ḯ":"I","Ỉ":"I","Ǐ":"I","Ȉ":"I","Ȋ":"I","Ị":"I","Į":"I","Ḭ":"I","Ɨ":"I","Ⓙ":"J","Ｊ":"J","Ĵ":"J","Ɉ":"J","Ⓚ":"K","Ｋ":"K","Ḱ":"K","Ǩ":"K","Ḳ":"K","Ķ":"K","Ḵ":"K","Ƙ":"K","Ⱪ":"K","Ꝁ":"K","Ꝃ":"K","Ꝅ":"K","Ꞣ":"K","Ⓛ":"L","Ｌ":"L","Ŀ":"L","Ĺ":"L","Ľ":"L","Ḷ":"L","Ḹ":"L","Ļ":"L","Ḽ":"L","Ḻ":"L","Ł":"L","Ƚ":"L","Ɫ":"L","Ⱡ":"L","Ꝉ":"L","Ꝇ":"L","Ꞁ":"L","Ǉ":"LJ","ǈ":"Lj","Ⓜ":"M","Ｍ":"M","Ḿ":"M","Ṁ":"M","Ṃ":"M","Ɱ":"M","Ɯ":"M","Ⓝ":"N","Ｎ":"N","Ǹ":"N","Ń":"N","Ñ":"N","Ṅ":"N","Ň":"N","Ṇ":"N","Ņ":"N","Ṋ":"N","Ṉ":"N","Ƞ":"N","Ɲ":"N","Ꞑ":"N","Ꞥ":"N","Ǌ":"NJ","ǋ":"Nj","Ⓞ":"O","Ｏ":"O","Ò":"O","Ó":"O","Ô":"O","Ồ":"O","Ố":"O","Ỗ":"O","Ổ":"O","Õ":"O","Ṍ":"O","Ȭ":"O","Ṏ":"O","Ō":"O","Ṑ":"O","Ṓ":"O","Ŏ":"O","Ȯ":"O","Ȱ":"O","Ö":"O","Ȫ":"O","Ỏ":"O","Ő":"O","Ǒ":"O","Ȍ":"O","Ȏ":"O","Ơ":"O","Ờ":"O","Ớ":"O","Ỡ":"O","Ở":"O","Ợ":"O","Ọ":"O","Ộ":"O","Ǫ":"O","Ǭ":"O","Ø":"O","Ǿ":"O","Ɔ":"O","Ɵ":"O","Ꝋ":"O","Ꝍ":"O","Ƣ":"OI","Ꝏ":"OO","Ȣ":"OU","Ⓟ":"P","Ｐ":"P","Ṕ":"P","Ṗ":"P","Ƥ":"P","Ᵽ":"P","Ꝑ":"P","Ꝓ":"P","Ꝕ":"P","Ⓠ":"Q","Ｑ":"Q","Ꝗ":"Q","Ꝙ":"Q","Ɋ":"Q","Ⓡ":"R","Ｒ":"R","Ŕ":"R","Ṙ":"R","Ř":"R","Ȑ":"R","Ȓ":"R","Ṛ":"R","Ṝ":"R","Ŗ":"R","Ṟ":"R","Ɍ":"R","Ɽ":"R","Ꝛ":"R","Ꞧ":"R","Ꞃ":"R","Ⓢ":"S","Ｓ":"S","ẞ":"S","Ś":"S","Ṥ":"S","Ŝ":"S","Ṡ":"S","Š":"S","Ṧ":"S","Ṣ":"S","Ṩ":"S","Ș":"S","Ş":"S","Ȿ":"S","Ꞩ":"S","Ꞅ":"S","Ⓣ":"T","Ｔ":"T","Ṫ":"T","Ť":"T","Ṭ":"T","Ț":"T","Ţ":"T","Ṱ":"T","Ṯ":"T","Ŧ":"T","Ƭ":"T","Ʈ":"T","Ⱦ":"T","Ꞇ":"T","Ꜩ":"TZ","Ⓤ":"U","Ｕ":"U","Ù":"U","Ú":"U","Û":"U","Ũ":"U","Ṹ":"U","Ū":"U","Ṻ":"U","Ŭ":"U","Ü":"U","Ǜ":"U","Ǘ":"U","Ǖ":"U","Ǚ":"U","Ủ":"U","Ů":"U","Ű":"U","Ǔ":"U","Ȕ":"U","Ȗ":"U","Ư":"U","Ừ":"U","Ứ":"U","Ữ":"U","Ử":"U","Ự":"U","Ụ":"U","Ṳ":"U","Ų":"U","Ṷ":"U","Ṵ":"U","Ʉ":"U","Ⓥ":"V","Ｖ":"V","Ṽ":"V","Ṿ":"V","Ʋ":"V","Ꝟ":"V","Ʌ":"V","Ꝡ":"VY","Ⓦ":"W","Ｗ":"W","Ẁ":"W","Ẃ":"W","Ŵ":"W","Ẇ":"W","Ẅ":"W","Ẉ":"W","Ⱳ":"W","Ⓧ":"X","Ｘ":"X","Ẋ":"X","Ẍ":"X","Ⓨ":"Y","Ｙ":"Y","Ỳ":"Y","Ý":"Y","Ŷ":"Y","Ỹ":"Y","Ȳ":"Y","Ẏ":"Y","Ÿ":"Y","Ỷ":"Y","Ỵ":"Y","Ƴ":"Y","Ɏ":"Y","Ỿ":"Y","Ⓩ":"Z","Ｚ":"Z","Ź":"Z","Ẑ":"Z","Ż":"Z","Ž":"Z","Ẓ":"Z","Ẕ":"Z","Ƶ":"Z","Ȥ":"Z","Ɀ":"Z","Ⱬ":"Z","Ꝣ":"Z","ⓐ":"a","ａ":"a","ẚ":"a","à":"a","á":"a","â":"a","ầ":"a","ấ":"a","ẫ":"a","ẩ":"a","ã":"a","ā":"a","ă":"a","ằ":"a","ắ":"a","ẵ":"a","ẳ":"a","ȧ":"a","ǡ":"a","ä":"a","ǟ":"a","ả":"a","å":"a","ǻ":"a","ǎ":"a","ȁ":"a","ȃ":"a","ạ":"a","ậ":"a","ặ":"a","ḁ":"a","ą":"a","ⱥ":"a","ɐ":"a","ꜳ":"aa","æ":"ae","ǽ":"ae","ǣ":"ae","ꜵ":"ao","ꜷ":"au","ꜹ":"av","ꜻ":"av","ꜽ":"ay","ⓑ":"b","ｂ":"b","ḃ":"b","ḅ":"b","ḇ":"b","ƀ":"b","ƃ":"b","ɓ":"b","ⓒ":"c","ｃ":"c","ć":"c","ĉ":"c","ċ":"c","č":"c","ç":"c","ḉ":"c","ƈ":"c","ȼ":"c","ꜿ":"c","ↄ":"c","ⓓ":"d","ｄ":"d","ḋ":"d","ď":"d","ḍ":"d","ḑ":"d","ḓ":"d","ḏ":"d","đ":"d","ƌ":"d","ɖ":"d","ɗ":"d","ꝺ":"d","ǳ":"dz","ǆ":"dz","ⓔ":"e","ｅ":"e","è":"e","é":"e","ê":"e","ề":"e","ế":"e","ễ":"e","ể":"e","ẽ":"e","ē":"e","ḕ":"e","ḗ":"e","ĕ":"e","ė":"e","ë":"e","ẻ":"e","ě":"e","ȅ":"e","ȇ":"e","ẹ":"e","ệ":"e","ȩ":"e","ḝ":"e","ę":"e","ḙ":"e","ḛ":"e","ɇ":"e","ɛ":"e","ǝ":"e","ⓕ":"f","ｆ":"f","ḟ":"f","ƒ":"f","ꝼ":"f","ⓖ":"g","ｇ":"g","ǵ":"g","ĝ":"g","ḡ":"g","ğ":"g","ġ":"g","ǧ":"g","ģ":"g","ǥ":"g","ɠ":"g","ꞡ":"g","ᵹ":"g","ꝿ":"g","ⓗ":"h","ｈ":"h","ĥ":"h","ḣ":"h","ḧ":"h","ȟ":"h","ḥ":"h","ḩ":"h","ḫ":"h","ẖ":"h","ħ":"h","ⱨ":"h","ⱶ":"h","ɥ":"h","ƕ":"hv","ⓘ":"i","ｉ":"i","ì":"i","í":"i","î":"i","ĩ":"i","ī":"i","ĭ":"i","ï":"i","ḯ":"i","ỉ":"i","ǐ":"i","ȉ":"i","ȋ":"i","ị":"i","į":"i","ḭ":"i","ɨ":"i","ı":"i","ⓙ":"j","ｊ":"j","ĵ":"j","ǰ":"j","ɉ":"j","ⓚ":"k","ｋ":"k","ḱ":"k","ǩ":"k","ḳ":"k","ķ":"k","ḵ":"k","ƙ":"k","ⱪ":"k","ꝁ":"k","ꝃ":"k","ꝅ":"k","ꞣ":"k","ⓛ":"l","ｌ":"l","ŀ":"l","ĺ":"l","ľ":"l","ḷ":"l","ḹ":"l","ļ":"l","ḽ":"l","ḻ":"l","ſ":"l","ł":"l","ƚ":"l","ɫ":"l","ⱡ":"l","ꝉ":"l","ꞁ":"l","ꝇ":"l","ǉ":"lj","ⓜ":"m","ｍ":"m","ḿ":"m","ṁ":"m","ṃ":"m","ɱ":"m","ɯ":"m","ⓝ":"n","ｎ":"n","ǹ":"n","ń":"n","ñ":"n","ṅ":"n","ň":"n","ṇ":"n","ņ":"n","ṋ":"n","ṉ":"n","ƞ":"n","ɲ":"n","ŉ":"n","ꞑ":"n","ꞥ":"n","ǌ":"nj","ⓞ":"o","ｏ":"o","ò":"o","ó":"o","ô":"o","ồ":"o","ố":"o","ỗ":"o","ổ":"o","õ":"o","ṍ":"o","ȭ":"o","ṏ":"o","ō":"o","ṑ":"o","ṓ":"o","ŏ":"o","ȯ":"o","ȱ":"o","ö":"o","ȫ":"o","ỏ":"o","ő":"o","ǒ":"o","ȍ":"o","ȏ":"o","ơ":"o","ờ":"o","ớ":"o","ỡ":"o","ở":"o","ợ":"o","ọ":"o","ộ":"o","ǫ":"o","ǭ":"o","ø":"o","ǿ":"o","ɔ":"o","ꝋ":"o","ꝍ":"o","ɵ":"o","ƣ":"oi","ȣ":"ou","ꝏ":"oo","ⓟ":"p","ｐ":"p","ṕ":"p","ṗ":"p","ƥ":"p","ᵽ":"p","ꝑ":"p","ꝓ":"p","ꝕ":"p","ⓠ":"q","ｑ":"q","ɋ":"q","ꝗ":"q","ꝙ":"q","ⓡ":"r","ｒ":"r","ŕ":"r","ṙ":"r","ř":"r","ȑ":"r","ȓ":"r","ṛ":"r","ṝ":"r","ŗ":"r","ṟ":"r","ɍ":"r","ɽ":"r","ꝛ":"r","ꞧ":"r","ꞃ":"r","ⓢ":"s","ｓ":"s","ß":"s","ś":"s","ṥ":"s","ŝ":"s","ṡ":"s","š":"s","ṧ":"s","ṣ":"s","ṩ":"s","ș":"s","ş":"s","ȿ":"s","ꞩ":"s","ꞅ":"s","ẛ":"s","ⓣ":"t","ｔ":"t","ṫ":"t","ẗ":"t","ť":"t","ṭ":"t","ț":"t","ţ":"t","ṱ":"t","ṯ":"t","ŧ":"t","ƭ":"t","ʈ":"t","ⱦ":"t","ꞇ":"t","ꜩ":"tz","ⓤ":"u","ｕ":"u","ù":"u","ú":"u","û":"u","ũ":"u","ṹ":"u","ū":"u","ṻ":"u","ŭ":"u","ü":"u","ǜ":"u","ǘ":"u","ǖ":"u","ǚ":"u","ủ":"u","ů":"u","ű":"u","ǔ":"u","ȕ":"u","ȗ":"u","ư":"u","ừ":"u","ứ":"u","ữ":"u","ử":"u","ự":"u","ụ":"u","ṳ":"u","ų":"u","ṷ":"u","ṵ":"u","ʉ":"u","ⓥ":"v","ｖ":"v","ṽ":"v","ṿ":"v","ʋ":"v","ꝟ":"v","ʌ":"v","ꝡ":"vy","ⓦ":"w","ｗ":"w","ẁ":"w","ẃ":"w","ŵ":"w","ẇ":"w","ẅ":"w","ẘ":"w","ẉ":"w","ⱳ":"w","ⓧ":"x","ｘ":"x","ẋ":"x","ẍ":"x","ⓨ":"y","ｙ":"y","ỳ":"y","ý":"y","ŷ":"y","ỹ":"y","ȳ":"y","ẏ":"y","ÿ":"y","ỷ":"y","ẙ":"y","ỵ":"y","ƴ":"y","ɏ":"y","ỿ":"y","ⓩ":"z","ｚ":"z","ź":"z","ẑ":"z","ż":"z","ž":"z","ẓ":"z","ẕ":"z","ƶ":"z","ȥ":"z","ɀ":"z","ⱬ":"z","ꝣ":"z","Ά":"Α","Έ":"Ε","Ή":"Η","Ί":"Ι","Ϊ":"Ι","Ό":"Ο","Ύ":"Υ","Ϋ":"Υ","Ώ":"Ω","ά":"α","έ":"ε","ή":"η","ί":"ι","ϊ":"ι","ΐ":"ι","ό":"ο","ύ":"υ","ϋ":"υ","ΰ":"υ","ω":"ω","ς":"σ"};return e.replace(/[^\u0000-\u007E]/g,(function(e){return t[e]||e}))};var c=e.fn.tokenize2;e.fn.tokenize2=function(i){var s=[];return this.filter("select").each((function(){var o=e(this),n=o.data("tokenize2"),r="object"==typeof i&&i;n||o.data("tokenize2",new t(this,r)),s.push(o.data("tokenize2"))})),s.length>1?s:s[0]},e.fn.tokenize2.Constructor=t,e.fn.tokenize2.noConflict=function(){return e.fn.tokenize2=c,this}}));var messengerTool=function(e){var t=$("body"),i=0,s=0,o=0,n=0,r=0,a=!0,l={},d=0,c=!1,h="",p="",u=null,m=null,g=!0,f=!1,v=0,k=10,y=!1,w=!1;function _(){$.get("/melis/MelisMessenger/MelisMessenger/getContactList",(function(e){var t="";e.data.length>0?(n!=e.totalContact||y)&&(U().empty(),n=e.totalContact,$.each(e,(function(e,i){for(var s=0;s<i.length;s++){var o=null!=i[s].contact_id?i[s].usrInfo[0].name:"("+translations.tr_melismessenger_tool_user_is_deleted+")";if(t="<div class='list-group-item selectContact' data-contact-id="+i[s].contact_id+" data-convo-id="+i[s].msgr_msg_id+">",t+="<span class='media'>",i[s].usrInfo.length>1)for(var n=0;n<i[s].usrInfo.length;n++)t+="<div class='media-msgrBody media-msgrBody-inline clearfix'>",t+="<label class='user-name'>"+(0==n?"":", ")+o+"<i class='icon-flag text-primary icon-2x'></i></label>",t+="</div>";else t+="<img src="+i[s].usrInfo[0].image+" alt='' width='35' class='thumb img-fluid rounded-circle float-left' />",t+="<div class='media-msgrBody media-msgrBody-inline clearfix'>",t+="<span class='"+(0!=i[s].usrInfo[0].isOnline&&null!=i[s].usrInfo[0].isOnline?"text-success float-right":"text-danger float-right")+"'><i class='fa fa-fw fa-circle'></i></span>",t+="<label class='user-name'>"+o+"<i class='icon-flag text-primary icon-2x'></i></label>",t+="<div id='messenger-msg-cont'><span id='messenger-msg'><small>"+i[s].usrInfo[0].message+"</small></span></div>",t+="</div>";t+="</span>",t+="</div>",U().append(t)}})),$("#contact-list div.selectContact:lt("+k+")").show(),M(i),y=!1):U().html('<p id="show-empty-contact">'+translations.tr_melismessenger_tool_contact_is_empty+"</p>")}))}function z(e,t,i,s){i=null==i?"append":i,s=null==s?0:s,0!=t?$.get("/melis/MelisMessenger/MelisMessenger/getConversation/"+t,{offset:s},(function(n){n.data.length>0?o!=n.total&&("append"==i&&I(),x(n.data,n.user_id,i),o=n.total,0!=S().find(".media").length&&(s<9?(e?setTimeout((function(){S().scrollTop(S()[0].scrollHeight)}),200):S().scrollTop(S()[0].scrollHeight),a=!0):S().scrollTop(l.offset().top-d)),y=!0,M(t)):S().html('<div id="convo-msg"><label>'+translations.tr_melismessenger_tool_empty_conversation+"</label></div>"),$("#chat-form").show()})):M(0,"")}function x(e,t,i){t=null==t?null:t;for(var s="",o=0;o<e.length;o++){var n=e[o].usr_image;if(e[o].msgr_msg_cont_sender_id==t||null==t)s='<div class="media innerAll contact-msg-block clearfix">\t<img src="'+n+'" alt="" class="thumb img-fluid rounded-circle float-right" width="40">\t<div class="media-msgrBody">\t\t<small class="date"><cite>'+e[o].msgr_msg_cont_date+'</cite></small>\t\t<div class="float-right chat-contact-msg my-msg">'+e[o].msgr_msg_cont_message+"</div>\t</div></div>";else s='<div class="media innerAll user-msg-block">\t<small class="chat-contact-name strong">'+(null!=e[o].usr_firstname&&null!=e[o].usr_lastname?e[o].usr_firstname+" "+e[o].usr_lastname:"("+translations.tr_melismessenger_tool_user_is_deleted+")")+'</small>\t<img src="'+n+'" alt="" class="thumb img-fluid rounded-circle float-left" width="40">\t<div class="media-msgrBody">\t\t<small class="date"><cite>'+e[o].msgr_msg_cont_date+'</cite></small>\t</div>\t<div class="chat-contact-msg">'+e[o].msgr_msg_cont_message+"</div></div>";"append"==i?S().append(s):S().prepend(s)}}function b(e){$.post("/melis/MelisMessenger/MelisMessenger/saveMessage",e,(function(e){e.success&&($("#sendMsgForm")[0].reset(),$("#chat-container > div.media").length<=0&&I(),x(e.data,null,"append"))})).done((function(){c=!1,S().animate({scrollTop:S()[0].scrollHeight},1e3)}))}function C(e){e=null==e||e,$.get("/melis/MelisMessenger/MelisMessenger/getNewMessage",(function(i){var s=0,o="";i.messages.length>0?(t.find("#melis-messenger-messages").removeClass("empty-notif"),t.find("#melis-messenger-messages").prev().find(".badge").removeClass("hidden"),$.each(i,(function(e,t){$.each(t,(function(e,t){o+='<li id="'+t.msgr_msg_cont_id+'" data-convo-id="'+t.msgr_msg_id+'">\t<img src="'+t.usr_image+'" alt="" width="45" class="thumb img-fluid rounded-circle float-left" />    <span class="media-msgrBody media-msgrBody-inline">        <span class="date-and-time"><small>'+t.msgr_msg_cont_date+'</small></span><br/>        <label class="user-name"><span>'+t.usr_firstname+" "+t.usr_lastname+'</span></label>    </span> \t <div id="messenger-msg-cont"><span id="messenger-msg"><small>'+t.msgr_msg_cont_message+"</small></span></div></li>",s++}))})),r!=i.messages.length&&i.messages.length>0&&(r=i.messages.length,!g&&e&&($("#melis-messenger-messages").slideToggle(),setTimeout((function(){$("#melis-messenger-messages").removeAttr("style")}),3e3)))):(r=0,o+='<li class="empty-notif-li">\t<div class="media">   \t <span>'+translations.tr_melismessenger_tool_no_message_notification+"</span> </div></li>",t.find("#melis-messenger-messages").addClass("empty-notif"),t.find("#melis-messenger-messages").prev().find(".badge").addClass("hidden")),t.find("#melis-messenger-messages").empty().append(o),t.find("#id_melismessenger_tool_header_messages.dropdown.notification a span.badge").text(s)}))}function M(e,t){t=null==t?"":t;var i="",s=!1;0!=e&&""==t?($("#contact-list .selectContact").each((function(){$("#contact-list .selectContact").removeClass("active");var i=$(this),o=i.attr("data-convo-id");if(e==o)return t=i.find("label.user-name").text(),i.addClass("active"),s=!0,!1})),i=translations.tr_melismessenger_tool_conversation_with+" <b>"+t+"</b>"):(s=!0,i=0==e&&""==t?translations.tr_melismessenger_tool_select_contact_todisplay_conversation:translations.tr_melismessenger_tool_conversation_with+" <b>"+t+"</b>"),s&&$("#convo-header").empty().append('<div id="convo-header-content">   <div><label>'+i+"</label></div></div>")}function A(){w&&$("#selectUsers").tokenize2({searchHighlight:!0,placeholder:translations.tr_melismessenger_tool_select_contact,displayNoResultsMessage:!0,tokensMaxItems:1,dropdownMaxItems:5})}function I(){0!=i&&S().empty()}function O(){$("#id_melismessenger_tool").is(":visible")&&(s=0,z(!1,i),_()),C()}function T(e){if(e=null==e?0:e,$("#id_meliscore_user_profile").is(":visible"))D();else{var t=!1,s=$("#user-name-link").html().trim();melisHelper.tabOpen(s,"fa-user","id_meliscore_user_profile","meliscore_user_profile",null,null,(function(){D(),t=!0})),t||(D(),t=!1)}0!=e&&(o=0,i=e,a=!1,I(),M(i),z(!0,i),$.post("/melis/MelisMessenger/MelisMessenger/updateMessageStatus",{id:i},(function(){C()})))}function D(){var e=$("#id_meliscore_user_profile_tabs"),t=e.find(".widget .widget-head ul li");$.each(t,(function(){var e=$(this),t=e.find("a").attr("href");e.removeClass("active"),"#id_melismessenger_tool"==t&&e.addClass("active")}));var i=e.find(".user-profile-tab-content .tab-content div.tab-pane");$.each(i,(function(){var e=$(this),t=e.attr("id");e.removeClass("active"),"id_melismessenger_tool"==t&&e.addClass("active")}))}function S(){return $("#chat-container")}function U(){return $("#contact-list")}return $.get("/melis/MelisMessenger/MelisMessenger/getUserRightsForMessenger",(function(t){1==t.isAccessible&&(w=!0,$.get("/melis/MelisMessenger/MelisMessenger/getMsgTimeInterval",(function(t){C(),m=""!=t.interval?t.interval:Number(6e4),u=e.setInterval(O,m)})),setTimeout((function(){g=!1}),3e3))})),t.on("click","#melis-messenger-tab",(function(){$("#id_melismessenger_tool").not(":visible")&&setTimeout((function(){0!=S().find(".media").length&&(S().scrollTop(S()[0].scrollHeight),a=!0)}),500)})),t.on("submit","#sendMsgForm",(function(e){$("#msgr_msg_id").val(i);var t=$("#msgr_msg_cont_message").val(),s=$("#sendMsgForm").serialize();""!=t&&null!=t&&function(e){if(c){var t={};t.mbrids=h,$.post("/melis/MelisMessenger/MelisMessenger/createConversation",$.param(t),(function(e){e.conversationId>0&&""!=e.conversationId&&null!=e.conversationId&&(i=e.conversationId,p="",h=0,$("#msgr_msg_id").val(i),I(),$("#chat-form").show(),U().empty(),b($("#sendMsgForm").serialize()),$("#compose-convo").prop("disabled",!1),setTimeout((function(){_()}),500))}))}else 0!=i&&b(e);$("#selectUsers").tokenize2().trigger("tokenize:clear")}(s),e.preventDefault()})),t.on("click",".selectContact",(function(e){var t=$(this);i!=t.attr("data-convo-id")&&(o=0,a=!1,i=t.attr("data-convo-id"),I(),M(i),s=0,z(!1,i),$.post("/melis/MelisMessenger/MelisMessenger/updateMessageStatus",{id:i},(function(){C(!1)}))),e.preventDefault()})),t.on("click","#compose-convo",(function(e){var s=$(this);if(""!=h){if($("#contact-list div.selectContact").each((function(){var e=$(this);$("#contact-list div.selectContact").removeClass("active");var t=e.attr("data-contact-id");if(h==t){i=e.attr("data-convo-id"),I(),e.parent().prepend(this),e.show();var s=e.find("label.user-name").text();return $("#convo-header").empty().append('<div id="convo-header-content"><div><label>'+translations.tr_melismessenger_tool_conversation_with+" <b>"+s+"</b></label></div></div>"),f=!0,o=0,z(!1,i),p="",h=0,!1}})),!f){var n="";t.find("#show-empty-contact").remove(),c=!0,n+="<div style='display: block' class='list-group-item active'>",n+="<span id='remove-new-convo' class='float-right btn btn-sm'>x</span>",n+="<span class='media'>",n+="<span class='media-msgrBody media-msgrBody-inline'>",n+="<label>"+translations.tr_melismessenger_tool_new_message+" <strong>"+p+"</strong></label>",n+="</span>",n+="</span>",n+="</a>",v=i,I(),i=0,M(0,p),U().prepend(n),s.prop("disabled",!0)}f=!1}e.preventDefault()})),t.on("click","#remove-new-convo",(function(){$(this).parent().remove(),$("#selectUsers").tokenize2().trigger("tokenize:clear"),$("#compose-convo").prop("disabled",!1),c=!1,p="",h=0,0!=v?(s=0,z(!1,i=v)):(n<=0&&($("#convo-header").empty(),U().html('<p id="show-empty-contact">'+translations.tr_melismessenger_tool_contact_is_empty+"</p>")),M(i,p))})),t.on("tokenize:tokens:add","#selectUsers",(function(e,t,i){p=i,h=t})),t.on("click",".refresh-chat",(function(e){a=!1,s=0,melisHelper.zoneReload("id_melismessenger_tool_content","melismessenger_tool_content"),e.preventDefault()})),t.on("click",".refresh-contacts",(function(e){melisHelper.zoneReload("id_melismessenger_tool_contact","melismessenger_tool_contact"),e.preventDefault()})),t.on("chat-scroll","#chat-container",(function(){var t=$(this).scrollTop();e.clearInterval(u),t<=0&&a&&o>10&&(o>Number(s+9)?0!==S().find(".media").length&&(l=$("#chat-container .media:first"),d=l.offset().top-S().scrollTop(),s=Number(s+9),o=0,z(!1,i,"prepend",s)):(S().find("#load-more-msg").remove(),S().prepend('<div id="load-more-msg"><p>'+translations.tr_melismessenger_tool_no_more_msg_to_load+"</p></div>"))),clearTimeout($.data(this,"timer")),$.data(this,"timer",setTimeout((function(){u=e.setInterval(O,m)}),2e3))})),t.on("contact-scroll","#contact-list",(function(){var e=$(this);if(e.scrollTop()+e.innerHeight()>=e[0].scrollHeight){var t=$("#contact-list div.selectContact").size();k=k+10<=t?k+10:t,$("#contact-list div.selectContact:lt("+k+")").show()}})),t.on("click","#id_melismessenger_tool_header_messages a.dropdown-toggle",(function(){T(),$("#melis-messenger-messages li").hasClass("empty-notif-li")&&$(e).width()<768&&($("#id_meliscore_leftmenu").removeAttr("style"),$("#id_meliscore_footer").removeClass("slide-left"),$("#newplugin-cont").toggleClass("show-menu"),$body.removeClass("sidebar-mini"))})),t.on("click","#melis-messenger-messages li",(function(){s=0;$(this);T($(this).attr("data-convo-id")),$(e).width()<768&&($("#id_meliscore_leftmenu").removeAttr("style"),$("#id_meliscore_footer").removeClass("slide-left"),$("#newplugin-cont").toggleClass("show-menu"),$body.removeClass("sidebar-mini"))})),{initTokenizePlugin:A,loadContact:function(){var e;w&&(n=0,U().empty(),A(),_(),(e=U()).on("scroll",(function(){e.trigger("contact-scroll")})))},loadMessages:function(){var e;w&&(o=0,s=0,z(!1,i),(e=S()).on("scroll",(function(){e.trigger("chat-scroll")})))}}}(window);
