<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2017 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisMessenger\Model\Tables;

use MelisCore\Model\Tables\MelisGenericTable;

class MelisMessengerMsgMembersTable extends MelisGenericTable 
{
    /**
     * Table name
     */
    const TABLE = 'melis_messenger_msg_members';
    /**
     * Primary key
     */
    const PRIMARY_KEY = 'msgr_msg_mbr_id';

    /**
     * MelisCmsNewsTable constructor.
     */
    public function __construct()
    {
        $this->idField = self::PRIMARY_KEY;
    }
    
    /**
     * Function to get the conversation ID by user ID
     * @param Int $userId
     * @return NULL|\Laminas\Db\ResultSet\ResultSetInterface
     */
    public function getConversationIdByUserId($userId)
    {
        $select = $this->tableGateway->getSql()->select();
        $select->columns(array('msgr_msg_id'));
        $select->where->equalTo("msgr_msg_mbr_usr_id", $userId);
        $select->group('msgr_msg_id');
        $data = $this->tableGateway->selectWith($select);
        return $data;
    }
}