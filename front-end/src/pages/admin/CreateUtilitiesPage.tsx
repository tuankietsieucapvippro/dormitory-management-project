import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { useNavigate } from "react-router-dom";
import { buildingApi, roomApi, utilitiesApi } from "../../services/api";

interface Building {
  buildingid: number;
  buildingname: string;
}

interface Room {
  roomid: number;
  roomname: string;
  floor: number;
}

const CreateUtilitiesPage = () => {
  const navigate = useNavigate();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState("");

  const [formData, setFormData] = useState({
    roomid: "",
    previouselectricitymeter: "",
    currentelectricitymeter: "",
    previouswatermeter: "",
    currentwatermeter: "",
    startdate: new Date().toISOString().split("T")[0],
    enddate: new Date().toISOString().split("T")[0],
    electricityprice: "3500",
    waterprice: "15000",
  });

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const response = await buildingApi.getAll();
        setBuildings(response.data);
      } catch (error) {
        console.error("Error fetching buildings:", error);
        alert("An error occurred while loading buildings");
      }
    };

    fetchBuildings();
  }, []);

  useEffect(() => {
    const fetchRooms = async () => {
      if (selectedBuilding) {
        try {
          const response = await roomApi.getByBuilding(
            Number(selectedBuilding),
          );
          setRooms(response.data);
        } catch (error) {
          console.error("Error fetching rooms:", error);
          alert("An error occurred while loading rooms");
        }
      } else {
        setRooms([]);
      }
    };

    fetchRooms();
  }, [selectedBuilding]);

  const handleBuildingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBuilding(e.target.value);
    setFormData((prev) => ({ ...prev, roomid: "" }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
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
      await utilitiesApi.create({
        ...formData,
        roomid: parseInt(formData.roomid),
        previouselectricitymeter: parseInt(formData.previouselectricitymeter),
        currentelectricitymeter: parseInt(formData.currentelectricitymeter),
        previouswatermeter: parseInt(formData.previouswatermeter),
        currentwatermeter: parseInt(formData.currentwatermeter),
        electricityprice: parseInt(formData.electricityprice),
        waterprice: parseInt(formData.waterprice),
      });
      navigate("/utilities");
    } catch (error) {
      console.error("Error creating utility record:", error);
      alert("An error occurred while creating the utility record");
    }
  };

  return (
    <Layout>
      <div className="flex h-full flex-col bg-[#130f21] text-[#e1dce4]">
        <h1 className="-mt-5 mb-2 p-5 text-center text-3xl font-bold uppercase">
          Add Utility Record
        </h1>

        <div className="mx-auto w-full max-w-2xl flex-1 px-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="buildingid" className="text-lg font-medium">
                Building
              </label>
              <select
                id="buildingid"
                value={selectedBuilding}
                onChange={handleBuildingChange}
                className="rounded-lg border border-gray-600 bg-[#201b39] px-4 py-2 focus:border-blue-500 focus:outline-none"
                required
              >
                <option value="">Select Building</option>
                {buildings.map((building) => (
                  <option key={building.buildingid} value={building.buildingid}>
                    {building.buildingname}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="roomid" className="text-lg font-medium">
                Room
              </label>
              <select
                id="roomid"
                name="roomid"
                value={formData.roomid}
                onChange={handleInputChange}
                className="rounded-lg border border-gray-600 bg-[#201b39] px-4 py-2 focus:border-blue-500 focus:outline-none"
                required
              >
                <option value="">Select Room</option>
                {rooms.map((room) => (
                  <option key={room.roomid} value={room.roomid}>
                    {room.roomname} - Floor {room.floor}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="startdate" className="text-lg font-medium">
                Start Date
              </label>
              <input
                type="date"
                id="startdate"
                name="startdate"
                value={formData.startdate}
                onChange={handleInputChange}
                className="rounded-lg border border-gray-600 bg-[#201b39] px-4 py-2 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="enddate" className="text-lg font-medium">
                End Date
              </label>
              <input
                type="date"
                id="enddate"
                name="enddate"
                value={formData.enddate}
                onChange={handleInputChange}
                className="rounded-lg border border-gray-600 bg-[#201b39] px-4 py-2 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

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
                placeholder="Enter previous electricity meter"
                required
                min="0"
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
                placeholder="Enter current electricity meter"
                required
                min="0"
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
                placeholder="Enter previous water meter"
                required
                min="0"
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
                placeholder="Enter current water meter"
                required
                min="0"
              />
            </div>

            <div className="mt-4 flex gap-4">
              <button
                type="submit"
                className="rounded-lg bg-blue-500 px-6 py-2 font-medium hover:bg-blue-600"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => navigate("/utilities")}
                className="rounded-lg bg-gray-500 px-6 py-2 font-medium hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CreateUtilitiesPage;
