# Code Review

| Reviewer | Coder |
| -------- | ----- |
| oneohtrix |  SunnyLi |
| AlexDar |  c4almash |
| c4almash |  oneohtrix |
| Timothy |  g3aishih |
| g3aishih |  Timothy |
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

## Reviewer : Timothy

-----

## Reviewer : g3aishih

-----

## Reviewer : g3abby
 * see example
