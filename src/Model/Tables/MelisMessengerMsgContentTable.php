<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2017 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisMessenger\Model\Tables;

use MelisCore\Model\Tables\MelisGenericTable;
use Laminas\Db\Sql\Expression;

class MelisMessengerMsgContentTable extends MelisGenericTable 
{
    /**
     * Table name
     */
    const TABLE = 'melis_messenger_msg_content';
    /**
     * Primary key
     */
    const PRIMARY_KEY = 'msgr_msg_cont_id';

    /**
     * MelisCmsNewsTable constructor.
     */
    public function __construct()
    {
        $this->idField = self::PRIMARY_KEY;
    }
    
    /**
     * Function to get new messages for notification
     * 
     * @param unknown $id
     * @return NULL|\Laminas\Db\ResultSet\ResultSetInterface
     */
    public function getNewMessage($id)
    {
        $select = $this->tableGateway->getSql()->select();
        $select->join(array('usr'=>'melis_core_user'), 'usr.usr_id = melis_messenger_msg_content.msgr_msg_cont_sender_id', array('usr_lastname', 'usr_firstname', 'usr_image'));
        $select->join(array('msg'=>'melis_messenger_msg'), 'msg.msgr_msg_id = melis_messenger_msg_content.msgr_msg_id', array());
        $select->join(array('mbr'=>'melis_messenger_msg_members'), 'mbr.msgr_msg_id = msg.msgr_msg_id', array());
        $select->where->equalTo("mbr.msgr_msg_mbr_usr_id", $id);
        $select->where->notEqualTo("msgr_msg_cont_sender_id", $id);
        $select->where->equalTo("msgr_msg_cont_status", 1);
        $select->order("msgr_msg_cont_date DESC");
        
        $data = $this->tableGateway->selectWith($select);
        return $data;
    }
    
    /**
     * Function to load contact list
     * @param unknown $convoId
     * @param unknown $id
     * @return unknown
     */
    public function getContact($convoId, $id)
    {
        $select = $this->tableGateway->getSql()->select();
        
        $subSelect = $this->tableGateway->getSql()->select();
        $subSelect->columns(array('msgr_msg_cont_date' => new Expression('MAX(msgr_msg_cont_date)')));
        $subSelect->group('msgr_msg_id');
        $subSelect->order('msgr_msg_cont_date DESC');
        
        $select->join(array("msg"=>"melis_messenger_msg"), "msg.msgr_msg_id = melis_messenger_msg_content.msgr_msg_id", array('msgr_msg_id'), $select::JOIN_LEFT);
        $select->join(array("mbr"=>"melis_messenger_msg_members"), "msg.msgr_msg_id = mbr.msgr_msg_id", array(), $select::JOIN_LEFT);
        $select->join(array("user"=>"melis_core_user"), "user.usr_id = mbr.msgr_msg_mbr_usr_id", array("usr_id", "usr_lastname", "usr_firstname", "usr_image", "usr_is_online"), $select::JOIN_LEFT);
        $select->where->in("msg.msgr_msg_id", $convoId);
        $select->where->notEqualTo("mbr.msgr_msg_mbr_usr_id", $id);
        $select->where->in("melis_messenger_msg_content.msgr_msg_cont_date", $subSelect);
        $select->group("msg.msgr_msg_id");
        $select->order("melis_messenger_msg_content.msgr_msg_cont_date DESC");

        $data = $this->tableGateway->selectWith($select);
        
        return $data;
    }
    
    /**
     * Function to update message status
     * @param Array $data
     * @param Int $convo_id
     * @param Int $user_id
     * @return number - Number of affected row
     */
    public function updateMessageStatus($data, $convo_id, $user_id)
    {
        $update = $this->tableGateway->getSql()->update();
        $update->set($data);
        $update->where->equalTo("msgr_msg_id", $convo_id);
        $update->where->notEqualTo("msgr_msg_cont_sender_id", $user_id);
        $res = $this->tableGateway->updateWith($update);
        
        return $res;
    }
}