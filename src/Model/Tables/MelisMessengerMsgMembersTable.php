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

class MelisMessengerMsgMembersTable extends MelisGenericTable 
{
    protected $tableGateway;
    protected $idField;
    
    public function __construct(TableGateway $tableGateway)
    {
        parent::__construct($tableGateway);
        $this->idField = 'msgr_msg_mbr_id';
    }
    
    /**
     * Function to get the conversation ID by user ID
     * @param Int $userId
     * @return NULL|\Zend\Db\ResultSet\ResultSetInterface
     */
    public function getConversationIdByUserId($userId)
    {
        $select = $this->tableGateway->getSql()->select();
        $select->columns(array('msgr_msg_id'));
        $select->where("msgr_msg_mbr_usr_id = $userId");
        $select->group('msgr_msg_id');
        $data = $this->tableGateway->selectWith($select);
        return $data;
    }
}