<?php

/**
 * Melis Technology (http://www.melistechnology.com)
 *
 * @copyright Copyright (c) 2017 Melis Technology (http://www.melistechnology.com)
 *
 */

namespace MelisMessenger\Form\Factory; 

use Psr\Container\ContainerInterface;
use Laminas\Form\Element\Textarea;
use Laminas\ServiceManager\ServiceLocatorInterface;
use Laminas\ServiceManager\FactoryInterface;

class MelisMessengerInputFactory extends Textarea
{
    public function __invoke(ContainerInterface $container, $requestedName)
    {
        $element = new Textarea;
        // Removing label of the form element
        $element->setLabel('');
        // added attribute
        $element->setAttribute('class', 'form-control melis-messenger-msg-box');

        return $element;
    }
}

