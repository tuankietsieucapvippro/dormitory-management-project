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

  useEffect(() => {
    const fetchUtility = async () => {
      try {
        const response = await utilitiesApi.getById(Number(id));
        const utilityData = response.data;

        setUtility(utilityData);
        setFormData({
          previouselectricitymeter:
            utilityData.previouselectricitymeter.toString(),
          currentelectricitymeter:
            utilityData.currentelectricitymeter.toString(),
          previouswatermeter: utilityData.previouswatermeter.toString(),
          currentwatermeter: utilityData.currentwatermeter.toString(),
          startdate: utilityData.startdate,
          enddate: utilityData.enddate,
          electricityprice: utilityData.electricityprice.toString(),
          waterprice: utilityData.waterprice.toString(),
        });
      } catch (error) {
        console.error("Error fetching utility data:", error);
        setError("An error occurred while loading the data");
      } finally {
        setLoading(false);
      }
    };

    fetchUtility();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await utilitiesApi.update(Number(id), {
        ...formData,
        previouselectricitymeter: parseInt(formData.previouselectricitymeter),
        currentelectricitymeter: parseInt(formData.currentelectricitymeter),
        previouswatermeter: parseInt(formData.previouswatermeter),
        currentwatermeter: parseInt(formData.currentwatermeter),
        electricityprice: parseInt(formData.electricityprice),
        waterprice: parseInt(formData.waterprice),
      });
      navigate("/utilities");
    } catch (error) {
      console.error("Error updating utility record:", error);
      alert("An error occurred while updating the utility record");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex h-full items-center justify-center bg-[#130f21] text-[#e1dce4]">
          <div className="text-lg">Loading...</div>
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
      <div className="flex h-full flex-col bg-[#130f21] text-[#e1dce4]">
        <h1 className="-mt-5 mb-2 p-5 text-center text-3xl font-bold uppercase">
          Edit Utility Record
        </h1>

        <div className="mx-auto w-full max-w-2xl flex-1 px-8">
          <div className="mb-6 rounded-lg bg-[#201b39] p-4">
            <h2 className="mb-2 text-xl font-semibold">Room Information</h2>
            <p className="mb-1">
              <span className="font-medium">Room:</span>{" "}
              {utility?.room?.roomname || "---"}
            </p>
            <p className="mb-1">
              <span className="font-medium">Building:</span>{" "}
              {utility?.room?.building?.buildingname || "---"}
            </p>
            <p>
              <span className="font-medium">Period:</span>{" "}
              {new Date(utility?.startdate || "").toLocaleDateString()} to{" "}
              {new Date(utility?.enddate || "").toLocaleDateString()}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="previouselectricitymeter"
                className="text-lg font-medium"
              >
                Previous Electricity Meter
              </label>
              <input
                type="number"
                id="previouselectricitymeter"
                name="previouselectricitymeter"
                value={formData.previouselectricitymeter}
                onChange={handleInputChange}
                className="rounded-lg border border-gray-600 bg-[#201b39] px-4 py-2 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="currentelectricitymeter"
                className="text-lg font-medium"
              >
                Current Electricity Meter
              </label>
              <input
                type="number"
                id="currentelectricitymeter"
                name="currentelectricitymeter"
                value={formData.currentelectricitymeter}
                onChange={handleInputChange}
                className="rounded-lg border border-gray-600 bg-[#201b39] px-4 py-2 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="previouswatermeter"
                className="text-lg font-medium"
              >
                Previous Water Meter
              </label>
              <input
                type="number"
                id="previouswatermeter"
                name="previouswatermeter"
                value={formData.previouswatermeter}
                onChange={handleInputChange}
                className="rounded-lg border border-gray-600 bg-[#201b39] px-4 py-2 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="currentwatermeter"
                className="text-lg font-medium"
              >
                Current Water Meter
              </label>
              <input
                type="number"
                id="currentwatermeter"
                name="currentwatermeter"
                value={formData.currentwatermeter}
                onChange={handleInputChange}
                className="rounded-lg border border-gray-600 bg-[#201b39] px-4 py-2 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div className="mt-4 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate("/utilities")}
                className="rounded bg-gray-500 px-4 py-2 hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded bg-blue-500 px-4 py-2 hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default EditUtilitiesPage;
