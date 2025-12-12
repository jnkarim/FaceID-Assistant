"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface Signup {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = () => {};

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-8">
      <div className="w-full grid grid-cols-1 lg:grid-cols-2">
        {/*Left Column- the form*/}
        <div className="flex flex-col justify-center gap-2">
          {/*Header*/}
          <div className="text-white text-xl font-semibold">
            FaceID Assistant
          </div>

          {/*Navigate to Home*/}
          <nav className="flex items-center gap-2">
            <Link
              href="/"
              className="text-lg font-bold text-neutral-400 hover:text-lime-400 transition underline"
            >
              Home
            </Link>
          </nav>

          <div className="flex flex-row">
            <h1 className="text-3xl font-bold text-white">Already a member?</h1>

            <Link
              href="/auth/login"
              className="text-lime-400 hover:text-lime-300 transition font-medium underline"
            >
              Log in
            </Link>
          </div>

          {/*Form*/}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/*first name & last name*/}
            <div className="flex flex-row justify-between gap-4">
              {" "}
              <input
                name="firstName"
                type="text"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full bg-transparent px-6 py-4 text-white border border-neutral-400 focus:border-lime-400 rounded-xl transition placeholder-neutral-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <input
                name="lastName"
                type="text"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full bg-transparent px-6 py-4 text-white border border-neutral-400 focus:border-lime-400 rounded-xl transition placeholder-neutral-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            {/*email*/}
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-transparent px-6 py-4 text-white border border-neutral-400 focus:border-lime-400 transition rounded-xl placeholder-neutral-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {/*password*/}
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="********"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-transparent px-6 py-4 text-white border border-neutral-400 focus:border-lime-400 transition rounded-xl placeholder-neutral-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-lime-400 transition disabled:opacity-50"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/*Submit Button*/}
            <div className="pt-2">
              {" "}
              <button
                type="submit"
                className="w-full px-8 py-4 bg-lime-400 text-black rounded-xl hover:bg-lime-300 transition font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Account
              </button>
            </div>

            <p className="text-neutral-500 text-sm">
              By creating an account, you agree to our Terms of Service and
              Privacy Policy
            </p>
          </form>
        </div>
        {/*Right Column- image*/}
        <div className="flex flex-col justify-center"></div>
      </div>
    </div>
  );
}
