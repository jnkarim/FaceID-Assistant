import mongoose from "mongoose";

const personSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      unique: true,
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
    //Relationship between two models
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

const Person = mongoose.models.Person || mongoose.model("Person", personSchema);

export default Person;
