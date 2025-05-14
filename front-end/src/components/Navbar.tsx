import { HiOutlineDocumentText } from "react-icons/hi";
import { IoLogOutOutline } from "react-icons/io5";
import { TbLayoutNavbar } from "react-icons/tb";
import ShinImage from "../assets/shin.jpg";
import { FaRegBuilding, FaSchool } from "react-icons/fa";
import { LuDoorOpen } from "react-icons/lu";
import { RiWaterFlashLine } from "react-icons/ri";
import {
  MdPersonOutline,
  MdSupportAgent,
  MdHome,
  MdNotifications,
  MdPayment,
} from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

interface UserRole {
  roleid: number;
  rolename: string;
}

interface UserAccount {
  accountid: number;
  username: string;
  role: UserRole;
}

interface UserData {
  account: UserAccount;
  token: string;
}

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const userData = JSON.parse(userStr);
      console.log("User data from localStorage:", userData);
      setUser(userData);
    } else {
      console.log("No user data found in localStorage");
    }

    // Retrieve the navbar state from localStorage
    const navbarState = localStorage.getItem("navbarCollapsed");
    if (navbarState) {
      setCollapsed(JSON.parse(navbarState));
    }
  }, []);

  const isActive = (path: string) => {
    return location.pathname.includes(path) ? "bg-[#201b39] rounded-lg" : "";
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const toggleNavbar = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem("navbarCollapsed", JSON.stringify(newState));
  };

  // Helper functions to safely get user information
  const getUsername = () => {
    return user?.account?.username || "Guest";
  };

  const getUserRole = () => {
    return user?.account?.role?.rolename || "No role";
  };

  const getUserInitial = () => {
    const username = getUsername();
    return username !== "Guest" ? username.charAt(0).toUpperCase() : "G";
  };

  // Check if the user is a student
  const isStudent = () => {
    const roleName = getUserRole().toLowerCase();
    return roleName === "sinh viên" || roleName === "student";
  };

  // Handle notification tab click
  const handleNotificationsClick = () => {
    navigate("/student/dashboard");
    // Use setTimeout to ensure navigation completes before trying to find the element
    setTimeout(() => {
      const notificationsTabButton = document.querySelector(
        'button[data-tab="notifications"]',
      ) as HTMLButtonElement;
      if (notificationsTabButton) {
        notificationsTabButton.click();
      }
    }, 100);
  };

  return (
    <div
      className={`flex h-screen flex-col justify-between bg-[#1b172e] p-4 text-[#e1dce4] transition-all duration-300 ${collapsed ? "w-20" : "w-auto"}`}
    >
      <div className="col-start-1 grid gap-10">
        <div className="flex justify-between">
          <FaSchool className={`size-10 ${collapsed ? "hidden" : ""}`} />
          <button onClick={toggleNavbar} className={collapsed ? "mx-auto" : ""}>
            <TbLayoutNavbar
              className={`size-7 transition-transform duration-300 ${collapsed ? "rotate-90" : "-rotate-90"}`}
            />
          </button>
        </div>
        <div className="grid gap-2">
          <p
            className={`text-gray-500 ${collapsed ? "text-center text-xs" : ""}`}
          >
            {collapsed ? "Menu" : "Menu"}
          </p>
          <ul>
            {isStudent() ? (
              // Student menu items
              <>
                <li className={`p-2 ${isActive("/student/dashboard")}`}>
                  <Link
                    to="/student/dashboard"
                    className="flex items-center gap-2"
                  >
                    <MdHome className={collapsed ? "mx-auto" : ""} />
                    <div className={collapsed ? "hidden" : ""}>Trang chủ</div>
                  </Link>
                </li>
                <li className={`p-2 ${isActive("/notifications")}`}>
                  <button
                    onClick={handleNotificationsClick}
                    className="flex w-full items-center gap-2"
                  >
                    <MdNotifications className={collapsed ? "mx-auto" : ""} />
                    <div className={collapsed ? "hidden" : ""}>Thông báo</div>
                  </button>
                </li>
                <li className={`p-2 ${isActive("/payment")}`}>
                  <Link to="#" className="flex items-center gap-2">
                    <MdPayment className={collapsed ? "mx-auto" : ""} />
                    <div className={collapsed ? "hidden" : ""}>Thanh toán</div>
                  </Link>
                </li>
                <li className={`p-2 ${isActive("/student/support")}`}>
                  <Link
                    to="/student/support"
                    className="flex items-center gap-2"
                  >
                    <MdSupportAgent className={collapsed ? "mx-auto" : ""} />
                    <div className={collapsed ? "hidden" : ""}>Hỗ trợ</div>
                  </Link>
                </li>
              </>
            ) : (
              // Admin menu items
              <>
                <li className={`p-2 ${isActive("/admin/building")}`}>
                  <Link
                    to="/admin/building"
                    className="flex items-center gap-2"
                  >
                    <FaRegBuilding className={collapsed ? "mx-auto" : ""} />
                    <div className={collapsed ? "hidden" : ""}>
                      Building Management
                    </div>
                  </Link>
                </li>
                <li className={`p-2 ${isActive("/admin/room")}`}>
                  <Link to="/admin/room" className="flex items-center gap-2">
                    <LuDoorOpen className={collapsed ? "mx-auto" : ""} />
                    <div className={collapsed ? "hidden" : ""}>
                      Room Management
                    </div>
                  </Link>
                </li>
                <li className={`p-2 ${isActive("/admin/room-type")}`}>
                  <Link
                    to="/admin/room-type"
                    className="flex items-center gap-2"
                  >
                    <HiOutlineDocumentText
                      className={collapsed ? "mx-auto" : ""}
                    />
                    <div className={collapsed ? "hidden" : ""}>
                      Room Type Management
                    </div>
                  </Link>
                </li>
                <li className={`p-2 ${isActive("/admin/utilities")}`}>
                  <Link
                    to="/admin/utilities"
                    className="flex items-center gap-2"
                  >
                    <RiWaterFlashLine className={collapsed ? "mx-auto" : ""} />
                    <div className={collapsed ? "hidden" : ""}>
                      Utilities Management
                    </div>
                  </Link>
                </li>
                <li className={`p-2 ${isActive("/admin/student")}`}>
                  <Link to="/admin/student" className="flex items-center gap-2">
                    <MdPersonOutline className={collapsed ? "mx-auto" : ""} />
                    <div className={collapsed ? "hidden" : ""}>
                      Student Management
                    </div>
                  </Link>
                </li>
                <li className={`p-2 ${isActive("/admin/support")}`}>
                  <Link to="/admin/support" className="flex items-center gap-2">
                    <MdSupportAgent className={collapsed ? "mx-auto" : ""} />
                    <div className={collapsed ? "hidden" : ""}>Support</div>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>

      <div className="grid gap-2">
        <div className="flex items-center gap-2 rounded-lg p-2">
          <div className="flex size-10 items-center justify-center rounded-full bg-indigo-600 text-xl font-bold">
            {getUserInitial()}
          </div>
          <div className={collapsed ? "hidden" : ""}>
            <p className="text-sm">{getUsername()}</p>
            <p className="text-xs text-gray-500">{getUserRole()}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg p-2 hover:bg-[#201b39]"
        >
          <IoLogOutOutline className={collapsed ? "mx-auto" : ""} />
          <div className={collapsed ? "hidden" : ""}>Đăng xuất</div>
        </button>
      </div>
    </div>
  );
};

export default Navbar;
