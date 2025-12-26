import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/UserModel";
import { NextRequest, NextResponse } from "next/server";

connect();

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const { email, firstName, lastName, googleId, profilePicture } = reqBody;

    // Check if user already exists
    const user = await User.findOne({ email });

    if (user) {
      // User exists - update Google info if not already set
      if (!user.googleId) {
        user.googleId = googleId;
        user.profilePicture = profilePicture;
        user.authProvider = 'google';
        user.isVerified = true; // Google accounts are pre-verified
        await user.save();
      }

      return NextResponse.json({
        message: "Login successful",
        success: true,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profilePicture: user.profilePicture,
        },
      });
    }

    // Create new user for Google sign-up
    const newUser = new User({
      firstName,
      lastName,
      email,
      googleId,
      profilePicture,
      authProvider: 'google',
      isVerified: true, // Google accounts are pre-verified
    });

    const savedUser = await newUser.save();

    return NextResponse.json({
      message: "User created successfully with Google",
      success: true,
      user: {
        id: savedUser._id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        profilePicture: savedUser.profilePicture,
      },
    });
  } catch (error: any) {
    console.error("Google auth error:", error);
    return NextResponse.json(
      { error: error.message || "Authentication failed" },
      { status: 500 }
    );
  }
}