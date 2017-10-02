<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2017 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisMessenger\Form\Factory; 

use Zend\Form\Element\Text;
use Zend\ServiceManager\ServiceLocatorInterface;
use Zend\ServiceManager\FactoryInterface;

/**
 * Melis Calendar Draggble Input Input Element
 */
class MelisMessengerInputFactory extends Text implements FactoryInterface
{
    public function createService(ServiceLocatorInterface $formElementManager)
    { 
        $element = new Text;
        // Removing label of the form element
        $element->setLabel('');
        // added attribute
        $element->setAttribute('class', 'form-control melis-messenger-msg-box');
        
        return $element;
    }
}

