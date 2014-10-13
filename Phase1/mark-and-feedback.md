# Feedback

* For your project reasoning, I think the fact that the current time management tool is bad could be construed as motivation to build a better one, rather than to avoid it. Still, what you wrote is fine.

* Your biography page should indicate in which order the members are listed. For example, listing members from left to right, back to front.

* For user story #5, typically websites allow users to log-in using their e-mail, while still specifying their own username. Perhaps the user story should be about being able to log-in using the uoft email (or the first part of it), rather than it being your username.

* For user story #6, I'm a bit surprised this is classified as low. This seems like an essential feature for every login-based service. Users have to login in many websites so they tend to forget their website. If they do and this is not implemented, they wouldn't be able to use the service (unless they create a new account).

* More suggestions of user stories: should messages for a channel be threaded? what are the privacy concerns (public/private channels)? are messages archived? are permissions required to create channels and join specific channels?

* For the release planning document, the # of each user story seems missing?

* The MVP should include more details on how the interface will be easy-to-use. How will you organize the messages in a readable format for larger groups (eg. a channel for a course with 350 students?). How will an user be able to navigate through all its channels?

* For the Message CRC card: it should have Channel as collaborator since it knows the channel it belongs to.

* For the Channel CRC card: does a channel knows its messages? Message is listed as collaborator but it does not have any responsabilities tied to Message.

* For the DAO CRC card: I do not believe "Get user’s authority, given a user" is a necessary responsability. If you already know the user, then you can easily query the user to know its responsabilities, since according to the User CRC, it knows its own responsabilities. It would be different if the DAO can return authorities based only on username though.

* You did not play out your scenarios using the CRC cards.

# Mark

* CRC cards: 10/15
* MVP: 13/15
* Everything else, full marks
* Total: 68/75

PS: AlexDar did not setup his personal repository, please do so, so that I can assign your individual grade.
