import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { useNavigate } from "react-router-dom";
import { buildingApi, roomApi, utilitiesApi } from "../../services/api";

interface Building {
  buildingid: number;
  buildingname: string;
}

interface Room {
  roomid: number;
  roomname: string;
  buildingid: number;
  status: string;
}

const CreateUtilitiesPage = () => {
  const navigate = useNavigate();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState("");

  const [formData, setFormData] = useState({
    roomid: "",
    previouselectricitymeter: "",
    currentelectricitymeter: "",
    previouswatermeter: "",
    currentwatermeter: "",
    startdate: new Date().toISOString().split("T")[0],
    enddate: new Date().toISOString().split("T")[0],
    electricityprice: "3500",
    waterprice: "15000",
  });

  // State để track validation errors
  const [validationErrors, setValidationErrors] = useState({
    electricity: "",
    water: "",
  });

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        console.log("Fetching buildings...");
        const response = await buildingApi.getAll();
        console.log("Buildings response:", response);

        // Xử lý response data
        let buildingsData: Building[];
        if (response.data?.data) {
          buildingsData = Array.isArray(response.data.data) ? response.data.data : [];
        } else {
          buildingsData = Array.isArray(response.data) ? response.data : [];
        }

        console.log("Buildings data:", buildingsData);
        setBuildings(buildingsData);
      } catch (error) {
        console.error("Error fetching buildings:", error);
        alert("Có lỗi xảy ra khi tải danh sách tòa nhà");
      }
    };

    fetchBuildings();
  }, []);

  useEffect(() => {
    const fetchRooms = async () => {
      if (selectedBuilding) {
        try {
          console.log("Fetching rooms for building:", selectedBuilding);

          // Sử dụng API getAll với filter thay vì getByBuilding
          const response = await roomApi.getAll();
          console.log("Rooms response:", response);

          // Xử lý response data
          let roomsData: Room[];
          if (response.data?.data) {
            roomsData = Array.isArray(response.data.data) ? response.data.data : [];
          } else {
            roomsData = Array.isArray(response.data) ? response.data : [];
          }

          // Filter rooms by building
          const filteredRooms = roomsData.filter(
            (room: Room) => room.buildingid === Number(selectedBuilding)
          );

          console.log("Filtered rooms:", filteredRooms);
          setRooms(filteredRooms);
        } catch (error) {
          console.error("Error fetching rooms:", error);
          alert("Có lỗi xảy ra khi tải danh sách phòng");
        }
      } else {
        setRooms([]);
      }
    };

    fetchRooms();
  }, [selectedBuilding]);

  const handleBuildingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBuilding(e.target.value);
    setFormData((prev) => ({ ...prev, roomid: "" }));
  };

  // Function để lấy chỉ số điện nước mới nhất của phòng
  const fetchLatestUtilityForRoom = async (roomId: number) => {
    try {
      console.log("Fetching latest utility for room:", roomId);
      const response = await utilitiesApi.getAll();

      // Xử lý response data
      let utilitiesData: any[];
      if (response.data?.data) {
        utilitiesData = Array.isArray(response.data.data) ? response.data.data : [];
      } else {
        utilitiesData = Array.isArray(response.data) ? response.data : [];
      }

      // Filter utilities cho phòng này và sắp xếp theo ngày kết thúc mới nhất
      const roomUtilities = utilitiesData
        .filter((util: any) => util.roomid === roomId || util.room?.roomid === roomId)
        .sort((a: any, b: any) => new Date(b.enddate).getTime() - new Date(a.enddate).getTime());

      console.log("Room utilities:", roomUtilities);

      if (roomUtilities.length > 0) {
        const latestUtility = roomUtilities[0];
        console.log("Latest utility:", latestUtility);

        // Cập nhật chỉ số cũ bằng chỉ số mới của lần trước
        setFormData((prev) => ({
          ...prev,
          previouselectricitymeter: latestUtility.currentelectricitymeter?.toString() || "0",
          previouswatermeter: latestUtility.currentwatermeter?.toString() || "0",
        }));

        console.log("Auto-filled previous meters:", {
          previouselectricitymeter: latestUtility.currentelectricitymeter,
          previouswatermeter: latestUtility.currentwatermeter,
        });

        // Hiển thị thông báo cho người dùng
        alert(`Đã tự động điền chỉ số cũ từ lần nhập trước:\n- Điện: ${latestUtility.currentelectricitymeter}\n- Nước: ${latestUtility.currentwatermeter}`);
      } else {
        console.log("No previous utility records found for this room");
        // Nếu không có dữ liệu trước đó, đặt về 0
        setFormData((prev) => ({
          ...prev,
          previouselectricitymeter: "0",
          previouswatermeter: "0",
        }));

        // Thông báo cho người dùng biết đây là lần đầu nhập
        alert("Đây là lần đầu nhập chỉ số cho phòng này. Chỉ số cũ được đặt về 0.");
      }
    } catch (error) {
      console.error("Error fetching latest utility:", error);
      // Nếu có lỗi, đặt về 0
      setFormData((prev) => ({
        ...prev,
        previouselectricitymeter: "0",
        previouswatermeter: "0",
      }));
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    // Nếu thay đổi phòng, tự động lấy chỉ số điện nước mới nhất
    if (name === "roomid" && value) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Clear validation errors khi chọn phòng mới
      setValidationErrors({
        electricity: "",
        water: "",
      });

      // Fetch latest utility cho phòng này
      fetchLatestUtilityForRoom(parseInt(value));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Validate real-time cho chỉ số điện nước mới
      if (name === "currentelectricitymeter" || name === "currentwatermeter") {
        const currentValue = parseInt(value) || 0;

        if (name === "currentelectricitymeter") {
          const previousElectricity = parseInt(formData.previouselectricitymeter) || 0;
          if (currentValue < previousElectricity && value !== "") {
            setValidationErrors(prev => ({
              ...prev,
              electricity: `Chỉ số điện mới (${currentValue}) không thể nhỏ hơn chỉ số cũ (${previousElectricity})`
            }));
          } else {
            setValidationErrors(prev => ({
              ...prev,
              electricity: ""
            }));
          }
        }

        if (name === "currentwatermeter") {
          const previousWater = parseInt(formData.previouswatermeter) || 0;
          if (currentValue < previousWater && value !== "") {
            setValidationErrors(prev => ({
              ...prev,
              water: `Chỉ số nước mới (${currentValue}) không thể nhỏ hơn chỉ số cũ (${previousWater})`
            }));
          } else {
            setValidationErrors(prev => ({
              ...prev,
              water: ""
            }));
          }
        }
      }
    }
  };

  // Function để validate chỉ số điện nước
  const validateMeterReadings = () => {
    const previousElectricity = parseInt(formData.previouselectricitymeter) || 0;
    const currentElectricity = parseInt(formData.currentelectricitymeter) || 0;
    const previousWater = parseInt(formData.previouswatermeter) || 0;
    const currentWater = parseInt(formData.currentwatermeter) || 0;

    const errors = [];

    // Kiểm tra chỉ số điện
    if (currentElectricity < previousElectricity) {
      errors.push(`Chỉ số điện mới (${currentElectricity}) không thể nhỏ hơn chỉ số điện cũ (${previousElectricity})`);
    }

    // Kiểm tra chỉ số nước
    if (currentWater < previousWater) {
      errors.push(`Chỉ số nước mới (${currentWater}) không thể nhỏ hơn chỉ số nước cũ (${previousWater})`);
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate chỉ số điện nước trước khi submit
    const validationErrors = validateMeterReadings();
    if (validationErrors.length > 0) {
      alert(`Lỗi validation:\n\n${validationErrors.join('\n')}`);
      return;
    }

    try {
      const payload = {
        roomId: parseInt(formData.roomid),
        startDate: formData.startdate,
        endDate: formData.enddate,
        previousElectricityMeter: parseInt(formData.previouselectricitymeter),
        currentElectricityMeter: parseInt(formData.currentelectricitymeter),
        previousWaterMeter: parseInt(formData.previouswatermeter),
        currentWaterMeter: parseInt(formData.currentwatermeter),
      };

      console.log("Creating utility with payload:", payload);
      await utilitiesApi.create(payload);
      alert("Tạo chỉ số điện nước thành công!");
      navigate("/admin/utilities");
    } catch (error: any) {
      console.error("Error creating utility record:", error);

      // Hiển thị lỗi cụ thể từ backend
      if (error.response?.data?.message) {
        alert(`Lỗi: ${error.response.data.message}`);
      } else if (error.message) {
        alert(`Lỗi: ${error.message}`);
      } else {
        alert("Có lỗi xảy ra khi tạo chỉ số điện nước");
      }
    }
  };

  return (
    <Layout>
      <div className="flex h-auto flex-col bg-[#130f21] text-[#e1dce4]">
        <h1 className="-mt-5 mb-2 p-5 text-center text-3xl font-bold uppercase">
          Thêm chỉ số điện nước
        </h1>

        <div className="mx-auto w-full max-w-2xl flex-1 px-8">
          {/* Thông báo hướng dẫn */}
          <div className="mb-6 rounded-lg bg-blue-900/30 border border-blue-500/30 p-4">
            <div className="flex items-start gap-3">
              <div className="text-blue-400 text-xl">ℹ️</div>
              <div>
                <h3 className="text-blue-300 font-medium mb-1">Hướng dẫn nhập chỉ số</h3>
                <p className="text-blue-200 text-sm">
                  Khi bạn chọn phòng, hệ thống sẽ tự động điền chỉ số điện và nước cũ từ lần nhập gần nhất.
                  Bạn chỉ cần nhập chỉ số điện và nước mới.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="buildingid" className="text-lg font-medium">
                Tòa nhà
              </label>
              <select
                id="buildingid"
                value={selectedBuilding}
                onChange={handleBuildingChange}
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
              <label htmlFor="roomid" className="text-lg font-medium">
                Phòng
              </label>
              <select
                id="roomid"
                name="roomid"
                value={formData.roomid}
                onChange={handleInputChange}
                className="rounded-lg border border-gray-600 bg-[#201b39] px-4 py-2 focus:border-blue-500 focus:outline-none"
                required
              >
                <option value="">Chọn phòng</option>
                {rooms.map((room) => (
                  <option key={room.roomid} value={room.roomid}>
                    {room.roomname}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="startdate" className="text-lg font-medium">
                Ngày bắt đầu
              </label>
              <input
                type="date"
                id="startdate"
                name="startdate"
                value={formData.startdate}
                onChange={handleInputChange}
                className="rounded-lg border border-gray-600 bg-[#201b39] px-4 py-2 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="enddate" className="text-lg font-medium">
                Ngày kết thúc
              </label>
              <input
                type="date"
                id="enddate"
                name="enddate"
                value={formData.enddate}
                onChange={handleInputChange}
                className="rounded-lg border border-gray-600 bg-[#201b39] px-4 py-2 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="previouselectricitymeter"
                className="text-lg font-medium"
              >
                Chỉ số điện cũ (tự động từ lần trước)
              </label>
              <input
                type="number"
                id="previouselectricitymeter"
                name="previouselectricitymeter"
                value={formData.previouselectricitymeter}
                className="rounded-lg border border-gray-600 bg-[#2a2547] px-4 py-2 text-gray-300 cursor-not-allowed"
                placeholder="Sẽ tự động cập nhật khi chọn phòng"
                readOnly
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="currentelectricitymeter"
                className="text-lg font-medium"
              >
                Chỉ số điện mới
              </label>
              <input
                type="number"
                id="currentelectricitymeter"
                name="currentelectricitymeter"
                value={formData.currentelectricitymeter}
                onChange={handleInputChange}
                className={`rounded-lg border px-4 py-2 focus:outline-none ${
                  validationErrors.electricity
                    ? "border-red-500 bg-red-900/20 focus:border-red-400"
                    : "border-gray-600 bg-[#201b39] focus:border-blue-500"
                }`}
                placeholder="Nhập chỉ số điện mới"
                required
                min="0"
              />
              {validationErrors.electricity && (
                <p className="text-red-400 text-sm mt-1">
                  ⚠️ {validationErrors.electricity}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="previouswatermeter"
                className="text-lg font-medium"
              >
                Chỉ số nước cũ (tự động từ lần trước)
              </label>
              <input
                type="number"
                id="previouswatermeter"
                name="previouswatermeter"
                value={formData.previouswatermeter}
                className="rounded-lg border border-gray-600 bg-[#2a2547] px-4 py-2 text-gray-300 cursor-not-allowed"
                placeholder="Sẽ tự động cập nhật khi chọn phòng"
                readOnly
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="currentwatermeter"
                className="text-lg font-medium"
              >
                Chỉ số nước mới
              </label>
              <input
                type="number"
                id="currentwatermeter"
                name="currentwatermeter"
                value={formData.currentwatermeter}
                onChange={handleInputChange}
                className={`rounded-lg border px-4 py-2 focus:outline-none ${
                  validationErrors.water
                    ? "border-red-500 bg-red-900/20 focus:border-red-400"
                    : "border-gray-600 bg-[#201b39] focus:border-blue-500"
                }`}
                placeholder="Nhập chỉ số nước mới"
                required
                min="0"
              />
              {validationErrors.water && (
                <p className="text-red-400 text-sm mt-1">
                  ⚠️ {validationErrors.water}
                </p>
              )}
            </div>

            <div className="mt-4 flex gap-4">
              <button
                type="submit"
                className="rounded-lg bg-blue-500 px-6 py-2 font-medium hover:bg-blue-600"
              >
                Tạo mới
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin/utilities")}
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

export default CreateUtilitiesPage;
