import { connect } from "@/dbConfig/dbConfig";
import Person from "@/models/PersonModel";
import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";

connect();

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const { name, info, descriptor } = body;

    console.log("Received data:", { name, info: info ? "present" : "missing", descriptorLength: descriptor?.length });

    // Validate input
    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "Name is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    if (!info || typeof info !== "string" || info.trim() === "") {
      return NextResponse.json(
        { error: "Info/description is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    if (!descriptor || !Array.isArray(descriptor)) {
      return NextResponse.json(
        { error: "Descriptor is required and must be an array" },
        { status: 400 }
      );
    }

    // Check if descriptor has correct length (128 numbers)
    if (descriptor.length !== 128) {
      return NextResponse.json(
        {
          error: `Invalid descriptor length. Expected 128, got ${descriptor.length}`,
        },
        { status: 400 }
      );
    }

    const existingPerson = await Person.findOne({
      userId: user.id,
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });

    if (existingPerson) {
      return NextResponse.json(
        { error: "Person with this name already exists" },
        { status: 409 }
      );
    }

    // Create new person
    const newPerson = new Person({
      name: name.trim(),
      info: info.trim(),
      descriptor,
      userId: user.id,
    });

    console.log("Creating person with data:", {
      name: newPerson.name,
      info: newPerson.info,
      hasDescriptor: !!newPerson.descriptor,
      descriptorLength: newPerson.descriptor?.length,
      userId: newPerson.userId
    });

    await newPerson.save();

    console.log(`Person registered: ${name} with info: ${info.substring(0, 50)}...`);
    const totalCount = await Person.countDocuments();
    console.log(`Total persons: ${totalCount}`);

    return NextResponse.json(
      {
        success: true,
        message: "Person registered successfully",
        person: {
          id: newPerson._id,
          name: newPerson.name,
          info: newPerson.info,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {// eslint-disable-line @typescript-eslint/no-explicit-any
    console.error("Registration error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Person with this name already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const persons = await Person.find({ userId: user.id })
      .select("name info descriptor createdAt")
      .lean();

    console.log(`Fetching persons. Total: ${persons.length}`);

    return NextResponse.json(
      {
        success: true,
        users: persons.map((p) => ({
          id: p._id,
          name: p.name,
          info: p.info,
          descriptor: p.descriptor,
          createdAt: p.createdAt,
        })),
      },
      { status: 200 }
    );
  } catch (error: any) {// eslint-disable-line @typescript-eslint/no-explicit-any
    console.error("Fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch persons: " + error.message },
      { status: 500 }
    );
  }
}

// DELETE - Remove a person by name
export async function DELETE(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");

    if (!name) {
      return NextResponse.json(
        { error: "Name parameter is required" },
        { status: 400 }
      );
    }

    const deletedPerson = await Person.findOneAndDelete({
      userId: user.id,
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });

    if (!deletedPerson) {
      return NextResponse.json({ error: "Person not found" }, { status: 404 });
    }

    console.log(`Person deleted: ${name}`);
    const remainingCount = await Person.countDocuments();
    console.log(`Remaining persons: ${remainingCount}`);

    return NextResponse.json(
      {
        success: true,
        message: "Person deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {// eslint-disable-line @typescript-eslint/no-explicit-any
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete person: " + error.message },
      { status: 500 }
    );
  }
}