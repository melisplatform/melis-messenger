var messengerTool = (function(window){
	
	var msgrBody = $('body');
	var messenger = $('#melis-messenger-messages');
	var msgrConversationId = "";
	var msgrMsgOffset = 0;
	var msgrInboxOffset = 0;
	var msgrTotalMsg = 0;
	var msgrTotalInboxList = 0;
	var msgrDetectScroll = true;
	var msgrLastMsg = {};
	var msgrCurOffset = 0;
	var msgrIsNewConvo = false;
	var msgrSelectedContactId = "";
	var msgrSelectedContactname = "";
	var msgrContactFound = false;
	var msgrIntervalName = null;
	var msgrTimeInterval = null;
	
	setMsgrTimeInterval();
    /**
     * Send Message
     */
    msgrBody.on('submit', '#sendMsgForm', function(e){
		//set the conversation
		$('#msgr_msg_id').val(msgrConversationId);
		//save the message
		saveMessage($(this).serialize());
        e.preventDefault();
    });
    
    /**
     * Display conversation after the user select a contact
     */
    msgrBody.on('click' , '.selectContact', function(e){
    	//check if we select the same contact, so that we will not going to request again
    	if(msgrConversationId != $(this).attr('data-convo-id'))
    	{
    		//specify if we allow to detect scroll
    		msgrDetectScroll = false;
	        //store the selected conversation id
	    	msgrConversationId=$(this).attr('data-convo-id');
	    	//empty the container
	    	emptyChatContainer();
	        //display select contact name
	    	setActiveAndGetName(msgrConversationId);
	    	//set msgrMsgOffset to 0 as starting point of query
	    	msgrMsgOffset = 0;
	    	//display conversation
	    	getConversation(msgrConversationId);
    	}
        e.preventDefault();
    });
    
    /**
     * Create a conversation after the user selecte a contact
     */
    msgrBody.on('click', '#compose-convo', function(e){
    	msgrSelectedContactId = $('#selectUsers').data('tokenize2').toArray().join(',');
    	//if user select a contact
    	if(msgrSelectedContactId != ""){
    		/**
    		 * we must loop through each contact in the inbox
    		 * to find if the user selected contact is already
    		 * in the inbox
    		 */
    		$('#inbox-list a').each(function(){
	    		$('#inbox-list a').removeClass('active');
	    		//get the contact id
	    		var id = $(this).attr('data-contact-id');
	    		//check if contact already in the inbox
	    		if(msgrSelectedContactId == id){
	    			msgrConversationId = $(this).attr('data-convo-id');
	    			//set offset to zero
	    	    	msgrInboxOffset = 0;
	    			//empty the container
	    			emptyChatContainer();
	    			
	    			//if the contact is not yet in the top, we must move it to the top of the inbox list
	    			$(this).parent().prepend(this);
	    			var contactName = $(this).find('label.user-name').text();
	    			//display the name
	    	    	$('#convo-header').empty().append(
	    								  		'<div id="convo-header-content">'+
	    								  			'<div><label>'+translations.tr_melismessenger_tool_conversation_with+' <b>'+contactName+'</b></label></div>'+
	    								  		'</div>'
	    								  	);
	    	    	msgrContactFound = true;
	    			getConversation(msgrConversationId);
	    			return false;
	    		}
	    	});
    		//create new conversation with user selected contact
    		if(!msgrContactFound){
    			msgrIsNewConvo = true;
    			var html = "";
    			html = 	"<a href='javascript:void(0)' class='list-group-item'>";
    			html += "<span class='media'>";
    				html += "<span class='media-msgrBody media-msgrBody-inline'>";
    					html += "<label>"+translations.tr_melismessenger_tool_new_message+" <b>"+msgrSelectedContactname+"</b></label>";
    				html +="</span>";
    			html +="</span>";
    			html +="</a>";
    			//empty the container
    			emptyChatContainer();
    			//get the new selected contact name
    			setActiveAndGetName("", msgrSelectedContactname);
    			//prepend the contact
    			$('#inbox-list').prepend(html);
        	}
    	}
    	e.preventDefault();
    });	
    
    //get the name of the selected contact
    msgrBody.on('tokenize:tokens:add','#selectUsers', function(e, value, text){
    	msgrSelectedContactname = text;
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
    
    //refresh inbox / contacts
    msgrBody.on('click', '.refresh-inbox', function(e){
    	//set conversation id to empty
    	msgrConversationId = "";
    	//set offset to zero
    	msgrInboxOffset = 0;
    	msgrMsgOffset = 0;
    	//reload inbox
    	melisHelper.zoneReload("id_melismessenger_tool_inbox", "melismessenger_tool_inbox");
    	e.preventDefault();
    });
    
    /**
     * Show previous messages when the user scroll up
     */
    msgrBody.on('chat-scroll','#chat-container', function(){
    	var scroll = $(this).scrollTop();
    	//remove the time interval if the user is scrolling to prevent from refeshing the conversation
    	window.clearInterval(msgrIntervalName);
    	//check if scroll is on top
    	if(scroll <= 0 && msgrDetectScroll){
    		/*
    		 * check if total messages is greater than 10
    		 * if less than 10, do not call ajax request anymore
    		 */
    		if(msgrTotalMsg > 10){
	    		if(msgrTotalMsg > Number(msgrMsgOffset + 9)){
	    			//check if our chat container is not empty
	    			if($('#chat-container').find('.media').length != 0){
		    			//we must get the position of the first element in the container which is the last message that we prepend
		    			msgrLastMsg = $('#chat-container .media:first');
		    			//store the current offset
		    			msgrCurOffset = msgrLastMsg.offset().top - $('#chat-container').scrollTop();
	    			}
	        		msgrMsgOffset = Number(msgrMsgOffset + 9);
	        		getConversation(msgrConversationId, "prepend", msgrMsgOffset);
	    		}else{
	    			//remove load-more-msg notification
	    			$('#chat-container').find('#load-more-msg').remove();
	    			//show message notification if all messages is loaded already
	    			$('#chat-container').prepend('<div id="load-more-msg"><p>'+translations.tr_melismessenger_tool_no_more_msg_to_load+'</p></div>');
	    		}
    		}
    	}
    	//if the user stop scrolling for over 5 seconds, we resume the interval
    	clearTimeout($.data(this, 'timer'));
		$.data(this, 'timer', setTimeout(function() {
			msgrIntervalName = window.setInterval(runMessengerInterval, msgrTimeInterval);
	  	}, 2000));	
    });
    
    /**
     * Show more data in the inbox on scroll down
     */
    msgrBody.on('inbox-scroll', '#inbox-list', function(){
    	var scroll = $(this).scrollTop();
    	if(scroll + $(this).innerHeight() >= $(this)[0].scrollHeight){
    		if(msgrTotalInboxList > 10){
    			if(msgrTotalInboxList > Number(msgrInboxOffset + 9)){
    				msgrInboxOffset = Number(msgrInboxOffset + 9);
	        		getInboxList();
    			}
    		}
    	}
    });
    
	/**
	* Function to display the inbox
	*/
	function getInboxList(){
		$.get('/melis/MelisMessenger/MelisMessenger/getInboxList',{'offset': msgrInboxOffset}, function(data){
	        var html = "";
	        if(data.data.length > 0){
	        	//store total number of inbox data
	        	msgrTotalInboxList = data.totalInbox;
	        	//process the data
		        $.each(data, function(key, val){
					for(var i = 0; i < val.length; i++){
						html = 	"<a href='javascript:void(0)' class='list-group-item selectContact' data-contact-id="+val[i]['contact_id']+" data-convo-id="+val[i]['msgr_msg_id']+">";
						html += "<span class='media'>";
						//check if conversation has many members
						if(val[i].usrInfo.length > 1){
							//loop to each user(preparation for group messages)
							for(var x = 0; x < val[i].usrInfo.length; x++){
								html += "<span class='media-msgrBody media-msgrBody-inline'>";
								html += "<label class='user-name'>"+((x == 0) ? '' : ', ')+val[i].usrInfo[x]['name']+"<i class='icon-flag text-primary icon-2x'></i></label>";
								html += "</span>";
							}
						}else{
							html += "<img src="+val[i].usrInfo[0]['image']+" alt='' width='35' class='thumb img-responsive img-circle pull-left' />";
							html += "<span class='media-msgrBody media-msgrBody-inline'>";
								html += "<span class='" + (val[i].usrInfo[0]['isOnline'] ? 'label label-success pull-right' : 'label label-danger pull-right') + "'>" + (val[i].usrInfo[0]['isOnline'] ? 'Online' : 'Offline') +"</span>";
								html += "<label class='user-name'>"+val[i].usrInfo[0]['name']+"<i class='icon-flag text-primary icon-2x'></i></label>";
								html += "<br/><span id='messenger-msg'><small>"+val[i].usrInfo[0]['message']+"</small></span>";
							html +="</span>";
						}
						html +="</span>";
	    				html +="</a>";
	    				$('#inbox-list').append(html);
					}
		        });
		        
	    		/**
	    		 * if the conversation id is empty,
	    		 * we need to get the first user in the inbox
	    		 * and display their conversation
	    		 */
	    		if(msgrConversationId == ""){
	    			msgrMsgOffset = 0;
    				msgrConversationId = $('#inbox-list').find('a:first').attr('data-convo-id');
	    			setActiveAndGetName(msgrConversationId);
	    			emptyChatContainer();
	    			getConversation(msgrConversationId, "append");
	    		}else{
	    			setActiveAndGetName(msgrConversationId);
	    		}
	        }else{
	        	(msgrInboxOffset == 0) ? $('#inbox-list').html('<p>'+translations.tr_melismessenger_tool_inbox_is_empty+'</p>') : "" ;
	        }
    	});
	}
	//get and display the conversation
	function getConversation(msgrConversationId, type = "append", msgrMsgOffset = 0){
		if(msgrConversationId != ""){
    		//get the messages
    		$.get('/melis/MelisMessenger/MelisMessenger/getConversation/'+msgrConversationId,{'offset': msgrMsgOffset}, function(data){
				 if(data.data.length > 0){
	            	//display data
					displayConversation(data.data, data.user_id, type);
					//store total number of message
					msgrTotalMsg = data.total;
		        	//position the scrollbar
		            if(msgrMsgOffset < 9){
				       	$('#chat-container').animate({
				       		scrollTop: $('#chat-container')[0].scrollHeight},
				       	1000);
				       	msgrDetectScroll = true;
		            }else{
		            	if($('#chat-container').find('.media').length != 0){
		            		//re position the scroll bar
		            		$('#chat-container').scrollTop(msgrLastMsg.offset().top - msgrCurOffset);
		            	}
		            }
				 }else{
					 $('#chat-container').html('<div id="convo-msg"><label>'+translations.tr_melismessenger_tool_empty_conversation+'</label></div>');
				 }
				 setActiveAndGetName(msgrConversationId);
				//show the form
		        $('#chat-form').show();
	        });
    	}
	}
	/**
	 *  Get and display the conversation of the user and its selected contact
	*/
	 function displayConversation(data, id = null, type){
		var html = "";
		//process the data
        for(var i = 0; i < data.length; i++){
        	var image = data[i].usr_image;
        	//check if message came from the user
            if(data[i].msgr_msg_cont_sender_id == id || id == null){
            	html = 
	                    '<div class="media innerAll right">'+
	                    '	<img src="'+image+'" alt="" class="thumb img-responsive img-circle pull-right" width="40">'+ 
	                    '	<div class="media-msgrBody">'+
	                    '		<small class="date"><cite>'+data[i].msgr_msg_cont_date+'</cite></small>'+
	                    '		<p class="pull-right my-msg">'+data[i].msgr_msg_cont_message+' &nbsp;&nbsp;</p>'+
	                    '	</div>'+
	                    '</div>'
                    ;
            }else{
            	var name = (data[i].usr_firstname != "" || data[i].usr_lastname != "") ? data[i].usr_firstname+" "+data[i].usr_lastname : "This user has been deleted." ;
            	html = 
		                '<div class="media innerAll">'+
		                '	<small class="author"><a href="#" title="" class="strong">'+name+'</a></small>'+
		                '	<img src="'+image+'" alt="" class="thumb img-responsive img-circle pull-left" width="40">'+
		                '	<div class="media-msgrBody">'+
		                '		<small class="date"><cite>'+data[i].msgr_msg_cont_date+'</cite></small>'+
		                '		<p>'+data[i].msgr_msg_cont_message+'</p>'+
		                '	</div>'+
		                '</div>'
	                ;
            }
            (type == "append") ? $('#chat-container').append(html) : $('#chat-container').prepend(html);
        }
	}
	/**
     * Function to send message
     * @param query string
     */
	function saveMessage(datas){
		if(msgrIsNewConvo){
			var obj = {};
			//create a new conversation with the selected contact
			obj.mbrids = msgrSelectedContactId;
	    	$.post('/melis/MelisMessenger/MelisMessenger/createConversation',$.param(obj), function(data){
	    		if(data.conversationId > 0 && data.conversationId != "" && data.conversationId != null){
	    			//set offset to zero
	    	    	msgrInboxOffset = 0;
	    			//store the conversation id to use later
	    			msgrConversationId = data.conversationId;
	    			//set the conversation
	    			$('#msgr_msg_id').val(msgrConversationId);
	    			//empty the container
	    			emptyChatContainer();
	    			//show the form
	    	        $('#chat-form').show();
	    	        //empty container
	    	        $('#inbox-list').empty();
	    	        //execute the saving of conversation
	    	        executeSave($('#sendMsgForm').serialize());
	    	        setTimeout(function(){
	    	        	//reload the inbox list
		    	        getInboxList();
	    	        }, 500);
	    		}
	    	});
		}else{
			executeSave(datas);
		}
	}
	/**
	 * Execute the saving of message
	 */
	function executeSave(datas){
		$.post('/melis/MelisMessenger/MelisMessenger/saveMessage', datas, function(data){
            if(data.status == 1){
            	$('#sendMsgForm')[0].reset();
            	//check if conversation is empty
            	if($('#chat-container > div.media').length <= 0){
            		emptyChatContainer();
            	}
	            displayConversation(data.data, null, "append");
            }
        }).done(function(){
        	//make the msgrIsNewConvo
        	msgrIsNewConvo = false;
        	//position the scrollbar
        	$('#chat-container').animate({
        	    scrollTop: $('#chat-container')[0].scrollHeight},
        	1000);
        });
	}
	/**
	 * Function to get new message to notify the user
	 */
	function getNewMessage(){
		$.get('/melis/MelisMessenger/MelisMessenger/getNewMessage', function(data){
			if(data.messages.length) {
				messenger.removeClass("empty-notif");
                msgrBody.find("#melis-messenger-messages").prev().find(".badge").removeClass("hidden");
                var ctr = 0;
                msgrBody.find("#melis-messenger-messages").empty();
                var tempData = '';
                $.each(data, function(index, element) {
                    $.each(element, function(index, msg){
                        tempData += '' +
                            '<li>' +
                            '	<img src="'+(msg.usr_image)+'" alt="" width="45" class="thumb img-responsive img-circle pull-left" />' +
                            '    <span class="media-msgrBody media-msgrBody-inline">' +
                            '        <span class="pull-right"><small>'+(msg.msgr_msg_cont_date)+'</small></span> '+
                            '        <label class="user-name">'+(msg.usr_firstname+" "+msg.usr_lastname)+'<i class="icon-flag text-primary icon-2x"></i></label>' +
                            '    </span> '+
                            '	 <span id="messenger-msg"><small>'+(msg.msgr_msg_cont_message)+'</small></span>' +
                            '</li>';
                        ctr++;
                    });
                });
                msgrBody.find("#melis-messenger-messages").append(tempData);
                msgrBody.find("#id_melismessenger_tool_header_messages.dropdown.notification a span.badge").text(ctr);
            }
		});
	}
	/**
     * Function to display the name of selected contact on the conversation content
     */
	function setActiveAndGetName(msgrConversationId, name = ""){
		var contactName = "";
		if(msgrConversationId != "" && name == ""){
	    	//loop through each contact to get the contact name
	    	$('#inbox-list a').each(function(){
	    		$('#inbox-list a').removeClass('active');
	    		//get the conversation id
	    		var id = $(this).attr('data-convo-id');
	    		//if the msgrConversationId is equal to the conversation id that we select, end the search and get the name
	    		if(msgrConversationId == id){
	    			contactName = $(this).find('label.user-name').text();
	    			$(this).addClass('active');
	    			return false;
	    		}
	    	});
		}else{
			contactName = name;
		}
    	//display the name
    	$('#convo-header').empty().append(
							  		'<div id="convo-header-content">'+
							  			'<div><label>'+translations.tr_melismessenger_tool_conversation_with+' <b>'+contactName+'</b></label></div>'+
							  		'</div>'
							  	);
	}
	//function to initialize tokenize plugin
	function initTokenizePlugin(){
		$('#selectUsers').tokenize2({
			searchHighlight: true,
			placeholder: translations.tr_melismessenger_tool_select_contact,
			displayNoResultsMessage: true,
			tokensMaxItems: 1,
			dropdownMaxItems: 5,
		});
	}
	//trigger the scroll event
	function triggerChatScrollEvent(el){
		el.on("scroll", function(){
            el.trigger("chat-scroll");
        });
	}
	function triggerInboxScrollEvent(el){
		el.on("scroll", function(){
            el.trigger("inbox-scroll");
        });
	}
	//empty the container
	function emptyChatContainer(){
		//empty container
		if(msgrConversationId != ""){
			$('#chat-container').empty();
		}
	}
	function setMsgrTimeInterval(){
		$.get('/melis/MelisMessenger/MelisMessenger/getMsgTimeInterval', function(data){
			getNewMessage();
			if(data.interval != ""){
				msgrTimeInterval = data.interval;
			}else{
				msgrTimeInterval = Number(1000 * 60); //default time interval
			}
			//refresh conversation depending on the time interval
			msgrIntervalName = window.setInterval(runMessengerInterval, msgrTimeInterval);
		});
	}
	function runMessengerInterval(){
		//check if messenger tool is selected
    	if($('#id_melismessenger_tool').is(':visible')){
    		emptyChatContainer();
    		getConversation(msgrConversationId);
    	}
    	getNewMessage();
	}
	//function to use on first load and reloading the conversation
	function loadMessages(){
		emptyChatContainer();
		getConversation(msgrConversationId);
		triggerChatScrollEvent($('#chat-container'));
	}
	//function to use on first load and reloading the inbox list
	function loadInbox(){
		//set offset to zero
    	msgrInboxOffset = 0;
    	msgrMsgOffset = 0;
    	
		triggerInboxScrollEvent($('#inbox-list'));
		initTokenizePlugin();
		getInboxList();
	}
	
	return{
        // key - access name outside                                 // value - name of function above
		initTokenizePlugin		:	initTokenizePlugin,
		loadInbox				:	loadInbox,
		loadMessages			:	loadMessages,			
    };
	
})(window);
