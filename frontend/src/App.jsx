import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "./App.css";
import Homepage from "./Components/Homepage/Homepage";
import Login from "./Components/Login/Login";
import Register from "./Components/Register/Register";
import ForgotPassword from "./Components/Auth/ForgotPassword";
import ResetPassword from "./Components/Auth/ResetPassword";
import Admin from "./Components/AdminPage/Admindash";
import ProtectedRoute from "./Components/ProtectedRoute";
import Onetofive from "./Components/Constitution/Onetofive";
import Law from "./Components/Constitution/law";
import Members from "./Components/Memberpage/Members";
import PublicMembers from "./Components/Homepage/PublicMembers";
import Aboutus from "./Components/Homepage/Aboutus";
import Contact from "./Components/Homepage/Contact";
import ContributionManagement from "./Components/ContributionPage/ContributionManagement";
import LoanManagement from "./Components/LoanPage/LoanManagement";
import ProfileManagement from "./Components/ProfilePage/ProfileManagement";
import { AuthProvider } from "./context/AuthContext";
import { MembersProvider } from "./context/MembersContext";
import { DashboardProvider } from "./context/DashboardContext";


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes - no authentication required */}
          <Route path="/" element={<Homepage />} />
          <Route path="/about" element={<Aboutus />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/public-members" element={<PublicMembers />} />
          <Route path="/constitution" element={<Onetofive />} />
          <Route path="/law" element={<Law />} />
          {/* Backward compatibility */}
          <Route path="/regg" element={<Register />} />
          <Route path="/one" element={<Onetofive />} />

          {/* Protected routes - authentication required */}
          <Route path="/admin" element={
            <DashboardProvider>
              <MembersProvider>
                <ProtectedRoute><Admin /></ProtectedRoute>
              </MembersProvider>
            </DashboardProvider>
          } />
          <Route path="/members" element={
            <MembersProvider>
              <ProtectedRoute><Members /></ProtectedRoute>
            </MembersProvider>
          } />
          <Route path="/contributions" element={
            <MembersProvider>
              <ProtectedRoute><ContributionManagement /></ProtectedRoute>
            </MembersProvider>
          } />
          <Route path="/loans" element={
            <MembersProvider>
              <ProtectedRoute><LoanManagement /></ProtectedRoute>
            </MembersProvider>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><ProfileManagement /></ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;