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
    mssv: "",
    hotensv: "",
    lop: "",
    gioitinh: "",
    ngaysinh: "",
    noisinh: "",
    email: "",
    sodienthoai: "",
    diachi: "",
    socccd: "",
    phongid: "",
    // ... other fields
  });

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await studentApi.getById(Number(id));
        // The actual student data might be in response.data.data or directly in response.data
        const studentData = response.data?.data || response.data;
        if (studentData) {
          setFormData(studentData);
        } else {
          console.error("Không tìm thấy thông tin sinh viên hoặc định dạng dữ liệu không hợp lệ:", response);
          alert("Không thể tải thông tin sinh viên, định dạng dữ liệu không hợp lệ");
        }
      } catch (error) {
        console.error("Có lỗi xảy ra khi lấy thông tin sinh viên:", error);
        alert("Có lỗi xảy ra khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
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
      await studentApi.update(Number(id), formData);
      navigate("/admin/student");
    } catch (error) {
      console.error("Có lỗi xảy ra khi cập nhật sinh viên:", error);
      alert("Có lỗi xảy ra khi cập nhật sinh viên");
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
      <div className="flex h-full flex-col bg-[#130f21] text-[#e1dce4]">
        <h1 className="-mt-5 mb-2 p-5 text-center text-3xl font-bold uppercase">
          Sửa thông tin sinh viên
        </h1>

        <div className="mx-auto w-full max-w-2xl flex-1 px-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="mssv" className="text-lg font-medium">
                Mã sinh viên
              </label>
              <input
                type="text"
                id="mssv"
                name="mssv"
                value={formData.mssv}
                onChange={handleInputChange}
                className="rounded-lg border border-gray-600 bg-[#201b39] px-4 py-2 focus:border-blue-500 focus:outline-none"
                placeholder="Nhập mã sinh viên"
                required
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="tensv" className="text-lg font-medium">
                  Tên
                </label>
                <input
                  type="text"
                  id="hotensv"
                  name="hotensv"
                  value={formData.hotensv}
                  onChange={handleInputChange}
                  className="rounded-lg border border-gray-600 bg-[#201b39] px-4 py-2 focus:border-blue-500 focus:outline-none"
                  placeholder="Nhập họ tên"
                  required
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="gioitinh" className="text-lg font-medium">
                  Giới tính
                </label>
                <select
                  id="gioitinh"
                  name="gioitinh"
                  value={formData.gioitinh}
                  onChange={handleInputChange}
                  className="rounded-lg border border-gray-600 bg-[#201b39] px-4 py-2 focus:border-blue-500 focus:outline-none"
                  required
                >
                  <option value="">Chọn giới tính</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="ngaysinh" className="text-lg font-medium">
                  Ngày sinh
                </label>
                <input
                  type="date"
                  id="ngaysinh"
                  name="ngaysinh"
                  value={formData.ngaysinh}
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
                <label htmlFor="sodienthoai" className="text-lg font-medium">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  id="sodienthoai"
                  name="sodienthoai"
                  value={formData.sodienthoai}
                  onChange={handleInputChange}
                  className="rounded-lg border border-gray-600 bg-[#201b39] px-4 py-2 focus:border-blue-500 focus:outline-none"
                  placeholder="Nhập số điện thoại"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="diachi" className="text-lg font-medium">
                Địa chỉ
              </label>
              <textarea
                id="diachi"
                name="diachi"
                value={formData.diachi}
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
