import { useState } from "react";
import Layout from "../../components/Layout";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { buildingApi } from "../../services/api";

const CreateBuildingPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    buildingname: "",
    description: "",
  });

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
      await buildingApi.create(formData);
      navigate("/admin/building");
    } catch (error) {
      console.error("Error creating building:", error);
      alert("An error occurred while creating the building");
    }
  };

  return (
    <Layout>
      <div className="flex h-full flex-col bg-[#130f21] text-[#e1dce4]">
        <h1 className="-mt-5 mb-2 p-5 text-center text-3xl font-bold uppercase">
          Thêm toà nhà mới
        </h1>

        <div className="mx-auto w-full max-w-2xl flex-1 px-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="buildingname" className="text-lg font-medium">
                Tên toà nhà
              </label>
              <input
                type="text"
                id="buildingname"
                name="buildingname"
                value={formData.buildingname}
                onChange={handleInputChange}
                className="rounded-lg border border-gray-600 bg-[#201b39] px-4 py-2 focus:border-blue-500 focus:outline-none"
                placeholder="Nhập tên toà nhà"
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
                placeholder="Nhập mô tả cho toà nhà"
              />
            </div>

            <div className="mt-4 flex gap-4">
              <button
                type="submit"
                className="rounded-lg bg-blue-500 px-6 py-2 font-medium hover:bg-blue-600"
              >
                Thêm
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin/building")}
                className="rounded-lg bg-gray-500 px-6 py-2 font-medium hover:bg-gray-600"
              >
                Huỷ
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CreateBuildingPage;
