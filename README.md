# Exercise Tracker REST API

#### A microservice project, part of Free Code Camp's curriculum

### Status

This project uses express.js & a Mongo Database [(https://mlab.com/)](https://mlab.com/). The App should fufill FCC objectives. The Project can be found & tested here:

[https://healthy-aphid.glitch.me/](https://healthy-aphid.glitch.me/)

I have also created a results page to extend the functionality. The results page uses pug and is useful for debugging etc. It shows the current user and exercise list pulled from the database:

[https://healthy-aphid.glitch.me/results](https://healthy-aphid.glitch.me/results)

### User Stories

1. I can create a user by posting form data username to /api/exercise/new-user and returned will be an object with username and _id.
2. I can get an array of all users by getting api/exercise/users with the same info as when creating a user.
3. I can add an exercise to any user by posting form data userId(_id), description, duration, and optionally date to /api/exercise/add. If no date supplied it will use current date. Returned will the the user object with also with the exercise fields added.
4. I can retrieve a full exercise log of any user by getting /api/exercise/log with a parameter of userId(_id). Return will be the user object with added array log and count (total exercise count).
5. I can retrieve part of the log of any user by also passing along optional parameters of from & to or limit. (Date format yyyy-mm-dd, limit = int)
