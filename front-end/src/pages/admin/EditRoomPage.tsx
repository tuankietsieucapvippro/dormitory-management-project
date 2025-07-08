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
    status: string;
    bedcount: string;
  }>({
    roomname: "",
    buildingid: "",
    roomtypeid: "",
    status: "",
    bedcount: "4",
  });

  // Hàm hiển thị thông tin debug
  const showDebugInfo = (data: any) => {
    console.log("Debug Info:", data);
    setDebugInfo(data);
  };



  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Bước 1: Tải thông tin phòng
        console.log(`Fetching room with ID: ${id}`);
        const roomResponse = await roomApi.getById(Number(id));

        // Xử lý response data - có thể có cấu trúc { data: { data: room } } hoặc { data: room }
        let roomData: Room;
        if (roomResponse.data?.data) {
          roomData = roomResponse.data.data as Room;
        } else {
          roomData = roomResponse.data as Room;
        }

        showDebugInfo({
          endpoint: `/rooms/${id}`,
          rawResponse: roomResponse.data,
          processedRoomData: roomData,
          step: "Fetch Room Data",
        });

        if (!roomData || !roomData.roomid) {
          throw new Error(`Không tìm thấy thông tin phòng với ID: ${id}`);
        }

        // Bước 2: Lưu dữ liệu phòng vào form
        setFormData({
          roomname: roomData.roomname || "",
          buildingid: roomData.buildingid?.toString() || "",
          roomtypeid: roomData.roomtypeid?.toString() || "",
          status: roomData.status || "",
          bedcount: roomData.bedcount?.toString() || "4",
        });

        console.log("Form data set:", {
          roomname: roomData.roomname,
          buildingid: roomData.buildingid,
          roomtypeid: roomData.roomtypeid,
          status: roomData.status,
          bedcount: roomData.bedcount,
        });

        // Bước 3: Tải danh sách tòa nhà
        console.log("Fetching buildings");
        const buildingResponse = await buildingApi.getAll();

        // Xử lý response data cho buildings
        let buildingsData: Building[];
        if (buildingResponse.data?.data) {
          buildingsData = Array.isArray(buildingResponse.data.data) ? buildingResponse.data.data : [];
        } else {
          buildingsData = Array.isArray(buildingResponse.data) ? buildingResponse.data : [];
        }

        showDebugInfo({
          endpoint: "/buildings",
          rawResponse: buildingResponse.data,
          processedData: buildingsData,
          count: buildingsData.length,
          step: "Fetch Buildings",
        });

        setBuildings(buildingsData);

        // Bước 4: Tải danh sách loại phòng
        console.log("Fetching room types");
        const roomTypeResponse = await roomTypeApi.getAll();

        // Xử lý response data cho room types
        let roomTypesData: RoomType[];
        if (roomTypeResponse.data?.data) {
          roomTypesData = Array.isArray(roomTypeResponse.data.data) ? roomTypeResponse.data.data : [];
        } else {
          roomTypesData = Array.isArray(roomTypeResponse.data) ? roomTypeResponse.data : [];
        }

        showDebugInfo({
          endpoint: "/room-types",
          rawResponse: roomTypeResponse.data,
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

  // Function để extract số giường từ tên loại phòng
  const extractBedCountFromRoomTypeName = (roomTypeName: string): string => {
    console.log(`Extracting bed count from room type: "${roomTypeName}"`);

    // Tìm số trong tên loại phòng (ví dụ: "phòng 8 người nam" -> "8")
    const match = roomTypeName.match(/(\d+)\s*người/i);
    if (match) {
      console.log(`Found bed count using "người" pattern: ${match[1]}`);
      return match[1];
    }

    // Nếu không tìm thấy pattern "X người", tìm số đầu tiên
    const numberMatch = roomTypeName.match(/\d+/);
    if (numberMatch) {
      console.log(`Found bed count using first number: ${numberMatch[0]}`);
      return numberMatch[0];
    }

    // Mặc định trả về 4 nếu không tìm thấy số nào
    console.log("No number found, using default: 4");
    return "4";
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    // Nếu thay đổi loại phòng, tự động cập nhật số giường
    if (name === "roomtypeid" && value) {
      const selectedRoomType = roomTypes.find(rt => rt.roomtypeid.toString() === value);
      if (selectedRoomType) {
        const bedCount = extractBedCountFromRoomTypeName(selectedRoomType.roomtypename);
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          bedcount: bedCount,
        }));
        return;
      }
    }

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
        roomName: formData.roomname,
        buildingId: parseInt(formData.buildingid),
        roomTypeId: parseInt(formData.roomtypeid),
        status: formData.status,
        bedCount: parseInt(formData.bedcount),
      };

      showDebugInfo({
        endpoint: `/rooms/${id}`,
        method: "PATCH",
        requestData: dataToUpdate,
        step: "Update Room",
      });

      await roomApi.update(Number(id), dataToUpdate);
      alert("Cập nhật phòng thành công!");
      navigate("/admin/room");
    } catch (error: any) {
      console.error("Có lỗi xảy ra khi cập nhật phòng:", error);

      // Hiển thị lỗi cụ thể từ backend
      if (error.response?.data?.message) {
        alert(`Lỗi: ${error.response.data.message}`);
      } else if (error.message) {
        alert(`Lỗi: ${error.message}`);
      } else {
        alert("Có lỗi xảy ra khi cập nhật phòng");
      }

      showDebugInfo({
        error: error.message,
        response: error.response?.data,
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
              <label htmlFor="bedcount" className="text-lg font-medium">
                Số giường (tự động từ loại phòng)
              </label>
              <input
                type="number"
                id="bedcount"
                name="bedcount"
                value={formData.bedcount}
                className="rounded-lg border border-gray-600 bg-[#2a2547] px-4 py-2 text-gray-300 cursor-not-allowed"
                placeholder="Sẽ tự động cập nhật khi chọn loại phòng"
                readOnly
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
                      {roomType.roomtypename} - {roomType.gender === 'male' ? 'Nam' : roomType.gender === 'female' ? 'Nữ' : roomType.gender} -{" "}
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
                <option value="available">Còn trống</option>
                <option value="occupied">Đã có người</option>
                <option value="maintenance">Đang bảo trì</option>
              </select>
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
