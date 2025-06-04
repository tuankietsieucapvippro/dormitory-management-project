import { useState } from "react";
import Layout from "../../components/Layout";
import { useNavigate } from "react-router-dom";
import { roomTypeApi } from "../../services/api";

const CreateRoomTypePage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    roomTypeName: "",
    price: "",
    gender: "",
    description: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await roomTypeApi.create(formData);
      navigate("/admin/room-type");
    } catch (error) {
      console.error("Có lỗi xảy ra khi tạo loại phòng:", error);
      alert("Có lỗi xảy ra khi tạo loại phòng");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="flex h-full flex-col bg-[#130f21] text-[#e1dce4]">
        <h1 className="-mt-5 mb-2 p-5 text-center text-3xl font-bold uppercase">
          Thêm loại phòng mới
        </h1>
        <div className="flex-1 overflow-auto p-8">
          <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
            <div className="rounded-lg bg-[#201b39] p-6">
              <div className="mb-6 grid gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label htmlFor="roomTypeName" className="text-lg font-medium">
                    Tên loại phòng
                  </label>
                  <input
                    type="text"
                    id="roomTypeName"
                    name="roomTypeName"
                    value={formData.roomTypeName}
                    onChange={handleInputChange}
                    className="rounded-lg border border-gray-600 bg-[#201b39] px-4 py-2 focus:border-blue-500 focus:outline-none"
                    placeholder="Nhập tên loại phòng"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="price" className="text-lg font-medium">
                    Đơn giá (VNĐ)
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="rounded-lg border border-gray-600 bg-[#201b39] px-4 py-2 focus:border-blue-500 focus:outline-none"
                    placeholder="Nhập đơn giá"
                    required
                    min="0"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="gender" className="text-lg font-medium">
                    Giới tính
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="rounded-lg border border-gray-600 bg-[#201b39] px-4 py-2 focus:border-blue-500 focus:outline-none"
                    required
                  >
                    <option value="">-- Chọn giới tính --</option>
                    <option value="Male">Nam</option>
                    <option value="Female">Nữ</option>
                    <option value="Mixed">Hỗn hợp</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                  <label htmlFor="description" className="text-lg font-medium">
                    Mô tả
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="rounded-lg border border-gray-600 bg-[#201b39] px-4 py-2 focus:border-blue-500 focus:outline-none"
                    placeholder="Nhập mô tả (tùy chọn)"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => navigate("/admin/room-type")}
                  className="rounded-lg bg-gray-500 px-6 py-2 hover:bg-gray-600"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-blue-500 px-6 py-2 hover:bg-blue-600 disabled:opacity-50"
                >
                  {isSubmitting ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CreateRoomTypePage;
