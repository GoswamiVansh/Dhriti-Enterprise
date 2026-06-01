import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

const AdminRoute = () => {
  const { userInfo } = useSelector((state: RootState) => state.auth);

  if (!userInfo || userInfo.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
