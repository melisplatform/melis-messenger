# melis-messenger

MelisMessenger offers a messenging system inside the platform so that collaborators can talk to each others.

## Getting Started

These instructions will get you a copy of the project up and running on your machine.

### Prerequisites

You will need to install melisplatform/melis-core in order to have this module running.  
This will automatically be done when using composer.

### Installing

Run the composer command:

```
composer require melisplatform/melis-messenger
```

### Database

Database model is accessible on the MySQL Workbench file:  
/melis-messenger/install/sql/model  
Database will be installed through composer and its hooks.  
In case of problems, SQL files are located here:  
/melis-messenger/install/sql

## Tools & Elements provided

- Messenger tab in the Profile section
- Header icon to visualize the new messages

## Running the code

### MelisMessenger Services

- MelisMessengerService  
  Provides services to send and get messages

File: /melis-messenger/src/Service/MelisMessengerService.php

```
// Get the service
$messengerService = $this->getServiceManager()->get('MelisMessengerService');
// save datas of this page with an array of keys of the names of the table's columns
$convo_id = $messengerService->saveMsg(array(...));
```

## Authors

- **Melis Technology** - [www.melistechnology.com](https://www.melistechnology.com/)

See also the list of [contributors](https://github.com/melisplatform/melis-messenger/contributors) who participated in this project.

## License

This project is licensed under the OSL-3.0 License - see the [LICENSE](LICENSE) file for details
