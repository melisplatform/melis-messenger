var messengerTool = (function(window){
	//messenger local variables
	var msgrBody = $('body');
	var msgrConversationId = 0; //conversation id
	var msgrMsgOffset = 0; //message offset - starts 0 to retrieve data in the database
	var msgrTotalMsg = 0; //total number of conversation message retrieve
	var msgrTotalInboxList = 0; //total number of inbox retrieve
	var msgrTotalNotificationMsg = 0; //total number of notification message
	var msgrDetectScroll = true; //specify if detecting scroll is allowed in the chat container
	var msgrLastMsg = {}; //get the last message on the container to use as a marker when we scroll to get more message
	var msgrCurOffset = 0; //get the chat container offset so that we can position the chat container scroll correctly if we load more
	var msgrIsNewConvo = false; //use to detect if we create a new conversation
	var msgrSelectedContactId = ""; //newly selected contact id
	var msgrSelectedContactname = ""; //newly selected contact name
	var msgrIntervalName = null; //store the interval name
	var msgrTimeInterval = null; //specify the time interval of refreshing the chat, inbox and message notification
	var msgrFirstLoad = true; //detect for first load
    var msgrContactFound = false; //use to detect if we the selected is already in the inbox
    var tempConversationId = 0; //store the conversation id temporarily
	var msgrInboxDefaultDisplayNo = 10; //default number of inbox to display
    var msgrLoadTheInbox = false; //used to detect when there is new message and need the inbox to load
	
	//set the interval for checking of new message
	setMsgrTimeInterval();
	//detect if first load
	$(window).load(function(){
		setTimeout(function(){
			//set the msgrFirstLoad to false after 3 seconds
			msgrFirstLoad = false;
		}, 3000);
	});

	//send message
	msgrBody.on('submit','#sendMsgForm', function(e){
        $('#msgr_msg_id').val(msgrConversationId);
        var msg = $('#_msgr_msg_cont_message').val();
        var qString = $('#sendMsgForm').serialize();
        if(msg != "" && msg != undefined) {
            saveMessage(qString);
        }
        e.preventDefault();
    });

    /**
     * Display conversation after the user select a contact
     */
    msgrBody.on('click' , '.selectContact', function(e){
    	//check if we select the same contact, so that we will not going to request again
    	if(msgrConversationId != $(this).attr('data-convo-id'))
    	{
            //set total number of message to 0
            msgrTotalMsg = 0;
    		//specify if we allow to detect scroll
    		msgrDetectScroll = false;
	        //store the selected conversation id
	    	msgrConversationId = $(this).attr('data-convo-id');
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
    	if(msgrSelectedContactId != ""){
    		/**
    		 * we must loop through each contact in the inbox
    		 * to find if the user selected contact is already
    		 * in the inbox
    		 */
    		$('#inbox-list div.selectContact').each(function(){
	    		$('#inbox-list div.selectContact').removeClass('active');
	    		//get the contact id
	    		var id = $(this).attr('data-contact-id');
	    		//check if contact already in the inbox
	    		if(msgrSelectedContactId == id){
	    			msgrConversationId = $(this).attr('data-convo-id');
	    			//empty the container
	    			emptyChatContainer();
	    			
	    			//if the contact is not yet in the top, we must move it to the top of the inbox list
	    			$(this).parent().prepend(this);
	    			$(this).show();
	    			var contactName = $(this).find('label.user-name').text();
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
    		if(!msgrContactFound){
                var html = "";
    			msgrBody.find('#show-empty-inbox').remove();
    			msgrIsNewConvo = true;
                //construct html data for the newly selected contact
    			html += "<div style='display: block' class='list-group-item active'>";
    			html +=	"<span id='remove-new-convo' class='pull-right btn btn-sm'>x</span>"
    			html += "<span class='media'>";
    				html += "<span class='media-msgrBody media-msgrBody-inline'>";
    					html += "<label>"+translations.tr_melismessenger_tool_new_message+" <b>"+msgrSelectedContactname+"</b></label>";
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
                getInboxListContainer().prepend(html);
    			//disable the button create
    			$(this).prop('disabled', true);
        	}
        	msgrContactFound = false;
    	}
    	e.preventDefault();
    });

    //remove newly created conversation and display the previous conversation
	msgrBody.on('click', '#remove-new-convo', function(){
		$(this).parent().remove();
        $('#selectUsers').tokenize2().trigger('tokenize:clear');
        $('#compose-convo').prop('disabled', false);

        msgrIsNewConvo = false;
        msgrSelectedContactname = "";
        msgrSelectedContactId = 0;

		if(tempConversationId != 0) {//display the previous conversation
            msgrMsgOffset = 0;
            msgrConversationId = tempConversationId;
            getConversation(false, msgrConversationId);
        }else{
		    if(msgrTotalInboxList <= 0) {
                $('#convo-header').empty();
                getInboxListContainer().html('<p id="show-empty-inbox">' + translations.tr_melismessenger_tool_inbox_is_empty + '</p>');
            }else{
		        setConversationHeader(msgrConversationId, msgrSelectedContactname);
            }
		}
	});
    
    //get the name and id of the selected contact
    msgrBody.on('tokenize:tokens:add','#selectUsers', function(e, value, text){
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
    
    //refresh inbox / contacts
    msgrBody.on('click', '.refresh-inbox', function(e){
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
	    			if(getChatContainer().find('.media').length !== 0){
		    			//we must get the position of the first element in the container which is the last message that we prepend
		    			msgrLastMsg = $('#chat-container .media:first');
		    			//store the current offset
		    			msgrCurOffset = msgrLastMsg.offset().top - getChatContainer().scrollTop();
                        msgrMsgOffset = Number(msgrMsgOffset + 9);
                        msgrTotalMsg = 0;
                        getConversation(false, msgrConversationId, "prepend", msgrMsgOffset);
	    			}
	    		}else{
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
     * Show more data in the inbox on scroll down
     */
    msgrBody.on('inbox-scroll', '#inbox-list', function(){
    	var scroll = $(this).scrollTop();
    	//check if scroll bar is in the bottom
    	if(scroll + $(this).innerHeight() >= $(this)[0].scrollHeight){
    		//show additional inbox list on scroll
            var inbox_size = $("#inbox-list div.selectContact").size();
            msgrInboxDefaultDisplayNo = (msgrInboxDefaultDisplayNo + 10 <= inbox_size) ? msgrInboxDefaultDisplayNo + 10 : inbox_size;
            $('#inbox-list div.selectContact:lt('+msgrInboxDefaultDisplayNo+')').show();
    	}
    });

    //show the messenger tab when the header messenger icon is click
    msgrBody.on('click', '#id_melismessenger_tool_header_messages a.dropdown-toggle', function(){
        if($('#id_melismessenger_tool').not(':visible')) {
            openMessengerTab();
        }
    });

    /*
     * show the message when the user click the msg on the notification
     * and update the message status to read
     */
    msgrBody.on('click', '#melis-messenger-messages li', function(){
        msgrMsgOffset = 0;
        var _temp_convo_id = $(this).attr('data-convo-id');
    	$.when(openMessengerTab()).then(function(){
            if(_temp_convo_id != undefined) {
                msgrTotalMsg = 0;
                //set conversation id
                msgrConversationId = _temp_convo_id;
                //specify if we allow to detect scroll
                msgrDetectScroll = false;
                //empty the container
                emptyChatContainer();
                //display select contact name
                setConversationHeader(msgrConversationId);
                //display conversation
                getConversation(false, msgrConversationId);

                //update the message status and refresh the message notification
                $.post('/melis/MelisMessenger/MelisMessenger/updateMessageStatus', {"id": msgrConversationId}, function () {
                    getNewMessage();
                });
            }
        });
    });
    
	/**
	* Function to display the inbox
	*/
	function getInboxList(){
		$.get('/melis/MelisMessenger/MelisMessenger/getInboxList', function(data){
	        var html = "";
	        if(data.data.length > 0){
                //check for new message in the inbox
	        	if(msgrTotalInboxList != data.totalInbox || msgrLoadTheInbox) {
                    getInboxListContainer().empty();
                    //store total number of inbox data
                    msgrTotalInboxList = data.totalInbox;
                    //process the data
                    $.each(data, function (key, val) {
                        for (var i = 0; i < val.length; i++) {
                            var name = (val[i]['contact_id'] != null) ? val[i].usrInfo[0]['name'] : "(This user has beed deleted.)";
                            html = "<div class='list-group-item selectContact' data-contact-id=" + val[i]['contact_id'] + " data-convo-id=" + val[i]['msgr_msg_id'] + ">";
                            html += "<span class='media'>";
                            //check if conversation has many members
                            if (val[i].usrInfo.length > 1) {
                                //loop to each user(preparation for group messages)
                                for (var x = 0; x < val[i].usrInfo.length; x++) {
                                    html += "<span class='media-msgrBody media-msgrBody-inline'>";
                                    html += "<label class='user-name'>" + ((x == 0) ? '' : ', ') + (name) + "<i class='icon-flag text-primary icon-2x'></i></label>";
                                    html += "</span>";
                                }
                            } else {
                                html += "<img src=" + (val[i].usrInfo[0]['image']) + " alt='' width='35' class='thumb img-responsive img-circle pull-left' />";
                                html += "<span class='media-msgrBody media-msgrBody-inline'>";
                                html += "<span class='" + ((val[i].usrInfo[0]['isOnline'] != 0 && val[i].usrInfo[0]['isOnline'] != null) ? 'text-success pull-right' : 'text-danger pull-right') + "'><i class='fa fa-fw fa-circle'></i></span>";
                                html += "<label class='user-name'>" + (name) + "<i class='icon-flag text-primary icon-2x'></i></label>";
                                html += "<div id='messenger-msg-cont'><span id='messenger-msg'><small>" + (val[i].usrInfo[0]['message']) + "</small></span></div>";
                                html += "</span>";
                            }
                            html += "</span>";
                            html += "</div>";
                            getInboxListContainer().append(html);
                        }
                    });
                    //show list of inbox
                    $('#inbox-list div.selectContact:lt(' + msgrInboxDefaultDisplayNo + ')').show();
                    setConversationHeader(msgrConversationId);
                    msgrLoadTheInbox = false;
                }
	        }else{
	        	getInboxListContainer().html('<p id="show-empty-inbox">'+translations.tr_melismessenger_tool_inbox_is_empty+'</p>');
	        }
    	});
	}
	
	//get and display the conversation
	function getConversation(timeOut, msgrConversationId, type, offset){
		timeOut = (timeOut == undefined ? true : timeOut);
		type 	= (type == undefined ? "append" : type);
        offset 	= (offset == undefined ? 0 : offset);

		if(msgrConversationId != 0){
    		//get the messages
    		$.get('/melis/MelisMessenger/MelisMessenger/getConversation/'+msgrConversationId,{'offset': offset}, function(data){
				 if(data.data.length > 0){
                    //check if there is new message
                     if(msgrTotalMsg != data.total) {
                         //empty the chat container if we append the data
                         if(type == "append"){
                             emptyChatContainer();
                         }
                         //display data
                         displayConversation(data.data, data.user_id, type);
                         //store total number of message
                         msgrTotalMsg = data.total;
                         //position the scrollbar
                         if (getChatContainer().find('.media').length != 0) {
                             if (offset < 9) {
                                 if (timeOut) {
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
                         msgrLoadTheInbox = true;
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
        for(var i = 0; i < data.length; i++){
        	var image = data[i].usr_image;
        	//check if message came from the user
            if(data[i].msgr_msg_cont_sender_id == id || id == null){//display the current user message
            	html = 
	                    '<div class="media innerAll right">'+
	                    '	<img src="'+image+'" alt="" class="thumb img-responsive img-circle pull-right" width="40">'+ 
	                    '	<div class="media-msgrBody">'+
	                    '		<small class="date"><cite>'+data[i].msgr_msg_cont_date+'</cite></small>'+
	                    '		<div class="pull-right chat-contact-msg my-msg">'+data[i].msgr_msg_cont_message+'</div>'+
	                    '	</div>'+
	                    '</div>'
                    ;
            }else{//display the message of the contact
            	var name = (data[i].usr_firstname != null && data[i].usr_lastname != null) ? data[i].usr_firstname+" "+data[i].usr_lastname : "("+translations.tr_melismessenger_tool_user_is_deleted+")" ;
            	html =
		                '<div class="media innerAll">'+
		                '	<small class="chat-contact-name strong">'+name+'</small>'+
		                '	<img src="'+image+'" alt="" class="thumb img-responsive img-circle pull-left" width="40">'+
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
		if(msgrIsNewConvo){
			var obj = {};
			//create a new conversation with the selected contact
			obj.mbrids = msgrSelectedContactId;
	    	$.post('/melis/MelisMessenger/MelisMessenger/createConversation',$.param(obj), function(data){
	    		if(data.conversationId > 0 && data.conversationId != "" && data.conversationId != null){
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
                    getInboxListContainer().empty();
	    	        //execute the saving of conversation
	    	        executeSave($('#sendMsgForm').serialize());
                    $('#compose-convo').prop('disabled', false);
                    //load the inbox
	    	        setTimeout(function(){
	    	        	//reload the inbox list
		    	        getInboxList();
	    	        }, 500);
	    		}
	    	});
		}else{
			if(msgrConversationId != 0){
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
			var ctr = 0;//count all message
			var tempData = '';
			if(data.messages.length >  0) {
				msgrBody.find("#melis-messenger-messages").removeClass("empty-notif");
                msgrBody.find("#melis-messenger-messages").prev().find(".badge").removeClass("hidden");

                $.each(data, function(index, element) {
                    $.each(element, function(index, msg){
                        tempData += '' +
                            '<li id="'+(msg.msgr_msg_cont_id)+'" data-convo-id="'+(msg.msgr_msg_id)+'">' +
                            '	<img src="'+(msg.usr_image)+'" alt="" width="45" class="thumb img-responsive img-circle pull-left" />' +
                            '    <span class="media-msgrBody media-msgrBody-inline">' +
                            '        <span class="pull-right"><small>'+(msg.msgr_msg_cont_date)+'</small></span><br/>'+
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
            }else{
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
		var name = (name == undefined ? "" : name);
		var msg = "";
		var flag = false;
		if(msgrConversationId != 0 && name == ""){
	    	//loop through each contact to get the contact name
	    	$('#inbox-list .selectContact').each(function(){
	    		$('#inbox-list .selectContact').removeClass('active');
	    		//get the conversation id
	    		var id = $(this).attr('data-convo-id');
	    		//if the msgrConversationId is equal to the conversation id that we select, end the search and get the name
	    		if(msgrConversationId == id){
	    			name = $(this).find('label.user-name').text();
	    			$(this).addClass('active');
	    			flag = true;
	    			return false;
	    		}
	    	});
            msg = translations.tr_melismessenger_tool_conversation_with+' <b>'+name+'</b>';
		}else{
		    flag = true;
		    if(msgrConversationId == 0 && name == ""){
		        msg = translations.tr_melismessenger_tool_select_contact_todisplay_conversation;
            }else {
                msg = translations.tr_melismessenger_tool_conversation_with+' <b>'+name+'</b>';
            }
		}
		if(flag) {
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
		if(msgrConversationId != 0){
            getChatContainer().empty();
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
            //set msg offset to 0
    		msgrMsgOffset = 0;
    		getConversation(false, msgrConversationId);
            getInboxList();
    	}
    	getNewMessage();
	}
	//function to use on first load and reloading the conversation
	function loadMessages(){
        //set total number of message to 0
        msgrTotalMsg = 0;
        //set offset to zero
        msgrMsgOffset = 0;
		getConversation(false, msgrConversationId);
		triggerChatScrollEvent(getChatContainer());
	}
	//function to use on first load and reloading the inbox list
	function loadInbox(){
        msgrTotalInboxList = 0;
        getInboxListContainer().empty();
		initTokenizePlugin();
		getInboxList();
        triggerInboxScrollEvent(getInboxListContainer());
	}

    //function to open the messenger tab
    function openMessengerTab(){
	    return new Promise(function(){
            //open the user profile tab
            var userName = $("#user-name-link").html().trim();
            melisHelper.tabOpen(userName, 'fa-user', 'id_meliscore_user_profile', 'meliscore_user_profile');
            //we must set a time to make sure that the tab are already loaded before we manipulate the DOM
            setTimeout(function(){
                //get the tabs
                var _parent = $('#id_meliscore_user_profile_tabs');
                //remove the active class in li and set active for the messenger tab
                var li = _parent.find('.widget .widget-head ul li');
                $.each(li, function(){
                    var a = $(this).find('a').attr('href');
                    $(this).removeClass('active');
                    if(a == "#id_melismessenger_tool"){
                        $(this).addClass('active');
                    }
                });
                //make the content of the tab active, and deactivate the rest
                var cont = _parent.find('.user-profile-tab-content .tab-content div.tab-pane');
                $.each(cont, function(){
                    var cont_id = $(this).attr('id');
                    $(this).removeClass('active');
                    if(cont_id == "id_melismessenger_tool"){
                        $(this).addClass('active');
                    }
                });
            }, 1500);
        });
    }

    //get the chat container
    function getChatContainer(){
        return $('#chat-container');
    }

    //get the inbox list container
    function getInboxListContainer(){
        return $('#inbox-list');
    }

	return{
        // key - access name outside    // value - name of function above
		initTokenizePlugin			:	initTokenizePlugin,
		loadInbox					:	loadInbox,
		loadMessages				:	loadMessages
    };
	
})(window);
