import { useState } from "react";
import '../App.css';
import { Link } from "react-router-dom";

function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e) => {
   
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    alert("Account Created");
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

          <button type="submit">
            Sign Up
          </button>

        </form>

        <Link to="/Home">
         <button>Login</button>
        </Link>

      </header>
    </div>
  );
}

export default Signup;
