<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2017 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisMessenger\Controller;

use MelisCore\Controller\AbstractActionController;
use MelisCore\Service\MelisCoreRightsService;
use Laminas\View\Model\ViewModel;
use Laminas\View\Model\JsonModel;

class MelisMessengerController extends AbstractActionController
{
    /**
     * Display the message notification
     * @return \Laminas\View\Model\ViewModel
     */
    public function headerMessengerAction()
    {
        $messengerService = $this->getServiceManager()->get('MelisMessengerService');
        $melisKey = $this->params()->fromRoute('melisKey', '');
        
        $view = new ViewModel();
        $view->melisKey = $melisKey;
        $view->isAccessible = $messengerService->getUserRightsForMessenger();
        return $view;
    }

    /**
     * 
     * Display the messenger tool
     * 
     * @return \Laminas\View\Model\ViewModel
     */
    public function renderMessengerAction()
    {
        $messengerService = $this->getServiceManager()->get('MelisMessengerService');
        $melisKey = $this->params()->fromRoute('melisKey', '');
    	$view = new ViewModel();
    	$view->melisKey = $melisKey;
        $view->isAccessible = $messengerService->getUserRightsForMessenger();
        return $view;
    }
    
    /**
     *
     * Function to render contact
     *
     * @return \Laminas\View\Model\ViewModel
     */
    public function renderMessengerContactAction()
    {
        //get melisKey
        $melisKey = $this->params()->fromRoute('melisKey', '');
        /*
         * Get list of registered users
         */
        $users = $this->getServiceManager()->get('MelisCoreTableUser');
        $usersList = $users->fetchAll()->toArray();
        
        $arr = array();
        $ids = array();
        foreach($usersList AS $x)
        {
            if($x['usr_id'] != $this->getCurrentUserId())
            {
                if(!array_key_exists($x['usr_id'], $ids))
                {
                    $ids[$x['usr_id']] = array();
                    array_push($arr, $x);
                }
            }
        }
        
        $view = new ViewModel();
        $view->users = $arr;
        $view->melisKey = $melisKey;
        return $view;
    }
    
    
    /**
     * Display the content of the messenger (the chatbox and the conversation)
     *
     * @return \Laminas\View\Model\ViewModel
     */
    public function renderMessengerToolContentAction()
    {
        $melisKey = $this->params()->fromRoute('melisKey', '');
        // Get Element form for Messenger event
        $melisMelisCoreConfig = $this->getServiceManager()->get('MelisCoreConfig');
        $appConfigForm = $melisMelisCoreConfig->getFormMergedAndOrdered('melismessenger/forms/melismessenger_conversation_form','melismessenger_conversation_form');
        
        $factory = new \Laminas\Form\Factory();
        $formElements = $this->getServiceManager()->get('FormElementManager');
        $factory->setFormElementManager($formElements);
        $propertyForm = $factory->createForm($appConfigForm);
        
        $view = new ViewModel();
        $view->setVariable('melismessenger_form', $propertyForm);
        $view->melisKey = $melisKey;
        return $view;
    }
    
    /**
     * Function to create new conversation
     * @return \Laminas\View\Model\JsonModel
     */
    public function createConversationAction()
    {
        $messengerService = $this->getServiceManager()->get('MelisMessengerService');
        $request = $this->getRequest();
        if($request->isPost())
        {
            $mbrIds = "";
            $postValues = get_object_vars($request->getPost());
            $postValues['msgr_msg_creator_id'] = $this->getCurrentUserId();
            $postValues['msgr_msg_date_created'] = date('Y/m/d H:i:s');
            //get the selected contact / member of the conversation ids
            $mbrIds = $postValues['mbrids'];
            //remove the mbrids in postValue to match the table field from db before saving
            unset($postValues['mbrids']);
            
            $convo_id = $messengerService->saveMsg($postValues);
            if($convo_id > 0)
            {
                //Convert string of member id to array
                $ids = explode(',', $mbrIds);
                //include the creator id to insert
                array_push($ids, $this->getCurrentUserId());
                
                for($i = 0; $i < sizeof($ids); $i++)
                {
                    //insert the members
                    $messengerService->saveMsgMembers(["msgr_msg_id"    =>  $convo_id, "msgr_msg_mbr_usr_id" =>  $ids[$i]]);
                }
            }
        }
        //return the newly created conversation id
        $response = array(
            'conversationId'   => $convo_id,
        );
        return new JsonModel($response);
    }
    
