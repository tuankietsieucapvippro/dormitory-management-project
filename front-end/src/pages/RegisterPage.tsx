import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { accountApi, semesterApi } from "../services/api"; // Import semesterApi

axios.defaults.baseURL = "http://localhost:3000"; // Thay bằng URL thực tế của backend

interface Building {
  buildingid: number;
  buildingname: string;
  description: string | null;
  hasAvailableRooms?: boolean;
}

interface Room {
  roomid: number;
  roomname: string;
  status: string;
  bedcount: number;
  roomtype: {
    roomtypeid: number;
    roomtypename: string; // Đổi từ typename để khớp với dữ liệu API
    price: number;
    gender: string | null; // Thêm trường gender
  };
}

interface RoomType {
  roomtypeid: number;
  typename: string;
  price: number;
  description: string | null;
}

interface Semester {
  semesterid: number;
  name: string;
  startdate: string;
  enddate: string;
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
  // startDate: string; // Xóa
  // endDate: string; // Xóa
  roomTypeId: string;
  semesterId: string;
}

const RegisterPage = () => {
  const [isChecked, setIsChecked] = useState(false);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]); // State cho học kỳ
  const [loading, setLoading] = useState(false); // Chung cho buildings, rooms
  const [loadingSemesters, setLoadingSemesters] = useState(false); // Riêng cho semesters
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
    // startDate: "", // Xóa
    // endDate: "", // Xóa
    roomTypeId: "",
    semesterId: "",
    });
  const [invalidFields, setInvalidFields] = useState<string[]>([]);
  const [submitMessage, setSubmitMessage] = useState("");
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [accountCreated, setAccountCreated] = useState(false);
  const [roomTypeName, setRoomTypeName] = useState<string>("");

  // Lấy danh sách tòa nhà khi component được mount
  useEffect(() => {
    const updateBuildingAvailability = async (buildingsToUpdate: Building[]) => {
      const updatedBuildings = await Promise.all(
        buildingsToUpdate.map(async (building) => {
          try {
            const response = await axios.get(
              `/rooms/available-by-building/${building.buildingid}`,
            );
            return {
              ...building,
              hasAvailableRooms: response.data && response.data.data && response.data.data.length > 0,
            };
          } catch (err) {
            console.error(
              `Lỗi khi kiểm tra phòng trống cho tòa nhà ${building.buildingid}:`,
              err,
            );
            return { ...building, hasAvailableRooms: false }; // Mặc định là false nếu có lỗi
          }
        }),
      );
      setBuildings(updatedBuildings);
    };

    const fetchBuildings = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get("/buildings");
        if (response.data && response.data.data) {
          // Tạm thời setBuildings để UI không bị trống quá lâu
          setBuildings(response.data.data);
          // Sau đó cập nhật thông tin phòng trống
          await updateBuildingAvailability(response.data.data);
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
        const response = await axios.get("/room-types");
        if (response.data && response.data.data) {
          setRoomTypes(response.data.data);
        }
      } catch (err) {
        console.error("Lỗi khi lấy danh sách loại phòng:", err);
      }
    };

    const fetchSemesters = async () => {
      setLoadingSemesters(true);
      try {
        const response = await semesterApi.getAll(); // Hoặc getActive() / getLatest()
        if (response.data) { // Giả sử API trả về mảng trực tiếp hoặc trong response.data
          // Nếu API trả về trong response.data.data như các API khác:
          // if (response.data && response.data.data) { setSemesters(response.data.data); }
          setSemesters(response.data.data || response.data); // Điều chỉnh tùy theo cấu trúc API semesters trả về

          // Tìm và đặt học kỳ mặc định
          const defaultSemesterName = "2025-2026 HK1";
          const fetchedSemesters = response.data.data || response.data;
          const defaultSemester = fetchedSemesters.find(
            (semester: Semester) => semester.name === defaultSemesterName
          );

          if (defaultSemester) {
            setFormData((prev) => ({
              ...prev,
              semesterId: defaultSemester.semesterid.toString(),
            }));
          }

          // Tùy chọn: Tự động chọn học kỳ đang hoạt động/gần nhất nếu có
          // const activeSemester = response.data.data.find(s => new Date(s.startdate) <= new Date() && new Date(s.enddate) >= new Date());
          // if (activeSemester) {
          //   setFormData(prev => ({...prev, semesterId: activeSemester.semesterid.toString()}));
          // }
        }
      } catch (err) {
        console.error("Lỗi khi lấy danh sách học kỳ:", err);
        setError((prevError) => prevError ? `${prevError}\nKhông thể lấy danh sách học kỳ.` : "Không thể lấy danh sách học kỳ.");
      } finally {
        setLoadingSemesters(false);
      }
    };

    fetchBuildings();
    fetchRoomTypes();
    fetchSemesters();
  }, []);

  // Lấy danh sách phòng trống khi người dùng chọn tòa nhà
  useEffect(() => {
    if (formData.buildingId && formData.gender) { // Thêm formData.gender vào điều kiện
      const fetchAvailableRooms = async () => {
        try {
          const response = await axios.get(
            `/rooms/available-by-building/${formData.buildingId}`,
          );
          if (response.data && response.data.data) {
            setAvailableRooms(response.data.data as Room[]); // Hoàn tác việc lọc ở đây
          } else {
            setAvailableRooms([]);
          }
        } catch (err) {
          console.error("Lỗi khi lấy danh sách phòng trống:", err);
          setAvailableRooms([]);
        }
      };

      fetchAvailableRooms();
    } else {
      setAvailableRooms([]); // Reset nếu không có buildingId hoặc gender
    }
  }, [formData.buildingId, formData.gender]); // Thêm formData.gender vào dependencies

  // Tự động điền roomTypeId khi chọn phòng
  useEffect(() => {
    if (formData.roomId && availableRooms.length > 0) {
      console.log("[RegisterPage] Selected Room ID from formData:", formData.roomId);
      console.log("[RegisterPage] Current availableRooms:", availableRooms);
      const selectedRoom = availableRooms.find(
        (room) => room.roomid.toString() === formData.roomId,
      );
      console.log("[RegisterPage] Found selectedRoom object:", selectedRoom);

      if (selectedRoom && selectedRoom.roomtype && typeof selectedRoom.roomtype.roomtypeid !== 'undefined' && typeof selectedRoom.roomtype.roomtypename !== 'undefined') { // Thay typename -> roomtypename
        console.log("[RegisterPage] Valid roomtype found in selectedRoom:", selectedRoom.roomtype);
        setFormData((prev) => ({
          ...prev,
          roomTypeId: selectedRoom.roomtype.roomtypeid.toString(),
        }));
        setRoomTypeName(selectedRoom.roomtype.roomtypename); // Thay typename -> roomtypename
      } else {
        console.warn("[RegisterPage] RoomType information is missing for the selected room, or roomtype object is incomplete. Resetting room type.", "Selected Room:", selectedRoom);
        setRoomTypeName(""); // Reset nếu thông tin loại phòng bị thiếu
        setFormData((prev) => ({ ...prev, roomTypeId: "" }));
      }
    } else {
      // Reset nếu không có phòng nào được chọn hoặc availableRooms rỗng
      if (formData.roomId) { // Chỉ log nếu có roomId nhưng không có availableRooms
        console.log("[RegisterPage] formData.roomId is set, but availableRooms is empty or not ready. Resetting room type.");
      }
      setRoomTypeName("");
      setFormData((prev) => ({ ...prev, roomTypeId: "" }));
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
      if (!newInvalidFields.includes("email")) {
        newInvalidFields.push("email");
      }
    }

    // Kiểm tra định dạng số điện thoại (đúng 10 số)
    const phoneRegex = /^\d{10}$/;
    if (formData.phoneNumber && !phoneRegex.test(formData.phoneNumber)) {
      if (!newInvalidFields.includes("phoneNumber")) {
        newInvalidFields.push("phoneNumber");
      }
    }

    // Kiểm tra định dạng CMND/CCCD (đúng 12 số)
    const idCardRegex = /^\d{12}$/;
    if (formData.idCard && !idCardRegex.test(formData.idCard)) {
      if (!newInvalidFields.includes("idCard")) {
        newInvalidFields.push("idCard");
      }
    }

    setInvalidFields(newInvalidFields);
    return newInvalidFields.length === 0;
  };

  // Hàm tạo tài khoản cho sinh viên
  const createStudentAccount = async (studentCode: string, idCard: string): Promise<number | null> => {
    try {
      const accountData = {
        username: studentCode,
        password: idCard,
        roleId: 8, // ID của role "sinh viên" - Cần đảm bảo roleId này là chính xác
      };
      console.log("[RegisterPage] Creating student account with data:", accountData);
      const response = await accountApi.create(accountData);
      console.log("[RegisterPage] Response from accountApi.create:", JSON.stringify(response, null, 2));

      // Giả định API trả về accountid trong response.data.data.accountid hoặc response.data.accountid
      if (response.data && (response.data.statusCode === 201 || response.data.success === true)) { // Kiểm tra cả statusCode và success nếu API trả về khác nhau
        const createdAccount = response.data.data || response.data; // Tùy thuộc vào cấu trúc response
        console.log("[RegisterPage] Extracted createdAccount object:", JSON.stringify(createdAccount, null, 2));
        if (createdAccount && typeof createdAccount.accountid === 'number') {
          console.log("[RegisterPage] Tài khoản sinh viên được tạo thành công, accountId:", createdAccount.accountid);
          setAccountCreated(true); // Vẫn có thể giữ state này nếu cần cho UI
          return createdAccount.accountid;
        } else {
          console.error("Lỗi: API tạo tài khoản không trả về accountid hợp lệ.", response.data);
          setSubmitMessage("Lỗi khi tạo tài khoản: Không nhận được ID tài khoản.");
          return null;
        }
      } else {
        console.error("Lỗi khi tạo tài khoản sinh viên từ API:", response.data);
        const errorMessage = response.data?.message || "Không thể tạo tài khoản.";
        setSubmitMessage(`Lỗi khi tạo tài khoản: ${errorMessage}`);
        return null;
      }
    } catch (error: any) {
      console.error("Lỗi ngoại lệ khi tạo tài khoản sinh viên:", error);
      const errorMessage = error.response?.data?.message || error.message || "Lỗi không xác định khi tạo tài khoản.";
      setSubmitMessage(`Lỗi ngoại lệ khi tạo tài khoản: ${errorMessage}`);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setSubmitMessage(""); // Reset submit message
      setError(null); // Reset error message

      try {
        // Bước 1: Tạo tài khoản sinh viên trước
        const newAccountId = await createStudentAccount(
          formData.studentCode,
          formData.idCard,
        );
        console.log("[RegisterPage] newAccountId from createStudentAccount:", newAccountId);

        if (newAccountId) {
          // Bước 2: Nếu tài khoản được tạo thành công, tiến hành đăng ký thông tin sinh viên và phòng
          const registerData = {
            student: {
              accountid: newAccountId, // Thêm accountid vào đây
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
              status: "pending",
            },
            registration: {
              buildingId: parseInt(formData.buildingId),
              roomId: parseInt(formData.roomId),
              roomTypeId: parseInt(formData.roomTypeId),
              semesterId: parseInt(formData.semesterId),
              status: "pending",
            },
          };
          console.log("[RegisterPage] Sending data to /room-registration/register-with-student:", JSON.stringify(registerData, null, 2));

          // Gửi request đến API đăng ký kết hợp
          const registrationResponse = await axios.post(
            "/room-registration/register-with-student",
            registerData,
          );
          console.log("[RegisterPage] Response from /room-registration/register-with-student:", JSON.stringify(registrationResponse, null, 2));

          if (registrationResponse.data) {
            let successMessage =
              "Đăng ký thành công! Vui lòng chờ quản trị viên xét duyệt.";
            successMessage +=
              " Tài khoản đã được tạo với tên đăng nhập là mã sinh viên và mật khẩu là số CMND/CCCD của bạn.";
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
              roomTypeId: "",
              semesterId: "", // Giữ lại semesterId đã chọn và disable
            });
            // Tìm lại semesterId mặc định để set lại sau khi reset, vì nó bị disable
            const defaultSemester = semesters.find(s => s.name === "2025-2026 HK1");
            if (defaultSemester) {
                setFormData(prev => ({...prev, semesterId: defaultSemester.semesterid.toString()}));
            }
            setRoomTypeName("");
            setIsChecked(false); // Reset checkbox
          } else {
            // Xử lý trường hợp API đăng ký sinh viên/phòng không thành công dù tài khoản đã tạo
            // Có thể cần một cơ chế rollback hoặc thông báo cho người dùng/admin
            setSubmitMessage("Tạo tài khoản thành công, nhưng đăng ký thông tin phòng thất bại. Vui lòng liên hệ quản trị viên.");
          }
        } else {
          // createStudentAccount đã setSubmitMessage lỗi rồi, không cần set lại ở đây
          // setSubmitMessage("Không thể tạo tài khoản sinh viên. Vui lòng thử lại.");
        }
      } catch (error: any) {
        console.error("Lỗi trong quá trình handleSubmit:", error);
        if (axios.isAxiosError(error) && error.response) {
          if (error.response.status === 409) {
            setSubmitMessage(
              error.response.data?.message ||
              "Đăng ký không thành công. Sinh viên này đã có một đăng ký phòng đang chờ xử lý hoặc đã được duyệt. Vui lòng kiểm tra lại hoặc liên hệ quản trị viên."
            );
          } else {
            setSubmitMessage(`Lỗi khi đăng ký: ${error.response.data?.message || "Lỗi không xác định từ máy chủ."}`);
          }
        } else {
          setSubmitMessage("Đã xảy ra lỗi không xác định trong quá trình đăng ký. Vui lòng thử lại sau.");
        }
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
    options: { value: string; label: string; disabled?: boolean }[],
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
          <option key={option.value} value={option.value} disabled={option.disabled}>
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
                  label: `${building.buildingname} - ${building.description || "Không có mô tả"} ${building.hasAvailableRooms === false ? "(Hết phòng)" : ""}`,
                  disabled: building.hasAvailableRooms === false,
                })),
                true,
              )
            )}

            {formData.buildingId &&
              (availableRooms.length > 0 ? (
                renderSelect(
                  "roomId",
                  "Phòng",
                  availableRooms.map((room) => {
                    const studentSelectedGender = formData.gender; // "Male" hoặc "Female"
                    const roomGenderAPI = room.roomtype?.gender;    // "male", "female", "Nam", "Nữ", null
                    let isDisabled = room.status === "Full"; // Vẫn disable nếu phòng đã đầy

                    if (!isDisabled && studentSelectedGender && roomGenderAPI) {
                      const studentGenderNormalized = studentSelectedGender.toLowerCase(); // "male" hoặc "female"
                      const roomGenderNormalized = roomGenderAPI.toLowerCase();

                      if (studentGenderNormalized === "male") { // Sinh viên là Nam (male)
                        // Disable nếu phòng là Nữ (female hoặc nữ)
                        if (roomGenderNormalized === "female" || roomGenderNormalized === "nữ") {
                          isDisabled = true;
                        }
                      } else if (studentGenderNormalized === "female") { // Sinh viên là Nữ (female)
                        // Disable nếu phòng là Nam (male hoặc nam)
                        if (roomGenderNormalized === "male" || roomGenderNormalized === "nam") {
                          isDisabled = true;
                        }
                      }
                    }
                    return {
                      value: room.roomid.toString(),
                      label: `${room.roomname} - ${room.bedcount} giường ${room.status === "Full" ? "(Đầy)" : ""} (${roomGenderAPI || 'N/A'})`,
                      disabled: isDisabled,
                    };
                  }),
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

            {loadingSemesters ? (
              <div className="text-center">Đang tải danh sách học kỳ...</div>
            ) : (
              renderSelect(
                "semesterId",
                "Học kỳ",
                semesters.map((semester) => ({
                  value: semester.semesterid.toString(),
                  label: semester.name,
                })),
                true, // required
                true, // disabled
              )
            )}

            {/* Xóa input cho Ngày bắt đầu và Ngày kết thúc */}
            {/* {renderInput("startDate", "Ngày bắt đầu", "date", true)} */}
            {/* {renderInput("endDate", "Ngày kết thúc", "date", true)} */}

            {/* Hiển thị thông tin loại phòng dựa trên phòng đã chọn */}
            <div className="flex items-center gap-2">
              <label className="w-32">Loại phòng *</label>
              <input
                type="text"
                value={roomTypeName || "Chưa chọn phòng"}
                disabled
                className="w-full rounded-lg border-2 border-transparent bg-[#130f21] p-2 opacity-70"
              />
            </div>

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
