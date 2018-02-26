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
     *
     * @param null $data
     * @return mixed
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
     *
     * @param null $data
     * @return mixed
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
     *
     * @param null $data
     * @return mixed
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
     * Function to get the conversation by conversation id
     *
     * @param null $id
     * @return mixed
     */
    public function getConversation($id = null){
        // Event parameters prepare
        $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());

        // Sending service start event
        $arrayParameters = $this->sendEvent('melismessenger_get_conversation_start', $arrayParameters);

        $msgTable =  $this->getServiceLocator()->get('MelisMessengerMsgTable');
        $result = $msgTable->getConversation($arrayParameters['id'])->toArray();

        // Adding results to parameters for events treatment if needed
        $arrayParameters['results'] = $result;
        // Sending service end event
        $arrayParameters = $this->sendEvent('melismessenger_get_conversation_end', $arrayParameters);

        return $arrayParameters['results'];
    }

    /**
     * Function to get the conversation by
     * conversation id with limit
     *
     * @param null $id
     * @param int $limit - default is 10
     * @param int $offset - default is 0
     * @return mixed
     */
    public function getConversationWithLimit($id = null, $limit = 10, $offset = 0){
        // Event parameters prepare
        $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());

        // Sending service start event
        $arrayParameters = $this->sendEvent('melismessenger_get_conversation_with_limit_start', $arrayParameters);

        $msgTable =  $this->getServiceLocator()->get('MelisMessengerMsgTable');
        $result = $msgTable->getConversationWithLimit($arrayParameters['id'], $arrayParameters['limit'], $arrayParameters['offset'])->toArray();

        // Adding results to parameters for events treatment if needed
        $arrayParameters['results'] = $result;
        // Sending service end event
        $arrayParameters = $this->sendEvent('melismessenger_get_conversation_with_limit_end', $arrayParameters);

        return $arrayParameters['results'];
    }

    /**
     * Function to get new message
     *
     * @param null $id
     * @return mixed
     */
    public function getNewMessage($id = null){
        // Event parameters prepare
        $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());

        // Sending service start event
        $arrayParameters = $this->sendEvent('melismessenger_get_new_message_start', $arrayParameters);

        $msgContent =  $this->getServiceLocator()->get('MelisMessengerMsgContentTable');
        $result = $msgContent->getNewMessage($arrayParameters['id'])->toArray();

        // Adding results to parameters for events treatment if needed
        $arrayParameters['results'] = $result;
        // Sending service end event
        $arrayParameters = $this->sendEvent('melismessenger_get_new_message_end', $arrayParameters);

        return $arrayParameters['results'];
    }

    /**
     * Function to update the status
     * of message
     *
     * @param null $data
     * @param null $msg_id
     * @param null $user_id
     * @return mixed
     */
    public function updateMessageStatus($data = null, $msg_id = null, $user_id = null){
        // Event parameters prepare
        $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());

        // Sending service start event
        $arrayParameters = $this->sendEvent('melismessenger_update_message_status_start', $arrayParameters);

        $msgContent =  $this->getServiceLocator()->get('MelisMessengerMsgContentTable');
        $result = $msgContent->updateMessageStatus($arrayParameters['data'], $arrayParameters['msg_id'], $arrayParameters['user_id']);

        // Adding results to parameters for events treatment if needed
        $arrayParameters['results'] = $result;
        // Sending service end event
        $arrayParameters = $this->sendEvent('melismessenger_update_message_status_end', $arrayParameters);

        return $arrayParameters['results'];
    }

    /**
     * Function to get the contact list
     *
     * @param null $convo_id
     * @param null $user_id
     * @return mixed
     */
    public function getContactList($convo_id = null, $user_id = null){
        // Event parameters prepare
        $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());

        // Sending service start event
        $arrayParameters = $this->sendEvent('melismessenger_get_contact_list_start', $arrayParameters);

        $msgContent =  $this->getServiceLocator()->get('MelisMessengerMsgContentTable');
        $result = $msgContent->getContact($arrayParameters['convo_id'], $arrayParameters['user_id'])->toArray();

        // Adding results to parameters for events treatment if needed
        $arrayParameters['results'] = $result;
        // Sending service end event
        $arrayParameters = $this->sendEvent('melismessenger_get_contact_list_end', $arrayParameters);

        return $arrayParameters['results'];
    }

    /**
     * Function to get the conversation id by user id,
     * we will going to use it to retrieve the list of contacts
     * that the user has a connection(the user is included in the convo)
     *
     * @param null $userId
     * @return mixed
     */
    public function prepareConversationId($userId = null){
        // Event parameters prepare
        $arrayParameters = $this->makeArrayFromParameters(__METHOD__, func_get_args());

        // Sending service start event
        $arrayParameters = $this->sendEvent('melismessenger_prepare_conversation_id_start', $arrayParameters);

        $msgTable = $this->getServiceLocator()->get('MelisMessengerMsgTable');
        $mbrTable = $this->getServiceLocator()->get('MelisMessengerMsgMembersTable');
        //get the conversation id from MelisMesengerMsgTable
        $msgConvoId = $msgTable->getConversationIdByUserId($arrayParameters['userId'])->toArray();
        //get the conversation id from MelisMessengerMsgMembersTable
        $mbrConvoId = $mbrTable->getConversationIdByUserId($arrayParameters['userId'])->toArray();
        //merge the results
        $result = array_merge($msgConvoId, $mbrConvoId);

        // Adding results to parameters for events treatment if needed
        $arrayParameters['results'] = $result;
        // Sending service end event
        $arrayParameters = $this->sendEvent('melismessenger_prepare_conversation_id_end', $arrayParameters);

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