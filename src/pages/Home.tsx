import Hero from "../components/Hero"
import ServiceSchema from "../components/ServiceSchema"
import LocalBusinessSchema from "../components/LocalBusinessSchema"

const Home = () => {
  return (
    <div className="min-h-screen bg-[#fffdfa]">
      <LocalBusinessSchema />
      <ServiceSchema />
      <Hero />
    </div>
  )
}

export default Home
