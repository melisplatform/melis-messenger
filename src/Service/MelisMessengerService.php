<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2017 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisMessenger\Service;

use MelisCore\Service\MelisCoreGeneralService;
use MelisCore\Service\MelisCoreRightsService;

/**
 * This service handles access to the messenger
 */
class MelisMessengerService extends MelisCoreGeneralService
{
    /**
    * Saving the newly created conversation
    * @param array $data
    */
    public function saveMsg($data = null){
        // Event parameters prepare
        $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());

        // Sending service start event
        $arrayParameters = $this->sendEvent('melismessenger_save_msg_start', $arrayParameters);

        $msgTable = $this->getServiceLocator()->get('MelisMessengerMsgTable');
        $result = $msgTable->save($arrayParameters['data']);

        // Adding results to parameters for events treatment if needed
        $arrayParameters['results'] = $result;
        // Sending service end event
        $arrayParameters = $this->sendEvent('melismessenger_save_msg_end', $arrayParameters);

        return $arrayParameters['results'];
    }
    
    /**
     * Saving the selected members for the conversation
     * @param array $data
     */
    public function saveMsgMembers($data = null){
        // Event parameters prepare
        $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());

        // Sending service start event
        $arrayParameters = $this->sendEvent('melismessenger_save_msg_members_start', $arrayParameters);

        $mbrTable = $this->getServiceLocator()->get('MelisMessengerMsgMembersTable');
        $result = $mbrTable->save($arrayParameters['data']);

        // Adding results to parameters for events treatment if needed
        $arrayParameters['results'] = $result;
        // Sending service end event
        $arrayParameters = $this->sendEvent('melismessenger_save_msg_members_end', $arrayParameters);

        return $arrayParameters['results'];
    }
    
    /**
     * Saving the conversation content / messages
     * @param array $data
     */
    public function saveMsgContent($data = null){
        // Event parameters prepare
        $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());

        // Sending service start event
        $arrayParameters = $this->sendEvent('melismessenger_save_msg_content_start', $arrayParameters);

        $contTable = $this->getServiceLocator()->get('MelisMessengerMsgContentTable');
        $result = $contTable->save($arrayParameters['data']);

        // Adding results to parameters for events treatment if needed
        $arrayParameters['results'] = $result;
        // Sending service end event
        $arrayParameters = $this->sendEvent('melismessenger_save_msg_content_end', $arrayParameters);

        return $arrayParameters['results'];
    }

    /**
     * Get user rights for messenger
     *
     * @return mixed
     */
    public function getUserRightsForMessenger(){
        $arrayParameters = array();

        $melisCoreAuth = $this->getServiceLocator()->get('MelisCoreAuth');
        $melisCoreRights = $this->getServiceLocator()->get('MelisCoreRights');
        $xmlRights = $melisCoreAuth->getAuthRights();
        $isAccessible = $melisCoreRights->isAccessible($xmlRights, MelisCoreRightsService::MELISCORE_PREFIX_INTERFACE, "/melismessenger");

        $arrayParameters['isAccessible'] = $isAccessible;
        $arrayParameters = $this->sendEvent('melismessenger_access_rights_end', $arrayParameters);

        return $arrayParameters['isAccessible'];
    }
}