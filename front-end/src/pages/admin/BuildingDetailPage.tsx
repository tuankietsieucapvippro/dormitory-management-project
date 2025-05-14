import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { useParams, useNavigate } from "react-router-dom";
import { buildingApi, roomApi } from "../../services/api";
import RoomTable from "../../components/RoomTable";

interface Room {
  roomid: number;
  roomname: string;
  status: string;
  bedcount: number;
  building: {
    buildingname: string;
    buildingid: number;
  };
  roomtype: {
    roomtypename: string;
    price: string;
    gender: string;
  };
  roomregistrations: any[];
}

interface Building {
  buildingid: number;
  buildingname: string;
  description: string;
  gender?: string; // Thêm trường gender nếu có
}

interface BuildingStats {
  totalRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  buildingGender: string;
  occupancyRate: number;
}

const BuildingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [building, setBuilding] = useState<Building | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [buildingRooms, setBuildingRooms] = useState<Room[]>([]);
  const [stats, setStats] = useState<BuildingStats>({
    totalRooms: 0,
    totalBeds: 0,
    occupiedBeds: 0,
    availableBeds: 0,
    buildingGender: "Chưa xác định",
    occupancyRate: 0,
  });

  const fetchBuildingData = async () => {
    try {
      setLoading(true);
      // Lấy thông tin tòa nhà
      const buildingResponse = await buildingApi.getById(Number(id));
      console.log("Building data:", buildingResponse.data);

      // Kiểm tra cấu trúc dữ liệu từ API
      if (buildingResponse && buildingResponse.data) {
        const buildingData =
          buildingResponse.data.data || buildingResponse.data;
        setBuilding(buildingData);

        // Lấy danh sách phòng của tòa nhà
        const roomsResponse = await roomApi.getByBuilding(Number(id));
        if (roomsResponse && roomsResponse.data) {
          const roomsData = roomsResponse.data.data || roomsResponse.data;
          const rooms = Array.isArray(roomsData) ? roomsData : [];
          setBuildingRooms(rooms);

          // Tính toán thống kê
          calculateBuildingStats(rooms);
        }
      } else {
        console.error("Invalid data format:", buildingResponse);
        alert(
          "Không thể tải thông tin tòa nhà, định dạng dữ liệu không hợp lệ",
        );
      }
    } catch (error) {
      console.error("Có lỗi xảy ra khi lấy thông tin tòa nhà:", error);
      alert("Có lỗi xảy ra khi tải dữ liệu tòa nhà");
    } finally {
      setLoading(false);
    }
  };

  const calculateBuildingStats = (rooms: Room[]) => {
    // Tổng số phòng
    const totalRooms = rooms.length;

    // Tính toán thông tin giường và loại phòng theo giới tính
    let totalBeds = 0;
    let occupiedBeds = 0;
    let maleRooms = 0;
    let femaleRooms = 0;
    let mixedRooms = 0;

    rooms.forEach((room) => {
      // Tính số giường
      const bedCount = room.bedcount || 0;
      totalBeds += bedCount;

      // Tính số giường đã sử dụng
      const occupiedCount = room.roomregistrations?.length || 0;
      occupiedBeds += occupiedCount;

      // Đếm phòng theo giới tính
      if (room.roomtype?.gender) {
        if (
          room.roomtype.gender.toLowerCase() === "nam" ||
          room.roomtype.gender.toLowerCase() === "male"
        ) {
          maleRooms++;
        } else if (
          room.roomtype.gender.toLowerCase() === "nữ" ||
          room.roomtype.gender.toLowerCase() === "female"
        ) {
          femaleRooms++;
        } else {
          mixedRooms++;
        }
      }
    });

    // Xác định loại tòa nhà theo giới tính
    let buildingGender = "Chưa xác định";
    if (maleRooms > 0 && femaleRooms === 0) {
      buildingGender = "Nam";
    } else if (femaleRooms > 0 && maleRooms === 0) {
      buildingGender = "Nữ";
    } else if (maleRooms > 0 && femaleRooms > 0) {
      buildingGender = "Nam và Nữ";
    }

    // Tính tỷ lệ lấp đầy (%)
    const occupancyRate =
      totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    setStats({
      totalRooms,
      totalBeds,
      occupiedBeds,
      availableBeds: totalBeds - occupiedBeds,
      buildingGender,
      occupancyRate,
    });
  };

  useEffect(() => {
    fetchBuildingData();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex h-full items-center justify-center bg-[#130f21] text-[#e1dce4]">
          Đang tải...
        </div>
      </Layout>
    );
  }

  if (!building) {
    return (
      <Layout>
        <div className="flex h-full items-center justify-center bg-[#130f21] text-[#e1dce4]">
          Không tìm thấy thông tin tòa nhà
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex h-auto flex-col gap-6 bg-[#130f21] p-6 text-[#e1dce4]">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{building.buildingname}</h1>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/building/edit/${building.buildingid}`)}
              className="rounded bg-yellow-500 px-4 py-2 hover:bg-yellow-600"
            >
              Sửa
            </button>
            <button
              onClick={() => navigate("/building")}
              className="rounded bg-blue-500 px-4 py-2 hover:bg-blue-600"
            >
              Quay lại
            </button>
          </div>
        </div>

        <div className="rounded-lg bg-[#201b39] p-6">
          <h2 className="mb-4 text-xl font-semibold">Thông tin tòa nhà</h2>

          <div className="mb-6">
            <h3 className="mb-2 text-lg font-medium">Mô tả</h3>
            <p>{building.description || "Không có mô tả"}</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-md bg-[#2a2444] p-4">
              <h3 className="mb-3 text-lg font-medium">Thống kê phòng</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Tổng số phòng:</span>
                  <span className="font-semibold">{stats.totalRooms}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tổng số giường:</span>
                  <span className="font-semibold">{stats.totalBeds}</span>
                </div>
                <div className="flex justify-between">
                  <span>Giường đã sử dụng:</span>
                  <span className="font-semibold">{stats.occupiedBeds}</span>
                </div>
                <div className="flex justify-between">
                  <span>Giường còn trống:</span>
                  <span className="font-semibold text-green-400">
                    {stats.availableBeds}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-md bg-[#2a2444] p-4">
              <h3 className="mb-3 text-lg font-medium">Thông tin khác</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Loại tòa nhà:</span>
                  <span className="font-semibold">
                    {stats.buildingGender === "Nam"
                      ? "Ký túc xá nam"
                      : stats.buildingGender === "Nữ"
                        ? "Ký túc xá nữ"
                        : stats.buildingGender === "Nam và Nữ"
                          ? "Ký túc xá hỗn hợp"
                          : "Chưa xác định"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tỷ lệ lấp đầy:</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-700">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${stats.occupancyRate}%` }}
                      ></div>
                    </div>
                    <span className="font-semibold">
                      {stats.occupancyRate}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-[#201b39] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Danh sách phòng</h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm phòng..."
                  className="rounded border border-gray-600 bg-[#130f21] px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <button
                onClick={() => navigate("/room/create")}
                className="rounded bg-green-500 px-4 py-2 hover:bg-green-600"
              >
                Thêm phòng
              </button>
            </div>
          </div>

          <RoomTable
            searchTerm={searchTerm}
            buildingId={building.buildingid}
            onRoomDeleted={fetchBuildingData}
          />
        </div>
      </div>
    </Layout>
  );
};

export default BuildingDetailPage;
