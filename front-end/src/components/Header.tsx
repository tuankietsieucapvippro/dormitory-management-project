import { IoNotificationsOutline } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getPageInfo = () => {
    const path = location.pathname;
    const segments = path.split("/").filter(Boolean);

    // Xác định tên trang và action
    let pageName = "";
    let action = "";

    switch (segments[0]) {
      case "building":
        pageName = "Building";
        break;
      case "room":
        pageName = "Room";
        break;
      case "type-room":
        pageName = "Type Room";
        break;
      case "utilities":
        pageName = "Utilities";
        break;
      case "student":
        pageName = "Student";
        break;
      case "support":
        pageName = "Support";
        break;
      default:
        pageName = "Dashboard";
    }

    // Chỉ hiển thị action nếu có segment thứ 2
    if (segments[1]) {
      switch (segments[1]) {
        case "detail":
          action = "Detail";
          break;
        case "edit":
          action = "Edit";
          break;
        case "create":
          action = "Create";
          break;
        default:
          action = segments[1].charAt(0).toUpperCase() + segments[1].slice(1);
      }
    }

    return { pageName, action };
  };

  const { pageName, action } = getPageInfo();

  return (
    <div className="flex justify-between bg-[#130f21] p-5 text-[#e1dce4]">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(`/${location.pathname.split("/")[1]}`)}
          className="text-gray-500 transition-colors hover:text-gray-400"
        >
          {pageName}
        </button>
        {action && (
          <>
            <span className="text-gray-500">/</span>
            <span>{action}</span>
          </>
        )}
      </div>
      <div className="flex gap-5">
        <button className="text-2xl">
          <IoNotificationsOutline />
        </button>
      </div>
    </div>
  );
};

export default Header;
