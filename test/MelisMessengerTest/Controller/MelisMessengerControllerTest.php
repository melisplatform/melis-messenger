<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2016 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisMessengerTest\Controller;

use MelisCore\ServiceManagerGrabber;
use Laminas\Test\PHPUnit\Controller\AbstractHttpControllerTestCase;
class MelisMessengerControllerTest extends AbstractHttpControllerTestCase
{
    protected $traceError = false;
    protected $sm;
    const SUCCESS = 1;

    public function setUp()
    {
        $this->sm  = new ServiceManagerGrabber();
    }

    private function getMessengerContentTable()
    {
        $model = 'MelisMessenger\Model\MelisMessenger';

        return $this->sm->getTableMock(new $model,
            'MelisMessenger\Model\Tables\MelisMessengerMsgContentTable',
            'melis_messenger_msg_content', 'fetchAll');

    }

    public function getPayload($method)
    {
        return $this->sm->getPhpUnitTool()->getPayload('MelisMessenger', $method);
    }

    /**
     * START ADDING YOUR TESTS HERE
     */

    public function testSendMessageToUserId1()
    {

        $data = array(
            'msgr_msg_cont_id'  =>  null,
            'msgr_msg_id'  =>  123456,
            'msgr_msg_cont_sender_id'  =>  1,
            'msgr_msg_cont_message'  =>  'This is a test from PHPunit.',
            'msgr_msg_cont_date'  =>  date('Y-m-d H:i:s'),
            'msgr_msg_cont_status'  =>  'new',
        );
        $result = (int) $this->getMessengerContentTable()->save($data);

        // if result returns a valid int value
        if($result) {
            $result = 1;
        }


        $this->assertSame($result, self::SUCCESS);
    }
}

