<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2017 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisMessenger\Service;

use Zend\ServiceManager\ServiceLocatorAwareInterface;
use Zend\ServiceManager\ServiceLocatorInterface;

/**
 * This service handles access to the messenger
 */
class MelisMessengerService  implements  ServiceLocatorAwareInterface
{
	protected $serviceLocator;
	
	public function setServiceLocator(ServiceLocatorInterface $sl)
	{
		$this->serviceLocator = $sl;
		return $this;
	}
	
	public function getServiceLocator()
	{
		return $this->serviceLocator;
	}
	
    /**
    * Saving the newly created conversation
    * @param array $data
    */
    public function saveMsg($data){
        $msgTable = $this->getServiceLocator()->get('MelisMessengerMsgTable');
        $res = $msgTable->save($data);
        return $res;
    }
    
    /**
     * Saving the selected members for the conversation
     * @param array $data
     */
    public function saveMsgMembers($data){
        $mbrTable = $this->getServiceLocator()->get('MelisMessengerMsgMembersTable');
        $res = $mbrTable->save($data);
        return $res;
    }
    
    /**
     * Saving the conversation content / messages
     * @param array $data
     */
    public function saveMsgContent($data){
        $contTable = $this->getServiceLocator()->get('MelisMessengerMsgContentTable');
        $res = $contTable->save($data);
        return $res;
    }
}