import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { useNavigate } from "react-router-dom";
import { studentApi } from "../../services/api";
import { formatDate, formatCurrency } from "../../utils/format";
import { MdPerson, MdHome, MdPayment, MdNotifications } from "react-icons/md";
import { RiWaterFlashLine } from "react-icons/ri";

interface Student {
  accountid: number;
  fullname: string;
  studentcode: string;
  class?: string;
  gender?: string;
  dateofbirth?: string;
  birthplace?: string;
  address?: string;
  email?: string;
  phonenumber?: string;
  idcard?: string;
  status?: string;
  roomregistrations?: RoomRegistration[];
}

interface RoomRegistration {
  roomregistrationid: number;
  registerdate?: string;
  checkoutdate?: string;
  status: string;
  room?: Room;
}

interface Room {
  roomid: number;
  roomname: string;
  floor: number;
  status: string;
  building?: {
    buildingid: number;
    buildingname: string;
  };
  roomtype?: {
    roomtypeid: number;
    roomtypename: string;
    price: number;
    gender: string;
  };
}

interface UserData {
  account: {
    accountid: number;
    username: string;
    role: {
      roleid: number;
      rolename: string;
    };
  };
  token: string;
}

const StudentDashboardPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState<string>("personal");

  useEffect(() => {
    // Get user data from localStorage
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      navigate("/login");
      return;
    }

    const userData = JSON.parse(userStr) as UserData;
    setUser(userData);

    const fetchStudentByUsername = async () => {
      setLoading(true);
      setError(null);

      try {
        // The username is the student code
        const studentCode = userData.account.username;
        const response = await studentApi.getByStudentCode(studentCode);

        if (!response || !response.data) {
          throw new Error("Invalid API response structure");
        }

        const studentData = response.data.data || response.data;

        if (!studentData) {
          throw new Error(
            `Không tìm thấy thông tin sinh viên với mã: ${studentCode}`,
          );
        }

        // Ensure roomregistrations is always an array
        if (
          studentData.roomregistrations &&
          !Array.isArray(studentData.roomregistrations)
        ) {
          studentData.roomregistrations = [studentData.roomregistrations];
        } else if (!studentData.roomregistrations) {
          studentData.roomregistrations = [];
        }

        setStudent(studentData);
      } catch (error: any) {
        console.error("Có lỗi xảy ra khi lấy thông tin sinh viên:", error);
        setError(
          error.message ||
            "Không thể tải thông tin sinh viên. Vui lòng thử lại sau.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStudentByUsername();
  }, [navigate]);

  // Lấy thông tin phòng hiện tại của sinh viên (phòng có trạng thái active)
  const getCurrentRoom = () => {
    if (!student?.roomregistrations || student.roomregistrations.length === 0) {
      return null;
    }

    // Tìm đăng ký phòng có trạng thái active
    return student.roomregistrations.find(
      (reg) =>
        reg.status.toLowerCase() === "active" ||
        reg.status.toLowerCase() === "đang ở" ||
        reg.status.toLowerCase() === "approved",
    );
  };

  const getPendingRoom = () => {
    if (!student?.roomregistrations || student.roomregistrations.length === 0) {
      return null;
    }

    // Tìm đăng ký phòng có trạng thái pending
    return student.roomregistrations.find(
      (reg) => reg.status.toLowerCase() === "pending",
    );
  };

  const currentRoom = getCurrentRoom();
  const pendingRoom = getPendingRoom();

  const getStatusBadgeClass = (status: string | null | undefined) => {
    if (!status) return "bg-gray-700/30 text-gray-400";

    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-700/30 text-yellow-400";
      case "approved":
      case "active":
      case "đang ở":
        return "bg-green-700/30 text-green-400";
      case "rejected":
        return "bg-red-700/30 text-red-400";
      default:
        return "bg-gray-700/30 text-gray-400";
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex h-full flex-col items-center justify-center bg-[#130f21] text-[#e1dce4]">
          <p className="mb-4 text-lg">Đang tải dữ liệu...</p>
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </Layout>
    );
  }

  if (error || !student) {
    return (
      <Layout>
        <div className="flex h-full flex-col items-center justify-center bg-[#130f21] text-[#e1dce4]">
          <p className="mb-4 text-lg text-red-500">
            {error || "Không tìm thấy thông tin sinh viên"}
          </p>
          <button
            onClick={() => navigate("/login")}
            className="rounded-lg bg-blue-500 px-6 py-2 font-medium hover:bg-blue-600"
          >
            Đăng nhập lại
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex h-full flex-col gap-6 bg-[#130f21] p-6 text-[#e1dce4]">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Trang cá nhân sinh viên</h1>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-[#201b39] px-4 py-2">
              Xin chào, {student.fullname}
            </div>
          </div>
        </div>

        {/* Dashboard Overview */}
        <div className="grid gap-6 md:grid-cols-4">
          <div className="flex items-center gap-4 rounded-lg bg-[#201b39] p-4">
            <div className="rounded-full bg-blue-500/20 p-3 text-2xl text-blue-500">
              <MdPerson />
            </div>
            <div>
              <p className="text-gray-400">Mã sinh viên</p>
              <p className="text-xl font-semibold">{student.studentcode}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-lg bg-[#201b39] p-4">
            <div className="rounded-full bg-green-500/20 p-3 text-2xl text-green-500">
              <MdHome />
            </div>
            <div>
              <p className="text-gray-400">Phòng</p>
              <p className="text-xl font-semibold">
                {currentRoom?.room?.roomname || "Chưa có phòng"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-lg bg-[#201b39] p-4">
            <div className="rounded-full bg-purple-500/20 p-3 text-2xl text-purple-500">
              <RiWaterFlashLine />
            </div>
            <div>
              <p className="text-gray-400">Tiện ích</p>
              <p className="text-xl font-semibold">
                {currentRoom ? "Đã kích hoạt" : "Chưa kích hoạt"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-lg bg-[#201b39] p-4">
            <div className="rounded-full bg-yellow-500/20 p-3 text-2xl text-yellow-500">
              <MdPayment />
            </div>
            <div>
              <p className="text-gray-400">Trạng thái</p>
              <p className="text-xl font-semibold">{student.status || "---"}</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-700">
          <button
            className={`px-4 py-2 ${
              activeTab === "personal"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-400"
            }`}
            onClick={() => setActiveTab("personal")}
            data-tab="personal"
          >
            Thông tin cá nhân
          </button>
          <button
            className={`px-4 py-2 ${
              activeTab === "room"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-400"
            }`}
            onClick={() => setActiveTab("room")}
            data-tab="room"
          >
            Thông tin phòng ở
          </button>
          <button
            className={`px-4 py-2 ${
              activeTab === "notifications"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-400"
            }`}
            onClick={() => setActiveTab("notifications")}
            data-tab="notifications"
          >
            Thông báo
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-auto">
          {activeTab === "personal" && (
            <div className="rounded-lg bg-[#201b39] p-6">
              <h2 className="mb-4 text-xl font-semibold">Thông tin cá nhân</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="grid gap-4">
                  <InfoItem label="Mã sinh viên" value={student.studentcode} />
                  <InfoItem label="Họ và tên" value={student.fullname} />
                  <InfoItem label="Lớp" value={student.class} />
                  <InfoItem label="Giới tính" value={student.gender} />
                  <InfoItem
                    label="Ngày sinh"
                    value={
                      student.dateofbirth
                        ? formatDate(student.dateofbirth)
                        : "---"
                    }
                  />
                  <InfoItem label="Nơi sinh" value={student.birthplace} />
                </div>
                <div className="grid gap-4">
                  <InfoItem label="Email" value={student.email} />
                  <InfoItem label="Số điện thoại" value={student.phonenumber} />
                  <InfoItem label="Địa chỉ" value={student.address} />
                  <InfoItem label="Số CCCD" value={student.idcard} />
                  <InfoItem label="Trạng thái" value={student.status} />
                </div>
              </div>
            </div>
          )}

          {activeTab === "room" && (
            <div className="flex flex-col gap-6">
              {pendingRoom && (
                <div className="rounded-lg bg-[#201b39] p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold">
                      Đăng ký đang chờ duyệt
                    </h2>
                    <span
                      className={`rounded-full px-3 py-1 text-sm ${getStatusBadgeClass(
                        pendingRoom.status,
                      )}`}
                    >
                      {pendingRoom.status}
                    </span>
                  </div>

                  {pendingRoom.room ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <InfoItem
                          label="Tòa nhà"
                          value={pendingRoom.room.building?.buildingname}
                        />
                        <InfoItem
                          label="Phòng"
                          value={pendingRoom.room.roomname}
                        />
                        <InfoItem
                          label="Tầng"
                          value={pendingRoom.room.floor?.toString()}
                        />
                      </div>
                      <div>
                        <InfoItem
                          label="Loại phòng"
                          value={pendingRoom.room.roomtype?.roomtypename}
                        />
                        <InfoItem
                          label="Đơn giá"
                          value={
                            pendingRoom.room.roomtype?.price
                              ? `${formatCurrency(
                                  Number(pendingRoom.room.roomtype.price),
                                )} VNĐ/tháng`
                              : "---"
                          }
                        />
                        <InfoItem
                          label="Ngày đăng ký"
                          value={
                            pendingRoom.registerdate
                              ? formatDate(pendingRoom.registerdate)
                              : "---"
                          }
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-400">Không có thông tin phòng</p>
                  )}
                </div>
              )}

              {currentRoom ? (
                <div className="rounded-lg bg-[#201b39] p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold">
                      Thông tin phòng hiện tại
                    </h2>
                    <span
                      className={`rounded-full px-3 py-1 text-sm ${getStatusBadgeClass(
                        currentRoom.status,
                      )}`}
                    >
                      {currentRoom.status}
                    </span>
                  </div>

                  {currentRoom.room ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <InfoItem
                          label="Tòa nhà"
                          value={currentRoom.room.building?.buildingname}
                        />
                        <InfoItem
                          label="Phòng"
                          value={currentRoom.room.roomname}
                        />
                        <InfoItem
                          label="Tầng"
                          value={currentRoom.room.floor?.toString()}
                        />
                        <InfoItem
                          label="Loại phòng"
                          value={currentRoom.room.roomtype?.roomtypename}
                        />
                      </div>
                      <div>
                        <InfoItem
                          label="Đơn giá"
                          value={
                            currentRoom.room.roomtype?.price
                              ? `${formatCurrency(
                                  Number(currentRoom.room.roomtype.price),
                                )} VNĐ/tháng`
                              : "---"
                          }
                        />
                        <InfoItem
                          label="Ngày đăng ký"
                          value={
                            currentRoom.registerdate
                              ? formatDate(currentRoom.registerdate)
                              : "---"
                          }
                        />
                        <InfoItem
                          label="Ngày hết hạn"
                          value={
                            currentRoom.checkoutdate
                              ? formatDate(currentRoom.checkoutdate)
                              : "---"
                          }
                        />
                        <InfoItem
                          label="Trạng thái phòng"
                          value={currentRoom.room.status}
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-400">Không có thông tin phòng</p>
                  )}
                </div>
              ) : (
                <div className="rounded-lg bg-[#201b39] p-6">
                  <h2 className="mb-4 text-xl font-semibold">
                    Thông tin phòng
                  </h2>
                  <div className="flex flex-col items-center justify-center gap-4 py-10">
                    <MdHome className="text-6xl text-gray-500" />
                    <p className="text-xl text-gray-400">
                      Bạn chưa đăng ký phòng
                    </p>
                    <button
                      onClick={() => navigate("/")}
                      className="rounded-lg bg-blue-500 px-4 py-2 hover:bg-blue-600"
                    >
                      Đăng ký phòng ngay
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="rounded-lg bg-[#201b39] p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Thông báo</h2>
                <MdNotifications className="text-2xl text-blue-500" />
              </div>

              <div className="flex flex-col gap-4">
                {currentRoom ? (
                  <>
                    <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
                      <h3 className="mb-2 font-semibold text-green-400">
                        Đăng ký phòng thành công
                      </h3>
                      <p>
                        Bạn đã được chấp nhận đăng ký phòng{" "}
                        {currentRoom.room?.roomname} tại tòa{" "}
                        {currentRoom.room?.building?.buildingname}.
                      </p>
                      <p className="mt-2 text-sm text-gray-400">
                        {currentRoom.registerdate
                          ? formatDate(currentRoom.registerdate)
                          : "---"}
                      </p>
                    </div>

                    <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
                      <h3 className="mb-2 font-semibold text-blue-400">
                        Thông báo thanh toán
                      </h3>
                      <p>
                        Vui lòng thanh toán phí phòng hàng tháng trước ngày 10
                        của mỗi tháng.
                      </p>
                      <p className="mt-2 text-sm text-gray-400">
                        {formatDate(new Date().toISOString())}
                      </p>
                    </div>
                  </>
                ) : pendingRoom ? (
                  <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
                    <h3 className="mb-2 font-semibold text-yellow-400">
                      Đăng ký đang chờ xét duyệt
                    </h3>
                    <p>
                      Đăng ký phòng của bạn đang được xem xét. Chúng tôi sẽ
                      thông báo kết quả sớm nhất.
                    </p>
                    <p className="mt-2 text-sm text-gray-400">
                      {pendingRoom.registerdate
                        ? formatDate(pendingRoom.registerdate)
                        : formatDate(new Date().toISOString())}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-4 py-10">
                    <p className="text-gray-400">Không có thông báo mới</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

// Helper component for consistent info display
const InfoItem = ({
  label,
  value,
}: {
  label: string;
  value?: string | number;
}) => (
  <div>
    <p className="text-gray-400">{label}</p>
    <p>{value || "---"}</p>
  </div>
);

export default StudentDashboardPage;
