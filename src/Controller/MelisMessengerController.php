<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2017 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisMessenger\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;
use Zend\View\Model\JsonModel;
use Zend\Filter\Int;
use MelisMessenger\Model\Tables\MelisMessengerMsgMembersTable;

class MelisMessengerController extends AbstractActionController
{
    public function indexAction()
    {
        $view = new ViewModel();
        return $view;
    }
    
    /**
     * 
     * Display the menu of the messenger
     * 
     * @return \Zend\View\Model\ViewModel
     */
    public function renderMessengerLeftmenuAction()
    {
        $view = new ViewModel();
        return $view;
    }
    
    /**
     * Display the message notification
     * @return \Zend\View\Model\ViewModel
     */
    public function headerMessengerAction()
    {
        $melisKey = $this->params()->fromRoute('melisKey', '');
        
        $view = new ViewModel();
        $view->melisKey = $melisKey;
        return $view;
    }

    /**
     * 
     * Display the messenger tool
     * 
     * @return \Zend\View\Model\ViewModel
     */
    public function renderMessengerAction()
    { 
        $melisKey = $this->params()->fromRoute('melisKey', '');
    	$view = new ViewModel();
    	$view->melisKey = $melisKey;
        return $view;
    }
    
    /**
     *
     * Function to render inbox
     *
     * @return \Zend\View\Model\ViewModel
     */
    public function renderMessengerInboxAction()
    {
        //get melisKey
        $melisKey = $this->params()->fromRoute('melisKey', '');
        /*
         * Get list of registered users
         */
        $users = $this->getServiceLocator()->get('MelisCoreTableUser');
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
     * @return \Zend\View\Model\ViewModel
     */
    public function renderMessengerToolContentAction()
    {
        $melisKey = $this->params()->fromRoute('melisKey', '');
        // Get Element form for Messenger event
        $melisMelisCoreConfig = $this->serviceLocator->get('MelisCoreConfig');
        $appConfigForm = $melisMelisCoreConfig->getFormMergedAndOrdered('melismessenger/forms/melismessenger_conversation_form','melismessenger_conversation_form');
        
        $factory = new \Zend\Form\Factory();
        $formElements = $this->getServiceLocator()->get('FormElementManager');
        $factory->setFormElementManager($formElements);
        $propertyForm = $factory->createForm($appConfigForm);
        
        $view = new ViewModel();
        $view->setVariable('melismessenger_form', $propertyForm);
        $view->melisKey = $melisKey;
        return $view;
    }
    
    /**
     * Function to create new conversation
     * @return \Zend\View\Model\JsonModel
     */
    public function createConversationAction()
    {
        $messengerService = $this->getServiceLocator()->get('MelisMessengerService');
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
     * @return \Zend\View\Model\JsonModel
     */
    public function saveMessageAction()
    {
        $msg = "failed";
        $status = 0;
        $data = array();
        
        $messengerService = $this->getServiceLocator()->get('MelisMessengerService');
        $melisMelisCoreConfig = $this->serviceLocator->get('MelisCoreConfig');
        $melisCoreAuth = $this->getServiceLocator()->get('MelisCoreAuth');
        $userAuthDatas =  $melisCoreAuth->getStorage()->read();
        $appConfigForm = $melisMelisCoreConfig->getFormMergedAndOrdered('melismessenger/forms/melismessenger_conversation_form','melismessenger_conversation_form');
        
        $factory = new \Zend\Form\Factory();
        $formElements = $this->getServiceLocator()->get('FormElementManager');
        $factory->setFormElementManager($formElements);
        $propertyForm = $factory->createForm($appConfigForm);
        $melisTool = $this->getServiceLocator()->get('MelisCoreTool');
        //get the request
        $request = $this->getRequest();
        //check if request is post
        if($request->isPost())
        {
            //get the data
            $postValues = get_object_vars($request->getPost());
            $postValues['msgr_msg_cont_message'] = htmlspecialchars($postValues['msgr_msg_cont_message']);
            //assign the data to the form
            $propertyForm->setData($postValues);
            //check if form is valid(if all the form field are match with the value that we pass from routes)
            if($propertyForm->isValid())
            {
                //override the postValue data to prepare the insertion of data
                $postValues['msgr_msg_cont_sender_id']  = $this->getCurrentUserId();
                $postValues['msgr_msg_cont_date']       =   date('Y-m-d H:i:s');
                $postValues['msgr_msg_cont_status']     =   "new";
                
                //save the message
                $res = $messengerService->saveMsgContent($postValues);
                //check if saving is success
                if($res)
                {
                    $postValues['msgr_msg_cont_message']    = htmlspecialchars_decode($postValues['msgr_msg_cont_message']);
                    $postValues['msgr_msg_cont_date'] = date('M d, Y g:i:s A', strtotime($postValues['msgr_msg_cont_date']));
                    $msg = "success";
                    $status = 1;
                    $data = $postValues;//we need to return the data that we pass so that we can display it directly to the conversation
                    $data['usr_image'] = $this->getUserImage($userAuthDatas->usr_image);
                }
            }
        }
        //prepare the data to return
        $response = array(
            'msg' =>  $msg,
            'status'  =>  $status,
            'data'  =>  array($data),
        );
        return new JsonModel($response);
    }
    
    /**
     * Function to get the conversation
     * @return \Zend\View\Model\JsonModel
     */
    public function getConversationAction()
    {
        $msg =  $this->getServiceLocator()->get('MelisMessengerMsgTable');
        $id = (int) $this->params()->fromRoute('id', 0);
        $offset = (int) $this->params()->fromQuery('offset', 0);
        $limit = (int) $this->params()->fromQuery('limit', 10);
        //get the convo list

        $totalMessages = count($msg->getConversation($id)->toArray());
        
        $convo = $msg->getConversationWithLimit($id, $limit, $offset)->toArray();

        if($offset == 0)
            $convo = array_reverse($convo);
        foreach ($convo As $key => $val)
        {
            //check if user image is not empty and convert it to base_64, else just return the default image
            $convo[$key]['usr_image'] = $this->getUserImage($convo[$key]['usr_image']);
            
            $convo[$key]['msgr_msg_cont_date'] = date('M d, Y g:i:s A', strtotime($convo[$key]['msgr_msg_cont_date']));
            $convo[$key]['msgr_msg_cont_message'] = htmlspecialchars_decode($convo[$key]['msgr_msg_cont_message']);
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
     * @return \Zend\View\Model\JsonModel
     */
    public function getNewMessageAction()
    {
        $msgContent =  $this->getServiceLocator()->get('MelisMessengerMsgContentTable');
        $message = $msgContent->getNewMessage($this->getCurrentUserId())->toArray();
        foreach($message AS $key => $val)
        {
            $message[$key]['msgr_msg_cont_message'] = htmlspecialchars_decode($message[$key]['msgr_msg_cont_message']);
            $message[$key]['usr_image'] =  $this->getUserImage($message[$key]['usr_image']);
            $message[$key]['msgr_msg_cont_date'] = date('M d, Y g:i:s A', strtotime($message[$key]['msgr_msg_cont_date']));
        }
        $response = array(
            'messages'  =>  $message,
        );
        
        return new JsonModel($response);
    }
    
    /**
     * Function to update message status
     * @return \Zend\View\Model\JsonModel
     */
    public function updateMessageStatusAction()
    {
        $msgContent =  $this->getServiceLocator()->get('MelisMessengerMsgContentTable');
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
                $arr = array("msgr_msg_cont_status" => "read");
                $res = $msgContent->updateMessageStatus($arr, $post_var['id'], $user_id);
            }
        }
        $response = array(
            "result"    =>  $res,
        );
        return new JsonModel($response);
    }
    
    /**
     * Get all contacts to put in the inbox list
     * @return \Zend\View\Model\JsonModel
     */
    public function getInboxListAction()
    {
        $arr = array();
        $usrInfo = array();
        $totalInbox = 0;
        //get current user id
        $userId  = $this->getCurrentUserId();
        $list = $this->getServiceLocator()->get('MelisMessengerMsgContentTable');
        
        $convoIds = $this->prepareConversationId($userId);
        //check if conversation id is not empty
        if(!empty($convoIds))
        {
            //count number of contacts in the inbox
            $totalInbox = count($list->getInbox($convoIds, $userId)->toArray());
            //get the list of inbox
            $inboxList = $list->getInbox($convoIds, $userId)->toArray();
            //loop through each inbox list to process the results before returning to view
            foreach($inboxList AS $key => $val)
            {
                /*
                 * check if the usr_id = to the current user id
                 * if there are equal, dont eclude the current user to the list of contacts
                 */
                if($userId != $inboxList[$key]['usr_id'])
                {
                    /*
                     * Group the contact for every conversation
                     *
                     * It will help to display the contact in group in the future,
                     * but it will also display the individual contact
                     */
                    if(!array_key_exists($inboxList[$key]['msgr_msg_id'], $arr))
                    {
                        $arr[$inboxList[$key]['msgr_msg_id']] = array();
                        $usrInfo = array();
                    }
                    //prepare the information of the contact
                    $name = $inboxList[$key]['usr_firstname']." ".$inboxList[$key]['usr_lastname'];
                    $isOnline = $inboxList[$key]['usr_is_online'];
                    $image = $this->getUserImage($inboxList[$key]['usr_image']);
                    $contact_id = $inboxList[$key]['usr_id'];
                    $message = htmlspecialchars_decode($inboxList[$key]['msgr_msg_cont_message']);
                    //push the contact information to the array
                    array_push($usrInfo, array("name"=>$name, "isOnline"=>$isOnline, "image"=>$image, "message"=>$message));
                    //get the ready the data to be return
                    $arr[$inboxList[$key]['msgr_msg_id']]['usrInfo'] = $usrInfo;
                    $arr[$inboxList[$key]['msgr_msg_id']]['msgr_msg_id'] = $inboxList[$key]['msgr_msg_id'];
                    $arr[$inboxList[$key]['msgr_msg_id']]['contact_id'] = $contact_id;
                }
            }
        }

        $response = array(
            'data'          =>  array_values($arr),
            'totalInbox'    =>  $totalInbox,
        );
        return new JsonModel($response);
    }
    
    /**
     * Function to get the messenger time interval in the config file
     * @return \Zend\View\Model\JsonModel
     */
    public function getMsgTimeIntervalAction()
    {    
        $config = $this->getServiceLocator()->get('config');
        $msgrConfig = $config['plugins']['meliscore']['datas']['default']['messenger']['msg_interval'];
        $response = array(
            "interval" => $msgrConfig,
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
        $msg = $this->getServiceLocator()->get('MelisMessengerMsgTable');
        $mbr = $this->getServiceLocator()->get('MelisMessengerMsgMembersTable');
        
        //get the conversation id from MelisMesengerMsgTable
        $msgConvoId = $msg->getConversationIdByUserId($userId)->toArray();
        //get the conversation id from MelisMessengerMsgMembersTable
        $mbrConvoId = $mbr->getConversationIdByUserId($userId)->toArray();
        //merge the results
        $ids = array_merge($msgConvoId, $mbrConvoId);
        
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
        $melisCoreAuth = $this->getServiceLocator()->get('MelisCoreAuth');
        if($melisCoreAuth->hasIdentity())
        {
            $userAuthDatas =  $melisCoreAuth->getStorage()->read();
            $userId = (int) $userAuthDatas->usr_id;
        }
        return $userId;
    }
}