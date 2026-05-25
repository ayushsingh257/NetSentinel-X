"use client";

import { useState } from "react";

export default function LoginPage() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

async function handleLogin() {

  try {

    const response = await fetch("http://localhost:8080/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {

      alert(data.error || "Login failed");
      return;
    }

    // STORE TOKEN
    localStorage.setItem("token", data.token);

    // STORE ROLE
    localStorage.setItem("role", data.role);

    alert("Login successful");

    window.location.href = "/";

  } catch (error) {

    console.error(error);

    alert("Server error");
  }
}

  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">

      <div className="bg-zinc-950 border border-cyan-500 rounded-2xl p-10 w-[400px] shadow-lg shadow-cyan-500/20">

        <h1 className="text-4xl font-bold text-cyan-400 mb-8 text-center">
          NetSentinel-X Login
        </h1>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mb-4 p-3 rounded-lg bg-zinc-900 border border-zinc-700"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 p-3 rounded-lg bg-zinc-900 border border-zinc-700"
        />

        <button
          onClick={handleLogin}
          className="w-full bg-cyan-600 hover:bg-cyan-500 transition-all duration-300 p-3 rounded-lg font-bold"
        >
          LOGIN
        </button>

      </div>

    </div>
  );
}