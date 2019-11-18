# Changelog
## Current
### Features
* Add /campuses/{id}/users route 
* Remove logic of automatic static validation
* Add SMS on refusal
* Refactor planning vehicule and remove dead/old code and lib
* Add Redis sync capability
* Add right to list user own rides and delete it
### Fix
## Version 1.4.2
### Features
* Hours of campus are now configurable
### Fix
* Fix issue on rights / rules
## Version 1.4.1
### Features
* Add timezone inside campus entity
* Save GDPR approve date in user entity 
### Fix
* Change default TZ env variable
* Fix token check for ride view
## Version 1.4.0
### Features
* Change user firstname/lastname model
* Add account management for anonymous
### Fix
* Fix POI search on label instead of name field 
## Version 1.3.1
### Features
 * Superadmin is now able to list all campuses
## Version 1.3.0
### Features
* Add phone management.
* Add roles to prevent unauthorized add/revoke of roles
* Added CRUD tests for basic routes
* Let user change self password
### Fix
* Fix search location for campus rule
* Fix filters addition for POI CRUD
* Fix ctx param in check rights middleware
## Version 1.2.1
### Fix
* When the dataset was too large, geolocations was impossible to query
## Version 1.2.0
### Features
* Improved driver management.
* Add POIs per base rights (local admin)
* Add logging capabilities
* Add createdAt mongoose plugin
* Add genericCRUD helper
* Fix CSV export
### Fix
## Version 1.1.0
### Features
* POIs per base
* Rights management reviewed
* Add missing rights controls
* SMS sent before validation
### Fix
* Fix POIs pagination
* Segfault nodejs 11.12

