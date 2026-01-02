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

    // ---------- EXISTING USER (Google login) ----------
    if (user) {
      // Update Google info if not already set
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

      const response = NextResponse.json(
        {
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
        },
        { status: 200 },
      );

      // auth cookie (login)
      response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      });

      // NO justSignedUp cookie here → this is login, not signup

      return response;
    }

    // ---------- NEW USER (Google sign-up) ----------
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

    const response = NextResponse.json(
      {
        message: "User created successfully with Google",
        success: true,
        user: {
          id: savedUser._id,
          email: savedUser.email,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          profilePicture: savedUser.profilePicture,
        },
      },
      { status: 201 },
    );

    // auth cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    // mark as just signed up (Google)
    response.cookies.set("justSignedUp", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 10, // 10 minutes
    });

    return response;
  } catch (error: any) {
    console.error("Google auth error:", error);
    return NextResponse.json(
      { error: error.message || "Authentication failed" },
      { status: 500 },
    );
  }
}
