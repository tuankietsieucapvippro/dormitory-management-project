import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { useParams, useNavigate } from "react-router-dom";
import { utilitiesApi } from "../../services/api";

interface Utility {
  utilitiesid: number;
  roomid: number;
  startdate: string;
  enddate: string;
  previouselectricitymeter: number;
  currentelectricitymeter: number;
  previouswatermeter: number;
  currentwatermeter: number;
  electricityprice: number;
  waterprice: number;
  room?: {
    roomname: string;
    building?: {
      buildingname: string;
    };
  };
}

const EditUtilitiesPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [utility, setUtility] = useState<Utility | null>(null);
  const [formData, setFormData] = useState({
    previouselectricitymeter: "",
    currentelectricitymeter: "",
    previouswatermeter: "",
    currentwatermeter: "",
    startdate: "",
    enddate: "",
    electricityprice: "",
    waterprice: "",
  });

  // State để track validation errors
  const [validationErrors, setValidationErrors] = useState({
    electricity: "",
    water: "",
  });

  useEffect(() => {
    const fetchUtility = async () => {
      try {
        console.log("Fetching utility with ID:", id);

        // Thử nhiều cách để lấy dữ liệu utility
        let response;
        let utilityData;

        try {
          // Thử getById trước
          response = await utilitiesApi.getById(Number(id));
          console.log("getById response:", response);
        } catch (getByIdError) {
          console.log("getById failed, trying getAll:", getByIdError);

          // Nếu getById không hoạt động, thử getAll và filter
          const allResponse = await utilitiesApi.getAll();
          console.log("getAll response:", allResponse);

          const allUtilities = allResponse.data?.data || allResponse.data || [];
          utilityData = allUtilities.find((util: Utility) => util.utilitiesid === Number(id));

          if (!utilityData) {
            throw new Error(`Không tìm thấy utility với ID ${id}`);
          }
        }

        // Xử lý response từ getById
        if (!utilityData && response) {
          utilityData = response.data?.data || response.data;
        }

        console.log("Processed utility data:", utilityData);

        if (utilityData && utilityData.utilitiesid) {
          setUtility(utilityData);

          // Format date để tương thích với input[type="date"]
          const formatDateForInput = (dateString: string) => {
            if (!dateString) return "";
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
          };

          setFormData({
            previouselectricitymeter: (utilityData.previouselectricitymeter || 0).toString(),
            currentelectricitymeter: (utilityData.currentelectricitymeter || 0).toString(),
            previouswatermeter: (utilityData.previouswatermeter || 0).toString(),
            currentwatermeter: (utilityData.currentwatermeter || 0).toString(),
            startdate: formatDateForInput(utilityData.startdate),
            enddate: formatDateForInput(utilityData.enddate),
            electricityprice: (utilityData.electricityprice || 0).toString(),
            waterprice: (utilityData.waterprice || 0).toString(),
          });

          console.log("Form data set:", {
            previouselectricitymeter: utilityData.previouselectricitymeter,
            currentelectricitymeter: utilityData.currentelectricitymeter,
            previouswatermeter: utilityData.previouswatermeter,
            currentwatermeter: utilityData.currentwatermeter,
            startdate: utilityData.startdate,
            enddate: utilityData.enddate,
          });
        } else {
          console.error("Invalid utility data:", utilityData);
          setError("Không tìm thấy dữ liệu điện nước hoặc dữ liệu không hợp lệ");
        }
      } catch (error: any) {
        console.error("Error fetching utility data:", error);
        setError(`Có lỗi xảy ra khi tải dữ liệu: ${error.message || error}`);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUtility();
    } else {
      setError("ID không hợp lệ");
      setLoading(false);
    }
  }, [id]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
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
            electricity: `Chỉ số điện mới (${currentValue}) không thể nhỏ hơn chỉ số điện cũ (${previousElectricity})`
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
            water: `Chỉ số nước mới (${currentValue}) không thể nhỏ hơn chỉ số nước cũ (${previousWater})`
          }));
        } else {
          setValidationErrors(prev => ({
            ...prev,
            water: ""
          }));
        }
      }
    }
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
        startDate: formData.startdate,
        endDate: formData.enddate,
        previousElectricityMeter: parseInt(formData.previouselectricitymeter),
        currentElectricityMeter: parseInt(formData.currentelectricitymeter),
        previousWaterMeter: parseInt(formData.previouswatermeter),
        currentWaterMeter: parseInt(formData.currentwatermeter),
      };

      console.log("Updating utility with payload:", payload);
      await utilitiesApi.update(Number(id), payload);
      alert("Cập nhật chỉ số điện nước thành công!");
      navigate("/admin/utilities");
    } catch (error: any) {
      console.error("Error updating utility record:", error);

      // Hiển thị lỗi cụ thể từ backend
      if (error.response?.data?.message) {
        alert(`Lỗi: ${error.response.data.message}`);
      } else if (error.message) {
        alert(`Lỗi: ${error.message}`);
      } else {
        alert("Có lỗi xảy ra khi cập nhật chỉ số điện nước");
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex h-full items-center justify-center bg-[#130f21] text-[#e1dce4]">
          <div className="text-lg">Đang tải dữ liệu...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex h-full items-center justify-center bg-[#130f21] text-[#e1dce4]">
          <div className="text-red-500">{error}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex h-auto flex-col bg-[#130f21] text-[#e1dce4]">
        <h1 className="-mt-5 mb-2 p-5 text-center text-3xl font-bold uppercase">
          Sửa chỉ số điện nước
        </h1>

        <div className="mx-auto w-full max-w-2xl flex-1 px-8">
          <div className="mb-6 rounded-lg bg-[#201b39] p-4">
            <h2 className="mb-2 text-xl font-semibold">Thông tin phòng</h2>
            <p className="mb-1">
              <span className="font-medium">Phòng:</span>{" "}
              {utility?.room?.roomname || "---"}
            </p>
            <p className="mb-1">
              <span className="font-medium">Tòa nhà:</span>{" "}
              {utility?.room?.building?.buildingname || "---"}
            </p>
            <p>
              <span className="font-medium">Kỳ hạn:</span>{" "}
              {new Date(utility?.startdate || "").toLocaleDateString()} đến{" "}
              {new Date(utility?.enddate || "").toLocaleDateString()}
            </p>
          </div>

          {/* Thông báo hướng dẫn */}
          <div className="mb-6 rounded-lg bg-yellow-900/30 border border-yellow-500/30 p-4">
            <div className="flex items-start gap-3">
              <div className="text-yellow-400 text-xl">⚠️</div>
              <div>
                <h3 className="text-yellow-300 font-medium mb-1">Lưu ý khi sửa chỉ số</h3>
                <p className="text-yellow-200 text-sm">
                  Chỉ số điện và nước mới phải lớn hơn hoặc bằng chỉ số cũ.
                  Hệ thống sẽ kiểm tra và báo lỗi nếu bạn nhập sai.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="previouselectricitymeter"
                className="text-lg font-medium"
              >
                Chỉ số điện cũ
              </label>
              <input
                type="number"
                id="previouselectricitymeter"
                name="previouselectricitymeter"
                value={formData.previouselectricitymeter}
                onChange={handleInputChange}
                className="rounded-lg border border-gray-600 bg-[#201b39] px-4 py-2 focus:border-blue-500 focus:outline-none"
                required
                min="0"
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
                Chỉ số nước cũ
              </label>
              <input
                type="number"
                id="previouswatermeter"
                name="previouswatermeter"
                value={formData.previouswatermeter}
                onChange={handleInputChange}
                className="rounded-lg border border-gray-600 bg-[#201b39] px-4 py-2 focus:border-blue-500 focus:outline-none"
                required
                min="0"
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
                required
                min="0"
              />
              {validationErrors.water && (
                <p className="text-red-400 text-sm mt-1">
                  ⚠️ {validationErrors.water}
                </p>
              )}
            </div>

            <div className="mt-4 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate("/admin/utilities")}
                className="rounded bg-gray-500 px-4 py-2 hover:bg-gray-600"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="rounded bg-blue-500 px-4 py-2 hover:bg-blue-600"
              >
                Lưu
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default EditUtilitiesPage;
