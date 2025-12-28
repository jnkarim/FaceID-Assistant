/* eslint-disable @typescript-eslint/no-explicit-any */
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/UserModel";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

connect();

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const { email, firstName, lastName, googleId, profilePicture } = reqBody;

    const user = await User.findOne({ email });

    if (user) {
      // User exists - update Google info if not already set
      if (!user.googleId) {
        user.googleId = googleId;
        user.profilePicture = profilePicture;
        user.authProvider = "google";
        await user.save();
      }

      const tokenData = {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      };

      const token = jwt.sign(tokenData, process.env.TOKEN_SECRET!, {
        expiresIn: "7d",
      });

      console.log("GOOGLE LOGIN TOKEN_SECRET:", process.env.TOKEN_SECRET);

      const response = NextResponse.json({
        status: 200,
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

      //attach cookie with response object
      response.cookies.set("token", token, {
        httpOnly: true,
        path: "/",
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });

      return response;
    }

    // Create new user for Google sign-up
    const newUser = new User({
      firstName,
      lastName,
      email,
      googleId,
      profilePicture,
      authProvider: "google",
    });

    const savedUser = await newUser.save();

    const tokenData = {
      id: savedUser._id,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      email: savedUser.email,
    };

    const token = jwt.sign(tokenData, process.env.TOKEN_SECRET!, {
      expiresIn: "7d",
    });

    const response = NextResponse.json({
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

    response.cookies.set("token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error("Google auth error:", error);
    return NextResponse.json(
      { error: error.message || "Authentication failed" },
      { status: 500 }
    );
  }
}
