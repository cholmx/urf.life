const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mwpbyjab'

export const sendEmail = async (formData, formType) => {
  const emailData = {
    to: 'info@urfellowship.com',
    subject: getEmailSubject(formType, formData),
    message: formatEmailBody(formType, formData),
    formType,
    timestamp: new Date().toISOString(),
    ...formData
  }

  try {
    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(emailData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
    }

    await response.json()
    return { success: true, error: null }
    
  } catch (error) {
    console.error('❌ Error sending email via Formspree:', error)
    return { success: false, error: error.message }
  }
}

const getEmailSubject = (formType, formData) => {
  switch (formType) {
    case 'contact':
      return `Contact Form: ${formData.subject || 'General Inquiry'}`
    case 'realm':
      return `New Realm Registration: ${formData.first_name} ${formData.last_name}`
    case 'table_group':
      return `Table Group Sign-up: ${formData.first_name} ${formData.last_name}`
    default:
      return 'Church Portal Form Submission'
  }
}

const formatEmailBody = (formType, formData) => {
  const timestamp = new Date().toLocaleString()
  let body = `Form Submission from Church Portal\n`
  body += `Submitted: ${timestamp}\n`
  body += `Form Type: ${formType.toUpperCase()}\n\n`

  switch (formType) {
    case 'contact':
      body += `Name: ${formData.name}\n`
      body += `Email: ${formData.email}\n`
      body += `Phone: ${formData.phone || 'Not provided'}\n`
      body += `Subject: ${formData.subject}\n\n`
      body += `Message:\n${formData.message}`
      break
      
    case 'realm':
      body += `Name: ${formData.first_name} ${formData.last_name}\n`
      body += `Email: ${formData.email}\n`
      body += `Phone: ${formData.phone}\n`
      body += `Address: ${formData.address_line1}\n`
      if (formData.address_line2) body += `Address Line 2: ${formData.address_line2}\n`
      body += `City: ${formData.city}, ${formData.state} ${formData.zip_code}\n`
      body += `Country: ${formData.country}\n`
      if (formData.birthday) body += `Birthday: ${formData.birthday}\n`
      if (formData.marital_status) body += `Marital Status: ${formData.marital_status}\n`
      if (formData.anniversary) body += `Anniversary: ${formData.anniversary}\n`
      break
      
    case 'table_group':
      body += `Name: ${formData.first_name} ${formData.last_name}\n`
      body += `Email: ${formData.email}\n`
      body += `Party Size: ${formData.party_size}\n`
      body += `Unavailable Days: ${formData.unavailable_days.length > 0 ? formData.unavailable_days.join(', ') : 'None specified'}\n`
      break

    default:
      body += JSON.stringify(formData, null, 2)
  }

  return body
}