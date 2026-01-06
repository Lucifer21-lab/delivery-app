const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

module.exports = (passport) => {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    // 1. Search for existing user by googleId or email
                    let user = await User.findOne({
                        $or: [
                            { googleId: profile.id },
                            { email: profile.emails[0].value }
                        ]
                    });

                    if (user) {
                        // If user exists but doesn't have a googleId linked yet, link it
                        if (!user.googleId) {
                            user.googleId = profile.id;
                            user.avatar = profile.photos[0].value;
                            user.isEmailVerified = true;
                            await user.save();
                        }
                        return done(null, user);
                    }

                    // 2. NEW USER LOGIC: Do NOT create the user in the database yet.
                    // Instead, pass the data to the next step to collect password/phone.
                    const newGoogleUser = {
                        isNewGoogleUser: true,
                        profile: {
                            googleId: profile.id,
                            name: profile.displayName,
                            email: profile.emails[0].value,
                            avatar: profile.photos[0].value
                        }
                    };

                    return done(null, newGoogleUser);
                } catch (error) {
                    console.error("Google OAuth Error:", error);
                    done(error, null);
                }
            }
        )
    );

    passport.serializeUser((user, done) => {
        // Handle both actual User models and the temporary newGoogleUser object
        const id = user.id || 'new-google-user';
        done(null, id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            if (id === 'new-google-user') return done(null, { isNewGoogleUser: true });
            const user = await User.findById(id);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });
};