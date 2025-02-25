import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Messages from "./pages/Messages";
import ForgotPassword from "./pages/ForgotPassword";

//Toastify imports for notifications
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/Home" element={<Home />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/Messages" element={<Messages />} />
        <Route path = "/ForgotPassword" element={<ForgotPassword />} />
      </Routes>
      <ToastContainer />
    </Router>
  );
}

export default App;
