import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import RegisterAdmin from "./pages/auth/RegisterAdmin";
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyOTP from "./pages/auth/VerifyOTP";
import Lobby from "./pages/dashboard/Lobby";
import Wallet from "./pages/dashboard/Wallet";
import CrashGame from "./pages/games/CrashGame";
import SpinWin from "./pages/games/SpinWin";
import Blackjack from "./pages/games/Blackjack";
import Plinko from "./pages/games/Plinko";
import AdminPanel from "./pages/admin/AdminPanel";
import Layout from "./components/layout/Layout";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;
  return user && ["admin", "super_admin"].includes(user.role) ? (
    children
  ) : (
    <Navigate to="/lobby" />
  );
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/register-admin" element={<RegisterAdmin />} />

      <Route
        path="/lobby"
        element={
          <PrivateRoute>
            <Layout>
              <Lobby />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/wallet"
        element={
          <PrivateRoute>
            <Layout>
              <Wallet />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/games/crash"
        element={
          <PrivateRoute>
            <Layout>
              <CrashGame />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/games/spin"
        element={
          <PrivateRoute>
            <Layout>
              <SpinWin />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/games/blackjack"
        element={
          <PrivateRoute>
            <Layout>
              <Blackjack />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/games/plinko"
        element={
          <PrivateRoute>
            <Layout>
              <Plinko />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <Layout>
              <AdminPanel />
            </Layout>
          </AdminRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
