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
            var $this = $(this);
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
                    $("#id_meliscore_leftmenu").prop('style', null);
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
                $("#id_meliscore_leftmenu").prop('style', null);
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
                    
                    if ( data.messages !== undefined && data.messages.length >  0 ) {
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
                                    $("#melis-messenger-messages").prop('style', null);
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