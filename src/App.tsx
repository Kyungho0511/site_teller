import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import RootPage from "./pages/RootPage";
import HomePage from "./pages/HomePage";
import ClusterPage from "./pages/ClusterPage";
import NotFoundPage from "./pages/NotFoundPage";
import SelectPage from "./pages/SelectPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootPage />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "/cluster/:clusterId", element: <ClusterPage /> },
      { path: "/select", element: <SelectPage /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
