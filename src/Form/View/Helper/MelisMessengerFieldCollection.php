<?php

namespace MelisMessenger\Form\View\Helper;
 
use Zend\Form\View\Helper\FormCollection;
 
class MelisMessengerFieldCollection extends FormCollection
{
    protected $defaultElementHelper = 'MelisMessengerFieldRow';
}