    /**
     * Function to save the message
     * @return \Laminas\View\Model\JsonModel
     */
    public function saveMessageAction()
    {
        $success = false;
        $data = array();
        $errors = array();
        
        $messengerService = $this->getServiceManager()->get('MelisMessengerService');
        $melisMelisCoreConfig = $this->getServiceManager()->get('MelisCoreConfig');
        $melisCoreAuth = $this->getServiceManager()->get('MelisCoreAuth');
        $userAuthDatas =  $melisCoreAuth->getStorage()->read();
        $appConfigForm = $melisMelisCoreConfig->getFormMergedAndOrdered('melismessenger/forms/melismessenger_conversation_form','melismessenger_conversation_form');
        
        $factory = new \Laminas\Form\Factory();
        $formElements = $this->getServiceManager()->get('FormElementManager');
        $factory->setFormElementManager($formElements);
        $propertyForm = $factory->createForm($appConfigForm);
        //get the request
        $request = $this->getRequest();
        //check if request is post
        if($request->isPost())
        {
            //get and sanitize the data
//            $postValues = $this->getTool()->sanitizeRecursive(get_object_vars($request->getPost()), array(), false, false);
            $postValues = get_object_vars($request->getPost());

            //assign the data to the form
            $propertyForm->setData($postValues);
            //check if form is valid(if all the form field are match with the value that we pass from routes)
            if($propertyForm->isValid())
            {
                //override the postValue data to prepare the insertion of data
                $postValues['msgr_msg_cont_sender_id']  = $this->getCurrentUserId();
                $postValues['msgr_msg_cont_date']       =   date('Y-m-d H:i:s');
                $postValues['msgr_msg_cont_status']     =   1;
                
                //save the message
                $res = $messengerService->saveMsgContent($postValues);
                //check if saving is success
                if($res)
                {
                    $postValues['msgr_msg_cont_date'] = date('M d, Y g:i:s A', strtotime($postValues['msgr_msg_cont_date']));
                    $success = true;
                    $data = $postValues;//we need to return the data that we pass so that we can display it directly to the conversation
                    $data['usr_image'] = $this->getUserImage($userAuthDatas->usr_image);
                }
            }
            else {
                $errors = $propertyForm->getMessages();
            }
        }
        //prepare the data to return
        $response = array(
            'success'  =>  $success,
            'data'  =>  array($data),
            'errors' => $errors
        );
        return new JsonModel($response);
    }
    
    /**
     * Function to get the conversation
     * @return \Laminas\View\Model\JsonModel
     */
    public function getConversationAction()
    {
        $msgService =  $this->getServiceManager()->get('MelisMessengerService');
        $id = (int) $this->params()->fromRoute('id', 0);
        $limit = (int) $this->params()->fromQuery('limit', 10);
        $offset = (int) $this->params()->fromQuery('offset', 0);
        //get the convo list
        $totalMessages = count($msgService->getConversation($id));
        
        $convo = $msgService->getConversationWithLimit($id, $limit, $offset);

        if($offset == 0)
            $convo = array_reverse($convo);
        foreach ($convo As $key => $val)
        {
            //check if user image is not empty and convert it to base_64, else just return the default image
            $convo[$key]['usr_image'] = $this->getUserImage($convo[$key]['usr_image']);
            
            $convo[$key]['msgr_msg_cont_date'] = date('M d, Y g:i:s A', strtotime($convo[$key]['msgr_msg_cont_date']));
//            $convo[$key]['msgr_msg_cont_message'] = $this->getTool()->sanitize($convo[$key]['msgr_msg_cont_message']);
        }
        
        //prepare the data to return
        $response = array(
            'data'      =>  $convo,
            'user_id'   =>  $this->getCurrentUserId(),
            'total'     =>  $totalMessages,
        );
        return new JsonModel($response);
    }
    
