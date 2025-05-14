import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// Admin pages
import {
  BuildingPage,
  RoomPage,
  RoomTypePage,
  UtilitiesPage,
  StudentPage,
  CreateBuildingPage,
  CreateRoomPage,
  CreateRoomTypePage,
  CreateUtilitiesPage,
  CreateStudentPage,
  BuildingDetailPage,
  EditBuildingPage,
  RoomDetailPage,
  EditRoomPage,
  RoomTypeDetailPage,
  EditRoomTypePage,
  StudentDetailPage,
  EditStudentPage,
  EditUtilitiesPage,
  SupportPage as AdminSupportPage,
} from "./pages/admin";

// Student pages
import {
  StudentDashboardPage,
  SupportPage as StudentSupportPage,
} from "./pages/student";

// Role-based route wrapper
interface RoleRouteProps {
  children: JSX.Element;
  allowedRole: string;
}

const RoleRoute = ({ children, allowedRole }: RoleRouteProps) => {
  const userStr = localStorage.getItem("user");

  if (!userStr) {
    return <Navigate to="/login" />;
  }

  try {
    const userData = JSON.parse(userStr);
    const userRole = userData.account?.role?.rolename?.toLowerCase() || "";

    // For student routes, only allow students
    if (allowedRole === "student" && userRole === "sinh viên") {
      return children;
    }

    // For admin routes, deny students
    if (allowedRole === "admin" && userRole !== "sinh viên") {
      return children;
    }

    // Redirect to appropriate dashboard based on role
    return (
      <Navigate
        to={userRole === "sinh viên" ? "/student-dashboard" : "/building"}
      />
    );
  } catch (error) {
    console.error("Error parsing user data:", error);
    return <Navigate to="/login" />;
  }
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Student routes */}
        <Route path="/student/*">
          <Route
            path="dashboard"
            element={
              <RoleRoute allowedRole="student">
                <StudentDashboardPage />
              </RoleRoute>
            }
          />
          <Route
            path="support"
            element={
              <RoleRoute allowedRole="student">
                <StudentSupportPage />
              </RoleRoute>
            }
          />
          {/* Redirect /student to /student/dashboard */}
          <Route path="" element={<Navigate to="/student/dashboard" />} />
        </Route>

        {/* For backward compatibility */}
        <Route
          path="/student-dashboard"
          element={<Navigate to="/student/dashboard" />}
        />

        {/* Admin routes */}
        <Route path="/admin/*">
          {/* Building management */}
          <Route
            path="building"
            element={
              <RoleRoute allowedRole="admin">
                <BuildingPage />
              </RoleRoute>
            }
          />
          <Route
            path="building/create"
            element={
              <RoleRoute allowedRole="admin">
                <CreateBuildingPage />
              </RoleRoute>
            }
          />
          <Route
            path="building/:id"
            element={
              <RoleRoute allowedRole="admin">
                <BuildingDetailPage />
              </RoleRoute>
            }
          />
          <Route
            path="building/edit/:id"
            element={
              <RoleRoute allowedRole="admin">
                <EditBuildingPage />
              </RoleRoute>
            }
          />

          {/* Room management */}
          <Route
            path="room"
            element={
              <RoleRoute allowedRole="admin">
                <RoomPage />
              </RoleRoute>
            }
          />
          <Route
            path="room/create"
            element={
              <RoleRoute allowedRole="admin">
                <CreateRoomPage />
              </RoleRoute>
            }
          />
          <Route
            path="room/:id"
            element={
              <RoleRoute allowedRole="admin">
                <RoomDetailPage />
              </RoleRoute>
            }
          />
          <Route
            path="room/edit/:id"
            element={
              <RoleRoute allowedRole="admin">
                <EditRoomPage />
              </RoleRoute>
            }
          />

          {/* Room type management */}
          <Route
            path="room-type"
            element={
              <RoleRoute allowedRole="admin">
                <RoomTypePage />
              </RoleRoute>
            }
          />
          <Route
            path="room-type/create"
            element={
              <RoleRoute allowedRole="admin">
                <CreateRoomTypePage />
              </RoleRoute>
            }
          />
          <Route
            path="room-type/:id"
            element={
              <RoleRoute allowedRole="admin">
                <RoomTypeDetailPage />
              </RoleRoute>
            }
          />
          <Route
            path="room-type/edit/:id"
            element={
              <RoleRoute allowedRole="admin">
                <EditRoomTypePage />
              </RoleRoute>
            }
          />

          {/* Utilities management */}
          <Route
            path="utilities"
            element={
              <RoleRoute allowedRole="admin">
                <UtilitiesPage />
              </RoleRoute>
            }
          />
          <Route
            path="utilities/create"
            element={
              <RoleRoute allowedRole="admin">
                <CreateUtilitiesPage />
              </RoleRoute>
            }
          />
          <Route
            path="utilities/edit/:id"
            element={
              <RoleRoute allowedRole="admin">
                <EditUtilitiesPage />
              </RoleRoute>
            }
          />

          {/* Student management */}
          <Route
            path="student"
            element={
              <RoleRoute allowedRole="admin">
                <StudentPage />
              </RoleRoute>
            }
          />
          <Route
            path="student/create"
            element={
              <RoleRoute allowedRole="admin">
                <CreateStudentPage />
              </RoleRoute>
            }
          />
          <Route
            path="student/:id"
            element={
              <RoleRoute allowedRole="admin">
                <StudentDetailPage />
              </RoleRoute>
            }
          />
          <Route
            path="student/edit/:id"
            element={
              <RoleRoute allowedRole="admin">
                <EditStudentPage />
              </RoleRoute>
            }
          />

          {/* Support */}
          <Route
            path="support"
            element={
              <RoleRoute allowedRole="admin">
                <AdminSupportPage />
              </RoleRoute>
            }
          />

          {/* Redirect /admin to /admin/building */}
          <Route path="" element={<Navigate to="/admin/building" />} />
        </Route>

        {/* Backward compatibility routes */}
        <Route path="/building" element={<Navigate to="/admin/building" />} />
        <Route path="/room" element={<Navigate to="/admin/room" />} />
        <Route path="/room-type" element={<Navigate to="/admin/room-type" />} />
        <Route path="/utilities" element={<Navigate to="/admin/utilities" />} />
        <Route path="/student" element={<Navigate to="/admin/student" />} />
        <Route path="/support" element={<Navigate to="/admin/support" />} />

        {/* Redirect all other routes to login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
