import { useState } from "react";
import { useNavigate } from "react-router-dom"; // page Redirection
import '../App.css';

function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const response = await fetch("http://localhost:5001/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Account Created!");
      navigate("/Home"); // go home
    } else {
      alert(data.message); //errors
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Create an Account</h1>

        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Username" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required
          />

          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required
          />

          <input  
            type="password" 
            placeholder="Confirm Password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            required
          />

          <button type="submit">Sign Up</button>
        </form>

        <button onClick={() => navigate("/Home")}>Login</button>
      </header>
    </div>
  );
}

export default Signup;
