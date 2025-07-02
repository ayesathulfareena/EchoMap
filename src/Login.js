// Login.jsx
import React from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import jwtDecode from "jwt-decode"; // Optional: To debug the Google credential token

const CLIENT_ID = "21797402170-0vhnqk39l8isiq4t1933uejkk5p0lc7c.apps.googleusercontent.com";

export default function Login() {
  const handleSuccess = async (credentialResponse) => {
    try {
      const googleToken = credentialResponse.credential;

      // (Optional) Debug the Google token
      console.log("Google token:", googleToken);
      const userInfo = jwtDecode(googleToken);
      console.log("Decoded user info:", userInfo);

      // 🔁 Replace with your backend URL if deployed
      const backendUrl = "http://localhost:8080/api/login";

      const res = await fetch(backendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: googleToken }),
      });

      const data = await res.json();

      if (data.token) {
        // Store backend JWT
        localStorage.setItem("token", data.token);
        alert("Login successful!");
        window.location.href = "/"; // redirect to home
      } else {
        alert("Login failed: Invalid response from server");
        console.error("Backend response:", data);
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Login failed: Check console for details.");
    }
  };

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h2>Login to Nearli</h2>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => {
            console.log("Google login failed");
            alert("Google login failed");
          }}
        />
      </div>
    </GoogleOAuthProvider>
  );
}