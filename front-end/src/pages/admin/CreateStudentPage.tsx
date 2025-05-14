import { useState, useEffect, ChangeEvent } from "react";
import Layout from "../../components/Layout";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { roomApi, studentApi } from "../../services/api";
import { buildingApi } from "../../services/api";

interface Toanha {
  toanhaid: number;
  tentoanha: string;
}

interface Phong {
  phongid: number;
  tenphong: string;
  tang: number;
  loaiphong: {
    gioitinh: string;
  };
}

const CreateStudentPage = () => {
  const navigate = useNavigate();
  const [toanhas, setToanhas] = useState<Toanha[]>([]);
  const [phongs, setPhongs] = useState<Phong[]>([]);
  const [selectedToanha, setSelectedToanha] = useState("");

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
  });

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const response = await buildingApi.getAll();
        setToanhas(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách tòa nhà:", error);
        alert("Có lỗi xảy ra khi tải danh sách tòa nhà");
      }
    };

    fetchBuildings();
  }, []);

  useEffect(() => {
    const fetchRooms = async () => {
      if (selectedToanha) {
        try {
          const response = await roomApi.getByBuilding(Number(selectedToanha));
          setPhongs(response.data);
        } catch (error) {
          console.error("Lỗi khi lấy danh sách phòng:", error);
          alert("Có lỗi xảy ra khi tải danh sách phòng");
        }
      } else {
        setPhongs([]);
      }
    };

    fetchRooms();
  }, [selectedToanha]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await studentApi.create(formData);
      navigate("/student");
    } catch (error) {
      console.error("Có lỗi xảy ra khi tạo sinh viên:", error);
      alert("Có lỗi xảy ra khi tạo sinh viên");
    }
  };

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

  function handleToanhaChange(event: ChangeEvent<HTMLSelectElement>): void {
    setSelectedToanha(event.target.value);
  }

  return (
    <Layout>
      <div className="flex h-full flex-col overflow-auto bg-[#130f21] pb-10 text-[#e1dce4]">
        <h1 className="-mt-5 mb-2 p-5 text-center text-3xl font-bold uppercase">
          Thêm sinh viên
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

            <div className="flex flex-col gap-2">
              <label htmlFor="hotensv" className="text-lg font-medium">
                Họ tên
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

            <div className="flex flex-col gap-2">
              <label htmlFor="diachi" className="text-lg font-medium">
                Địa chỉ
              </label>
              <textarea
                id="diachi"
                name="diachi"
                value={formData.diachi}
                onChange={handleInputChange}
                className="h-20 rounded-lg border border-gray-600 bg-[#201b39] px-4 py-2 focus:border-blue-500 focus:outline-none"
                placeholder="Nhập địa chỉ"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="toanhaid" className="text-lg font-medium">
                Tòa nhà
              </label>
              <select
                id="toanhaid"
                value={selectedToanha}
                onChange={handleToanhaChange}
                className="rounded-lg border border-gray-600 bg-[#201b39] px-4 py-2 focus:border-blue-500 focus:outline-none"
                required
              >
                <option value="">Chọn tòa nhà</option>
                {toanhas.map((toanha) => (
                  <option key={toanha.toanhaid} value={toanha.toanhaid}>
                    {toanha.tentoanha}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="phongid" className="text-lg font-medium">
                Phòng
              </label>
              <select
                id="phongid"
                name="phongid"
                value={formData.phongid}
                onChange={handleInputChange}
                className="rounded-lg border border-gray-600 bg-[#201b39] px-4 py-2 focus:border-blue-500 focus:outline-none"
                required
                disabled={!formData.gioitinh || !selectedToanha}
              >
                <option value="">Chọn phòng</option>
                {phongs.map((phong) => (
                  <option key={phong.phongid} value={phong.phongid}>
                    {phong.tenphong} - Tầng {phong.tang}
                  </option>
                ))}
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
                onClick={() => navigate("/student")}
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

export default CreateStudentPage;
