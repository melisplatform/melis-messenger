<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2017 Melis Technology (http://www.melistechnology.com)
 *
 */

return array(
    'router' => array(
        'routes' => array(
        	'melis-backoffice' => array(
                'child_routes' => array(
                    'application-MelisMessenger' => array(
                        'type'    => 'Literal',
                        'options' => array(
                            'route'    => 'MelisMessenger',
                            'defaults' => array(
                                '__NAMESPACE__' => 'MelisMessenger\Controller',
                                'controller'    => 'Index',
                                'action'        => 'index',
                            ),
                        ),
                        'may_terminate' => true,
                        'child_routes' => array(
                            'default' => array(
                                'type'    => 'Segment',
                                'options' => array(
                                    'route'    => '/[:controller[/:action][/:id]]',
                                    'constraints' => array(
                                        'controller' => '[a-zA-Z][a-zA-Z0-9_-]*',
                                        'action'     => '[a-zA-Z][a-zA-Z0-9_-]*',
                                        'id'     => '[0-9]+',
                                    ),
                                    'defaults' => array(
                                    ),
                                ),
                            ),
                        ),
                    ),
                ),    
        	),
            /*
             * This route will handle the
             * alone setup of a module
             */
            'setup-melis-messenger' => array(
                'type'    => 'Literal',
                'options' => array(
                    'route'    => '/MelisMessenger',
                    'defaults' => array(
                        '__NAMESPACE__' => 'MelisMessenger\Controller',
                        'controller'    => 'MelisSetup',
                        'action'        => 'setup-form',
                    ),
                ),
                'may_terminate' => true,
                'child_routes' => array(
                    'default' => array(
                        'type'    => 'Segment',
                        'options' => array(
                            'route'    => '/[:controller[/:action]]',
                            'constraints' => array(
                                'controller' => '[a-zA-Z][a-zA-Z0-9_-]*',
                                'action'     => '[a-zA-Z][a-zA-Z0-9_-]*',
                            ),
                            'defaults' => array(
//
                            ),
                        ),
                    ),
                    'setup' => array(
                        'type' => 'Segment',
                        'options' => array(
                            'route' => '/setup',
                            'defaults' => array(
                                'controller' => 'MelisMessenger\Controller\MelisSetup',
                                'action' => 'setup-form',
                            ),
                        ),
                    ),
                ),
            ),
        ),
    ),
    'service_manager' => array(
        'aliases' => array(

            'MelisMessengerService' => \MelisMessenger\Service\MelisMessengerService::class,

            'MelisMessengerMsgTable' => \MelisMessenger\Model\Tables\MelisMessengerMsgTable::class,
            'MelisMessengerMsgContentTable' => MelisMessenger\Model\Tables\MelisMessengerMsgContentTable::class,
            'MelisMessengerMsgMembersTable' => MelisMessenger\Model\Tables\MelisMessengerMsgMembersTable::class,
        ),
    ),
    'controllers' => array(
        'invokables' => array(
            'MelisMessenger\Controller\MelisMessenger' => 'MelisMessenger\Controller\MelisMessengerController',
            'MelisMessenger\Controller\MelisSetup' => 'MelisMessenger\Controller\MelisSetupController',
        ),
    ),
    'form_elements' => array(
        'factories' => array(
            'MelisMessengerInput' => 'MelisMessenger\Form\Factory\MelisMessengerInputFactory',
        )
    ),
    'view_manager' => array(
        'display_not_found_reason' => true,
        'display_exceptions'       => true,
        'doctype'                  => 'HTML5',
        'template_map' => array(
            'layout/layout'             => __DIR__ . '/../view/layout/default.phtml',
            'MelisMessenger/test'       => __DIR__ . '/../view/melis-messenger/melis-messenger/plugins/test.phtml',
        ),
        'template_path_stack' => array(
            __DIR__ . '/../view',
        ),
        'strategies' => array(
            'ViewJsonStrategy',
        ),
    ),
);
