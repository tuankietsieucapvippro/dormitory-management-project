import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [invalidFields, setInvalidFields] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (invalidFields.includes(name)) {
      setInvalidFields((prev) => prev.filter((field) => field !== name));
    }
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const newInvalidFields: string[] = [];

    // Kiểm tra trường trống
    if (!formData.username) newInvalidFields.push("username");
    if (!formData.password) newInvalidFields.push("password");

    if (newInvalidFields.length > 0) {
      setInvalidFields(newInvalidFields);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/accounts/login",
        formData,
      );
      if (response.data && response.data.data) {
        localStorage.setItem("user", JSON.stringify(response.data.data));

        // Check if the user is a student based on role name
        const userRole =
          response.data.data.account?.role?.rolename?.toLowerCase();

        if (userRole === "sinh viên" || userRole === "student") {
          // Redirect to student dashboard if the user is a student
          navigate("/student/dashboard");
        } else {
          // Redirect to admin dashboard for other roles
          navigate("/admin/building");
        }
      }
    } catch (error: any) {
      setInvalidFields(["username", "password"]);

      // Hiển thị thông báo lỗi từ API
      if (error.response) {
        setErrorMessage(
          error.response.data.message || "Sai tên đăng nhập hoặc mật khẩu",
        );
      } else {
        setErrorMessage("Có lỗi xảy ra khi đăng nhập");
      }
    }
  };

  return (
    <div className="grid h-screen place-content-center bg-[#1b172e] text-[#e1dce4]">
      <div className="grid h-full w-full place-items-center gap-5 rounded-xl bg-[#130f21] p-20">
        <img src="" alt="" />
        <h5 className="text-2xl font-bold">Đăng nhập vào hệ thống</h5>
        {errorMessage && (
          <div className="w-full rounded bg-red-500 p-2 text-white">
            {errorMessage}
          </div>
        )}
        <input
          type="text"
          name="username"
          placeholder="Tên đăng nhập"
          value={formData.username}
          onChange={handleInputChange}
          className={`border-2 border-solid ${
            invalidFields.includes("username")
              ? "border-red-500"
              : "border-indigo-600"
          } w-full rounded-xl bg-[#130f21] px-2 py-2`}
        />
        <input
          type="password"
          name="password"
          placeholder="Mật khẩu"
          value={formData.password}
          onChange={handleInputChange}
          className={`border-2 border-solid ${
            invalidFields.includes("password")
              ? "border-red-500"
              : "border-indigo-600"
          } w-full rounded-xl bg-[#130f21] px-2 py-2`}
        />
        <div className="flex w-full justify-between">
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <p>Nhớ mật khẩu</p>
          </label>
          <button className="text-indigo-400 hover:underline">
            <p>Quên mật khẩu?</p>
          </button>
        </div>
        <button
          onClick={handleLogin}
          className="w-full rounded-lg bg-indigo-600 py-2 font-bold hover:bg-indigo-700"
        >
          Đăng nhập
        </button>
        <div className="text-center">
          <p>Chưa có tài khoản? Vui lòng liên hệ quản trị viên</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
