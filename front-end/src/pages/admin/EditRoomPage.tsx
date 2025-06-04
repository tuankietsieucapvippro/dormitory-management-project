import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { useParams, useNavigate } from "react-router-dom";
import { api, buildingApi, roomTypeApi, roomApi } from "../../services/api";

// Định nghĩa interface phù hợp với API
interface Building {
  buildingid: number;
  buildingname: string;
}

interface RoomType {
  roomtypeid: number;
  roomtypename: string;
  price: string | number;
  gender: string;
}

interface Room {
  roomid: number;
  roomname: string;
  buildingid: number;
  roomtypeid: number;
  floor: number;
  status: string;
  bedcount: number;
  building?: {
    buildingname: string;
  };
  roomtype?: {
    roomtypename: string;
    gender: string;
    price: string | number;
  };
}

const EditRoomPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);

  const [formData, setFormData] = useState<{
    roomname: string;
    buildingid: string;
    roomtypeid: string;
    floor: string;
    status: string;
    bedcount: string;
  }>({
    roomname: "",
    buildingid: "",
    roomtypeid: "",
    floor: "",
    status: "",
    bedcount: "4",
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

    // Nếu data là một object, kiểm tra xem có thể nó là array-like object
    if (typeof data === "object") {
      // Kiểm tra xem có property nào là số không
      const hasNumericKeys = Object.keys(data).some(
        (key) => !isNaN(Number(key)),
      );
      if (hasNumericKeys) {
        try {
          // Thử chuyển object thành array
          return Array.from(data as any);
        } catch (e) {
          console.error("Không thể chuyển đổi dữ liệu thành mảng:", e);
        }
      }
    }

    return [];
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Bước 1: Tải thông tin phòng
        console.log(`Fetching room with ID: ${id}`);
        const roomResponse = await roomApi.getById(Number(id));
        const roomData = roomResponse.data as Room;

        showDebugInfo({
          endpoint: `/rooms/${id}`,
          responseData: roomData,
          step: "Fetch Room Data",
        });

        if (!roomData) {
          throw new Error(`Không tìm thấy thông tin phòng với ID: ${id}`);
        }

        // Bước 2: Lưu dữ liệu phòng vào form
        setFormData({
          roomname: roomData.roomname || "",
          buildingid: roomData.buildingid?.toString() || "",
          roomtypeid: roomData.roomtypeid?.toString() || "",
          floor: roomData.floor?.toString() || "",
          status: roomData.status || "",
          bedcount: roomData.bedcount?.toString() || "4",
        });

        // Bước 3: Tải danh sách tòa nhà
        console.log("Fetching buildings");
        const buildingResponse = await buildingApi.getAll();

        // Đảm bảo dữ liệu là một mảng
        const buildingsData = ensureArray<Building>(buildingResponse.data);

        showDebugInfo({
          endpoint: "/buildings",
          responseType: typeof buildingResponse.data,
          isArray: Array.isArray(buildingResponse.data),
          rawData: buildingResponse.data,
          processedData: buildingsData,
          count: buildingsData.length,
          step: "Fetch Buildings",
        });

        setBuildings(buildingsData);

        // Bước 4: Tải danh sách loại phòng
        console.log("Fetching room types");
        const roomTypeResponse = await roomTypeApi.getAll();

        // Đảm bảo dữ liệu là một mảng
        const roomTypesData = ensureArray<RoomType>(roomTypeResponse.data);

        showDebugInfo({
          endpoint: "/room-types",
          responseType: typeof roomTypeResponse.data,
          isArray: Array.isArray(roomTypeResponse.data),
          rawData: roomTypeResponse.data,
          processedData: roomTypesData,
          count: roomTypesData.length,
          step: "Fetch Room Types",
        });

        setRoomTypes(roomTypesData);
      } catch (error: any) {
        console.error("Có lỗi xảy ra khi lấy dữ liệu:", error);
        setError(
          error.message ||
            "Không thể tải thông tin phòng. Vui lòng thử lại sau.",
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
      fetchData();
    } else {
      setError("ID phòng không hợp lệ");
      setLoading(false);
    }
  }, [id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToUpdate = {
        roomname: formData.roomname,
        buildingid: parseInt(formData.buildingid),
        roomtypeid: parseInt(formData.roomtypeid),
        floor: parseInt(formData.floor),
        status: formData.status,
        bedcount: parseInt(formData.bedcount),
      };

      showDebugInfo({
        endpoint: `/rooms/${id}`,
        method: "PATCH",
        requestData: dataToUpdate,
        step: "Update Room",
      });

      await roomApi.update(Number(id), dataToUpdate);
      navigate("/admin/room");
    } catch (error: any) {
      console.error("Có lỗi xảy ra khi cập nhật phòng:", error);
      alert(
        "Có lỗi xảy ra khi cập nhật phòng: " +
          (error.message || "Vui lòng thử lại sau"),
      );
      showDebugInfo({
        error: error.message,
        stack: error.stack,
        step: "Update Error",
      });
    } finally {
      setLoading(false);
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

  if (error) {
    return (
      <Layout>
        <div className="flex h-full flex-col items-center justify-center bg-[#130f21] text-[#e1dce4]">
          <p className="mb-4 text-lg text-red-500">{error}</p>
          <div className="mb-6 max-w-2xl rounded-lg bg-[#201b39] p-4 text-sm">
            <pre className="overflow-auto whitespace-pre-wrap">
              {debugInfo
                ? JSON.stringify(debugInfo, null, 2)
                : "Không có thông tin debug"}
            </pre>
          </div>
          <button
            onClick={() => navigate("/admin/room")}
            className="rounded-lg bg-blue-500 px-6 py-2 font-medium hover:bg-blue-600"
          >
            Quay lại danh sách phòng
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex h-full flex-col bg-[#130f21] text-[#e1dce4]">
        <h1 className="-mt-5 mb-2 p-5 text-center text-3xl font-bold uppercase">
          Sửa thông tin phòng
        </h1>

        <div className="mx-auto w-full max-w-2xl flex-1 px-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="roomname" className="text-lg font-medium">
                Tên phòng
              </label>
              <input
                type="text"
                id="roomname"
                name="roomname"
                value={formData.roomname}
                onChange={handleInputChange}
                className="rounded-lg border border-gray-600 bg-[#201b39] px-4 py-2 focus:border-blue-500 focus:outline-none"
                placeholder="Nhập tên phòng"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="floor" className="text-lg font-medium">
                Tầng
              </label>
              <input
                type="number"
                id="floor"
                name="floor"
                value={formData.floor}
                onChange={handleInputChange}
                className="rounded-lg border border-gray-600 bg-[#201b39] px-4 py-2 focus:border-blue-500 focus:outline-none"
                placeholder="Nhập số tầng"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="bedcount" className="text-lg font-medium">
                Số giường
              </label>
              <input
                type="number"
                id="bedcount"
                name="bedcount"
                value={formData.bedcount}
                onChange={handleInputChange}
                className="rounded-lg border border-gray-600 bg-[#201b39] px-4 py-2 focus:border-blue-500 focus:outline-none"
                placeholder="Nhập số giường"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="buildingid" className="text-lg font-medium">
                Tòa nhà
              </label>
              <select
                id="buildingid"
                name="buildingid"
                value={formData.buildingid}
                onChange={handleInputChange}
                className="rounded-lg border border-gray-600 bg-[#201b39] px-4 py-2 focus:border-blue-500 focus:outline-none"
                required
              >
                <option value="">Chọn tòa nhà</option>
                {Array.isArray(buildings) &&
                  buildings.map((building) => (
                    <option
                      key={building.buildingid}
                      value={building.buildingid}
                    >
                      {building.buildingname}
                    </option>
                  ))}
              </select>
              {!Array.isArray(buildings) && (
                <p className="mt-1 text-sm text-red-400">
                  Lỗi tải danh sách tòa nhà! Dữ liệu không đúng định dạng.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="roomtypeid" className="text-lg font-medium">
                Loại phòng
              </label>
              <select
                id="roomtypeid"
                name="roomtypeid"
                value={formData.roomtypeid}
                onChange={handleInputChange}
                className="rounded-lg border border-gray-600 bg-[#201b39] px-4 py-2 focus:border-blue-500 focus:outline-none"
                required
              >
                <option value="">Chọn loại phòng</option>
                {Array.isArray(roomTypes) &&
                  roomTypes.map((roomType) => (
                    <option
                      key={roomType.roomtypeid}
                      value={roomType.roomtypeid}
                    >
                      {roomType.roomtypename} - {roomType.gender} -{" "}
                      {Number(roomType.price).toLocaleString()} VNĐ
                    </option>
                  ))}
              </select>
              {!Array.isArray(roomTypes) && (
                <p className="mt-1 text-sm text-red-400">
                  Lỗi tải danh sách loại phòng! Dữ liệu không đúng định dạng.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="status" className="text-lg font-medium">
                Trạng thái
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="rounded-lg border border-gray-600 bg-[#201b39] px-4 py-2 focus:border-blue-500 focus:outline-none"
                required
              >
                <option value="">Chọn trạng thái</option>
                <option value="Available">Còn trống</option>
                <option value="Full">Đã đầy</option>
                <option value="Maintenance">Đang sửa chữa</option>
              </select>
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

            <div className="mt-4 flex gap-4">
              <button
                type="submit"
                className="rounded-lg bg-blue-500 px-6 py-2 font-medium hover:bg-blue-600"
              >
                Cập nhật
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin/room")}
                className="rounded-lg bg-gray-500 px-6 py-2 font-medium hover:bg-gray-600"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default EditRoomPage;
