import { useState } from "react";
import '../App.css';
import { Link } from "react-router-dom";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="App">
      <header className="App-header">
        <h1>ChatHaven</h1>
 
        <form>         
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

          <button 
            type="submit" 
            onClick={() => alert(`Username: ${username}\nPassword: ${password}`)}
          >
            login
          </button>
        </form>

        <Link to="/signup">
         <button>Create an account</button>
        </Link>
      </header>
      
    </div>
  );
}

export default App;
