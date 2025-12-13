"use client";

import { Eye, EyeClosed, Radar } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex flex-col ">
      <div className="w-full px-8 py-6 flex items-center justify-center border-b border-black gap-8">
        {/*Header*/}
        <div className="gap-2 flex flex-row items-center">
          <Radar className="w-6 h-6 text-lime-400" />
          <div className="text-white text-xl font-bold">FaceID Assistant</div>
        </div>

        {/*Navigate to Home*/}
        <nav className="flex items-center gap-2">
          <Link
            href="/"
            className="text-lg font-bold text-neutral-400 hover:text-lime-400 transition"
          >
            Home
          </Link>
        </nav>
      </div>

      <div className="flex flex-1 justify-center items-center">
        <div className="w-full max-w-md flex flex-col gap-4">
          {/*Header*/}
          <div className="flex flex-col items-center gap-2">
            <div className="text-xl font-semibold text-neutral-400">
              LOG IN NOW
            </div>
            <div className="flex flex-row items-start gap-2">
              {" "}
              <div className="text-4xl font-semibold">Welcome Back</div>
              <span className="text-lime-400 text-4xl font-semibold">! </span>
            </div>

            <div className="flex flex-row items-center gap-2">
              <h1 className="text-lg font-bold text-neutral-400">
                {"Don't have an account?"}
              </h1>

              <Link
                href="/signup"
                className="text-lime-400 hover:text-lime-300 transition font-medium font-semibold underline"
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
              className="w-full px-6 py-4 text-white bg-black border border-neutral-400 focus:border-lime-400 transition focus:outline-none rounded-lg placeholder-white disabled:opacity-50 disabled:cursor-not-allowed"
            />

            {/*Password*/}
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="********"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-black px-6 py-4 border border-neutral-400 focus:border-lime-400 rounded-lg transition focus:outline-none placeholder-white text-white disabled:opacity-50 disabled:cursor-not-allowed"
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

      <div className="hidden lg:flex justify-end items-end p-4">
        <Radar className="w-8 h-8 text-lime-400" />
      </div>
    </div>
  );
}
