<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2017 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisMessenger\Form\Factory; 

use Zend\Form\Element\Textarea;
use Zend\ServiceManager\ServiceLocatorInterface;
use Zend\ServiceManager\FactoryInterface;

class MelisMessengerInputFactory extends Textarea implements FactoryInterface
{
    public function createService(ServiceLocatorInterface $formElementManager)
    { 
        $element = new Textarea;
        // Removing label of the form element
        $element->setLabel('');
        // added attribute
        $element->setAttribute('class', 'form-control melis-messenger-msg-box');
        
        return $element;
    }
}

