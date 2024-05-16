import { useState } from 'react'

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

import DisplayPage from './pages/DisplayPage.jsx';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route path="" element={<DisplayPage />} />
    </Route>
  )
);


function App() {

  return <RouterProvider router={router}/>
}

export default App
