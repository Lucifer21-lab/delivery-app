const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

module.exports = (passport) => {
    passport.use(
        // create a new instance of Google Strategy
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL
            },

            // Verification callback function
            // profile -->  object containing user information from Google like Google ID, display name, email and profile picture
            async (accessToken, refreshToken, profile, done) => {
                console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
                try {
                    // find user if it has logged in with google earlier
                    let user = await User.findOne({ googleId: profile.id });

                    if (user) {
                        console.log("User logged with google before --> server/src/config/passport");
                        return done(null, user);
                    }

                    // find user if it exists but it has not logged in before using google and is trying for the first time
                    user = await User.findOne({ email: profile.emails[0].value });

                    if (user) {
                        console.log("User logged with google first time --> server/src/config/passport");
                        user.googleId = profile.id;
                        user.avatar = profile.photos[0].value;
                        user.isEmailVerified = true;
                        await user.save();
                        return done(null, user);
                    }

                    // if user does nto exists and is logging with google then create a new instance of it
                    user = await User.create({
                        googleId: profile.id,
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        avatar: profile.photos[0].value,
                        isEmailVerified: true
                    });

                    console.log("Creating user --> server/src/config/passport");
                    done(null, user);
                } catch (error) {
                    console.log("Google OAuth Configuration failed in -->  server/src/config/passport.js");
                    done(error, null);
                }
            }
        )
    );

    // below 2 functions are essential for managing user sessions

    // After a user logs in, this function is called. It decides what information about the user should be stored in the session/cookie. 
    // Here, you are only storing the user's unique _id from MongoDB.
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });


    // On every subsequent request, Passport takes the ID from the session (that was stored by serializeUser) and uses it to fetch the
    // full user object from the database. This makes the user object available on req.user.
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });
};
