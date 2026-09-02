import { Link } from 'react-router-dom'
import StandardButton from '../components/StandardButton'
import { FiHome } from 'react-icons/fi'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-accent">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-text-custom mb-4">Page Not Found</h2>
        <p className="text-lg text-text-custom mb-8">
          Sorry, the page you're looking for doesn't exist.
        </p>
        <Link to="/">
          <StandardButton icon={FiHome}>
            Return Home
          </StandardButton>
        </Link>
      </div>
    </div>
  )
}

export default NotFound