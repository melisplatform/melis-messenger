<?php
    return array(
        'plugins' => array(
            'meliscore' => array(
                'interface' => array(
                    'meliscore_header' => array(//display the messenger header notifications
                        'interface' => array(
                            'melismessenger_tool_header_messages' => array(
                                'conf' => array(
                                    'type' => 'melistoolmessenger/interface/melismessenger_tool_header_messages'
                                )
                            ),
                         ),
                     ),
                    'meliscore_leftmenu' => array(//manage the tabs of user profile
                        'interface' => array(
                            'meliscore_leftmenu_identity' =>  array(
                                'interface' => array(
                                    'meliscore_user_profile' => array(
                                        'interface' => array(
                                            'meliscore_user_profile_right' => array(
                                                'interface' => array(
                                                    'meliscore_user_profile_tabs' => array(
                                                        'interface' =>  array(
                                                            'melismessenger_tool' => array(
                                                                'conf' => array(
                                                                    'type' => 'melistoolmessenger/interface/melismessenger_tool'
                                                                )
                                                            ),
                                                        ),
                                                    ),
                                                ),
                                            ),
                                        ),
                                    ),
                                ),
                            ),
                        ),
                    ),
                 ),
                'datas' => array(
                    'default' => array(//default time interval where the messages refresh its data
                        'messenger' => array(
                            'msg_interval' => 1000 * 60, // in milliseconds (default is 1 min)
                        ),
                    ),
                ),
            ),
            'melistoolmessenger' => array(
                'conf' => array(
                    'id' => '',
                    'name' => 'tr_melismessenger_tool_name',
                    'rightsDisplay' => 'none',
                ),
                'ressources' => array(
                    'js' => array(
                       'MelisMessenger/plugins/tokenize2.min.js',
                       'MelisMessenger/js/tools/messenger-tool.js',
                    ),
                    'css' => array(
                       'MelisMessenger/plugins/tokenize2.min.css',
                       'MelisMessenger/css/messenger-tool.css',
                    ),
                ),
                'interface' => array(
                    'melismessenger_tool' => array(
                        'conf' => array(
                            'id' => 'id_melismessenger_tool',
                            'melisKey' => 'melismessenger_tool',
                            'name' => 'tr_melismessenger_tool_name',
                            'icon' => 'comments',
                        ),
                        'forward' => array(
                            'module' => 'MelisMessenger',
                            'controller' => 'MelisMessenger',
                            'action' => 'render-messenger',
                            'jscallback' => 'messengerTool.initTokenizePlugin();',
                            'jsdatas' => array()
                        ),
                        'interface' => array(
                            'melismessenger_tool_content' => array(
                                'conf' => array(
                                    'id' => 'id_melismessenger_tool_content',
                                    'melisKey' => 'melismessenger_tool_content',
                                    'name' => 'tr_melismessenger_tool_name',
                                ),
                                'forward' => array(
                                    'module' => 'MelisMessenger',
                                    'controller' => 'MelisMessenger',
                                    'action' => 'render-messenger-tool-content',
                                    'jscallback' => 'messengerTool.loadMessages();',
                                    'jsdatas' => array()
                                ),
                            ),
                            'melismessenger_tool_inbox' => array(
                                'conf' => array(
                                    'id' => 'id_melismessenger_tool_inbox',
                                    'melisKey' => 'melismessenger_tool_inbox',
                                    'name' => 'tr_melismessenger_tool_name',
                                ),
                                'forward' => array(
                                    'module' => 'MelisMessenger',
                                    'controller' => 'MelisMessenger',
                                    'action' => 'render-messenger-inbox',
                                    'jscallback' => 'messengerTool.loadInbox();',
                                    'jsdatas' => array()
                                ),
                            ),
                        ),
                    ),
                    'melismessenger_tool_header_messages' => array(
                        'conf' => array(
                            'id' => 'id_melismessenger_tool_header_messages',
                            'melisKey' => 'melismessenger_tool_header_messages',
                            'name' => 'tr_melismessenger_tool_name',
                        ),
                        'forward' => array(
                            'module' => 'MelisMessenger',
                            'controller' => 'MelisMessenger',
                            'action' => 'header-messenger',
                            'jscallback' => '',
                            'jsdatas' => array()
                        ),
                    ),
                ),
            ),
        ),
    );