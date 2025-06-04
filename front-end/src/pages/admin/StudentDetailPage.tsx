import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { useParams, useNavigate } from "react-router-dom";
import { studentApi } from "../../services/api";
import { formatDate, formatCurrency } from "../../utils/format";

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

const StudentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Hàm hiển thị thông tin debug
  const showDebugInfo = (data: any) => {
    console.log("Debug Info:", data);
    setDebugInfo(data);
  };

  useEffect(() => {
    const fetchStudent = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log(`Fetching student with ID: ${id}`);
        const response = await studentApi.getById(Number(id));

        // Log the entire response for debugging
        console.log("API Response:", response);

        // Check if the response has the expected structure
        if (!response || !response.data) {
          throw new Error("Invalid API response structure");
        }

        // The actual student data might be in response.data.data due to API structure
        const studentData = response.data.data || response.data;

        showDebugInfo({
          endpoint: `/students/${id}`,
          responseData: response.data,
          studentData: studentData,
          step: "Fetch Student Data",
        });

        if (!studentData) {
          throw new Error(`Không tìm thấy thông tin sinh viên với ID: ${id}`);
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
        showDebugInfo({
          error: error.message,
          stack: error.stack,
          step: "Error",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStudent();
    } else {
      setError("ID sinh viên không hợp lệ");
      setLoading(false);
    }
  }, [id]);

  // Lấy thông tin phòng hiện tại của sinh viên (phòng có trạng thái active)
  const getCurrentRoom = () => {
    if (!student?.roomregistrations || student.roomregistrations.length === 0) {
      return null;
    }

    // Tìm đăng ký phòng có trạng thái active
    return student.roomregistrations.find(
      (reg) =>
        reg.status.toLowerCase() === "active" ||
        reg.status.toLowerCase() === "đang ở",
    );
  };

  const currentRoom = getCurrentRoom();

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
          <div className="mb-6 max-w-2xl rounded-lg bg-[#201b39] p-4 text-sm">
            <pre className="overflow-auto whitespace-pre-wrap">
              {debugInfo
                ? JSON.stringify(debugInfo, null, 2)
                : "Không có thông tin debug"}
            </pre>
          </div>
          <button
            onClick={() => navigate("/admin/student")}
            className="rounded-lg bg-blue-500 px-6 py-2 font-medium hover:bg-blue-600"
          >
            Quay lại danh sách sinh viên
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex h-full flex-col gap-6 bg-[#130f21] p-6 text-[#e1dce4]">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Thông tin sinh viên</h1>
          <button
            onClick={() => navigate("/admin/student")}
            className="rounded bg-blue-500 px-4 py-2 hover:bg-blue-600"
          >
            Quay lại
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Thông tin cá nhân */}
          <div className="rounded-lg bg-[#201b39] p-6">
            <h2 className="mb-4 text-xl font-semibold">Thông tin cá nhân</h2>
            <div className="grid gap-4">
              <InfoItem label="Mã sinh viên" value={student.studentcode} />
              <InfoItem label="Họ và tên" value={student.fullname} />
              <InfoItem label="Lớp" value={student.class} />
              <InfoItem label="Giới tính" value={student.gender} />
              <InfoItem
                label="Ngày sinh"
                value={
                  student.dateofbirth ? formatDate(student.dateofbirth) : "---"
                }
              />
              <InfoItem label="Nơi sinh" value={student.birthplace} />
              <InfoItem label="Email" value={student.email} />
              <InfoItem label="Số điện thoại" value={student.phonenumber} />
              <InfoItem label="Địa chỉ" value={student.address} />
              <InfoItem label="Số CCCD" value={student.idcard} />
              <InfoItem label="Trạng thái" value={student.status} />
            </div>
          </div>

          {/* Thông tin phòng ở */}
          <div className="rounded-lg bg-[#201b39] p-6">
            <h2 className="mb-4 text-xl font-semibold">Thông tin phòng ở</h2>
            {currentRoom && currentRoom.room ? (
              <div className="grid gap-4">
                <InfoItem
                  label="Tòa nhà"
                  value={currentRoom.room.building?.buildingname}
                />
                <InfoItem label="Phòng" value={currentRoom.room.roomname} />
                <InfoItem
                  label="Tầng"
                  value={currentRoom.room.floor?.toString()}
                />
                <InfoItem
                  label="Loại phòng"
                  value={currentRoom.room.roomtype?.roomtypename}
                />
                <InfoItem
                  label="Đơn giá"
                  value={
                    currentRoom.room.roomtype?.price
                      ? `${formatCurrency(Number(currentRoom.room.roomtype.price))} VNĐ`
                      : "---"
                  }
                />
                <InfoItem
                  label="Trạng thái phòng"
                  value={currentRoom.room.status}
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
              </div>
            ) : (
              <p className="text-gray-400">Chưa đăng ký phòng</p>
            )}
          </div>
        </div>

        {/* Debug info section */}
        <div className="mt-4 rounded-lg bg-[#201b39] p-4 text-xs">
          <details>
            <summary className="cursor-pointer font-medium">
              Thông tin debug
            </summary>
            <pre className="mt-2 overflow-auto whitespace-pre-wrap">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </details>
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

export default StudentDetailPage;
