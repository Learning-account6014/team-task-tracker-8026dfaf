import { useAuth } from "@/hooks/useAuth";
import Login from "./Login";
import Dashboard from "./Dashboard";

const Index = () => {
  const { user } = useAuth();
  return user ? <Dashboard /> : <Login />;
};

export default Index;
