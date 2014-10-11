## CRC Cards

| User                            |
| ------------------------------- |
| Has a username and password     |
| Has authorities                 |
| Knows its own blocked users list|

| Message                         | Collaborators           |
| ------------------------------- | ----------------------- |
| Has an identifier               | User                    |
| Knows its posting user          |                         |
| Knows its posting date/time     |                         |
| Knows the channel it belongs to |                         |

| Channel (Thread)              | Collaborators       | 
| ----------------------------- | ---------------------  | 
| Knows its admin(s)            | User                   |
| Knows an identifier           | Message                |
| Knows its link and title      |                        |
| Knows its main category       |                        |
| Knows its domain (university) |                        |
| Knows its subscribers         |                        |


| Interface [DAO]                                         | Collaborators                     | 
| ------------------------------------------------------- | --------------------------------- | 
| Create a user, take in a username and given a password  | User                              |
| Get a user, given his/her username and password         | Message                           |
| Post a public message to the specified channel          | Channel                           |
| Create a channel under the specified main category      |                                   |
| Get all subscribed channels, given a username           |                                   |
| Get all subscribers, given a channel                    |                                   |
| Reset the password, given a username                    |                                   |
| Get a channel, given its identifier / title / link      |                                   |
| Get a message, given its identifier                     |                                   |
| Get all messages, given a channel                       |                                   |
| Get all channels, given a main category                 |                                   |
| Get all channels, given a domain                        |                                   |
| Subscribe a user to the specified channel               |                                   |
| Get user’s authority, given a user                      |                                   |
| Mute / kick out a user in the channel                   |                                   |
| Send email notification                                 |                                   |
| Set Admin for the specified channel, given a user       |                                   |

