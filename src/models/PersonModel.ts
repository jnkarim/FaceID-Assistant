import mongoose from "mongoose";

const personSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
    },
    info: {
      type: String,
      required: [true, "Please provide description of the user"],
      trim: true,
    },
    descriptor: {
      type: [Number],
      required: [true, "Please provide a face descriptor"],
      validate: {
        validator: function (arr: number[]) {
          return arr.length === 128;
        },
        message: "Descriptor must contain exactly 128 numbers",
      },
    },
    // Relationship between two models
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index: name must be unique per user
personSchema.index({ name: 1, userId: 1 }, { unique: true });

const Person = mongoose.models.Person || mongoose.model("Person", personSchema);

export default Person;