<a name="readme-top"></a>

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg?style=for-the-badge)](https://github.com/hacs/integration)

# Office 365 Card

Table of contents
-----------------

* [Introduction](#introduction)
* [Default Config](#default-config)
* [Supported Types](#supported-types)
  * [Inbox](#inbox)
  * [To Do](#to-do)
  * [Teams](#teams)

## Introduction
Needs the [Office 365 Integration](https://github.com/RogerSelwyn/O365-HomeAssistant) to work

This is a Card to show information from your Office 365 sensors into your home assistant dashboard. The intend its to create a <b>simple</b> and easy to use card to integrate the sensors information in the dashboard.

I made a video about the Office 365 integration and on my research, I couldn't find any other card that allowed me to show the information from the sensors easily. So I made this card to simplify the process for everyone that needs it.

The Icon and the name of the card are taken from the sensor's configuration

Once installed can be added from the Dashboard Panel, just search for Office365 Card

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Default Config

```yaml
type: custom:office365-card
entity: sensor.inbox
max_items: 4
only_overdue: false
```
## Supported Types

## Inbox
<p align="center"><img src="img/inbox.webp" alt="inbox sensor example img"></p>

* The card shows the email list from an email sensor ([doc](https://rogerselwyn.github.io/O365-HomeAssistant/installation_and_configuration.html#email_sensors)) or a query sensor ([doc](https://rogerselwyn.github.io/O365-HomeAssistant/installation_and_configuration.html#query_sensors))
* State Color based on importance level of the email
  * Info: Normal
  * Alert: Important

#### Options
| Name  | Requirement | Description | 
| --- | --- |  --- |
| type  | **Required** | `custom:office365-card` |
| entity | **Required**  | Home Assistant entity ID |
| max_items | Optional | Maximum amount of items to show in the card <br> The header counter will still show the real value <br> Set to 0 to show all  |
<p align="right">(<a href="#readme-top">back to top</a>)</p>

## To Do
<p align="center"><img src="img/task.webp" alt="task sensor example img"></p>

* The card Lists the items from a tasks sensor ([doc](https://rogerselwyn.github.io/O365-HomeAssistant/sensor.html#taskto-do-sensor))
* The sensor only retrieve not finished tasks, so there is no way to show the finished ones
* Each item has a link that will take you to the items page on todo.office.com
* The State Color is based on the Due Date:
  * Warning : With Due Date, not overdue
  * Alert: With Due Date, overdue
  * Info: Without Due Date

#### Options
| Name | Requirement | Description | 
| --- | --- | --- |
| type  | **Required** | `custom:office365-card` |
| entity | **Required**  | Home Assistant entity ID |
| max_items | Optional | Maximum amount of items to show in the card <br> The header counter will still show the real value <br> Set to 0 to show all  |
| only_overdue | Optional | Only show overdue tasks <br> Default: false |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Teams
<p align="center"><img src="img/teams_last_message.webp" alt="task sensor example img"></p>

* The card shows the information from the teams chat sensor ([doc](https://rogerselwyn.github.io/O365-HomeAssistant/sensor.html#teams-chat-sensor))
* Has a link that will open the conversation in teams.microsoft.com

#### Options
| Name | Requirement | Description | 
| --- | --- | --- |
| type  | **Required** | `custom:office365-card` |
| entity | **Required**  | Home Assistant entity ID |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Licence
office365-card is [MIT licenced](license.txt)



