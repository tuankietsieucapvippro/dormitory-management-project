import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { useParams, useNavigate } from "react-router-dom";
import { buildingApi } from "../../services/api";

interface Building {
  buildingid: number;
  buildingname: string;
  description: string;
}

const EditBuildingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [building, setBuilding] = useState<Building | null>(null);
  const [formData, setFormData] = useState({
    buildingname: "",
    description: "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBuilding = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await buildingApi.getById(Number(id));
        console.log("Building data:", response.data);

        // Kiểm tra cấu trúc dữ liệu từ API
        if (response && response.data) {
          // Lấy dữ liệu từ response (hỗ trợ cả cấu trúc data.data)
          const buildingData = response.data.data || response.data;
          setBuilding(buildingData);

          // Cập nhật form với dữ liệu tòa nhà
          setFormData({
            buildingname: buildingData.buildingname || "",
            description: buildingData.description || "",
          });
        } else {
          setError(
            "Không thể tải thông tin tòa nhà, định dạng dữ liệu không hợp lệ",
          );
        }
      } catch (error) {
        console.error("Có lỗi xảy ra khi lấy thông tin tòa nhà:", error);
        setError("Có lỗi xảy ra khi tải dữ liệu tòa nhà");
      } finally {
        setLoading(false);
      }
    };

    fetchBuilding();
  }, [id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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
      await buildingApi.update(Number(id), formData);
      alert("Cập nhật tòa nhà thành công!");
      navigate(`/building/${id}`);
    } catch (error) {
      console.error("Có lỗi xảy ra khi cập nhật tòa nhà:", error);
      alert("Có lỗi xảy ra khi cập nhật tòa nhà");
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

  if (error) {
    return (
      <Layout>
        <div className="flex h-full flex-col items-center justify-center gap-4 bg-[#130f21] text-[#e1dce4]">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => navigate("/building")}
            className="rounded-lg bg-blue-500 px-6 py-2 font-medium hover:bg-blue-600"
          >
            Quay lại
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex h-full flex-col bg-[#130f21] text-[#e1dce4]">
        <h1 className="-mt-5 mb-2 p-5 text-center text-3xl font-bold uppercase">
          Sửa thông tin tòa nhà
        </h1>

        <div className="mx-auto w-full max-w-2xl flex-1 px-8 pb-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="buildingname" className="text-lg font-medium">
                Tên tòa nhà
              </label>
              <input
                type="text"
                id="buildingname"
                name="buildingname"
                value={formData.buildingname}
                onChange={handleInputChange}
                className="rounded-lg border border-gray-600 bg-[#201b39] px-4 py-2 focus:border-blue-500 focus:outline-none"
                placeholder="Nhập tên tòa nhà"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="description" className="text-lg font-medium">
                Mô tả
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="h-32 rounded-lg border border-gray-600 bg-[#201b39] px-4 py-2 focus:border-blue-500 focus:outline-none"
                placeholder="Nhập mô tả cho tòa nhà"
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
                onClick={() => navigate(`/building/${id}`)}
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

export default EditBuildingPage;
