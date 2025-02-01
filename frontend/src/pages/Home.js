import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import '../App.css';

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // Hook to redirect users

  const handleLogin = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:5001/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      navigate("/Messages"); // go to messages on success
    } else {
      alert(data.message); // error
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>ChatHaven</h1>

        <form onSubmit={handleLogin}>         
          <input 
            type="text" 
            placeholder="Username" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
          />

          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />

          <button type="submit">Login</button>
        </form>

        <button onClick={() => navigate("/Signup")}>Create an account</button>
      </header>
    </div>
  );
}

export default App;
