import { createElement } from 'react'
import { FiAlertTriangle } from 'react-icons/fi'

// The `name` prop (looking up `Fi${name}` on a wildcard import of the whole
// react-icons/fi module) is unused everywhere in the app - every call site
// passes `icon` directly - but the dynamic lookup it required kept Rollup
// from tree-shaking the ~300-icon module out of the bundle. Every caller
// passes `icon`, so this is behavior-identical for real usage.
const SafeIcon = ({ icon, ...props }) => {
  return icon ? createElement(icon, props) : <FiAlertTriangle {...props} />
}

export default SafeIcon
