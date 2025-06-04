import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DeleteModal from "./DeleteModal";
import { utilitiesApi } from "../services/api";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface Utility {
  utilitiesid: number;
  room: {
    roomid: number;
    roomname: string;
    building?: {
      buildingname: string;
    };
  };
  startdate: string;
  enddate: string;
  previouselectricitymeter: number;
  currentelectricitymeter: number;
  previouswatermeter: number;
  currentwatermeter: number;
  electricityprice: number;
  waterprice: number;
}

interface UtilitiesTableProps {
  searchTerm?: string;
}

const UtilitiesTable = ({ searchTerm = "" }: UtilitiesTableProps) => {
  const navigate = useNavigate();
  const [utilities, setUtilities] = useState<Utility[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    utilitiesid: null as number | null,
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchUtilities();
  }, [currentPage, searchTerm]);

  const fetchUtilities = async () => {
    setLoading(true);
    try {
      const response = await utilitiesApi.getAll();
      // Filter utilities based on search term if provided
      let filteredData = response.data;
      if (searchTerm) {
        filteredData = response.data.filter(
          (util: Utility) =>
            util.room?.roomname
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            util.room?.building?.buildingname
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()),
        );
      }

      setTotalItems(filteredData.length);

      // Get current page items
      const indexOfLastItem = currentPage * itemsPerPage;
      const indexOfFirstItem = indexOfLastItem - itemsPerPage;
      const currentItems = filteredData.slice(
        indexOfFirstItem,
        indexOfLastItem,
      );

      setUtilities(currentItems);
    } catch (error) {
      console.error("Error fetching utilities:", error);
      alert("An error occurred while loading utilities data");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.utilitiesid) return;

    try {
      await utilitiesApi.delete(deleteModal.utilitiesid);
      setDeleteModal({ isOpen: false, utilitiesid: null });
      fetchUtilities();
    } catch (error) {
      console.error("Error deleting utility record:", error);
      alert("An error occurred while deleting the utility record");
    }
  };

  // Pagination controls
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  if (loading && utilities.length === 0) {
    return <div className="py-4 text-center">Loading...</div>;
  }

  return (
    <div>
      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-[#201b39] text-left">
            <th className="border border-gray-300 px-4 py-2">Room</th>
            <th className="border border-gray-300 px-4 py-2">Building</th>
            <th className="border border-gray-300 px-4 py-2">Start Date</th>
            <th className="border border-gray-300 px-4 py-2">End Date</th>
            <th className="border border-gray-300 px-4 py-2">
              Electricity Meter
            </th>
            <th className="border border-gray-300 px-4 py-2">Water Meter</th>
            <th className="border border-gray-300 px-4 py-2">
              Electricity Price
            </th>
            <th className="border border-gray-300 px-4 py-2">Water Price</th>
            <th className="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {utilities.length > 0 ? (
            utilities.map((utility) => (
              <tr key={utility.utilitiesid}>
                <td className="border border-gray-300 px-4 py-2">
                  {utility.room?.roomname}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {utility.room?.building?.buildingname}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {new Date(utility.startdate).toLocaleDateString()}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {new Date(utility.enddate).toLocaleDateString()}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {utility.previouselectricitymeter} -{" "}
                  {utility.currentelectricitymeter}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {utility.previouswatermeter} - {utility.currentwatermeter}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {utility.electricityprice?.toLocaleString()} VND
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {utility.waterprice?.toLocaleString()} VND
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        navigate(`/admin/utilities/edit/${utility.utilitiesid}`)
                      }
                      className="text-yellow-500"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        setDeleteModal({
                          isOpen: true,
                          utilitiesid: utility.utilitiesid,
                        })
                      }
                      className="text-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={9}
                className="border border-gray-300 px-4 py-4 text-center"
              >
                No utility records found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => paginate(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 rounded px-3 py-1 text-sm disabled:opacity-50"
          >
            <FaChevronLeft /> Prev
          </button>

          {[...Array(totalPages)].map((_, index) => {
            const pageNumber = index + 1;

            // Always show first page, last page, current page, and pages 1 before and after current
            if (
              pageNumber === 1 ||
              pageNumber === totalPages ||
              (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
            ) {
              return (
                <button
                  key={pageNumber}
                  onClick={() => paginate(pageNumber)}
                  className={`rounded px-3 py-1 text-sm ${
                    currentPage === pageNumber
                      ? "bg-blue-500 text-white"
                      : "hover:bg-gray-700"
                  }`}
                >
                  {pageNumber}
                </button>
              );
            }

            // Show dots for skipped pages, but only once
            if (
              (pageNumber === 2 && currentPage > 3) ||
              (pageNumber === totalPages - 1 && currentPage < totalPages - 2)
            ) {
              return <span key={pageNumber}>...</span>;
            }

            return null;
          })}

          <button
            onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 rounded px-3 py-1 text-sm disabled:opacity-50"
          >
            Next <FaChevronRight />
          </button>
        </div>
      )}

      <DeleteModal
        isOpen={deleteModal.isOpen}
        title="Confirm Delete"
        message="Are you sure you want to delete this utility record?"
        onClose={() => setDeleteModal({ isOpen: false, utilitiesid: null })}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default UtilitiesTable;
