import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { buildingApi } from "../../services/api";
import { roomApi, roomTypeApi } from "../../services/api";

interface Building {
  buildingid: number;
  buildingname: string;
}

interface RoomType {
  roomtypeid: number;
  roomtypename: string;
  price: string | null; // Adjusted to match entity
  gender: string | null; // Adjusted to match entity
}

const CreateRoomPage = () => {
  const navigate = useNavigate();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);

  const [formData, setFormData] = useState({
    roomName: "",
    buildingId: "",
    roomTypeId: "",
    status: "Available", // Default to 'Available' as per DTO
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [toanhaResponse, loaiphongResponse] = await Promise.all([
          buildingApi.getAll(),
          roomTypeApi.getAll(),
        ]);

        const toanhasData = toanhaResponse.data.data || toanhaResponse.data;
        const loaiphongsData = loaiphongResponse.data.data || loaiphongResponse.data;

        setBuildings(Array.isArray(toanhasData) ? toanhasData : []);
        setRoomTypes(Array.isArray(loaiphongsData) ? loaiphongsData : []);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
        alert("Có lỗi xảy ra khi tải dữ liệu");
      }
    };

    fetchInitialData();
  }, []);

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
    try {
      await roomApi.create({
        roomName: formData.roomName,
        buildingId: parseInt(formData.buildingId),
        roomTypeId: parseInt(formData.roomTypeId),
        status: formData.status,
      });
      navigate("/admin/room");
    } catch (error) {
      console.error("Có lỗi xảy ra khi tạo phòng:", error);
      alert("Có lỗi xảy ra khi tạo phòng");
    }
  };

  return (
    <Layout>
      <div className="flex h-full flex-col bg-[#130f21] text-[#e1dce4]">
        <h1 className="-mt-5 mb-2 p-5 text-center text-3xl font-bold uppercase">
          Thêm phòng
        </h1>

        <div className="mx-auto w-full max-w-2xl flex-1 px-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="roomName" className="text-lg font-medium">
                Tên phòng
              </label>
              <input
                type="text"
                id="roomName"
                name="roomName"
                value={formData.roomName}
                onChange={handleInputChange}
                className="rounded-lg border border-gray-600 bg-[#201b39] px-4 py-2 focus:border-blue-500 focus:outline-none"
                placeholder="Nhập tên phòng"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="buildingId" className="text-lg font-medium">
                Tòa nhà
              </label>
              <select
                id="buildingId"
                name="buildingId"
                value={formData.buildingId}
                onChange={handleInputChange}
                className="rounded-lg border border-gray-600 bg-[#201b39] px-4 py-2 focus:border-blue-500 focus:outline-none"
                required
              >
                <option value="">Chọn tòa nhà</option>
                {buildings.map((building) => (
                  <option key={building.buildingid} value={building.buildingid}>
                    {building.buildingname}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="roomTypeId" className="text-lg font-medium">
                Loại phòng
              </label>
              <select
                id="roomTypeId"
                name="roomTypeId"
                value={formData.roomTypeId}
                onChange={handleInputChange}
                className="rounded-lg border border-gray-600 bg-[#201b39] px-4 py-2 focus:border-blue-500 focus:outline-none"
                required
              >
                <option value="">Chọn loại phòng</option>
                {roomTypes.map((roomType) => (
                  <option
                    key={roomType.roomtypeid}
                    value={roomType.roomtypeid}
                  >
                    {roomType.roomtypename} -{" "}
                    {roomType.price !== null && typeof parseFloat(roomType.price) === 'number' ? parseFloat(roomType.price).toLocaleString() : 'N/A'}đ - {roomType.gender}
                  </option>
                ))}
              </select>
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
              >
                <option value="Available">Còn trống (Available)</option>
                <option value="Occupied">Đã có người (Occupied)</option>
                <option value="Maintenance">Đang bảo trì (Maintenance)</option>
              </select>
            </div>

            <div className="mt-4 flex gap-4">
              <button
                type="submit"
                className="rounded-lg bg-blue-500 px-6 py-2 font-medium hover:bg-blue-600"
              >
                Thêm mới
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

export default CreateRoomPage;
