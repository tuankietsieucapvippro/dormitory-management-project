import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:3000"; // Thay bằng URL thực tế của backend

interface Building {
  buildingid: number;
  buildingname: string;
  description: string | null;
}

interface Room {
  roomid: number;
  roomname: string;
  status: string;
  bedcount: number;
  roomtype: {
    roomtypeid: number;
    typename: string;
    price: number;
  };
}

interface RoomType {
  roomtypeid: number;
  typename: string;
  price: number;
  description: string | null;
}

interface FormData {
  fullName: string;
  studentCode: string;
  class: string;
  gender: string;
  dateOfBirth: string;
  birthplace: string;
  address: string;
  email: string;
  phoneNumber: string;
  idCard: string;
  // Trường thông tin đăng ký phòng (sẽ được lưu vào bảng khác)
  buildingId: string;
  roomId: string;
  startDate: string;
  endDate: string;
  roomTypeId: string;
}

const RegisterPage = () => {
  const [isChecked, setIsChecked] = useState(false);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    studentCode: "",
    class: "",
    gender: "",
    dateOfBirth: "",
    birthplace: "",
    address: "",
    email: "",
    phoneNumber: "",
    idCard: "",
    buildingId: "",
    roomId: "",
    startDate: "",
    endDate: "",
    roomTypeId: "",
  });
  const [invalidFields, setInvalidFields] = useState<string[]>([]);
  const [submitMessage, setSubmitMessage] = useState("");
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [accountCreated, setAccountCreated] = useState(false);

  // Lấy danh sách tòa nhà khi component được mount
  useEffect(() => {
    const fetchBuildings = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get("/buildings");
        if (response.data && response.data.data) {
          setBuildings(response.data.data);
        }
      } catch (err) {
        console.error("Lỗi khi lấy danh sách tòa nhà:", err);
        setError("Không thể lấy danh sách tòa nhà. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    const fetchRoomTypes = async () => {
      try {
        const response = await axios.get("/room-type");
        if (response.data && response.data.data) {
          setRoomTypes(response.data.data);
        }
      } catch (err) {
        console.error("Lỗi khi lấy danh sách loại phòng:", err);
      }
    };

    fetchBuildings();
    fetchRoomTypes();
  }, []);

  // Lấy danh sách phòng trống khi người dùng chọn tòa nhà
  useEffect(() => {
    if (formData.buildingId) {
      const fetchAvailableRooms = async () => {
        try {
          const response = await axios.get(
            `/rooms/available-by-building/${formData.buildingId}`,
          );
          if (response.data && response.data.data) {
            setAvailableRooms(response.data.data);
          }
        } catch (err) {
          console.error("Lỗi khi lấy danh sách phòng trống:", err);
          setAvailableRooms([]);
        }
      };

      fetchAvailableRooms();
    } else {
      setAvailableRooms([]);
    }
  }, [formData.buildingId]);

  // Tự động điền roomTypeId khi chọn phòng
  useEffect(() => {
    if (formData.roomId && availableRooms.length > 0) {
      const selectedRoom = availableRooms.find(
        (room) => room.roomid.toString() === formData.roomId,
      );
      if (selectedRoom && selectedRoom.roomtype) {
        setFormData((prev) => ({
          ...prev,
          roomTypeId: selectedRoom.roomtype.roomtypeid.toString(),
        }));
      }
    }
  }, [formData.roomId, availableRooms]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Xóa trường khỏi danh sách invalid khi người dùng bắt đầu nhập
    if (invalidFields.includes(name)) {
      setInvalidFields((prev) => prev.filter((field) => field !== name));
    }
  };

  const validateForm = () => {
    const newInvalidFields: string[] = [];

    // Kiểm tra tất cả các trường (tất cả đều là required)
    Object.entries(formData).forEach(([key, value]) => {
      if (!value.trim()) {
        newInvalidFields.push(key);
      }
    });

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newInvalidFields.push("email");
    }

    // Kiểm tra định dạng số điện thoại (10 số)
    const phoneRegex = /^\d{10}$/;
    if (formData.phoneNumber && !phoneRegex.test(formData.phoneNumber)) {
      newInvalidFields.push("phoneNumber");
    }

    setInvalidFields(newInvalidFields);
    return newInvalidFields.length === 0;
  };

  // Hàm tạo tài khoản cho sinh viên
  const createStudentAccount = async (studentCode: string, idCard: string) => {
    try {
      // Tạo tài khoản với username là mã sinh viên và password là CMND/CCCD
      const accountData = {
        username: studentCode,
        password: idCard,
        roleId: 8, // ID của role "sinh viên"
      };

      const response = await axios.post("/accounts", accountData);

      if (response.data && response.data.statusCode === 201) {
        console.log("Tài khoản sinh viên được tạo thành công:", response.data);
        setAccountCreated(true);
        return true;
      } else {
        console.error("Lỗi khi tạo tài khoản sinh viên:", response.data);
        return false;
      }
    } catch (error) {
      console.error("Lỗi khi tạo tài khoản sinh viên:", error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        // Dữ liệu cho cả sinh viên và đăng ký phòng
        const registerData = {
          student: {
            fullName: formData.fullName,
            studentCode: formData.studentCode,
            class: formData.class,
            gender: formData.gender,
            dateOfBirth: formData.dateOfBirth,
            birthplace: formData.birthplace,
            address: formData.address,
            email: formData.email,
            phoneNumber: formData.phoneNumber,
            idCard: formData.idCard,
            status: "Pending", // Mặc định là đang chờ xét duyệt
          },
          registration: {
            buildingId: parseInt(formData.buildingId),
            roomId: parseInt(formData.roomId),
            startDate: formData.startDate,
            endDate: formData.endDate,
            roomTypeId: parseInt(formData.roomTypeId),
            status: "Pending",
          },
        };

        // Gửi request đến API đăng ký kết hợp
        const response = await axios.post(
          "/room-registration/register-with-student",
          registerData,
        );

        if (response.data) {
          // Tạo tài khoản cho sinh viên
          const accountCreated = await createStudentAccount(
            formData.studentCode,
            formData.idCard,
          );

          let successMessage =
            "Đăng ký thành công! Vui lòng chờ quản trị viên xét duyệt.";

          if (accountCreated) {
            successMessage +=
              " Tài khoản đã được tạo với tên đăng nhập là mã sinh viên và mật khẩu là số CMND/CCCD của bạn.";
          }

          setSubmitMessage(successMessage);

          // Reset form sau khi đăng ký thành công
          setFormData({
            fullName: "",
            studentCode: "",
            class: "",
            gender: "",
            dateOfBirth: "",
            birthplace: "",
            address: "",
            email: "",
            phoneNumber: "",
            idCard: "",
            buildingId: "",
            roomId: "",
            startDate: "",
            endDate: "",
            roomTypeId: "",
          });
        }
      } catch (error) {
        console.error("Lỗi khi đăng ký:", error);
        setSubmitMessage("Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại sau.");
      }
    }
  };

  const renderInput = (
    name: keyof FormData,
    label: string,
    type: string = "text",
    required: boolean = false,
    disabled: boolean = false,
  ) => (
    <div className="flex items-center gap-2">
      <label
        htmlFor={name}
        className={`w-32 ${invalidFields.includes(name) ? "text-red-500" : ""}`}
      >
        {label}
        {required ? " *" : ""}
      </label>
      <input
        type={type}
        name={name}
        id={name}
        value={formData[name]}
        onChange={handleInputChange}
        placeholder={label}
        disabled={disabled}
        className={`w-full rounded-lg bg-[#130f21] p-2 ${
          invalidFields.includes(name)
            ? "border-2 border-red-500"
            : "border-2 border-transparent"
        } ${disabled ? "opacity-70" : ""}`}
      />
    </div>
  );

  const renderSelect = (
    name: keyof FormData,
    label: string,
    options: { value: string; label: string }[],
    required: boolean = false,
    disabled: boolean = false,
  ) => (
    <div className="flex items-center gap-2">
      <label
        htmlFor={name}
        className={`w-32 ${invalidFields.includes(name) ? "text-red-500" : ""}`}
      >
        {label}
        {required ? " *" : ""}
      </label>
      <select
        name={name}
        id={name}
        value={formData[name]}
        onChange={handleInputChange}
        disabled={disabled}
        className={`w-full rounded-lg bg-[#130f21] p-2 ${
          invalidFields.includes(name)
            ? "border-2 border-red-500"
            : "border-2 border-transparent"
        } ${disabled ? "opacity-70" : ""}`}
      >
        <option value="">Chọn {label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  // Tìm thông tin loại phòng dựa vào roomTypeId
  const selectedRoomType = roomTypes.find(
    (rt) => rt.roomtypeid.toString() === formData.roomTypeId,
  );

  return (
    <div className="flex h-screen flex-col gap-10 overflow-auto bg-[#130f21] p-5 text-[#e1dce4]">
      <div className="flex items-center justify-between">
        <div className="w-screen text-center text-3xl font-bold uppercase">
          Đăng ký lưu trú tại ký túc xá
        </div>
        <Link to="/login" className="rounded-lg bg-[#1b172e] p-2">
          Login
        </Link>
      </div>

      {error && (
        <div className="rounded bg-red-700 p-2 text-center">{error}</div>
      )}

      <div className="flex flex-col gap-5 md:flex-row">
        <div className="w-full rounded-xl bg-[#1b172e] p-5 md:w-1/2">
          <h1 className="text-center text-2xl font-bold">Thông tin cá nhân</h1>
          <form className="mt-4 flex flex-col gap-3">
            {renderInput("fullName", "Họ và tên", "text", true)}
            {renderInput("studentCode", "Mã sinh viên", "text", true)}
            {renderInput("class", "Lớp", "text", true)}
            {renderSelect(
              "gender",
              "Giới tính",
              [
                { value: "Male", label: "Nam" },
                { value: "Female", label: "Nữ" },
              ],
              true,
            )}
            {renderInput("dateOfBirth", "Ngày sinh", "date", true)}
            {renderInput("birthplace", "Nơi sinh", "text", true)}
            {renderInput("address", "Địa chỉ", "text", true)}
            {renderInput("email", "Email", "email", true)}
            {renderInput("phoneNumber", "Số điện thoại", "tel", true)}
            {renderInput("idCard", "CMND/CCCD", "text", true)}
          </form>
        </div>

        <div className="w-full rounded-xl bg-[#1b172e] p-5 md:w-1/2">
          <h1 className="text-center text-2xl font-bold">Đăng ký ký túc xá</h1>
          <form className="mt-4 flex flex-col gap-3">
            {loading ? (
              <div className="text-center">Đang tải danh sách tòa nhà...</div>
            ) : (
              renderSelect(
                "buildingId",
                "Tòa nhà",
                buildings.map((building) => ({
                  value: building.buildingid.toString(),
                  label: `${building.buildingname} - ${building.description || "Không có mô tả"}`,
                })),
                true,
              )
            )}

            {formData.buildingId &&
              (availableRooms.length > 0 ? (
                renderSelect(
                  "roomId",
                  "Phòng",
                  availableRooms.map((room) => ({
                    value: room.roomid.toString(),
                    label: `${room.roomname} - ${room.bedcount} giường`,
                  })),
                  true,
                )
              ) : (
                <div className="flex items-center gap-2">
                  <label className="w-32">Phòng *</label>
                  <input
                    type="text"
                    disabled
                    className="w-full rounded-lg bg-[#130f21] p-2 opacity-50"
                    value="Không có phòng trống"
                  />
                </div>
              ))}

            {renderInput("startDate", "Ngày bắt đầu", "date", true)}
            {renderInput("endDate", "Ngày kết thúc", "date", true)}

            {/* Hiển thị thông tin loại phòng dựa trên phòng đã chọn */}
            {renderInput("roomTypeId", "Loại phòng", "text", true, true)}

            {formData.roomTypeId && selectedRoomType && (
              <div className="mt-2 rounded-lg border border-gray-700 p-3">
                <h3 className="font-bold text-green-400">
                  {selectedRoomType.typename}
                </h3>
                <p>Giá: {selectedRoomType.price.toLocaleString()} VNĐ/tháng</p>
                {selectedRoomType.description && (
                  <p>Mô tả: {selectedRoomType.description}</p>
                )}
              </div>
            )}
          </form>
        </div>
      </div>

      {submitMessage && (
        <div
          className={`rounded p-2 text-center ${submitMessage.includes("thành công") ? "bg-green-700" : "bg-red-700"}`}
        >
          {submitMessage}
        </div>
      )}

      <div className="flex flex-col items-center gap-2">
        <div className="flex gap-2">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => setIsChecked(e.target.checked)}
          />
          <p>
            Tôi hoàn toàn chịu trách nhiệm và tính chính xác của thông tin trên
          </p>
        </div>
        <button
          onClick={handleSubmit}
          className={`rounded-lg bg-[#1b172e] p-2 ${!isChecked ? "cursor-not-allowed opacity-50" : ""}`}
          disabled={!isChecked}
        >
          Đăng ký
        </button>
      </div>
    </div>
  );
};

export default RegisterPage;
