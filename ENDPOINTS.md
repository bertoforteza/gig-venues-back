## Users Endpoints

### Register

- [POST] “/user/register”
  - Status: 201

### Login

- [POST] “/user/login”
  - Status: 200

## Venues Endpoints

### HomePage

- [GET] “/”
  - Status: 200
- [GET] “/home”
  - Status: 200

### VenueDetailedCard

- [GET] “/venues/id”
  - Status: 200

### Venues search results

- [GET] “/venues”
  - Status: 200

### MyVenuesList

- [GET] “/my-venues”
  - Status: 200

### MyVenueDetailed

- [GET] “/my-venues/id”
  - Status: 200

### CreateVenue

- [POST] “/my-venues/new”
  - Status: 201

### NotFoundPage

- [GET] “/\*”
  - Status: 404

### UpdateVenue

- [PUT] “/my-venues/id/update”
  - Status: 201

### DeleteVenue

- [DELETE] “/my-venues/delete”
  - Status: 200