    /**
     * Get message to display in the messenger notifications
     * @return \Laminas\View\Model\JsonModel
     */
    public function getNewMessageAction()
    {
        $msgService =  $this->getServiceManager()->get('MelisMessengerService');
        $message = $msgService->getNewMessage($this->getCurrentUserId());
        foreach($message AS $key => $val)
        {
//            $message[$key]['msgr_msg_cont_message'] = $this->getTool()->sanitize($message[$key]['msgr_msg_cont_message']);
            $message[$key]['usr_image'] =  $this->getUserImage($message[$key]['usr_image']);
            $message[$key]['msgr_msg_cont_date'] = date('M d, Y g:i:s A', strtotime($message[$key]['msgr_msg_cont_date']));
        }
        $response = array(
            'messages'  =>  (sizeof($message) > 0) ? $message : array(),
        );
        
        return new JsonModel($response);
    }

    public function getLastMessageAction()
    {
        $msgService =  $this->getServiceManager()->get('MelisMessengerService');
        $message = $msgService->getNewMessage($this->getCurrentUserId());
        foreach($message AS $key => $val)
        {
//            $message[$key]['msgr_msg_cont_message'] = $this->getTool()->sanitize($message[$key]['msgr_msg_cont_message']);
            $message[$key]['usr_image'] =  $this->getUserImage($message[$key]['usr_image']);
        }
        $response = array(
            'messages'  =>  $message,
        );

        return new JsonModel($response);
    }
    /**
     * Function to update message status
     * @return \Laminas\View\Model\JsonModel
     */
    public function updateMessageStatusAction()
    {
        $msgService =  $this->getServiceManager()->get('MelisMessengerService');
        //get the request
        $request = $this->getRequest();
        $post_var = get_object_vars($request->getPost());
        $user_id = $this->getCurrentUserId();
        $res = "";
        //check if request is post
        if($request->isPost())
        {
            if($post_var['id'] != "")
            {
                $arr = array("msgr_msg_cont_status" => 0);
                $res = $msgService->updateMessageStatus($arr, $post_var['id'], $user_id);
            }
        }
        $response = array(
            "result"    =>  $res,
        );
        return new JsonModel($response);
    }
    
    /**
     * Get all contacts
     * @return \Laminas\View\Model\JsonModel
     */
    public function getContactListAction()
    {
        $arr = array();
        $usrInfo = array();
        $onlineContacts = array();
        $offlineContacts = array();
        $deletedContacts = array();
        $totalContact = 0;
        //get current user id
        $userId  = $this->getCurrentUserId();
        $msgService =  $this->getServiceManager()->get('MelisMessengerService');
        
        $convoIds = $this->prepareConversationId($userId);
        //check if conversation id is not empty
        if(!empty($convoIds))
        {
            //count number of contacts
            $totalContact = count($msgService->getContactList($convoIds, $userId));
            //get the list of contact
            $contactList = $msgService->getContactList($convoIds, $userId);
            //loop through each contact list to process the results before returning to view
            $sortedArr = array();
            foreach ($contactList as $key => $row)
            {
                $sortedArr[$key] = $row["usr_firstname"];
            }

            array_multisort($sortedArr, SORT_ASC, $contactList);
            foreach($contactList as $key => $contact){
                if($contact["usr_is_online"] == "1"){
                    array_push($onlineContacts,$contact);
                }else if($contact["usr_is_online"] == "0"){
                    array_push($offlineContacts,$contact);
                }else{
                    array_push($deletedContacts,$contact);
                }
                unset($contactList[$key]);
            }
            if(empty($contactList)){
                $contactList = $this->mergeArray($contactList,$onlineContacts);
                $contactList = $this->mergeArray($contactList,$offlineContacts);
                $contactList = $this->mergeArray($contactList,$deletedContacts);
            }
            foreach($contactList AS $key => $val)
            {
                /*
                 * check if the usr_id = to the current user id
                 * if there are equal, dont eclude the current user to the list of contacts
                 */
                if($userId != $contactList[$key]['usr_id'])
                {
                    /*
                     * Group the contact for every conversation
                     *
                     * It will help to display the contact in group in the future,
                     * but it will also display the individual contact
                     */
                    if(!array_key_exists($contactList[$key]['msgr_msg_id'], $arr))
                    {
                        $arr[$contactList[$key]['msgr_msg_id']] = array();
                        $usrInfo = array();
                    }
                    //prepare the information of the contact
                    $name = $contactList[$key]['usr_firstname']." ".$contactList[$key]['usr_lastname'];
                    $isOnline = $contactList[$key]['usr_is_online'];
                    $image = $this->getUserImage($contactList[$key]['usr_image']);
                    $contact_id = $contactList[$key]['usr_id'];
//                    $message = $this->getTool()->sanitize($contactList[$key]['msgr_msg_cont_message']);
                    $message = $contactList[$key]['msgr_msg_cont_message'];
                    //push the contact information to the array
                    array_push($usrInfo, array("name"=>$name, "isOnline"=>$isOnline, "image"=>$image, "message"=>$message));
                    //get the ready the data to be return
                    $arr[$contactList[$key]['msgr_msg_id']]['usrInfo'] = $usrInfo;
                    $arr[$contactList[$key]['msgr_msg_id']]['msgr_msg_id'] = $contactList[$key]['msgr_msg_id'];
                    $arr[$contactList[$key]['msgr_msg_id']]['contact_id'] = $contact_id;
                }
            }
        }

        $response = array(
            'data'            =>  array_values($arr),
            'totalContact'    =>  $totalContact,
        );
        return new JsonModel($response);
    }

