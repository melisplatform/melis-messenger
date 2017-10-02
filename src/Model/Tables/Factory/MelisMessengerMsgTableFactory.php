<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2017 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisMessenger\Model\Tables\Factory;

use Zend\ServiceManager\ServiceLocatorInterface;
use Zend\ServiceManager\FactoryInterface;
use Zend\Db\ResultSet\HydratingResultSet;
use Zend\Db\TableGateway\TableGateway;
use Zend\Stdlib\Hydrator\ObjectProperty;

use MelisMessenger\Model\MelisMessenger;
use MelisMessenger\Model\Tables\MelisMessengerMsgTable;

class MelisMessengerMsgTableFactory implements FactoryInterface
{
	public function createService(ServiceLocatorInterface $sl)
	{
	    $hydratingResultSet = new HydratingResultSet(new ObjectProperty(), new MelisMessenger());
    	$tableGateway = new TableGateway('melis_messenger_msg', $sl->get('Zend\Db\Adapter\Adapter'), null, $hydratingResultSet);
		
    	return new MelisMessengerMsgTable($tableGateway);
	}

}