import { useNavigate } from "react-router-dom";

function LogoutButton({ className = "" }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login", { replace: true });
  };

  return (
    <button type="button" className={className} onClick={handleLogout}>
      Logout
    </button>
  );
}

export default LogoutButton;
