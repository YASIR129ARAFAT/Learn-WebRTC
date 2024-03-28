import "./App.css";


import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import Display from "./pages/Display";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route path="" element={<Display />} />
    </Route>
  )
);



function App() {
  return <RouterProvider router={router} />
}

export default App;
