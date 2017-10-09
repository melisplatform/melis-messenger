<?php
return array(
    'plugins' => array(
        'melismessenger' => array(
            'forms' => array(
                'melismessenger_conversation_form' => array(
                    'attributes' => array(
                        'name' => 'messengerform',
                        'id' => 'sendMsgForm',
                        'method' => 'POST',
                        'action' => '',
                    ),
                    'hydrator'  => 'Zend\Stdlib\Hydrator\ArraySerializable',
                    'elements' => array(
                        array(
							'spec' => array(
								'name' => 'msgr_msg_id',
								'type' => 'hidden',
								'attributes' => array(
									'id' => 'msgr_msg_id',
							    ),
						    ),
						),
                        array(
                            'spec' => array(
                                'name' => 'msgr_msg_cont_sender_id',
                                'type' => 'hidden',
                                'attributes' => array(
                                    'id' => 'msgr_msg_cont_sender_id',
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'msgr_msg_cont_date',
                                'type' => 'hidden',
                                'attributes' => array(
                                    'id' => 'msgr_msg_cont_date',
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'msgr_msg_cont_status',
                                'type' => 'hidden',
                                'attributes' => array(
                                    'id' => 'msgr_msg_cont_status',
                                ),
                            ),
                        ),
                        array(
                            'spec' => array(
                                'name' => 'msgr_msg_cont_message',
                                'type' => 'MelisMessengerInput',
                                'attributes' => array(
                                    'id' => 'msgr_msg_cont_message',
                                    'value' => '',
                                    'required' => 'required',
                                ),
                            ),
                        ),
                    ),
                    'input_filter' => array(
                        'msgr_msg_cont_message' => array(
                            'name'     => 'msgr_msg_cont_message',
                            'required' => true,
                            'validators' => array(
                                array(
                                    'name' => 'NotEmpty',
                                    'options' => array(
                                        'messages' => array(
                                            \Zend\Validator\NotEmpty::IS_EMPTY => 'tr_melistoolmesseger_tool_input_empty',
                                        ),
                                    ),
                                ),
                            ),
                            'filters'  => array(
                                array('name' => 'StripTags'),
                                array('name' => 'StringTrim'),
                            ),
                        ),
                    ),
                ),
            ),
        ),
    ),
);
