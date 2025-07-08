import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { studentApi } from "../../services/api";

const EditStudentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullname: "",
    studentcode: "",
    class: "",
    gender: "",
    dateofbirth: "",
    birthplace: "",
    address: "",
    email: "",
    phonenumber: "",
    idcard: "",
    status: "",
  });



  useEffect(() => {
    const fetchStudent = async () => {
      try {
        // console.log("Fetching student with ID:", id);

        // Thử nhiều cách để lấy dữ liệu student
        let response;
        let studentData;

        try {
          // Thử getById trước
          response = await studentApi.getById(Number(id));
          // console.log("getById response:", response);
          // console.log("getById response.data:", response.data);
          // console.log("getById response.data.data:", response.data?.data);
        } catch (getByIdError) {
          // console.log("getById failed, trying getAll:", getByIdError);

          // Nếu getById không hoạt động, thử getAll và filter
          const allResponse = await studentApi.getAll();
          // console.log("getAll response:", allResponse);

          const allStudents = allResponse.data?.data || allResponse.data || [];
          // console.log("All students:", allStudents);
          // console.log("Looking for ID:", Number(id));

          // Thử tìm theo accountid trước, sau đó studentid
          studentData = allStudents.find((student: any) =>
            student.accountid === Number(id) || student.studentid === Number(id)
          );

          // console.log("Found student data:", studentData);

          if (!studentData) {
            throw new Error(`Không tìm thấy sinh viên với ID ${id}`);
          }
        }

        // Xử lý response từ getById
        if (!studentData && response) {
          studentData = response.data?.data || response.data;
        }

        // console.log("Processed student data:", studentData);
        // console.log("Student data keys:", studentData ? Object.keys(studentData) : "No data");
        // console.log("Student accountid:", studentData?.accountid);

        if (studentData && (studentData.accountid || studentData.studentid)) {
          // Format date để tương thích với input[type="date"]
          const formatDateForInput = (dateString: string) => {
            if (!dateString) return "";
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
          };

          // Lưu status gốc và chuyển đổi format
          const dbStatus = studentData.status || "pending";

          // Gender đã đúng format trong database (Male/Female)
          const formGender = studentData.gender || "";

          setFormData({
            fullname: studentData.fullname || "",
            studentcode: studentData.studentcode || "",
            class: studentData.class || "",
            gender: formGender,
            dateofbirth: formatDateForInput(studentData.dateofbirth),
            birthplace: studentData.birthplace || "",
            address: studentData.address || "",
            email: studentData.email || "",
            phonenumber: studentData.phonenumber || "",
            idcard: studentData.idcard || "",
            status: dbStatus, // Sử dụng giá trị database format (lowercase)
          });



          // console.log("Data loaded:", {
          //   status: {
          //     database: dbStatus,
          //     formStatus: dbStatus,
          //     willSendToBackend: dbStatus
          //   },
          //   gender: {
          //     database: studentData.gender,
          //     formGender: formGender,
          //     willSendToBackend: formGender // Giữ nguyên Male/Female
          //   }
          // });

          // console.log("Form data set:", {
          //   fullname: studentData.fullname,
          //   studentcode: studentData.studentcode,
          //   gender: formGender,
          //   status: dbStatus,
          //   dateofbirth: studentData.dateofbirth,
          // });
        } else {
          console.error("Invalid student data:", studentData);
          alert("Không tìm thấy dữ liệu sinh viên hoặc dữ liệu không hợp lệ");
        }
      } catch (error: any) {
        console.error("Error fetching student data:", error);
        alert(`Có lỗi xảy ra khi tải dữ liệu: ${error.message || error}`);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStudent();
    } else {
      alert("ID không hợp lệ");
      setLoading(false);
    }
  }, [id]);



  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
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
      // Gender giữ nguyên format Male/Female để khớp với database
      const genderValue = formData.gender;

      // Status giữ nguyên format chữ thường để khớp với database và backend enum
      const statusValue = formData.status;

      // Tạo payload với status
      const payload = {
        fullName: formData.fullname,
        studentCode: formData.studentcode,
        class: formData.class,
        gender: genderValue,
        dateOfBirth: formData.dateofbirth,
        birthplace: formData.birthplace,
        address: formData.address,
        email: formData.email,
        phoneNumber: formData.phonenumber,
        idCard: formData.idcard,
        status: statusValue, // Sử dụng status đã chuyển đổi
      };

      // Validate payload trước khi gửi
      // console.log("Gender validation:", {
      //   original: formData.gender,
      //   value: genderValue,
      //   valid: ['Male', 'Female'].includes(genderValue)
      // });

      // console.log("Status validation:", {
      //   original: formData.status,
      //   value: statusValue,
      //   valid: ['pending', 'approved', 'rejected'].includes(statusValue)
      // });

      // console.log("Updating student with payload:", payload);
      // console.log("Student ID:", Number(id));
      // console.log("Original form data:", formData);
      // console.log("Payload JSON:", JSON.stringify(payload, null, 2));

      await studentApi.update(Number(id), payload);
      alert("Cập nhật thông tin sinh viên thành công!");
      navigate("/admin/student");
    } catch (error: any) {
      console.error("Có lỗi xảy ra khi cập nhật sinh viên:", error);
      console.error("Error response:", error.response);
      console.error("Error response data:", error.response?.data);
      console.error("Error message array:", error.response?.data?.message);

      // Hiển thị lỗi cụ thể từ backend
      if (error.response?.data?.message) {
        // Nếu là array của errors, join chúng lại
        const errorMessage = Array.isArray(error.response.data.message)
          ? error.response.data.message.join(', ')
          : error.response.data.message;
        // console.log("Formatted error message:", errorMessage);
        alert(`Lỗi: ${errorMessage}`);
      } else if (error.message) {
        alert(`Lỗi: ${error.message}`);
      } else {
        alert("Có lỗi xảy ra khi cập nhật sinh viên");
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex h-full items-center justify-center bg-[#130f21] text-[#e1dce4]">
          Đang tải...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex h-auto flex-col bg-[#130f21] text-[#e1dce4]">
        <h1 className="-mt-5 mb-2 p-5 text-center text-3xl font-bold uppercase">
          Sửa thông tin sinh viên
        </h1>

        <div className="mx-auto w-full max-w-2xl flex-1 px-8">


          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="studentcode" className="text-lg font-medium">
                Mã sinh viên
              </label>
              <input
                type="text"
                id="studentcode"
                name="studentcode"
                value={formData.studentcode}
                onChange={handleInputChange}
                className="rounded-lg border border-gray-600 bg-[#201b39] px-4 py-2 focus:border-blue-500 focus:outline-none"
                placeholder="Nhập mã sinh viên"
                required
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="fullname" className="text-lg font-medium">
                  Họ và tên
                </label>
                <input
                  type="text"
                  id="fullname"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleInputChange}
                  className="rounded-lg border border-gray-600 bg-[#201b39] px-4 py-2 focus:border-blue-500 focus:outline-none"
                  placeholder="Nhập họ tên"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="class" className="text-lg font-medium">
                  Lớp
                </label>
                <input
                  type="text"
                  id="class"
                  name="class"
                  value={formData.class}
                  onChange={handleInputChange}
                  className="rounded-lg border border-gray-600 bg-[#201b39] px-4 py-2 focus:border-blue-500 focus:outline-none"
                  placeholder="Nhập lớp"
                  required
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="gender" className="text-lg font-medium">
                  Giới tính
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender || ""}
                  onChange={handleInputChange}
                  className="rounded-lg border border-gray-600 bg-[#201b39] px-4 py-2 focus:border-blue-500 focus:outline-none"
                  required
                >
                  <option value="">Chọn giới tính</option>
                  <option value="Male">Nam</option>
                  <option value="Female">Nữ</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="dateofbirth" className="text-lg font-medium">
                  Ngày sinh
                </label>
                <input
                  type="date"
                  id="dateofbirth"
                  name="dateofbirth"
                  value={formData.dateofbirth}
                  onChange={handleInputChange}
                  className="rounded-lg border border-gray-600 bg-[#201b39] px-4 py-2 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-lg font-medium">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="rounded-lg border border-gray-600 bg-[#201b39] px-4 py-2 focus:border-blue-500 focus:outline-none"
                  placeholder="Nhập email"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="phonenumber" className="text-lg font-medium">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  id="phonenumber"
                  name="phonenumber"
                  value={formData.phonenumber}
                  onChange={handleInputChange}
                  className="rounded-lg border border-gray-600 bg-[#201b39] px-4 py-2 focus:border-blue-500 focus:outline-none"
                  placeholder="Nhập số điện thoại"
                  required
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="birthplace" className="text-lg font-medium">
                  Nơi sinh
                </label>
                <input
                  type="text"
                  id="birthplace"
                  name="birthplace"
                  value={formData.birthplace}
                  onChange={handleInputChange}
                  className="rounded-lg border border-gray-600 bg-[#201b39] px-4 py-2 focus:border-blue-500 focus:outline-none"
                  placeholder="Nhập nơi sinh"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="idcard" className="text-lg font-medium">
                  Số CCCD
                </label>
                <input
                  type="text"
                  id="idcard"
                  name="idcard"
                  value={formData.idcard}
                  onChange={handleInputChange}
                  className="rounded-lg border border-gray-600 bg-[#201b39] px-4 py-2 focus:border-blue-500 focus:outline-none"
                  placeholder="Nhập số CCCD"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="status" className="text-lg font-medium">
                Trạng thái
              </label>
              <select
                id="status"
                name="status"
                value={formData.status || ""}
                onChange={handleInputChange}
                className="rounded-lg border border-gray-600 bg-[#201b39] px-4 py-2 focus:border-blue-500 focus:outline-none"
                required
              >
                <option value="">Chọn trạng thái</option>
                <option value="pending">Chờ duyệt</option>
                <option value="approved">Đã duyệt</option>
                <option value="rejected">Từ chối</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="address" className="text-lg font-medium">
                Địa chỉ
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="rounded-lg border border-gray-600 bg-[#201b39] px-4 py-2 focus:border-blue-500 focus:outline-none"
                placeholder="Nhập địa chỉ"
                rows={3}
                required
              />
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
                onClick={() => navigate("/admin/student")}
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

export default EditStudentPage;
