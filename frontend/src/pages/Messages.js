import { useNavigate } from "react-router-dom";
import '../App.css';

function App() {
  const navigate = useNavigate();

  return (
    <div className="App">
      <header className="App-header">
        <h1>ChatHaven</h1>

        <div className="chat-container">
          <div className="sidebar">
            <h2>Groups</h2>
            <ul>
              <li>group1</li>
              <li>group2</li>
              <li>group3</li>
            </ul>
          </div>

          <div className="chat-area">
            <h2>Messages</h2>
            <div className="message-list">
              <p><strong>User1:</strong> Hey</p>
              <p><strong>User2:</strong> Hi</p>
              <p><strong>User3:</strong> Yoo!</p>
            </div>
          </div>
        </div>

       
        <button onClick={() => navigate("/home")}>Logout</button> 
      </header>
    </div>
  );
}

export default App;
