# Changelog
## Current
### Features
* Added stats route
* Added capacity to car model model
* Added capacity check in ride pre validate hook
* Changed logger from Winston to Pino
* Added shuttle routes and model
* Added shuttle factory routes and model
* Move rides & time slots into /campuses route
### Fix
## Version 1.4.6c
### Fix
* Website user was not able to request a ride
## Version 1.4.6
### Features
* Enforce allowed methods error
* Enforce CORS allowed origin
* Add few HTTP headers thanks to helmet
* Ensure that MX entry exists for an email address
* Add a limit to email size.
* Add ratings stats to :campus/stats route
### Fix
* Normalize email in find
* Ensure that email is compliant with Regex
* Check filter for phone listing
* Don't let admin remove a user
* Ensure that car is linked to the current selected campus
* Clean POI authorizations 
* Throw error if ride has the same departure and arrival POI
* Added rate limit model & handles it for password attempt
* Fixed rights for user update
* Added required to coordinates in campus model
* Added rights to drivers-positions.mjs
* Scoped CRUD rights to campus
* CSV import duplication error message
* id to _id conversion
* Refs for batch phones route
* Fix drivers right to edit ride status
* Fixed self editing rights for user
## Version 1.4.5
### Features
* Added connection status management for drivers through sockets
* Add recurring time slots
* Add csv middleware to list routes when needed
* Add batch crud route to handle csv imports
* Export metrics for prometheus
### Fix
* bump validator to 12.1.0 & deleted node-input-validator
* Updated csv flatten middleware to common csv formatter for rides
* Deleted password from token
* Set rating route status code to 204
## Version 1.4.4
### Features
* Refactor rights to be able to check inheritance and add rights on model
* Add rating form route and model
* Add push notifications
* User can delete his own account
* Add password constraint
* Add password expiration
* Add rights for admin to update his own campuses
* Add date coherence control
* Add mergeMasks helper
* Add defaultReservationScope to campus model
* Add possibility for ride owner to cancel ride by updating status
### Fix
* Remove logs from mongodb, using Loki stack right now
* Export dashboard and monitoring on deploy
* Rides and ratings routes tests
* Link in registration mail
* Fix fixtures script
* Fix deprecation warnings
## Version 1.4.3
### Features
* Add /campuses/{id}/users route 
* Remove logic of automatic static validation
* Add SMS on refusal
* Refactor cars planning and remove dead/old code and lib
* Add Redis sync capability
* Add filter management to pois list route
* Add enabled field to Poi model
* Add right to list user own rides and delete it
* Standardize email content
### Fix
* Fix potential leak of hashed password
* Fix SMS on cancel
* Fix errors on post/patch /users /campuses/{id}/users /campuses/{id}/drivers
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

