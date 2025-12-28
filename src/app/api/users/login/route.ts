/* eslint-disable @typescript-eslint/no-explicit-any */
import { connect } from "@/dbConfig/dbConfig";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "@/models/UserModel";
import { NextRequest, NextResponse } from "next/server";

connect();

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const { email, password } = reqBody;

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: "User does not exist" },
        { status: 400 }
      );
    }

    if (user.authProvider === "google") {
      return NextResponse.json(
        { error: "Please use Google Sign-In for this account" },
        { status: 400 }
      );
    }

    // ✅ Check if password exists (safety check)
    if (!user.password) {
      return NextResponse.json(
        { error: "This account uses Google Sign-In. Please use Google to log in." },
        { status: 400 }
      );
    }

    const validPassword = await bcryptjs.compare(password, user.password);

    if (!validPassword) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 400 }
      );
    }

    // Generate token
    const tokenData = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    };

    const token = jwt.sign(tokenData, process.env.TOKEN_SECRET!, {
      expiresIn: "7d",
    });

    console.log("LOGIN TOKEN_SECRET:", process.env.TOKEN_SECRET);

    const response = NextResponse.json({
      message: "Login successful",
      success: true,
    });

    // Token save in cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 7 * 24 * 60 * 60, 
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
