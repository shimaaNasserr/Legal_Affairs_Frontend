import { RouterProvider } from "react-router-dom";
import route from "./routes/RouteList";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./App.css";
import DashboardLayout from "./layout/DashboardLayout";


function App() {

  return (
    <>
      <RouterProvider router={route}></RouterProvider>
      {/* <DashboardLayout>
      <h2>مرحبًا بك في لوحة التحكم</h2>
      <p>هنا محتوى الصفحة الرئيسية.</p>
    </DashboardLayout> */}

    </>
  );
}

export default App;