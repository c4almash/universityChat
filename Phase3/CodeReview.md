# Code Review

| Reviewer | Coder |
| -------- | ----- |
| oneohtrix |  SunnyLi |
| AlexDar |  c4almash |
| c4almash |  oneohtrix |
| timothylai |  g3aishih |
| g3aishih |  timothylai |
| SunnyLi |  g3abby |
| g3abby |  AlexDar |

-----

## Reviewer : oneohtrix

* Good eye for bugs: caught not being able to send a message with Enter on browsers other than Google Chrome in #25.
* I think the code for alerting errors is kind of hacky (#24). Instead of using the cookie to display errors (which may be modified on the user side), there should be a good error handling mechanism so that Express can percolate the error out on the response, similar to the way django or ror does it (not sure if there exists an easy way to do this, however)

-----

## Reviewer : SunnyLi

-----

## Reviewer : AlexDar

-----

## Reviewer : c4almash

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

-----

## Reviewer : g3abby
 * see example
