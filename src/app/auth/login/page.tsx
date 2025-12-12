"use client";

import { Eye, EyeClosed } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
export interface Login {
  email: string;
  password: string;
}

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
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
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md flex flex-col gap-8">
        {/*Header*/}
        <div className="flex flex-col justify-center gap-4">
          <div className="text-white text-xl font-semibold">
            FaceID Assistant
          </div>
          {/*Navigate to Home*/}
          <nav className="flex items-center gap-2">
            <Link
              href="/"
              className="text-lg font-bold text-neutral-400 hover:text-lime-400 transition underline"
            >
              {" "}
              Home{" "}
            </Link>
          </nav>

          <div className="flex flex-col   gap-2">
            <h1 className="text-3xl font-bold text-white">
              {"Don't have an account?"}
            </h1>

            <Link
              href="/auth/signup"
              className="text-lime-400 hover:text-lime-300 transition font-medium underline"
            >
              Sign up
            </Link>
          </div>
        </div>

        {/*Form*/}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/*Email*/}
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-6 py-4 text-white bg-transparent border border-neutral-400 focus:border-lime-400 transition focus:outline-none rounded-lg placeholder-neutral-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />

          {/*Password*/}
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="********"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-transparent px-6 py-4 border border-neutral-400 focus:border-lime-400 rounded-lg transition focus:outline-none placeholder-neutral-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              onClick={() => {
                setShowPassword(!showPassword);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-lime-400 transition disabled:opacity-50"
            >
              {showPassword ? <EyeClosed size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/*Submit Button*/}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full px-8 py-4 bg-lime-400 text-black rounded-xl hover:bg-lime-300 transition font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Log in
            </button>
            <p className="text-neutral-500 text-sm mt-8 text-center">
              Log in to access your account. Nice to have you back.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
