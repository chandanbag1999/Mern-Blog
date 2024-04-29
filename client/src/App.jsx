import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Home, About, SignIn, SignUp, Dashboard, Projects} from "./pages/index.js"
import Header from './components/Header.jsx'
import FooterCom from './components/Footer.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Header />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/projects" element={<Projects />} />

    </Routes>
    <FooterCom/>
  </BrowserRouter>
)
}
