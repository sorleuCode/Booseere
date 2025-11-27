import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "./App.css";
import Homepage from "./Components/Homepage/Homepage";
import Login from "./Components/Login/Login";
import Register from "./Components/Register/Register";
import Admin from "./Components/AdminPage/Admindash";
import ProtectedRoute from "./components/ProtectedRoute";
import Onetofive from "./Components/Constitution/Onetofive";
import Members from "./Components/Memberpage/Members";
import { AuthProvider } from "./context/AuthContext";
import { MembersProvider } from "./context/MembersContext";

function App() {
  return (
    <AuthProvider>
  <MembersProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/regg" element={<Register />} />
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        <Route path="/one" element={<Onetofive />} />
        <Route path="/members" element={<Members />} />
      </Routes>
    </Router>
  </MembersProvider>
</AuthProvider>

  );
}

export default App;
