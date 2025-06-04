import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { useParams, useNavigate } from "react-router-dom";
import { roomTypeApi, roomApi } from "../../services/api";
import DeleteModal from "../../components/DeleteModal";

interface RoomType {
  roomtypeid: number;
  roomtypename: string;
  price: string | number;
  gender: string;
  description?: string;
  rooms?: Room[];
}

interface Room {
  roomid: number;
  roomname: string;
  floor: number;
  status: string;
  buildingid: number;
  building?: {
    buildingname: string;
  };
  students?: any[];
}

const RoomTypeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roomType, setRoomType] = useState<RoomType | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    roomId: null as number | null,
    roomName: "",
  });

  // Hàm hiển thị thông tin debug
  const showDebugInfo = (data: any) => {
    console.log("Debug Info:", data);
    setDebugInfo(data);
  };

  // Hàm đảm bảo dữ liệu trả về là mảng
  const ensureArray = <T,>(data: any): T[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    return [];
  };

  useEffect(() => {
    const fetchRoomType = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log(`Fetching room type with ID: ${id}`);
        const response = await roomTypeApi.getById(Number(id));
        const data = response.data as RoomType;

        showDebugInfo({
          endpoint: `/room-types/${id}`,
          responseData: data,
          step: "Fetch Room Type Data",
        });

        if (!data) {
          throw new Error(`Không tìm thấy thông tin loại phòng với ID: ${id}`);
        }

        // Đảm bảo rooms là một mảng
        if (data.rooms) {
          data.rooms = ensureArray<Room>(data.rooms);
        } else {
          data.rooms = [];
        }

        setRoomType(data);
      } catch (error: any) {
        console.error("Có lỗi xảy ra khi lấy thông tin loại phòng:", error);
        setError(
          error.message ||
            "Không thể tải thông tin loại phòng. Vui lòng thử lại sau.",
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
      fetchRoomType();
    } else {
      setError("ID loại phòng không hợp lệ");
      setLoading(false);
    }
  }, [id]);

  const handleDelete = async () => {
    if (!deleteModal.roomId) return;

    try {
      await roomApi.delete(deleteModal.roomId);

      // Refresh data
      const response = await roomTypeApi.getById(Number(id));
      setRoomType(response.data);
      setDeleteModal({ isOpen: false, roomId: null, roomName: "" });
    } catch (error: any) {
      console.error("Có lỗi xảy ra khi xóa phòng:", error);
      alert(
        "Có lỗi xảy ra khi xóa phòng: " +
          (error.message || "Vui lòng thử lại sau"),
      );
    }
  };

  const getStatusClass = (status: string | null | undefined): string => {
    if (!status) {
      return "inline-block rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800";
    }

    switch (status.toLowerCase()) {
      case "available":
      case "còn trống":
        return "inline-block rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800";
      case "full":
      case "đã đầy":
        return "inline-block rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800";
      case "maintenance":
      case "đang sửa chữa":
        return "inline-block rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800";
      default:
        return "inline-block rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800";
    }
  };

  const getStatusText = (status: string | null | undefined): string => {
    if (!status) return "---";

    switch (status.toLowerCase()) {
      case "available":
        return "Còn trống";
      case "full":
        return "Đã đầy";
      case "maintenance":
        return "Đang sửa chữa";
      default:
        return status;
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

  if (error || !roomType) {
    return (
      <Layout>
        <div className="flex h-full flex-col items-center justify-center bg-[#130f21] text-[#e1dce4]">
          <p className="mb-4 text-lg text-red-500">
            {error || "Không tìm thấy thông tin loại phòng"}
          </p>
          <div className="mb-6 max-w-2xl rounded-lg bg-[#201b39] p-4 text-sm">
            <pre className="overflow-auto whitespace-pre-wrap">
              {debugInfo
                ? JSON.stringify(debugInfo, null, 2)
                : "Không có thông tin debug"}
            </pre>
          </div>
          <button
            onClick={() => navigate("/admin/room-type")}
            className="rounded-lg bg-blue-500 px-6 py-2 font-medium hover:bg-blue-600"
          >
            Quay lại danh sách loại phòng
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex h-full flex-col bg-[#130f21] text-[#e1dce4]">
        <div className="-mt-5 mb-2 flex items-center justify-between p-5">
          <button
            onClick={() => navigate("/admin/room-type")}
            className="rounded-lg bg-gray-500 px-4 py-2 hover:bg-gray-600"
          >
            Quay lại
          </button>
          <h1 className="text-center text-3xl font-bold uppercase">
            {roomType.roomtypename}
          </h1>
          <div className="w-[100px]"></div>
        </div>

        <div className="flex-1 overflow-auto p-8">
          <div className="grid gap-8">
            {/* Thông tin cơ bản */}
            <div className="rounded-lg bg-[#201b39] p-6">
              <h2 className="mb-4 text-xl font-semibold">
                Thông tin loại phòng
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-gray-400">Tên loại phòng</p>
                  <p>{roomType.roomtypename}</p>
                </div>
                <div>
                  <p className="text-gray-400">Đơn giá</p>
                  <p>{Number(roomType.price).toLocaleString()} VNĐ</p>
                </div>
                <div>
                  <p className="text-gray-400">Giới tính</p>
                  <p>{roomType.gender}</p>
                </div>
                <div>
                  <p className="text-gray-400">Mô tả</p>
                  <p>{roomType.description || "Không có mô tả"}</p>
                </div>
                <div>
                  <p className="text-gray-400">Số phòng</p>
                  <p>{roomType.rooms?.length || 0}</p>
                </div>
              </div>
            </div>

            {/* Danh sách phòng */}
            <div className="rounded-lg bg-[#201b39] p-6">
              <h2 className="mb-4 text-xl font-semibold">
                Danh sách phòng ({roomType.rooms?.length || 0})
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full table-auto border-collapse border border-gray-600">
                  <thead>
                    <tr className="bg-[#130f21]">
                      <th className="border border-gray-600 px-4 py-2 text-left">
                        Tên phòng
                      </th>
                      <th className="border border-gray-600 px-4 py-2 text-left">
                        Tòa nhà
                      </th>
                      <th className="border border-gray-600 px-4 py-2 text-left">
                        Tầng
                      </th>
                      <th className="border border-gray-600 px-4 py-2 text-left">
                        Số sinh viên
                      </th>
                      <th className="border border-gray-600 px-4 py-2 text-left">
                        Trạng thái
                      </th>
                      <th className="border border-gray-600 px-4 py-2 text-left">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(roomType.rooms) &&
                    roomType.rooms.length > 0 ? (
                      roomType.rooms.map((room) => (
                        <tr key={room.roomid}>
                          <td className="border border-gray-600 px-4 py-2">
                            {room.roomname}
                          </td>
                          <td className="border border-gray-600 px-4 py-2">
                            {room.building?.buildingname || "---"}
                          </td>
                          <td className="border border-gray-600 px-4 py-2">
                            {room.floor}
                          </td>
                          <td className="border border-gray-600 px-4 py-2">
                            {room.students?.length || 0}
                          </td>
                          <td className="border border-gray-600 px-4 py-2">
                            <span className={getStatusClass(room.status)}>
                              {getStatusText(room.status)}
                            </span>
                          </td>
                          <td className="border border-gray-600 px-4 py-2">
                            <div className="flex gap-2">
                              <button
                                onClick={() => navigate(`/admin/room/${room.roomid}`)}
                                className="text-blue-500 hover:text-blue-600"
                              >
                                Chi tiết
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteModal({
                                    isOpen: true,
                                    roomId: room.roomid,
                                    roomName: room.roomname,
                                  })
                                }
                                className="text-red-500 hover:text-red-600"
                              >
                                Xóa
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="border border-gray-600 px-4 py-2 text-center"
                        >
                          Chưa có phòng nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
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
        </div>
      </div>

      <DeleteModal
        isOpen={deleteModal.isOpen}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa phòng "${deleteModal.roomName}" không? Hành động này không thể hoàn tác.`}
        onClose={() =>
          setDeleteModal({ isOpen: false, roomId: null, roomName: "" })
        }
        onConfirm={handleDelete}
      />
    </Layout>
  );
};

export default RoomTypeDetailPage;