    private function mergeArray($array1, $array2){
        if(!empty($array2))
            foreach($array2 as $arr2){
                array_push($array1, $arr2);
            }
        return $array1;
    }
    
    /**
     * Function to get the messenger time interval in the config file
     * @return \Laminas\View\Model\JsonModel
     */
    public function getMsgTimeIntervalAction()
    {    
        $config = $this->getServiceManager()->get('config');
        $msgrConfig = $config['plugins']['melistoolmessenger']['datas']['default']['messenger']['msg_interval'];
        $response = array(
            "interval" => $msgrConfig,
        );
        return new JsonModel($response);
    }

    /**
     * Function to get the user rights of user to melis messenger
     * @return \Laminas\View\Model\JsonModel
     */
    public function getUserRightsForMessengerAction(){
        $messengerService = $this->getServiceManager()->get('MelisMessengerService');
        $isAccessible = $messengerService->getUserRightsForMessenger();
        $response = array(
            'isAccessible' => $isAccessible
        );
        return new JsonModel($response);
    }
    
    /**
     * Function to get the conversation id by user id,
     * we will going to use it to retrieve the list of contacts
     * that the user has a connection(the user is included in the convo)
     * 
     * @param Int $userId
     * @return array - array of ID
     */
    private function prepareConversationId($userId)
    {
        $msgService = $this->getServiceManager()->get('MelisMessengerService');
        $ids = $msgService->prepareConversationId($userId);

        $data = array();
        $str = "";
        //loop through each id and remove the key and store the value to array
        foreach($ids AS $key=>$val)
        {
            array_push($data, $val['msgr_msg_id']);
        }
        //remove the duplicate Id
        $unqId = array_unique($data, SORT_NUMERIC);
        return $unqId;
    }
    
    /**
     * Function to get the user image.
     * If !empty($msg), it will convert the image to base_64, else just the return the default image
     * @param unknown $img
     * @return string
     */
    private function getUserImage($img)
    {
        if(!empty($img))//encode the image
        {
            return "data:image/jpeg;base64,".base64_encode($img);    
        }
        else//return the default image
        {
            return "/MelisCore/images/profile/default_picture.jpg";
        }
    }
    
    /**
     * Function to return the current user ID
     * @return Int user ID
     */
    private function getCurrentUserId()
    {
        $userId = null;
        $melisCoreAuth = $this->getServiceManager()->get('MelisCoreAuth');
        if($melisCoreAuth->hasIdentity())
        {
            $userAuthDatas =  $melisCoreAuth->getStorage()->read();
            $userId = (int) $userAuthDatas->usr_id;
        }
        return $userId;
    }

    private function getTool()
    {
        $service = $this->getServiceManager()->get('MelisCoreTool');

        return $service;
    }


}