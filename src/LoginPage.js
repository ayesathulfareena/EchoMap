import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailLogin = async () => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.token);
      alert("Login successful");
    } else {
      alert(data);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    const res = await fetch("/api/auth/google-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: credentialResponse.credential }),
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("token", data.token);
      alert("Google Login Successful");
    } else {
      alert("Google Login Failed");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Login</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      /><br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      /><br />

      <button onClick={handleEmailLogin}>Login with Email</button>

      <hr />

      <GoogleLogin
        onSuccess={handleGoogleLogin}
        onError={() => {
          alert("Google Login Failed");
        }}
      />
    </div>
  );
}

export default LoginPage;