<?php

namespace MelisMessenger;
use Laminas\Mvc\ModuleRouteListener;
use Laminas\Mvc\MvcEvent;
use Laminas\ModuleManager\ModuleManager;
use Laminas\Stdlib\ArrayUtils;
use Laminas\Session\Container;

/**
 * Class Module
 * @package MelisMessenger
 * @require melis-core
 */
class Module
{
    
    public function init(ModuleManager $manager)
    {
    }
    
    public function onBootstrap(MvcEvent $e)
    {
        $this->createTranslations($e);
    }
    
    public function getAutoloaderConfig()
    {
        return array(
            'Laminas\Loader\StandardAutoloader' => array(
                'namespaces' => array(
                    __NAMESPACE__ => __DIR__ . '/src/' . __NAMESPACE__,
                ),
            ),
        );
    }

    public function getConfig()
    {
        $config = array();
    	$configFiles = array(
			include __DIR__ . '/../config/module.config.php',
			include __DIR__ . '/../config/app.interface.php',
			include __DIR__ . '/../config/app.forms.php',
			include __DIR__ . '/../config/diagnostic.config.php',
    	);
    	
    	foreach ($configFiles as $file) {
    		$config = ArrayUtils::merge($config, $file);
    	} 
    	
    	return $config;
    }
	
	public function createTranslations($e)
    {
        $sm = $e->getApplication()->getServiceManager();
        $translator = $sm->get('translator');

        // Get the locale used from meliscore session
        $container = new Container('meliscore');
        $locale = $container['melis-lang-locale'];

        // Load files

        if (!empty($locale))
        {   
            $translationType = array(
                'interface',
            );
            
            $translationList = array();
            if(file_exists($_SERVER['DOCUMENT_ROOT'].'/../module/MelisModuleConfig/config/translation.list.php')){
                $translationList = include 'module/MelisModuleConfig/config/translation.list.php';
            }

            foreach($translationType as $type){
                
                $transPath = '';
                $moduleTrans = __NAMESPACE__."/$locale.$type.php";
                
                if(in_array($moduleTrans, $translationList)){
                    $transPath = "module/MelisModuleConfig/languages/".$moduleTrans;
                }

                if(empty($transPath)){
                    
                    // if translation is not found, use melis default translations
                    $defaultLocale = (file_exists(__DIR__ . "/../language/$locale.$type.php"))? $locale : "en_EN";
                    $transPath = __DIR__ . "/../language/$defaultLocale.$type.php";
                }
                
                $translator->addTranslationFile('phparray', $transPath);
            }
        }
    }
}