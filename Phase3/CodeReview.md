# Code Review

| Reviewer   | Coder         |
| --------   | -----         |
| oneohtrix  |  SunnyLi      |
| AlexDar    |  c4almash     |
| c4almash   |  oneohtrix    |
| timothylai |  g3aishih     |
| g3aishih   |  timothylai   |
| SunnyLi    |  g3abby       |
| g3abby     |  AlexDar      |

-----

## Reviewer : oneohtrix

* Good eye for bugs: caught not being able to send a message with Enter on browsers other than Google Chrome in #25.
* I think the code for alerting errors is kind of hacky (#24). Instead of using the cookie to display errors (which may be modified on the user side), there should be a good error handling mechanism so that Express can percolate the error out on the response, similar to the way django or ror does it (not sure if there exists an easy way to do this, however)

-----

## Reviewer : SunnyLi

Abby did many of the write-ups but not any code related commits through her account as can be seen
[here](https://github.com/csc301-fall2014/Proj-Evening-Team1-repo/commits/master?author=g3abby).

However, she worked with Alex to complete the initial front-end design as seen
[here](https://github.com/csc301-fall2014/Proj-Evening-Team1-repo/compare/8c1dfb50...adc6c1d5).

 * I find the initial markup for the login form a little hackish, that the design wasn't very
   engaging to users nor does it follow the flat UI design principle which we are using as I noted
   [here](https://github.com/csc301-fall2014/Proj-Evening-Team1-repo/commit/8581e0847f864ba14d7f7e48676111647ba679f7).
 * I thought that the login form designed with responsiveness in mind was very thoughtful -
   but it doesn't work very well here in practice..

These commits gave me great ideas which made me decide to improve it with PR
[#24](https://github.com/csc301-fall2014/Proj-Evening-Team1-repo/pull/24)

-----

## Reviewer : AlexDar
 * He found a npm bug and then implemented a clever solution commit c736cca7e43e77ef0aba0f22881198abef1b6e93
 * I find it impressive the speed with which he implemented the solution and also the decision to fix it himself instead of opening up an issue and possibly waiting a long time for someone else to tackle the problem.
 * I suggested he document at least some parts of the issue (at mininum the original cause, as well as the fix -> if not in an issue log then perhaps as a comment in the code)

-----

## Reviewer : c4almash
 * He found a serious issue in the login interface


-----

## Reviewer : timothylai
* Implementing the back button for the lost password page makes it much easier for navigation.
* The lost password function works excellent without faults with the nodemailer package.
* The interface and code is simple and corresponds well with our current interfaces.
* Forgot-password.HTML follows the same design schema and is consistant with the login page

-----

## Reviewer : g3aishih
 * Timothy worked with Sunny to redesign the homepage login. (#24 commit c85ea01)
 * The <form> tags now appear to be properly defined in index.html
 * They got rid of unneeded css files (styleRESP.css) so there's less junk in our src folder
 * I like the simple design, combining the power of bootstrap and our own css
 * Good use of classes in the html/css, pretty clean css
 * Could be using a min version of styles.css to make the files size a TINY bit smaller

-----

## Reviewer : g3abby
 * Fixed the page not open issue in the style sheet. (commit id: adc6c1d)
 * I found that it's tricky to catch the conflicting style.css files issue which caused page could be loaded. (commit id: 8ec2a9b)
 * I figured that the HTML front-end login screen he designed is simple and neat. (commit id: 8581e08)
 * Added the CSS style sheet to make the UI look neat. (commit id: 8ec2a9b87b38e7690dbf8cded5c3aeea61cf2ce2)
