<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2017 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisMessenger\Model\Tables;

use MelisCore\Model\Tables\MelisGenericTable;
use Zend\Db\TableGateway\TableGateway;
use Zend\Db\Sql\Join;

class MelisMessengerMsgTable extends MelisGenericTable 
{
    /**
     * Table name
     */
    const TABLE = 'melis_messenger_msg';
    /**
     * Primary key
     */
    const PRIMARY_KEY = 'msgr_msg_id';

    /**
     * MelisCmsNewsTable constructor.
     */
    public function __construct()
    {
        $this->idField = self::PRIMARY_KEY;
    }
    
    /**
     * Function to load conversation with limit and offset
     * @param int $id
     * @param int $limit
     * @param int $offset
     * @return NULL|\Zend\Db\ResultSet\ResultSetInterface
     */
    public function getConversationWithLimit($id, $limit, $offset){
        $select = $this->tableGateway->getSql()->select();
        $select->join(array('content'=>'melis_messenger_msg_content'), 'content.msgr_msg_id = melis_messenger_msg.msgr_msg_id', array('*'), $select::JOIN_LEFT);
        $select->join(array('user'=>'melis_core_user'), 'user.usr_id = content.msgr_msg_cont_sender_id', array('usr_lastname', 'usr_firstname', 'usr_image'), $select::JOIN_LEFT);
        $select->where->equalTo("melis_messenger_msg.msgr_msg_id", $id);
        $select->offset($offset);
        $select->limit($limit);
        $select->order("content.msgr_msg_cont_date DESC");
        
        $data = $this->tableGateway->selectWith($select);
        return $data;
    }
    
    /**
     * Function to load conversation by conversation ID
     *
     * @param unknown $id
     * @return NULL|\Zend\Db\ResultSet\ResultSetInterface
     */
    public function getConversation($id){
        $select = $this->tableGateway->getSql()->select();
        $select->join(array('content'=>'melis_messenger_msg_content'), 'content.msgr_msg_id = melis_messenger_msg.msgr_msg_id');
        $select->join(array('user'=>'melis_core_user'), 'user.usr_id = content.msgr_msg_cont_sender_id', array('usr_lastname', 'usr_firstname', 'usr_image'));
        $select->where->equalTo("melis_messenger_msg.msgr_msg_id", $id);
        
        $data = $this->tableGateway->selectWith($select);
        return $data;
    }
    
    /**
     * Function to get the conversation ID buy user Id
     * @param Int $userId
     * @return NULL|\Zend\Db\ResultSet\ResultSetInterface
     */
    public function getConversationIdByUserId($userId){
        $select = $this->tableGateway->getSql()->select();
        $select->columns(array('msgr_msg_id'));
        $select->where->equalTo("msgr_msg_creator_id", $userId);
        $data = $this->tableGateway->selectWith($select);
        return $data;
    }
}