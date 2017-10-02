<?php
namespace MelisMessenger\Form\View\Helper;
 
use Zend\Form\View\Helper\FormRow;
use Zend\Form\ElementInterface;
 
class MelisMessengerFieldRow extends FormRow
{
	
	const MELIS_MESSENGER_INPUT_BOX   = 'melis-messenger-msg-box';
	
	public function render(ElementInterface $element, $labelPosition = null)
	{
		if($element->getAttribute('class') == self::MELIS_MESSENGER_INPUT_BOX){
			$formElement = '';
			$element->setLabel('');
			$formElement = '<div class="input-group test">
								'.parent::render($element).'
								<div class="input-group-btn">
									<button type="submit" class="btn btn-primary"><i class="fa fa-paper-plane"></i></button>
								</div>
							</div>';
			return $formElement;
		}
	}
	
	/**
	 * Returns the class attribute of the element
	 * @param ElementInterface $element
	 * @return String
	 */
	protected function getClass(ElementInterface $element)
	{
	    return $element->getAttribute('class');
	}
}